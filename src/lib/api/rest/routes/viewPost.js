import { galleryCollection } from "custom-utils/buckets"

export default async (req, res) => {
    const { publicId } = req.body
        
    if (!publicId) return res.json({ status: 400 })

    const file = await galleryCollection.findOne({ 'metadata.publicId': publicId })

    if (!file) return res.json({ status: 400 })

    if (req.user && req.user.number === file.metadata.teamNumber) return res.json({ status: 401 })

    await galleryCollection.updateOne(
        { _id: file._id },
        { $push: { 'metadata.views': Date.now() } }
    )
}