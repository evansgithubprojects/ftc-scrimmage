export const env = process.argv[2] === '--dev' ? 'dev' : 'prod'

import express from 'express'
import { createServer } from 'http'
import path from 'path'
import passport from 'passport'
import passportCustom from 'passport-custom'
import MongoStore from 'connect-mongo'
import initViews from './views.js'
import initAPI from 'lib/api'
import { Scrimmage, Team, Totd } from 'lib/models'
import session from 'express-session'
import createBuckets from 'custom-utils/buckets'
import stats from 'custom-utils/stats'
import validateInteger from 'custom-utils/validateInteger'
import updateLeaderboards from 'custom-utils/updateLeaderboards'
import mongoose from 'mongoose'
import { fileURLToPath } from 'url'

const __dirname = path.join(fileURLToPath(import.meta.url), '../')

const dbString = `${process.env.DB_STRING}/${env}?retryWrites=true&w=majority&appName=${process.env.DB_APP_NAME}`

const app = express()
const PORT = process.env.PORT || 3000
const server = createServer(app)

export const rootURL = env === 'dev' ? 'http://localhost:3000' : 'https://ftcscrimmage.org'

export const sessionMiddleware = session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: dbString,
    }),
    proxy: true,
    cookie: {
        secure: env === 'prod',
        expires: 60 * 60 * 24 * 365 * 1000
    }
})

passport.use('team-credentials', new passportCustom.Strategy(async (req, done) => {
    const teamID = parseInt(req.body.teamID)

    if (!validateInteger(teamID)) {
        done('Invalid Team Number') 
        return
    }

    const team = await Team.getFromNumber(teamID)
    if (!team) {
        Team.register(req.body)
            .then(team => done(null, team))
            .catch(done)
        return
    }

    team.verifyPassword(req.body.password)
        .then(() => done(null, team))
        .catch(done)
}))

passport.serializeUser((team, done) => done(null, team.number))

passport.deserializeUser(async (number, done) => done(null, await Team.getFromNumber(number)))

app.use(express.static(path.join(__dirname, 'public')))

app.use(express.json())
app.use(sessionMiddleware)
app.use(passport.initialize())
app.use(passport.session())

mongoose.connect(dbString).then(async () => {
    createBuckets()
    
    initAPI(server, app)
    initViews(app, __dirname)
    
    setInterval(() => {
        stats.update()
        Totd.refresh()
    }, 15 * 60 * 1000)
    stats.update()
    Totd.refresh()
  
    await Promise.all((await Team.find()).map(async team => {
        await team.updateOPR()
    }))

    await Promise.all((await Scrimmage.find()).map(async scrimmage => {
        if (scrimmage.date.getTime() < Date.now()) return
        await scrimmage.updateRankings()
    }))
  
    updateLeaderboards()
    
    server.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
})