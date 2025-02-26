import { Scrimmage, Invite, Match } from 'lib/models'

export default async (req, res) => {
    const scrimmageCode = req.params.code
    const isAuthed = req.isAuthenticated()
    const scrimmage = await Scrimmage.getFromCode(scrimmageCode)
    if (!scrimmage) return res.json({ status: 404 })

    const isParticipant = !isAuthed ? false : scrimmage.participants.includes(req.user.number) || await Invite.hasPendingInvite(req.user.number, scrimmageCode)

    if (scrimmage.private && !isParticipant) return res.json({ status: 404 })

    const sanitized = await scrimmage.sanitize(!isAuthed || scrimmage.host != req.user.number)

    if (scrimmage.date.getTime() < Date.now()) {
        const results = await scrimmage.getResults()
        if (results) {
            sanitized.results = await results.sanitize()

            const matches = await Match.sanitizeMany(await Match.find({ scrimmageCode }))
            sanitized.matches = matches
        }
    }

    res.json({ status: 200, scrimmage: sanitized })
}