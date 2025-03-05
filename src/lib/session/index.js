import passport from 'passport'
import passportCustom from 'passport-custom'
import MongoStore from 'connect-mongo'
import session from 'express-session'
import validateInteger from 'custom-utils/validateInteger'
import { dbString } from 'custom-utils/dbConnection'
import { Team } from 'lib/models'

const env = process.argv[2] === '--dev' ? 'dev' : 'prod'
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

export default app => {
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

    app.use(sessionMiddleware)
    app.use(passport.initialize())
    app.use(passport.session())
}