import {initChatWindow} from './chatWindow.js'
import loadChat from './loadChat.js'
import {showPortal} from '../components/portal/portal.js'

document.head.append(createElement('script', {src: './chatWindow.js', type: 'module'}))

const teamNumberInput = document.querySelector('#team-number')
const chatButton = document.querySelector('#chat')
const teamButtons = document.querySelector('#teams')
const scrimmageButtons = document.querySelector('#scrimmages')
const eventButtons = document.querySelector('#events')

export const url = new URL(window.location)

let currentChatId = url.searchParams.get('chat')
let chatDB = {}

export const chats = {
    getCurrent() {
        return chatDB[currentChatId]
    },
    setCurrent(chatId) {
        currentChatId = chatId
    },
    get(chatId) {
        return chatDB[chatId]
    },
    add(chat) {
        chatDB[chat.publicId] = chat
    },
    addMessage(message) {
        chatDB[message.chat].messages.push(message)
    }
}

const createDM = async (teamNumber) => {
    chatButton.disabled = true
    const response = await postJSON('/createChat', {teamNumber})
    switch (response.status) {
        case 400:
            alert("You can't message yourself!")
            break
        case 404:
            alert(`Team ${teamNumber} hasn't signed up yet!`)
            break
        case 200:
            const { chat } = response
            if (!document.querySelector(`#${chat.publicId}`)) {
                addChatButton(chat)
            }
            chats.add(chat)
            loadChat(chat)
            break
    }
    chatButton.disabled = false
}

const init = () => {
    const chatToLoad = url.searchParams.get('dm')
    if (chatToLoad) createDM(chatToLoad)

    chatButton.onclick = () => {
        createDM(teamNumberInput.value)
    }
    
    for (const route of [ '/getDms', '/getScrimmageChats', '/getEventChats']) {
        fetch(route).then(async response => {
            for (const chat of (await response.json()).chats) {
                chats.add(chat)
                addChatButton(chat)
                if (!chatToLoad && chat.publicId === currentChatId) loadChat(chat)
            }
            document.querySelector('#chats-loading').remove()
            document.querySelector('.lists').style.display = 'flex'
        })
    }
    
    initChatWindow()
}

fetch('/auth').then(async response => {
    const {isAuthenticated} = await response.json()
    if (!isAuthenticated) return showPortal(false)
    init()
})

export const getChatName = chat => {
    if (chat.name) return chat.name
    const { members } = chat
    members.splice(members.findIndex(member => member.number === myTeamNumber), 1)
    let name = ''
    for (let i = 0; i < members.length; i++) {
        const member = members[i]
        name += `${member.number} ${member.name}`
        if (i != members.length - 1) name += ', '
    }
    return name
}

const generateChatButton = chat => {
    const chatName = getChatName(chat)
    const chatLabel = createElement('span', {style: 'font-size: 1.1em;', textContent: chatName})
    const notification = createElement('div', {className: 'notification'})
    if (chat.readReceipts && !chat.readReceipts[myTeamNumber.toString()]) {
        notification.style.display = 'block'
    }
    const button = createElement('button', {id: chat.publicId, className: 'team fancy', children: [chatLabel, notification]})
    button.onclick = () => loadChat(chat, chatName)

    return button
}

export const addChatButton = chat => {
    const button = generateChatButton(chat)
    switch (chat.type) {
        case 'team':
            teamButtons.append(button)
            break
        case 'scrimmage':
            scrimmageButtons.append(button)
            break
        case 'event':
            eventButtons.append(button)
    }
    return button
}