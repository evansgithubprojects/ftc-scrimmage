import { Scrimmage, Team } from 'lib/models'
import ftcRoutes from 'lib/ftc'
import validateInteger from 'custom-utils/validateInteger'

export default async (req, res) => {
    const teamNumber = parseInt(req.body.teamNumber)

    if (!validateInteger(teamNumber)) return res.json({status: 404})

    let team = await Team.getFromNumber(teamNumber)

    if (!team) return res.json({status: 404})

    team = await team.sanitize({ summarizeOpr: false })

    const teamInfo = await ftcRoutes.getTeam(teamNumber)

    let scrimmages = await Scrimmage.getTeamScrimmages(teamNumber)
    scrimmages = scrimmages.filter(scrimmage => !scrimmage.private)
    scrimmages = await Promise.all(scrimmages.map(async scrimmage => await scrimmage.sanitize(true)))
    
    return res.json({status: 200, info: {...team, ...teamInfo, scrimmages}})
}