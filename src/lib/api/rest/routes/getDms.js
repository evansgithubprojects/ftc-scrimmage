import { Dm, Message } from 'lib/models'

export default async (req, res) => {
    const teamNumber = req.user.number

    let dms = await Dm.find({members: teamNumber})
    for (let i = 0; i < dms.length; i++) {
        const chat = dms[i]
        if (!await Message.findOne({chat: chat.publicId})) {
            dms.splice(dms.indexOf(chat), 1)
        }
    }

    return res.json({ status: 200, chats: await Dm.sanitizeMany(dms) })
}