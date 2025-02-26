import { showPortal } from "../components/portal/portal.js"
import generateMediaDisplay from "../utils/generateMediaDisplay.js"
import { createLine, createGraph } from "../components/graph/createGraph.js"
import { inspectMedia } from "../components/mediaInspector/mediaInspector.js"

const dmButton = document.querySelector('#dm')
const galleryDisplay = document.querySelector('#gallery')

const viewingTeamNumber = parseInt(window.location.pathname.split('/')[2])

const navigate = path => {
    window.location.href = path
}

fetch('/auth').then(async response => {
    const {isAuthenticated} = await response.json()

    if (!isAuthenticated) {
        dmButton.onclick = showPortal
        dmButton.textContent = 'Send Message'
    }
    else {
        fetch('/getTeamNumber').then(async response => {
            const { teamNumber } = await response.json()
            if (viewingTeamNumber === teamNumber) {
                dmButton.onclick = () => navigate('/account')
                dmButton.textContent = 'Edit Profile'
            }
            else {
                dmButton.onclick = () =>  navigate(`/messages?dm=${viewingTeamNumber}`)
                dmButton.textContent = 'Send Message'
            }
        })

        postJSON('/viewProfile', {teamNumber: viewingTeamNumber})
    }
})

const scrimmageList = document.querySelector('#scrimmage-list')
const participatingList = document.querySelector('#participation-list')

const listScrimmage = (scrimmage) => {
    const element = createElement('button', {className: 'scrimmage fancy', textContent: scrimmage.title})
    element.onclick = () => navigate(`/scrimmage/${scrimmage.code}`)
    if (scrimmage.host === viewingTeamNumber) {
        scrimmageList.append(element)
    }
    else {
        participatingList.append(element)
    }
}

const populateName = info => {
    const numberLabel = document.querySelector('#number')
    numberLabel.style.color = info.color
    numberLabel.style.textShadow = `0 0 40px ${info.color}`
    numberLabel.textContent = info.teamNumber
    document.querySelector('#name').textContent = info.name
}

const populateContacts = info => {
    const emailContact = document.querySelector('#email')
    const instagramContact = document.querySelector('#instagram')
    const scoutContact = document.querySelector('#scout-link')
    const emailLink = emailContact.querySelector('a')
    const instagramLink = instagramContact.querySelector('a')
    emailLink.href = `mailto://${info.email}`
    emailLink.textContent = info.email
    if (info.instagram) {
        instagramLink.href = `https://instagram.com/${info.instagram}`
    }
    instagramLink.textContent = info.instagram || 'None'
    scoutContact.querySelector('a').href = `https://ftcscout.org/teams/${viewingTeamNumber}`
}

const populateBanner = color => {
    const bannerImage = document.querySelector('#banner')
    bannerImage.style.border = `2px solid ${color}`
    bannerImage.src = `/cdn/banner/${viewingTeamNumber}`
}

const populateOPR = opr => {
    const graphContainer = document.querySelector('#opr-graph')
    const secondaryColor = getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()
    createGraph(
        screen.width < 500 ? screen.width - 20 : 500, 300, 
        [ 
            createLine(opr.auto, secondaryColor), 
            createLine(opr.teleop, 'red'),
            createLine(opr.endgame, 'blue')
        ], 
        graphContainer
    )
}

const initPostId = (new URL(window.location)).searchParams.get('view')

const populateGallery = gallery => {
    if (gallery.length > 0) {
        for (const [publicId, mimetype] of gallery) {
            if (publicId === initPostId) inspectMedia(mimetype === 'mp4', publicId)
            galleryDisplay.append(generateMediaDisplay(publicId, mimetype))
        }
    }
    else {
        document.querySelector('#empty-gallery').style.display = 'flex'
    }
}

postJSON('/getProfile', { teamNumber: viewingTeamNumber }).then(response => {
    if (response.status === 404) return alert('Team not found!')
    let { info, info: { scrimmages } } = response
    info.color = info.color || 'var(--secondary)'
    document.querySelector('.inner-header').style.filter = `drop-shadow(0 0px 8px ${info.color})`
    document.querySelector('#profile-views').textContent = `${info.profileViews} Profile Views`
    populateName(info)
    populateContacts(info)
    populateBanner(info.color)
    populateOPR(info.opr)
    scrimmages.forEach(listScrimmage)
    if (scrimmageList.childElementCount === 0) {
        scrimmageList.append(createElement('span', { textContent: 'None' }))
    }
    if (participatingList.childElementCount === 0) {
        participatingList.append(createElement('span', { textContent: 'None' }))
    }
})

postJSON('/getGallery', { teamNumber: viewingTeamNumber }).then(({ gallery }) => {
    document.querySelector('#gallery-loading').remove()
    populateGallery(gallery)
})