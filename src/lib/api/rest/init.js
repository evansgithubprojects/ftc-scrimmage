import multer from 'multer'
import passport from 'passport'
import strings from 'custom-utils/strings'
import movtoMp4 from 'custom-utils/movToMp4'
import { authMiddleware, devMiddleware } from 'lib/auth'
import * as routes from './routes/index.js'
import {sockets} from 'lib/api'

const allowedMimetypes = {
    'uploadMedia': [
        'image/jpeg',
        'image/png',
        'video/mp4',
        'video/quicktime'
    ],
    'updateAccount': [
        'image/jpeg',
        'image/png'
    ]
}

const requiredFilePaths = [
    'uploadMedia'
]

const upload = multer({
    storage: multer.memoryStorage(),
    limits: {fileSize: 1024 * 1024 * 30}, //30MB
    fileFilter: async (req, file, cb) => {
        const { mimetype, originalname } = file

        let mimetypeIsAllowed

        const path = req.path.split('/')[2]

        switch (path) {
            case 'uploadScrimmageData':
                mimetypeIsAllowed = originalname.endsWith('.db')
                break
            default:
                mimetypeIsAllowed = allowedMimetypes[path].includes(mimetype)
                break
        }
        req.failedFileValidation = !mimetypeIsAllowed
        cb(null, mimetypeIsAllowed)
    }
})

const uploadMiddleware = upload.any()

const uploadHandler = (req, res, next) => {
    uploadMiddleware(req, res, async err => {
        if (err) {
            switch (err.message) {
                case 'File too large':
                    return res.json({ status: 400, err: 'File too large' })
                default:
                    console.log(err)
                    return res.json({ status: 500 })
            }
        }

        const fileIsRequired = requiredFilePaths.includes(req.path.split('/')[2])
        if (fileIsRequired && req.files.length === 0) return res.json({ status: 400 })

        const [ file ] = req.files
        if (file && file.mimetype === 'video/quicktime') {
            try {
                req.files[0] = await movtoMp4(file)
            }
            catch (err) {
                console.log(err)
                return res.json({ status: 500 })
            }
        }
        next()
    })
}

const checkUploadValidation = (req, res, next) => {
    if (req.failedFileValidation) return res.json({ status: 400 })
    next()
}

export default (app) => {
    for (const route of Object.values(routes)) {
        if (route.init) route.init()
    }

    const authedRoutes = [
        ['getScrimmages', 'get'],
        ['getDms', 'get'],
        ['getScrimmageChats', 'get'],
        ['getEventChats', 'get'],
        ['getTeamNumber', 'get'],
        ['getGallery', 'get'],
        ['getEmailPreferences', 'get'],
        ['updateScrimmage', 'post'],
        ['revokeInvite', 'post'],
        ['removeParticipant', 'post'],
        ['replyToScrimmage', 'post'],
        ['sendMessage', 'post'],
        ['readChat', 'post'],
        ['createChat', 'post'],
        ['register', 'post'],
        ['viewProfile', 'post'],
        ['deleteMedia', 'post']
    ]

    const formRoutes = [
        'createScrimmage',
        'inviteTeam',
        'updateAccount',
        'uploadScrimmageData',
        'updateAlliance',
        'uploadMedia',
        'updateEmailPreferences'
    ]

    //public apis
    app.get('/scrimmageData/:code', routes.getScrimmageData)
    app.get('/auth', routes.isAuthenticated)
    app.get('/getStats', routes.getStats)
    app.get('/totd', routes.totd)
    app.get('/leaderboards', routes.leaderboards)
    app.get('/cdn/:mediaType/:mediaId', routes.cdn)
    app.get('/postData/:publicId', routes.getPostData)
    app.post('/form/login', [multer().any(), passport.authenticate('team-credentials', {failWithError: true}), (err, req, res, next) => {
        switch(err) {
            case 'Invalid Team Number':
            case strings.notFoundInFIRST:
                res.json({status: 400, err: ['teamID', err]})
                break
            case 'Invalid Email Address':
                res.json({status: 400, err: ['email', err]})
                break
            case 'Incorrect Password':
                res.json({status: 400, err: ['password', err]})
                break
            default:
                res.json({status: 500})
                break
        }
    }], async (req, res) => {
        req.user.logins.push(Date.now())
        await req.user.save()
        res.json({status: 200})
    })
    app.post('/exploreScrimmages', routes.exploreScrimmages)
    app.post('/getProfile', routes.getProfile)
    app.post('/getGallery', routes.getGallery)
    app.post('/share', routes.share)
    app.post('/viewPost', routes.viewPost)

    //form apis
    formRoutes.forEach(routeName => {
        const route = routes[routeName]
        app.post(`/form/${routeName}`, [authMiddleware, uploadHandler, checkUploadValidation], route.default || route)
    })

    //authed apis
    authedRoutes.forEach(route => {
        const [path, method] = route
        app[method](`/${path}`, authMiddleware, routes[path])
    })

    app.post('/logout', [authMiddleware, (req, res, next) => {
        sockets.remove(req.user.number)
        req.logout((err) => {
            if (err) return next(err)
            res.json({status: 200})
        })
    }])

    app.get('/getAnalytics', devMiddleware, routes.getAnalytics)
}