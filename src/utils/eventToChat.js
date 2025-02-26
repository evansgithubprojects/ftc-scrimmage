import ftcRoutes from 'lib/ftc'
import { Message } from 'lib/models'

export default async event => {
    //mock chat structure
    const {code, name} = event
    event = {type: 'event', publicId: code, name}

    //teams are "members"
    const teams = await ftcRoutes.getEventTeams(code)
    event.members = teams.map(({teamNumber, nameShort}) => ({teamNumber, teamName: nameShort}))

    const messages = await Message.find({chat: code})
    event.messages = messages.map(message => message.sanitize())
    
    return  event
}