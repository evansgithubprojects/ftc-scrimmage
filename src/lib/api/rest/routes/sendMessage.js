import ftcRoutes from 'lib/ftc'
import { Dm, Scrimmage, Message, Team } from 'lib/models'
import { rootURL } from '../../../../server.js'
import email from 'lib/email'
import { sockets } from "lib/api"
import eventToChat from 'custom-utils/eventToChat'
import scrimmageToChat from 'custom-utils/scrimmageToChat'

const getEvent = ftcRoutes.getEvent

export default async (req, res) => {
    const {
        chatId,
        chatType,
        text
    } = req.body

    if (text.trim().length === 0) return res.json({status: 400})

    const teamNumber = req.user.number

    switch (chatType) {
        case 'team': {
            const dm = await Dm.findOne({publicId: chatId})
            if (!dm || !dm.members.includes(teamNumber)) return res.json({status: 401})
        
            const message = await dm.sendMessage(teamNumber, text)
        
            res.json({status: 200, message})
            }
            break
        case 'scrimmage': {
                const scrimmage = await Scrimmage.getFromCode(chatId)
                if (!scrimmage || !scrimmage.participants.includes(teamNumber)) return res.json({status: 401})

                const message = new Message({
                    chat: chatId,
                    author: teamNumber,
                    text
                })
                await message.save()

                const sanitized = message.sanitize()

                //participants are "members"
                const parsedScrimmage = await scrimmageToChat(scrimmage)
                for (const team of parsedScrimmage.members) {
                    if (teamNumber === team.teamNumber) continue

                    if (sockets.exists(team.teamNumber)) {
                        sockets.emit(team.teamNumber, 'newMessage', {message: sanitized, chat: parsedScrimmage})
                    }
                    else {
                        const teamDoc = await Team.getFromNumber(team.teamNumber)
                        if (teamDoc && teamDoc.messageNotifications) {
                            email.send(teamDoc.email, email.templates.message, {
                                sender: `${teamNumber} ${req.user.name}`,
                                link: rootURL + `/messages?chat=${parsedScrimmage.publicId}`
                            })
                        }
                    }
                }

                res.json({status: 200, message: sanitized})
            }
            break
        case 'event':
            const event = await getEvent(chatId)
            if (!event) return res.json({status: 401})
    
            const message = new Message({
                chat: chatId,
                author: teamNumber,
                text
            })
            await message.save()
    
            const sanitized = message.sanitize()
    
            //teams are "members"
            const parsedEvent = await eventToChat(event)
            for (const team of parsedEvent.members) {
                if (teamNumber === team.teamNumber) continue

                if (sockets.exists(team.teamNumber)) {
                    sockets.emit(team.teamNumber, 'newMessage', {message: sanitized, chat: parsedEvent})
                }
                else {
                    const teamDoc = await Team.getFromNumber(team.teamNumber)
                    if (teamDoc && teamDoc.messageNotifications) {
                        email.send(teamDoc.email, email.templates.message, {
                            sender: `${teamNumber} ${req.user.name}`,
                            link: rootURL + `/messages?chat=${parsedEvent.publicId}`
                        })
                    }
                }
            }
    
            res.json({status: 200, message: sanitized})
            break
    }
}