import initHTTP from './rest/init.js'
import initSockets from './socket/init.js'
export { sockets } from './socket/init.js'
import { Team } from 'lib/models'
import validateInteger from 'custom-utils/validateInteger'

export default (server, app) => {
    initHTTP(app)
    initSockets(server)
}

export const profileViewMiddleware = async (req, res, next) => {
    const teamNumber = parseInt(req.params.teamNumber)

    if (!validateInteger(teamNumber)) return

    Team.getFromNumber(teamNumber).then(async team => {
        if (!team) return
        team.rawProfileViews.push(Date.now())
        await team.save()
    })
    next()
}