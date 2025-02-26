import validateInteger from "custom-utils/validateInteger"
import { Team } from 'lib/models'

export default async (req, res) => {
    const teamNumber = parseInt(req.body.teamNumber)

    if (!validateInteger(teamNumber)) return res.json({ status: 400 })

    const gallery = await Team.getGallery(teamNumber)
    res.json({ status: 200, gallery })
}