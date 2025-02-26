import validateInteger from 'custom-utils/validateInteger'
import { Team } from 'lib/models'

export default async (req, res) => {
    const teamNumber = parseInt(req.body.teamNumber)

    if (!validateInteger) return res.json({status: 404})

    const team = await Team.getFromNumber(teamNumber)
    if (!team) return res.json({status: 404})
    team.profileViews.push(Date.now())
    await team.save()
}