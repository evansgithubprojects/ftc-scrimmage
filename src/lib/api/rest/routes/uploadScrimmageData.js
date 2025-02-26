import fs from 'fs'
import path from 'path'
import { Readable } from 'stream'
import { Scrimmage, Results } from 'lib/models'
import { scrimmageDataBucket } from "custom-utils/buckets"
import updateLeaderboards from 'custom-utils/updateLeaderboards'
import mongoose from 'mongoose'

const dataFolderPath = path.join(process.cwd(), 'src/tmp')

export default async (req, res) => {
    const {scrimmageCode} = req.body

    const scrimmage = await Scrimmage.findOne({code: scrimmageCode})
    if (!scrimmage) return res.json({status: 404})
    if (scrimmage.host != req.user.number || scrimmage.date.getTime() > Date.now()) return res.json({status: 401})

    const data = req.files[0]

    const buffer = Buffer.from(data.buffer)
    
    const stream = new Readable()
    stream.push(buffer)
    stream.push(null)

    fs.writeFileSync(dataFolderPath + `/${scrimmageCode}.db`, buffer)

    await mongoose.connection.db.collection('scrimmageData.files').deleteOne({ filename: `${scrimmageCode}.db` })

    const uploadStream = scrimmageDataBucket.openUploadStream(`${scrimmageCode}.db`)
    stream.pipe(uploadStream)
        .on('error', err => {
            console.log(err)
            res.json({status: 500})
        })
        .on('finish', async () => {
            await Results.parse(scrimmageCode)

            updateLeaderboards()

            res.json({status: 200})
        })
}