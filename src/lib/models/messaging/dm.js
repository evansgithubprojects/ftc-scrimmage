import mongoose from "mongoose"
import { sockets } from "lib/api"
import email from "lib/email"
import { Team, Message } from 'lib/models'
import { rootURL } from "../../../server.js"
import getTeamName from "custom-utils/getTeamName"

export default mongoose.model('DM', new mongoose.Schema({
    publicId: String,
    members: [Number],
    readReceipts: Object
}, {
    methods: {
        async sanitize(nameCache = null) {
            const usingCache = nameCache != null
            if (!usingCache) nameCache = {}

            const data = this.toObject()

            const {members} = data
            for (let i = 0; i < members.length; i++) {
                const number = members[i]
                let name = nameCache[number]
                if (!name) {
                    name = await getTeamName(number)
                    nameCache[number] = name
                }
                members[i] = {
                    number,
                    name
                }
            }

            data.messages = (await Message.find({chat: this.publicId})).map(message => message.sanitize())
            
            delete data._id
            delete data.__v

            data.type = 'team'

            return usingCache ? [data, nameCache] : data
        },
        async addTeam(teamNumber) {
            this.members.push(teamNumber)
            this.readReceipts[teamNumber] = false
            this.markModified('readReceipts')
            await this.save()
        },
        async sendMessage(authorTeamNumber, text) {
            const message = new Message({
                chat: this.publicId,
                author: authorTeamNumber,
                text
            })
            await message.save()

            const sanitized = message.sanitize()

            const sanitizedChat = await this.sanitize()

            const authorDoc = await Team.getFromNumber(authorTeamNumber)

            for (const member of this.members) {
                if (member === authorTeamNumber) continue

                this.readReceipts[member] = false
                if (sockets.exists(member)) {
                    sockets.emit(member, 'newMessage', {message: sanitized, chat: sanitizedChat})
                }
                else {
                    const teamDoc = await Team.getFromNumber(member)
                    if (!teamDoc.messageNotifications) continue
                    email.send(teamDoc.email, email.templates.message, {
                        sender: `${authorTeamNumber} ${authorDoc.name}`,
                        link: rootURL + `/messages?chat=${this.publicId}`
                    })
                }
            }
            this.markModified('readReceipts')
            await this.save()

            return sanitized
        },
        async read(teamNumber) {
            this.readReceipts[teamNumber] = true
            this.markModified('readReceipts')
            await this.save()
        }
    },
    statics: {
        async sanitizeMany(dms) {
            let nameCache = {}
            for (let i = 0; i < dms.length; i++) {
                [dms[i], nameCache] = await dms[i].sanitize(nameCache)
            }
            return dms
        }
    }
}))