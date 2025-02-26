import { nanoid } from 'nanoid'
import validateInteger from 'custom-utils/validateInteger'
import { Team, Dm } from 'lib/models'

export default async (req, res) => {
    const teamNumber = parseInt(req.body.teamNumber)

    if (!validateInteger(teamNumber)) return res.json({status: 404})

    if (teamNumber === req.user.number) return res.json({status: 400})

    const otherTeam = await Team.getFromNumber(teamNumber)
    if (!otherTeam) return res.json({status: 404})

    const members = [req.user.number, parseInt(teamNumber)]

    let chat = await Dm.findOne({$or: [{members}, {members: members.reverse()}]})
    if (chat) return res.json({status: 200, chat: await chat.sanitize()})
    
    chat = new Dm({
        publicId: nanoid(),
        members,
        readReceipts: {
            [req.user.number]: true,
            [teamNumber]: false
        }
    })
    await chat.save()
    return res.json({status: 200, chat: await chat.sanitize()})
}