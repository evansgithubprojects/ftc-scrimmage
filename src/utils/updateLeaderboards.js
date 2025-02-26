import { Team, Ranking, Match, Scrimmage } from 'lib/models'

export default async () => {
    const oprRankings = await Team.aggregate([
        {
            $addFields: {
                auto: { $arrayElemAt: [{ $arrayElemAt: ['$opr.auto', -1] }, 0] },
                teleop: { $arrayElemAt: [{ $arrayElemAt: ['$opr.teleop', -1] }, 0] },
                endgame: { $arrayElemAt: [{ $arrayElemAt: ['$opr.endgame', -1] }, 0] },
            }
        },
        {
            $addFields: {
                opr: { $sum: ['$auto', '$teleop', '$endgame'] }
            }
        },
        {
            $sort: { opr: -1 }
        },
        {
            $project: {
                opr : 1,
                number : 1,
                name : 1
            }
        }
    ])

    const teamNumbers = (await Team.find({}, { number: 1 })).map(({ number }) => number)

    const matchesPlayedRankings = (await Promise.all(
        teamNumbers.map(async number => {
            return { number, matchesPlayed: (await Match.getMatchesPlayed(number)).length }
        })
    )).sort((a, b) => b.matchesPlayed - a.matchesPlayed)

    const scrimmagesPlayedRankings = (await Promise.all(
        teamNumbers.map(async number => {
            return { number, scrimmagesPlayed: (await Scrimmage.getScrimmagesPlayed(number)).length }
        })
    )).sort((a, b) => b.scrimmagesPlayed - a.scrimmagesPlayed)

    await Promise.all(oprRankings.map(async (team, i) => {
        const opr = Math.round(team.opr * 100) / 100
        const oprRank = i + 1
        const matchesPlayedRank = matchesPlayedRankings.findIndex(({ number }) => number === team.number)
        const { matchesPlayed } = matchesPlayedRankings[matchesPlayedRank]
        const scrimmagesPlayedRank = scrimmagesPlayedRankings.findIndex(({ number }) => number === team.number)
        const { scrimmagesPlayed } = scrimmagesPlayedRankings[scrimmagesPlayedRank]
        await Ranking.updateOne(
            { teamNumber: team.number },
            { $set: { 
                    opr, 
                    oprRank,
                    matchesPlayed,
                    matchesPlayedRank,
                    scrimmagesPlayed,
                    scrimmagesPlayedRank
                }
            },
            { upsert: true }
        )
    }))
}