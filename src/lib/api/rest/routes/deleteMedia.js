import mongoose from "mongoose"

export default async (req, res) => {
    const { videoId } = req.body

    if (!videoId) return res.json({ status: 400 })
    
    const { db } = mongoose.connection
    const filesCollection = db.collection('galleries.files')
    const file = await filesCollection.findOne({ 'metadata.publicId': videoId })

    if (!file) return res.json({ status: 400 })

    const { _id } = file
    await filesCollection.deleteOne({ _id })
    await db.collection('galleries.chunks').deleteMany({ files_id: _id })
    
    res.json({ status: 200 })
}