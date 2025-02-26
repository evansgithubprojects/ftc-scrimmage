import { Dm } from 'lib/models'

export default async(req, res) => {
    const teamID = req.user.number
    const chat = await Dm.findOne({publicId: req.body.chatId, members: parseInt(teamID)})
    
    if (!chat) return res.json({status: 401})

    await chat.read(teamID)
    return res.json({status: 200})
}
