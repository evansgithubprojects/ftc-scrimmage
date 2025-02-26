import {format, formatDistanceToNow} from 'https://cdn.skypack.dev/date-fns'
import { showPortal } from '../components/portal/portal.js'
import { initResults, displayRankings, displayMatches } from './results.js'
import fileUploader from '../components/fileUploader.js'

const scrimmageCode = window.location.pathname.split('/')[2]
const main = document.querySelector('main')

const reply = async (accepted) => {
    const response = await postJSON('/replyToScrimmage', {scrimmageCode, accepted})
    if (response.status === 200) {
        window.location.reload()
    }
}

if (new URL(window.location).searchParams.get('login')) {
    fetch('/auth').then(async response => {
        const {isAuthenticated} = await response.json()
        if (!isAuthenticated) showPortal()
    })
}

const participantsContainer = document.querySelector('#participants-list')

const populateParticipants = ({ host, participants, pendingInvites }) => {
    for (const { number, name } of participants) {
        const nameLink = createElement('a', {
            target: '_blank', 
            href: `/profile/${number}`,
            textContent: `${number} ${name}`
        })
        const iconUrl = number === host ? '/icons/crown.png' : '/icons/checkmark.png'
        const statusIcon = createElement('img', { src: iconUrl })
        participantsContainer.append(createElement('div', { className: 'participant', children: [statusIcon, nameLink]}))
    }

    for (const { to, toName } of pendingInvites) {
        const nameLink = createElement('a', {
            target: '_blank', 
            href: `/profile/${to}`,
            textContent: `${to} ${toName}`
        })
        const statusIcon = createElement('img', { src: '/icons/pending.png' })
        participantsContainer.append(createElement('div', { className: 'participant', children: [statusIcon, nameLink]}))
    }
}

document.querySelector('#code').textContent = `Share Code: ${scrimmageCode}`
document.querySelector('.share-code').style.display = 'flex'

const copyButton = document.querySelector('#copy-code')
copyButton.onclick = async () => {
    copyButton.querySelector('img').src = '/loading.png'
    await navigator.clipboard.writeText(`${window.location.origin}/scrimmage/${scrimmageCode}`)
    copyButton.querySelector('img').src = '/icons/link.png'
}

fetch(`/scrimmageData/${scrimmageCode}`).then(async response => {
    response = await response.json()
    if (response.status === 404) {
        return alert("Scrimmage not found")
    }
    let {
        host,
        title,
        info,
        date,
        address,
        participants,
        pendingInvites
    } = response.scrimmage

    const { number: hostNumber } = participants.find(team => team.number === host)

    document.title = 'FTC Scrimmage - ' + title

    const actionButton = document.querySelector('#action')

    if (hostNumber === myTeamNumber) {
        const editButton = createElement('button', {textContent: 'Edit', onclick: () => window.location.href = `/scrimmage/${scrimmageCode}/edit`})
        document.querySelector('.inner-header').append(editButton)
    }

    if (pendingInvites.find(invite => invite.to == myTeamNumber)) {
        actionButton.remove()
        const label = createElement('span', {textContent: "You've been invited to this scrimmage!"})
        const accept = createElement('button', {className: 'accept', textContent: 'Accept'})
        const deny = createElement('button', {className: 'deny', textContent: 'Deny'})
        const notification = createElement('div', {className: 'invited', children: [label, accept, deny]})
        accept.onclick = async () => await reply(true)
        deny.onclick = async () => await reply(false)
        main.insertBefore(notification, main.firstChild)
    }
    else if (participants.find(participant => participant.number === myTeamNumber)) {
        actionButton.textContent = 'Open Chat'
        actionButton.onclick = () => window.location.href = `/messages?chat=${scrimmageCode}`
    }
    else if (new Date(date).getTime() > Date.now()) {
        actionButton.setAttribute('register', true)
        actionButton.textContent = 'Register'
        actionButton.onclick = async () => {
            if (myTeamNumber) {
                const {status} = await postJSON('/register', {scrimmageCode})
                if (status === 200) window.location.reload()
            }
            else {
                showPortal()
            }
        }
    }
    else {
        actionButton.remove()
    }

    populateParticipants(response.scrimmage)
    
    document.querySelector('#title').textContent = title
    document.querySelector('#info').textContent = info
    document.querySelector('#date').textContent = format(date, 'EEEE, MMMM dd, yyyy @h:mm a (') + formatDistanceToNow(date) + ')'
    document.querySelector('#address').textContent = `${address.street}, ${address.city}, ${address.state}`

    const resultsColumn = document.querySelector('#results')

    initResults(response.scrimmage)
    displayRankings(response.scrimmage)
    displayMatches(response.scrimmage)

    const resultsUploader = fileUploader('Upload Scrimmage Data', '.db')
    resultsUploader.appendTo(resultsColumn)
    resultsUploader.onUpload = async ([ dataFile ]) => {
        const formData = new FormData()
        formData.append('dataFile', dataFile)
        formData.append('scrimmageCode', scrimmageCode)
        const { status } = await postForm('/uploadScrimmageData', formData)
        if (status === 200) {
            window.location.reload()
        }
    }

    if (host != myTeamNumber) document.querySelector('.upload-mask').style.display = 'none'

    main.querySelector('img').remove()
    main.querySelector('.info').style.display = 'flex'
    document.querySelector('#participants').style.display = 'flex'
    resultsColumn.style.display = 'flex'
})