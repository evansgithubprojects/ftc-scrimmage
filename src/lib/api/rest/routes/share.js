import { galleryCollection } from 'custom-utils/buckets'

export default async (req, res) => {
    const { publicId } = req.body

    if (!publicId) return res.json({ status: 400 })

    const file = await galleryCollection.findOne({ 'metadata.publicId': publicId })

    if (!file) return res.json({ status: 400 })

    await galleryCollection.updateOne(
        { _id: file._id },
        { $push: { 'metadata.shares': Date.now() } }
    )

    return res.json({ status: 200 })
}