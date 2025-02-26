import { Readable } from 'stream'
import { bannerBucket } from "custom-utils/buckets"
import mongoose from 'mongoose';

export default async (req, res) => {
    const team = req.user
    const banner = req.files[0]
    const {
        email,
        instagram,
        color
    } = req.body

    for (const [key, val] of Object.entries({ email, instagram, color })) {
        if (val && key in team && team[key] != val) {
            team[key] = val
        }
    }
    await team.save()

    if (banner) {
        await mongoose.connection.db.collection('banners.files').deleteOne({ metadata: { teamNumber: team.number } })
        const stream = new Readable()
        stream.push(banner.buffer)
        stream.push(null)
        const uploadStream = bannerBucket.openUploadStream(
            `${team.number}.${banner.mimetype.split('/')[1]}`,
            {
                metadata: {
                    teamNumber: team.number
                }
            }
        )
        stream.pipe(uploadStream)
        .on('error', err => {
            console.log(err)
            res.json({status: 500})
        })
        .on('finish', () => res.json({status: 200}))
    }
    else {
        res.json({status: 200})
    }
}