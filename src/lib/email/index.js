import sendEmail from "./sendEmail.js"
import handlebars from 'handlebars'
import fs from 'fs'

const templatesPath = import.meta.dirname + '/templates/'

export default {
    send: sendEmail,
    templates: {
        invite: {
            subject: "You've received an invite!",
            html: handlebars.compile(fs.readFileSync(templatesPath + 'invite.html').toString())
        },
        message: {
            subject: 'New Message',
            html: handlebars.compile(fs.readFileSync(templatesPath + 'message.html').toString())
        }
    }
}