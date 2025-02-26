import { Scrimmage } from 'lib/models'

export default async (req, res) => {
    const {scrimmageCode, participantNumber} = req.body

    const scrimmage = await Scrimmage.getFromCode(scrimmageCode)

    if (!scrimmage) return res.json({status: 404})
    if (scrimmage.host != req.user.number) return res.json({status: 401})
    if (scrimmage.date - Date.now() < 0) return res.json({status: 401})
    if (!scrimmage.participants.includes(participantNumber)) return res.json({status: 400})

    scrimmage.participants.splice(scrimmage.participants.indexOf(participantNumber), 1)
    await scrimmage.updateRankings()

    return res.json({status: 200})
}