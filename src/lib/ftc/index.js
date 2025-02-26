import {headers} from './params.js'
import getTeam from './routes/getTeam.js'
import getTeamEvents from './routes/getTeamEvents.js'
import seasonSummary from './routes/seasonSummary.js'
import getEvent from './routes/getEvent.js'
import getEventTeams from './routes/getEventTeams.js'

export const params = {
    headers
}

export default {
    getTeam,
    getTeamEvents,
    seasonSummary,
    getEvent,
    getEventTeams
}