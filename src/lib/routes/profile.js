import { rootURL } from './../../server.js'
import { Team } from 'lib/models'
import { galleryCollection } from 'custom-utils/buckets'

const appendMetaTags = (html, props) => {
    const endOfHeadIndex = html.indexOf('</head>')
    let str = ''
    for (const [property, content] of props) {
        str += `<meta property="${property}" content="${content}"></meta>`
    }
    return html.slice(0, endOfHeadIndex) + str + html.slice(endOfHeadIndex)
}

export default (req, res) => {
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
}