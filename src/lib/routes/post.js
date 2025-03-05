import { galleryCollection } from 'custom-utils/buckets'

export default async (req, res) => {
    const { publicId } = req.params
    const file = await galleryCollection.findOne({ 'metadata.publicId': publicId })
    if (!file) return res.json({ status: 404 })
    res.redirect(`/profile/${file.metadata.teamNumber}?view=${publicId}`)
}