import { nanoid } from 'nanoid'
import { Team, Invite, Scrimmage } from 'lib/models'
import ftcRoutes from 'lib/ftc'
import strings from 'custom-utils/strings'
import validateEmail from 'custom-utils/validateEmail'
import validateInteger from 'custom-utils/validateInteger'
import getTeamName from 'custom-utils/getTeamName'

const validateScrimmage = async (scrimmageCode) => {
    const scrimmage = await Scrimmage.findOne({ code: scrimmageCode })
    if (!scrimmage) {
        throw {err: 'Attempted fabricated scrimmageCode exploit while inviting'}
    }
    return scrimmage
}

const checkInviteeRegistration = async (inviteeNumber, inviteeName, inviteeEmail) => {
    const inviteeDoc = await Team.getFromNumber(inviteeNumber)
    if (!inviteeDoc) {
        if (!inviteeEmail) throw { err: ['global', `Team ${inviteeNumber} ${inviteeName} hasn't signed up yet! (If you know their email, we can send them an invite)`] }
        if (!validateEmail(inviteeEmail)) throw {err: ['teamEmail', 'Invalid email']}

        return new Team({
            name: inviteeName,
            email: inviteeEmail
        })
    }
    return inviteeDoc
}

export default async (req, res) => {
    try {
        const { teamNumber, teamEmail, scrimmageCode } = req.body
        const inviteeNumber = parseInt(teamNumber)
        if (!validateInteger(teamNumber)) return res.json({ err: ['teamNumber', 'Invalid invitee number'] })
        if (!await ftcRoutes.getTeam(teamNumber)) return res.json({ err: ['teamNumber', strings.notFoundInFIRST] })
        const inviterNumber = req.user.number

        const scrimmage = await validateScrimmage(scrimmageCode)
        
        const inviteeName = await getTeamName(inviteeNumber)
        const inviteeDoc = await checkInviteeRegistration(inviteeNumber, inviteeName, teamEmail)
        const inviteeFullName = `${inviteeNumber} ${inviteeName}`
        if (scrimmage.participants.includes(inviteeNumber)) return res.json({ err: ['global', `Team ${inviteeFullName} is already participating!`] })

        if (await Invite.hasPendingInvite(inviteeNumber, scrimmage.code)) return res.json({ err: ['global', `Team ${inviteeFullName} already has an outstanding invite`] })

        const inviterDoc = await Team.getFromNumber(inviterNumber)

        let invite = await Invite.findOne({from: inviterNumber, to: inviteeNumber, scrimmageCode})
        if (invite) {
            invite.accepted = null
            invite.replyTime = null
            await invite.save()
        }
        else {
            invite = new Invite({
                publicId: nanoid(),
                from: inviterNumber,
                to: inviteeNumber,
                scrimmageCode
            })

            await invite.save()
        }

        inviteeDoc.invite(`${inviterNumber} ${inviterDoc.name}`, inviteeFullName, scrimmage)

        res.json({status: 200, invite: await invite.sanitize()})
    } catch (err) {
        if (err.err) {
            return res.json(err)
        }
        console.log(err)
        res.json({status: 500})
    }
}