import ftcRoutes from 'lib/ftc'
import eventToChat from 'custom-utils/eventToChat'

export default async (req, res) => {
    const teamNumber = req.user.number

    let events = await ftcRoutes.getTeamEvents(teamNumber)
    events = await Promise.all(events.map(async event => await eventToChat(event)))

    return res.json({ status: 200, chats: events })
}