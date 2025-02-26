import { Scrimmage } from 'lib/models'
import scrimmageToChat from 'custom-utils/scrimmageToChat'

export default async (req, res) => {
    const teamNumber = req.user.number

    let scrimmages = await Scrimmage.getTeamScrimmages(teamNumber)
    scrimmages = await Promise.all(scrimmages.map(async scrimmage => await scrimmageToChat(scrimmage)))

    return res.json({ status: 200, chats: scrimmages })
}