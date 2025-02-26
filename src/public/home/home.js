import { showPortal } from "../components/portal/portal.js"

const actions = document.querySelector('#actions')

fetch('/auth').then(async response => {
    const { isAuthenticated, teamNumber } = await response.json()

    let actionButton = createElement('button', { 
        className: 'ledium', 
        textContent: isAuthenticated ? 'Profile' : 'Login / Sign up'
    })

    if (isAuthenticated) {
        actionButton.onclick = () => window.location.href = `/profile/${teamNumber}`
    }
    else {
        actionButton.onclick = () => showPortal()
    }

    actions.insertBefore(actionButton, actions.firstChild)

    const exploreButton = createElement('button', { className: 'ledium', textContent: 'Explore'})
    exploreButton.onclick = () => window.location.href = '/explore'
    actions.appendChild(exploreButton)
})

fetch('/getStats').then(async response => {
    const {stats} = await response.json()
    document.querySelector('#teams').textContent = `${stats.numTeamsRegistered}/${stats.numTeams}`
    document.querySelector('#scrimmages').textContent = stats.numScrimmages
    document.querySelector('#participants').textContent = stats.numParticipants
    document.querySelector('#media').textContent = stats.numMedia

    document.querySelector('#stats-loading').remove()
    document.querySelector('.stats').style.display = 'flex'
})

fetch('/totd').then(async response => {
    const { totd: { number, name } } = await response.json()
    const label = document.querySelector('#totd-name')
    label.textContent = `${number} ${name}`
    label.href = `/profile/${number}`
    document.querySelector('#totd-banner').querySelector('img').src = `/cdn/banner/${number}`
})