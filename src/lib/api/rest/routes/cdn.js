import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import { bannerBucket, bannerCollection, galleryBucket, galleryCollection } from 'custom-utils/buckets'

export default async (req, res) => {
    switch (req.params.mediaType) {
        case 'banner': {
            const teamNumber = parseInt(req.params.mediaId)
            const file = await bannerCollection.findOne({ 'metadata.teamNumber': teamNumber })
            if (!file) {
                fs.createReadStream(path.join(fileURLToPath(import.meta.url), '../../../../../public/no-banner.png')).pipe(res)
            }
            else {
                const downloadStream = bannerBucket.openDownloadStream(file._id)
    
                downloadStream.pipe(res)
            }
        }
        break
        case 'media': {
            const publicId = req.params.mediaId
            const file = await galleryCollection.findOne({ 'metadata.publicId': publicId })
            if (!file) return res.json({ status: 404 })

            const downloadStream = galleryBucket.openDownloadStream(file._id)
            downloadStream.pipe(res)
        }
        break
        case 'icon': {
            const iconPath = path.join(fileURLToPath(import.meta.url), `../../../../../public/icons/${req.params.mediaId}`)
            if (!fs.existsSync(iconPath)) return res.json({ status: 404 })
            res.sendFile(path.resolve(iconPath))
        }
    }
}