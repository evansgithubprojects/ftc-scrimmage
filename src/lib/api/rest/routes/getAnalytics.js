import { Team } from 'lib/models'

export default async (req, res) => {
    //when FTC Scrimmage was released
    const startDate = new Date(1734984540 * 1000)

    const teams = await Team.find()
    const latestTeam = (await Team.find().sort({_id: -1}).exec())[0]
    const latestTeamDate = latestTeam._id.getTimestamp()

    //25% 50% 75%

    const min = startDate.getTime()
    const max = latestTeamDate.getTime()
    const q1 = min + 0.25 * (max - min)
    const q2 = min + 0.5 * (max - min)
    const q3 = min + 0.75 * (max - min)

    const numQ1 = teams.filter(team => team._id.getTimestamp() < q1).length
    const numQ2 = teams.filter(team => team._id.getTimestamp() < q2).length
    const numQ3 = teams.filter(team => team._id.getTimestamp() < q3).length

    return res.json({status: 200, analytics: {
        teams: [
            {
                date: startDate,
                teamCount: 0
            },
            {
                date: new Date(q1),
                teamCount: numQ1
            },
            {
                date: new Date(q2),
                teamCount: numQ2
            },
            {
                date: new Date(q3),
                teamCount: numQ3
            },
            {
                date: latestTeamDate,
                teamCount: teams.length
            }
        ]
    }})
}