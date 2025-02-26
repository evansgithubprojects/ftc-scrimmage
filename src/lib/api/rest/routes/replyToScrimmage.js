import { Scrimmage, Invite } from 'lib/models'

export default async (req, res) => {
    const {
        scrimmageCode,
        accepted
    } = req.body

    if (!scrimmageCode) return res.json({status: 401})

    if (!await Invite.hasPendingInvite(req.user.number, scrimmageCode)) return res.json({status: 401})

    if (accepted) {
        const scrimmage = await Scrimmage.getFromCode(scrimmageCode)
        scrimmage.participants.push(req.user.number)
        await scrimmage.updateRankings()
    }

    await Invite.reply(req.user, scrimmageCode, accepted)

    res.json({status: 200})
}