import mongoose from "mongoose"

export default mongoose.model('Message', new mongoose.Schema({
    chat: String,
    author: Number,
    text: String
}, {
    methods: {
        sanitize() {
            const data = this.toObject()

            data.sentDate = data._id.getTimestamp()

            delete data._id
            delete data.__v
            
            return data
        }
    }
}))