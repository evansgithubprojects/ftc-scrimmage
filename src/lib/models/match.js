import ScoreDetails from "./schemas/scoreDetails.ts"
import mongoose from "mongoose"
import generateId from 'custom-utils/generateId'
import Team from './team.js'
import getTeamName from "custom-utils/getTeamName"

export default mongoose.model('Match', new mongoose.Schema({
    publicId: String,
    scrimmageCode : String,
    startTime : Date,
    scoreDetails : {},
    red: [Number],
    blue: [Number]
}, {
    methods: {
        async sanitize(nameCache) {
            const usingCache = nameCache != null
            if (!usingCache) nameCache = {}

            const data = this.toObject()

            delete data.scrimmageCode

            delete data._id
            delete data.__v

            await Promise.all(['red', 'blue'].map(async color => {
                const alliance = data[color]
                data[color] = await Promise.all(alliance.map(async number => {
                    if (!nameCache[number]) {
                        nameCache[number] = await getTeamName(number)
                    }
                    return { number, name: nameCache[number] }
                }))
            }))

            return usingCache ? [data, nameCache] : data
        },
        async updateAlliance(color, index, newTeamNumber) {
            this[color][index] = newTeamNumber
            await this.save()

            const team = await Team.getFromNumber(newTeamNumber)
            await team.updateOPR()
        }
    },
    statics: {
        async parse(scrimmageCode, rawMatchData, scheduleStations, teamsList) {
            const { 
                FMSScheduleDetailId : { data : FMSScheduleDetailIdBuffer }, 
                ScoreDetails : { data : ScoreDetailsBuffer },
                AutoStartTime 
            } = rawMatchData
            
            const scoreDetails = await ScoreDetails.parse(ScoreDetailsBuffer)
            
            const teams = scheduleStations.filter(({ FMSScheduleDetailId }, i) => 
                FMSScheduleDetailId.data.every((val, i) => val === FMSScheduleDetailIdBuffer[i])
            ).map(({ FMSTeamId: { data: FMSTeamIdBuffer }, Alliance }) => {
                const { TeamNumber: number, TeamNameShort: name } = teamsList.find(({ FMSTeamId }) => 
                    FMSTeamId.data.every((val, i) => val === FMSTeamIdBuffer[i])
                )
                return { number, name, alliance: Alliance === 1 ? 'red' : 'blue' }
            })

            const match = new this({
                publicId: await generateId(this),
                scrimmageCode,
                startTime: new Date(AutoStartTime), 
                scoreDetails,
                red: teams.filter(({ alliance }) => alliance === 'red').map(({ number }) => number),
                blue: teams.filter(({ alliance }) => alliance === 'blue').map(({ number }) => number)
            })
        
            return match
        },
        async sanitizeMany(matches) {
            let nameCache = {}
            for (let i = 0; i < matches.length; i++) {
                [matches[i], nameCache] = await matches[i].sanitize(nameCache)
            }
            return matches
        },
        async getMatchesPlayed(teamNumber) {
            return await this.find({$or: [{red: {$in: [teamNumber]}}, {blue: {$in: [teamNumber]}}]})
        }
    }
}))