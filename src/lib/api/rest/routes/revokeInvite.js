import { Scrimmage, Invite } from 'lib/models'

export default async (req, res) => {
    const invite = await Invite.findOne({publicId: req.body.inviteId})
    if (!invite) return res.json({status: 400})

    const scrimmage = await Scrimmage.getFromCode(invite.scrimmageCode)

    if (!scrimmage) return res.json({status: 404})
    if (scrimmage.host != req.user.number) return res.json({status: 401})
    if (scrimmage.date - Date.now() < 0) return res.json({status: 401})

    await invite.deleteOne({_id: invite._id})
    res.json({ status: 200 })
}