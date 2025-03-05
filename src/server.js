import express from 'express'
import { createServer } from 'http'
import path from 'path'
import initViews from './views.js'
import initAPI from 'lib/api'
import { Scrimmage, Team } from 'lib/models'
import updateLeaderboards from 'custom-utils/updateLeaderboards'
import { fileURLToPath } from 'url'
import initSessions from 'lib/session'
import initDB from 'custom-utils/dbConnection'

const __dirname = path.join(fileURLToPath(import.meta.url), '../')

const app = express()
const PORT = process.env.PORT || 3000
const server = createServer(app)

const env = process.argv[2] === '--dev' ? 'dev' : 'prod'
export const rootURL = env === 'dev' ? 'http://localhost:3000' : 'https://ftcscrimmage.org'

initSessions(app)
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

initDB().then(async () => {
    initAPI(server, app)
    initViews(app, __dirname)
    
    await Team.updateOPRsGlobally()
    await Scrimmage.updateRankingsGlobally()
    updateLeaderboards()
    
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})