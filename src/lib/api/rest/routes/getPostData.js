import { galleryCollection } from "custom-utils/buckets"

export default async (req, res) => {
    const { publicId } = req.params
    
    if (!publicId) return res.json({ status: 400 })

    const file = await galleryCollection.findOne({ 'metadata.publicId': publicId })

    if (!file) return res.json({ status: 400 })

    const { shares = [], views = [] } = file.metadata

    return res.json({ status: 200, data: { shares, views } })
}