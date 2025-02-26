import { Scrimmage } from 'lib/models'

export default async (req, res) => {
    const scrimmage = await Scrimmage.getFromCode(req.body.scrimmageCode)

    if (!scrimmage) return res.json({status: 404})
    if (scrimmage.private) return res.json({status: 401})

    scrimmage.participants.push(req.user.number)
    await scrimmage.updateRankings()

    res.json({status: 200})
}