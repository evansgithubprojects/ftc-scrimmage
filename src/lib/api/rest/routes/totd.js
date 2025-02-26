import { Team, Totd } from 'lib/models'

export default async (req, res) => {
    const team = await Team.getFromNumber((await Totd.findOne()).number)

    return res.json({status: 200, totd: await team.sanitize()})
}