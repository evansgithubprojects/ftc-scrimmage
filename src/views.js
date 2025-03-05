import engines from 'consolidate'
import { authMiddleware, hostMiddleware, devMiddleware } from 'lib/auth'
import path from 'path'
import { profileViewMiddleware } from 'lib/api'
import * as routes from 'lib/routes'

export default (app, __dirname) => {
    //render config
    app.set('views', path.join(__dirname, 'public', 'views'))
    app.engine('html', engines.mustache)
    app.set('view engine', 'html')

    //public views
    app.get('/', (req, res) => res.render('home'))
    app.get('/scrimmage/:scrimmageId', (req, res) => res.render('scrimmage'))
    app.get('/explore', (req, res) => res.render('explore'))
    app.get('/profile/:teamNumber', profileViewMiddleware, routes.profile)
    app.get('/messages', (req, res) => res.render('messages'))
    app.get('/account', (req, res) => res.render('account'))
    app.get('/post/:publicId', routes.post)

    //private views
    app.get('/dashboard', authMiddleware, (req, res) => res.render('dashboard'))
    app.get('/scrimmage/:scrimmageId/edit', hostMiddleware, (req, res) => res.render('editScrimmage'))
    app.get('/analytics', devMiddleware, (req, res) => res.render('analytics'))

    //catch-all
    app.get("*", (req, res) => res.redirect('/'))
}