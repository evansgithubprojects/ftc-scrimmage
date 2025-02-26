import {toZonedTime} from 'https://esm.run/date-fns-tz'
import createForm from '../components/form/form.js'
import generateTeamTemplate from './generateTeamTemplate.js'

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

const participantsList = document.querySelector('#participants')

const scrimmageCode = window.location.pathname.split('/')[2]

let isOver

const appendTeamToList = (list, teamNumber, teamName, actionButton) => {
    let display
    if (isOver) {
        display = createElement('span', { textContent: `${teamNumber} ${teamName}`})
    }
    else {
        display = generateTeamTemplate(teamNumber, teamName, actionButton)
    }
    list.append(display)
    return display
}

const displayInvite = (list, invite, actionButton) => {
    return appendTeamToList(list, invite.to, invite.toName, actionButton)
}

const displayParticipant = (participant, actionButton = null) => {
    return appendTeamToList(participantsList, participant.number, participant.name, actionButton)
}

const makeRevokeable = (invite, list) => {
    const revokeButton = createElement('button', {className: 'revoke', textContent: 'Revoke'})
    revokeButton.onclick = async () => {
        const response = await postJSON('/revokeInvite', {inviteId: invite.publicId})
        if (response.status === 200) {
            revokeButton.parentElement.remove()
            refreshList(list)
        }
    }
    list.append(revokeButton)

    return revokeButton
}

const makeRemoveable = participantNumber => {
    const removeButton = createElement('button', {className: 'revoke', textContent: 'Remove'})
    removeButton.onclick = async () => {
        const response = await postJSON('/removeParticipant', {scrimmageCode, participantNumber})
        if (response.status === 200) {
            removeButton.parentElement.remove()
        }
    }
    participantsList.append(removeButton)

    return removeButton
}

const refreshList = (list) => {
    if (list.childElementCount === 0) {
        list.append(createElement('span', {className: 'no-invites', textContent: 'none'}))
    }
    else if (list.querySelector('.no-invites')) {
        list.querySelector('.no-invites').remove()
    }
}

document.querySelector('#code').textContent = `Share Code: ${scrimmageCode}`
document.querySelector('#view-button').href = `/scrimmage/${scrimmageCode}`

fetch(`/scrimmageData/${scrimmageCode}`).then(async response => {
    const { scrimmage } = await response.json()
    scrimmage.date = new Date(scrimmage.date)

    isOver = scrimmage.date - Date.now() < 0

    //general
    const localDate = toZonedTime(scrimmage.date, timezone)
    let month = localDate.getMonth() + 1
    let day = localDate.getDate()
    if (month < 10) month = '0' + month
    if (day < 10) day = '0' + day
    const dayString = localDate.getFullYear() + '-' + month + '-' + day
    const timeString = localDate.toString().substring(16, 24)
    const title = document.querySelector('#title')
    const privacy = document.querySelector('#private')
    const date = document.querySelector('#date')
    const time = document.querySelector('#time')
    const street = document.querySelector('#street')
    const city = document.querySelector('#city')
    const state = document.querySelector('#state')
    const info = document.querySelector('#info')
    const save = document.querySelector('#save')
    if (isOver) {
        for (const element of [ title, privacy, date, time, street, city, state, info, save ]) {
            element.disabled = true
        }
    }
    title.value = scrimmage.title
    privacy.checked = scrimmage.private
    date.value = dayString
    time.value = timeString
    street.value = scrimmage.address.street
    city.value = scrimmage.address.city
    state.value = scrimmage.address.state
    info.value = scrimmage.info

    const declinedList = document.querySelector('#declined')
    const pendingList = document.querySelector('#pending')

    appendTeamToList(participantsList, myTeamNumber, scrimmage.participants.find(({number}) => number === myTeamNumber).name)

    for (const participant of scrimmage.participants) {
        if (participant.number === myTeamNumber) continue
        if (isOver) {
            displayParticipant(participant)
        }
        else {
            displayParticipant(participant, makeRemoveable(participant.number))
        }
    }
    participantsList.querySelector('img[src="/loading.png"]').remove()
    refreshList(participantsList)

    for (const declined of scrimmage.declinedInvites) {
        declinedList.append(createElement('span', {textContent: `${declined.to} ${declined.toName}`}))
    }
    declinedList.querySelector('img[src="/loading.png"]').remove()
    refreshList(declinedList)

    if (!isOver) {
        for (const invite of scrimmage.pendingInvites) {
            displayInvite(pendingList, invite, makeRevokeable(invite, pendingList))
        }
    }
    pendingList.querySelector('img[src="/loading.png"]').remove()
    refreshList(pendingList)
    if (isOver) {
        pendingList.querySelector('span').textContent = 'This scrimmage is over, so all pending invites have been disabled.'
    }

    if (!isOver) {
        const inviteForm = createForm([
            {
                title: 'Team Number',
                max_characters: 5,
                param: 'teamNumber',
                type: 'number'
            },{
                title: 'Team Email (Optional)',
                max_characters: 254,
                param: 'teamEmail',
                type: 'email'
            }
        ], 'Send Invite', '/inviteTeam', {scrimmageCode})
        inviteForm.onSubmit = ({invite}) => {
            inviteForm.reload()
            displayInvite(pendingList, invite, makeRevokeable(invite, pendingList))
            refreshList(pendingList)
            return `Invite sent to team ${invite.to} ${invite.toName} via email!`
        }
        document.querySelector('#invite-form').append(inviteForm.element)
    }

    const fields = {
        private: privacy,
        title,
        date,
        time,
        street,
        city,
        state,
        info
    }

    save.onclick = () => {
        const fieldValues = {}
        for (const [key, val] of Object.entries(fields)) {
            fieldValues[key] = val.type === 'checkbox' ? val.checked : val.value
        }
        postJSON('/updateScrimmage', {timezone, fields: fieldValues, scrimmageCode})
    }

    const updateInfoHeight = () => {
        info.style.height = ''
        info.style.height = info.scrollHeight + 3 + 'px'
    }
    updateInfoHeight()
    info.oninput = updateInfoHeight
})