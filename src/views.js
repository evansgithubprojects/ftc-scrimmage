import engines from 'consolidate'
import { authMiddleware, hostMiddleware, devMiddleware } from 'lib/auth'
import validateInteger from 'custom-utils/validateInteger'
import { galleryCollection } from 'custom-utils/buckets'
import { Team } from 'lib/models'
import path from 'path'
import { rootURL } from './server.js'

const profileViewMiddleware = async (req, res, next) => {
    const teamNumber = parseInt(req.params.teamNumber)

    if (!validateInteger(teamNumber)) return

    Team.getFromNumber(teamNumber).then(async team => {
        if (!team) return
        team.rawProfileViews.push(Date.now())
        await team.save()
    })
    next()
}

const appendMetaTags = (html, props) => {
    const endOfHeadIndex = html.indexOf('</head>')
    let str = ''
    for (const [property, content] of props) {
        str += `<meta property="${property}" content="${content}"></meta>`
    }
    return html.slice(0, endOfHeadIndex) + str + html.slice(endOfHeadIndex)
}

export default (app, __dirname) => {
    app.set('views', path.join(__dirname, 'public', 'views'))
    app.engine('html', engines.mustache)
    app.set('view engine', 'html')

    //public views
    app.get('/', (req, res) => res.render('home'))
    app.get('/scrimmage/:scrimmageId', (req, res) => res.render('scrimmage'))
    app.get('/explore', (req, res) => res.render('explore'))
    app.get('/profile/:teamNumber', profileViewMiddleware, (req, res) => {
        res.render('profile', async (err, html) => {
            if (err) {
                return res.json({ status: 500 })
            }

            const { teamNumber } = req.params

            const team = await Team.getFromNumber(teamNumber)

            if (team) {
                html = appendMetaTags(html, [
                    ['og:url', `${rootURL}/profile/${teamNumber}`],
                    ['theme-color', team.color || '#8000ff']
                ])
                const postId = req.query.view
                if (postId) {
                    const file = await galleryCollection.findOne({ 'metadata.publicId': postId })
                    if (file) {
                        html = appendMetaTags(html, [
                            ['og:title', `Post by ${teamNumber} ${team.name}`]
                        ])

                        const isVideo = file.filename.split('.')[1] === 'mp4'
                        if (isVideo) {
                            html = appendMetaTags(html, [
                                ['og:type', 'video'],
                                ['og:video:type', 'video/mp4'],
                                ['og:video', `${rootURL}/cdn/media/${postId}`]
                            ])
                        }
                        else {
                            html = appendMetaTags(html, [
                                ['og:image', `${rootURL}/cdn/media/${postId}`],
                                ['twitter:card', 'summary_large_image']
                            ])
                        }
                    }
                }
                else {
                    html = appendMetaTags(html, [
                        ['og:title', `${teamNumber} ${team.name}`],
                        ['og:image', `${rootURL}/cdn/banner/${teamNumber}`],
                                ['twitter:card', 'summary_large_image']
                    ])
                }
            }

            html = html.replace('META_LOGO_PATH', `${rootURL}/cdn/icon/logo.png`)

            res.send(html)
        })
    })
    app.get('/messages', (req, res) => res.render('messages'))
    app.get('/account', (req, res) => res.render('account'))
    app.get('/post/:publicId', async (req, res) => {
        const { publicId } = req.params
        const file = await galleryCollection.findOne({ 'metadata.publicId': publicId })
        if (!file) return res.json({ status: 404 })
        res.redirect(`/profile/${file.metadata.teamNumber}?view=${publicId}`)
    })

    app.get('/dashboard', authMiddleware, (req, res) => res.render('dashboard'))
    app.get('/scrimmage/:scrimmageId/edit', hostMiddleware, (req, res) => res.render('editScrimmage'))
    app.get('/analytics', devMiddleware, (req, res) => res.render('analytics'))

    app.get("*", (req, res) => res.redirect('/'))
}