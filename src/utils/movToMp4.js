import ffmpeg from "fluent-ffmpeg"
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'

const tmpPath = path.join(import.meta.dirname, '../tmp/media')

export default async file => {
    const [ fileName, extension ] = file.originalname.split('.')
    file.originalname = fileName + '.mp4'
    file.mimetype = 'video/mp4'

    const inputFilePath = tmpPath + `/${crypto.randomUUID()}.${extension}`
    const outputFilePath = tmpPath + `/${crypto.randomUUID()}.mp4`
    fs.writeFileSync(inputFilePath, file.buffer)

    return new Promise((resolve, reject) => {
        console.time('conversion')
        ffmpeg(inputFilePath)
            .outputOptions([
                '-movflags faststart', // Optimize for streaming
                '-preset veryfast',    // Faster encoding with reasonable efficiency
                '-crf 23',             // Balanced quality and compression
                '-c:v libx264',        // H.264 codec for better compatibility
            ])
            .on('error', console.log)
            .on('error', reject)
            .on('end', () => {
                file.buffer = fs.readFileSync(outputFilePath)
                fs.unlinkSync(inputFilePath)
                fs.unlinkSync(outputFilePath)
                console.timeEnd('conversion')
                resolve(file)
            })
            .save(outputFilePath)
})
}