import {toZonedTime} from 'https://esm.run/date-fns-tz'
import { chats } from './messages.js'

const messageContainer = document.querySelector('#messages')

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default (message) => {
    const date = toZonedTime(new Date(message.sentDate), timezone)
    const direction = message.author === myTeamNumber ? 'outgoing' : 'incoming'
    const text = createElement('p', {textContent: message.text})
    const time = createElement('span', {className: 'snormal', textContent: date.toString().substring(16, 21)})
    const messageElement = createElement('div', {className: `message ${direction} column`, children: [text, time]})
    const {members, type} = chats.getCurrent()
    if ((members.length > 2 || type === 'scrimmage') && message.author != myTeamNumber) {
        const from = members.find(member => member.number === message.author)
        const team = createElement('span', {className: 'snormal', textContent: `${from.number} ${from.name}`})
        messageElement.insertBefore(team, messageElement.firstChild)
    }
    messageContainer.append(messageElement)
    messageElement.scrollIntoView()
}