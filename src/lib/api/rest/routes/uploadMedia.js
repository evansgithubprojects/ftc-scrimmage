import { Readable } from 'stream'
import generateId from 'custom-utils/generateId'
import { galleryBucket } from "custom-utils/buckets"

export default async ( req, res ) => {
    const { number : teamNumber } = req.user

    const mediaFile = req.files[0]

    const stream = new Readable()
    stream.push(mediaFile.buffer)
    stream.push(null)

    const mimetype = mediaFile.mimetype.split('/')[1]
    const publicId = await generateId('galleries.files')

    const uploadStream = galleryBucket.openUploadStream(
        `${teamNumber}.${mimetype}`,
        {
            metadata: {
                publicId,
                teamNumber
            }
        }
    )
    stream.pipe(uploadStream)
    .on('error', err => {
        console.log(err)
        res.json({ status: 500 })
    })
    .on('finish', () => res.json({ 
        status: 200, 
        media: {
            publicId,
            mimetype,
            data: mediaFile.buffer.toString('base64')
        } 
    }))
}