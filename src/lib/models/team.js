import mongoose from "mongoose"
import bcrypt from 'bcrypt'
import email from 'lib/email'
import {rootURL} from '../../server.js'
import Match from "./match.js"
import calculateOPR from 'custom-utils/calculateOPR'
import Scrimmage from "./scrimmage.js"
import ftcRoutes from 'lib/ftc'
import strings from 'custom-utils/strings'
import validateInteger from 'custom-utils/validateInteger'
import validateEmail from 'custom-utils/validateEmail'
import { galleryCollection } from "custom-utils/buckets"

export default mongoose.model('Team', new mongoose.Schema({
    number: Number,
    name: String,
    email: String,
    instagram: String,
    password: String,
    color: String,
    logins: {type: [Date], default: []},
    profileViews: {type: [Date], default: []},
    rawProfileViews: {type: [Date], default: []},
    opr: {
        auto: { type: [[Number, Date]], default: [] },
        teleop: { type: [[Number, Date]], default: [] },
        endgame: { type: [[Number, Date]], default: [] }
    },
    totd: { type: Boolean, default : false },
    scrimmageNotifications: { type: Boolean, default: true },
    messageNotifications: { type: Boolean, default: true }
}, {
    methods: {
        async sanitize({ summarizeOpr = true } = {}) {
            const data = this.toObject()
            delete data._id
            delete data.__v
            delete data.password
            delete data.logins
            delete data.rawProfileViews

            data.profileViews = data.profileViews.length

            if (summarizeOpr) {
                for (const phase of ['auto', 'teleop', 'endgame']) {
                    const list = data.opr[phase]
                    data.opr[phase] = list.length > 0 ? list[list.length - 1][0] : 0
                }
            }
            else {
                for (const phase of ['auto', 'teleop', 'endgame']) {
                    const list = data.opr[phase]
                    data.opr[phase] = list.length > 0 ? list.map(val => ({ value: val[0], date: val[1] })) : [0, Date.now()]
                }
            }

            return data
        },
        invite(inviterFullName, inviteeFullName, scrimmage) {
            email.send(this.email, email.templates.invite, {
                inviter: inviterFullName,
                invitee: inviteeFullName,
                scrimmageName: scrimmage.title, 
                link: rootURL + `/scrimmage/${scrimmage.code}?login=true`
            })
        },
        verifyPassword(password) {
            return new Promise((resolve, reject) => {
                bcrypt.compare(password, this.password, async (err, result) => {
                    if (err) {
                        console.log(err)
                        reject()
                    }
            
                    if (!result) {
                        reject("Incorrect Password")
                    }

                    resolve()
                })
            })
        },
        async updateOPR() {
            const now = Date.now()
            const matches = await Match.getMatchesPlayed(this.number)
            const opr = calculateOPR(matches, this.number)
            if (!opr) return
            for (const phase of Object.keys(opr)) {
                const rating = opr[phase]
                const oprList = this.opr[phase]
                if (oprList.length > 0 && rating === oprList[oprList.length - 1][0]) continue
                oprList.push([rating, now])
            }
            await this.save()
            for (const { scrimmageCode } of matches) {
                const scrimmage = await Scrimmage.findOne({code: scrimmageCode})
                await scrimmage.updateRankings()
            }
        }
    },
    statics: {
        async register(userInput) {
            const {teamID, email, password} = userInput

            if (!validateInteger(teamID)) throw ['teamID', 'Invalid Team Number']

            const teamInfo = await ftcRoutes.getTeam(teamID)
            if (!teamInfo) throw strings.notFoundInFIRST

            if (!validateEmail(email)) throw 'Invalid Email Address'

            return new Promise(async (resolve, reject) => {
                bcrypt.hash(password, 10, async (err, hashedPassword) => {
                if (err) {
                    console.log(err)
                    return reject('An unknown error occurred. Try again.')
                }
            
                const team = new this({
                    number: teamID,
                    name: teamInfo.nameShort,
                    email,
                    password: hashedPassword
                })
                await team.save()
                await team.updateOPR()
                resolve(team)
                })
            })
        },
        async getFromNumber(number) {
            return await this.findOne({number})
        },
        async getFromNumbers(numbers) {
            return await this.find({ number: { $in: numbers } })
        },
        async getGallery(teamNumber) {
            const files = await galleryCollection.find({ 'metadata.teamNumber': teamNumber }).toArray()
            return files.map(media => {
                return [media.metadata.publicId, media.filename.split('.')[1]]
            })
        },
        async getTotd() {
            return await this.findOne({ totd: true })
        }
    }
}))