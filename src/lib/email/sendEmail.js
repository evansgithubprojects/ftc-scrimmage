import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'ftc.scrimmage6@gmail.com',
        pass: process.env.EMAIL_PASS
    }
})

export default (email, template, options) => {
    transporter.sendMail({
        from: 'FTC Scrimmage',
        to: email,
        subject: `FTC Scrimmage - ${template.subject}`,
        html: template.html(options)
    })
}