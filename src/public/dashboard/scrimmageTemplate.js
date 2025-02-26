import {format, formatDistanceToNow} from 'https://cdn.skypack.dev/date-fns'

export const generateScrimmageTemplate = (scrimmage) => {
    const scrimmageCode = scrimmage.code
    const title = createElement('a', { className: 'ledium title', textContent: scrimmage.title, href: `/scrimmage/${scrimmageCode}`})
    const editButton = createElement('button', { textContent: 'Edit' })
    editButton.onclick = () => window.location.href = `/scrimmage/${scrimmageCode}/edit`
    const plural = scrimmage.participants.length > 1 ? 'Participants' : 'Participant'
    const participantCount = createElement('span', {textContent: `${scrimmage.participants.length} ${plural}`})
    const date = createElement('p', {textContent: format(scrimmage.date, 'EEEE, MMMM dd, yyyy @h:mm a (') + formatDistanceToNow(scrimmage.date) + ')'})
    const info = createElement('p', {textContent: scrimmage.info})
    const display = createElement('div', {className: 'scrimmage column', children: [title, editButton, participantCount, date, info]})
    return display
}