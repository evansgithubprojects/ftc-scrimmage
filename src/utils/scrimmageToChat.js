import { Message } from 'lib/models'

export default async scrimmage => {
    const {code, title} = scrimmage
    const chat = {type: 'scrimmage', publicId: code, name: title}

    //participants are "members"
    const teams = await scrimmage.getTeams()
    chat.members = teams.map(({ number, name }) => ({ number, name }))

    const messages = await Message.find({ chat: code })
    chat.messages = messages.map(message => message.sanitize())

    return chat
}