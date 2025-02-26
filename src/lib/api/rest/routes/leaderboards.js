import getTeamName from 'custom-utils/getTeamName'
import { Ranking } from 'lib/models'

export default async (req, res) => {
    let [opr, matchesPlayed, scrimmagesPlayed] = await Promise.all([
        Ranking.aggregate([
            { $sort: { opr: -1 } },
            { $limit: 10 },
            { $project: { 
                    number : '$teamNumber',
                    value: '$opr',
                    oprRank: 1
                } 
            }
        ]),
        Ranking.aggregate([
            { $sort: { matchesPlayed: -1 } },
            { $limit: 10 },
            { $project: { 
                    number : '$teamNumber',
                    value: '$matchesPlayed',
                    matchesPlayedRank: 1
                } 
            }
        ]),
        Ranking.aggregate([
            { $sort: { scrimmagesPlayed: -1 } },
            { $limit: 10 },
            { $project: { 
                    number : '$teamNumber',
                    value: '$scrimmagesPlayed',
                    scrimmagesPlayedRank: 1
                } 
            }
        ])
    ])

    opr = await Promise.all(opr.map(async ({ number, value }) => ({ 
        number,
        value, 
        name: await getTeamName(number) 
    })))
    matchesPlayed = await Promise.all(matchesPlayed.map(async ({ number, value }) => ({ 
        number, 
        value, 
        name: await getTeamName(number) 
    })))
    scrimmagesPlayed = await Promise.all(scrimmagesPlayed.map(async ({ number, value }) => ({ 
        number,
        value,
        name: await getTeamName(number) 
    })))

    return res.json({ status: 200, leaderboards: { opr, matchesPlayed, scrimmagesPlayed } })
}