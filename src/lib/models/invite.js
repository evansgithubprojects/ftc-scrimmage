import mongoose from "mongoose"
import getTeamName  from 'custom-utils/getTeamName'

export default mongoose.model('Invite', new mongoose.Schema({
    publicId: String,
    from: Number,
    to: Number,
    scrimmageCode: String,
    accepted: Boolean,
    replyTime: Date
}, {
    methods: {
        async sanitize() {
            const data = this.toObject()
            delete data._id
            delete data.__v

            data.toName = await getTeamName(data.to)

            return data
        }
    },
    statics: {
        async hasPendingInvite(teamNumber, scrimmageCode) {
            return await this.findOne({accepted: { $exists: false }, scrimmageCode, to: teamNumber}) != null
        },
        async reply(teamDoc, scrimmageCode, accepted) {
            const invite = await this.findOne({scrimmageCode, to: teamDoc.number})
            invite.accepted = accepted
            invite.replyTime = Date.now()
            await invite.save()
        }
    }
}))