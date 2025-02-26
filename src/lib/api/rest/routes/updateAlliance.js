import { Match, Scrimmage } from 'lib/models'
import validateInteger from 'custom-utils/validateInteger'

export default async (req, res) => {
    const { red1, red2, blue1, blue2, matchId } = req.body
    const alliances = {
        red: [red1, red2],
        blue: [blue1, blue2]
    }

    const match = await Match.findOne({publicId: matchId})
    
    if (!match) return res.json({status: 404})

    const { scrimmageCode } = match

    const scrimmage = await Scrimmage.findOne({code: scrimmageCode})

    for (const color of ['red', 'blue']) {
        const alliance = alliances[color]
        for (let i = 0; i < alliance.length; i++) {
            const newTeamNumber = parseInt(alliance[i])
            if (!validateInteger(newTeamNumber) || newTeamNumber.length > 5) continue
            if (!scrimmage.participants.includes(newTeamNumber)) {
                return res.json({status: 404, err: [`${color + (i + 1)}`, 'Team is not a participant']})
            }
    
            await match.updateAlliance(color, i, newTeamNumber)
        }
    }

    res.json({status: 200})
}