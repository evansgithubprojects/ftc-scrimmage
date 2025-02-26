import mongoose from "mongoose"
import ftcRoutes from 'lib/ftc'
import Invite from './invite.js'
import Results from "./results.js"
import Team from "./team.js"
import getTeamName from "custom-utils/getTeamName"

const compareOPRs = (opr, otherOpr) => {
    if (!opr && otherOpr) return 1
    if (!otherOpr && opr) return -1
    if (!otherOpr && !opr) return 0
    const totalOpr = opr.auto + opr.teleop + opr.endgame
    const totalOtherOpr = otherOpr.auto + otherOpr.teleop + otherOpr.endgame
    return totalOtherOpr - totalOpr
}

const populateInvites = async invites => {
    return await Promise.all(invites.map(async invite =>
        await invite.sanitize()
    ))
}

const model = mongoose.model('Scrimmage', new mongoose.Schema({
    code: String,
    host: Number,
    title: String,
    info: String,
    date: Date,
    address: {
        street: String,
        city: String,
        state: String
    },
    participants: [Number],
    rankings: [Number],
    private: {type: Boolean, default: true}
}, {
    methods: {
        async sanitize(isPublic = false, preview = false) {
            const data = this.toObject()
            delete data._id
            delete data.__v

            if (!preview) {
                const teamDocs = await Team.getFromNumbers(data.participants)
                data.participants = await Promise.all(teamDocs.map(async teamDoc => {
                    const { number, name, opr } = await teamDoc.sanitize()
                    return {
                        number,
                        name,
                        opr
                    }
                }))
            }

            const invites = await this.getInvites()

            const pendingInvites = invites.filter(invite => {
                return !Object.hasOwn(invite.toObject(), 'accepted')
            })
            data.pendingInvites = await populateInvites(pendingInvites)

            if (!isPublic) {
                const acceptedInvites = invites.filter(invite => invite.accepted)
                data.acceptedInvites = await populateInvites(acceptedInvites)
                const declinedInvites = invites.filter(invite => invite.accepted === false)
                data.declinedInvites = await populateInvites(declinedInvites)
            }

            delete data.invitesAccepted
            delete data.invitesDenied
            delete data.invitesSent

            return data
        },
        async getTeams() {
            return await Promise.all(this.participants.map((async number => ({
                number,
                name: await getTeamName(number)
            }))))
        },
        async getInvites() {
            return await Invite.find({ scrimmageCode: this.code })
        },
        async getResults() {
            return await Results.findOne({scrimmageCode: this.code})
        },
        async updateRankings() {
            if (this.date.getTime() > Date.now()) {
                const participants = await Promise.all(Object.assign([], this.participants).map(async number => 
                    await (await Team.getFromNumber(number)).sanitize()
                ))
                this.rankings = participants.sort(({opr}, {opr: otherOpr}) => 
                    compareOPRs(opr, otherOpr)
                ).map(({number}) => number)
            }
            await this.save()
        }
    },
    statics: {
        async getFromCode(code) {
            return await this.findOne({ code })
        },
        async getTeamScrimmages(teamNumber) {
            return await this.find({ participants: teamNumber })
        },
        async getScrimmagesPlayed(teamNumber) {
            return await this.find({ participants: teamNumber, date: { $lt: new Date() } })
        }
    }
}))

export default model