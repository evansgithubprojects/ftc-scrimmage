import ftcRoutes from 'lib/ftc'
import { Team, Scrimmage } from 'lib/models'
import mongoose from 'mongoose'

const getNumParticipants = async () => {
    const participantsAggregation = await Scrimmage.aggregate([
        {
            $project: {
                participantsLength: {$size: '$participants'}
            }
        },
        {
            $group: {
                _id: null,
                totalParticipants: {$sum: '$participantsLength'}
            }
        }
    ])

    return participantsAggregation.length > 0 ? participantsAggregation[0].totalParticipants : 0
}

let stats = {}

export default {
    async update() {
        stats.numScrimmages = await Scrimmage.countDocuments()
        stats.numParticipants =  await getNumParticipants()
        stats.numTeamsRegistered = await Team.countDocuments()
        stats.numTeams = (await ftcRoutes.seasonSummary()).teamCount
        stats.numMedia = await mongoose.connection.db.collection('galleries.files').countDocuments()
    },
    get() {
        return stats
    }
}