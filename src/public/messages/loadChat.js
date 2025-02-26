import {toZonedTime} from 'https://esm.run/date-fns-tz'
import { chats, getChatName, url } from "./messages.js"
import displayMessage from './displayMessage.js'

const chatOverlay = document.querySelector('.no-chat')
const title = document.querySelector('#title')
const messageContainer = document.querySelector('#messages')

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone

export default (chat, chatName = null) => {
    if (!chatName) chatName = getChatName(chat)
    chatOverlay.style.display = 'block'
    const chatId = chat.publicId
    chats.setCurrent(chatId)
    messageContainer.innerHTML = ''
    messageContainer.append(createElement('div', {className: 'fade'}))
    title.textContent = chatName
    switch (chat.type) {
        case 'team':
            title.href = `/profile/${chatName.split(' ')[0]}`
            break
        case 'scrimmage':
            title.href = `/scrimmage/${chatId}`
        case 'event':
            title.href = `https://ftcscout.org/events/2024/${chatId}`
            break
    }
    let currentDate
    for (const message of chat.messages) {
        const date = toZonedTime(new Date(message.sentDate), timezone)
        const dayString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        if (currentDate != dayString) {
            currentDate = dayString
            messageContainer.append(createElement('span', {textContent: '- ' + dayString + ' -'}))
        }
        displayMessage(message)
    }
    chatOverlay.style.display = 'none'
    url.searchParams.set('chat', chatId)
    window.history.replaceState({}, '', url)
    const chatButton = document.getElementById(chatId)
    const notification = chatButton.querySelector('.notification')
    if (notification.style.display === 'block') {
        postJSON('/readChat', {chatId})
        notification.style.display = 'none'
    }
}