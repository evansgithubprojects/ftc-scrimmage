import { Scrimmage } from 'lib/models'

export default async (req, res) => {
    let scrimmages = await Scrimmage.getTeamScrimmages(req.user.number)
    scrimmages = await Promise.all(scrimmages.map(async scrimmage => await scrimmage.sanitize(false, true)))
    return res.json({status: 200, scrimmages})
}