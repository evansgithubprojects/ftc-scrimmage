import ftc from 'lib/ftc'
import { Team } from 'lib/models'

export default async teamNumber => {
    const team = await Team.getFromNumber(teamNumber)
    return team ? team.name : (await ftc.getTeam(teamNumber)).nameShort
}