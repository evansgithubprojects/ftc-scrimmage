import {chats, addChatButton} from './messages.js'
import displayMessage from './displayMessage.js'

const messageContainer = document.querySelector('#messages')

export const initChatWindow = () => {
    const input = document.querySelector('#message')

    input.onkeyup = async (event) => {
        if (event.key === 'Enter') {
            const currentChat = chats.getCurrent()
            const response = await postJSON('/sendMessage', {
                chatId: currentChat.publicId,
                chatType: currentChat.type,
                text: input.value
            })
            if (response.status === 200) {
                input.value = ''
                displayMessage(response.message)
            }
            else if (response.status != 400) {
                alert('Message failed to send')
            }
        }
    }
}

socket.on('newMessage', ({message, chat}) => {
    new Audio('/audio/message.mp3').play()

    const currentChat = chats.getCurrent()

    if (currentChat && message.chat === currentChat.publicId) {
        postJSON('/readChat', {chatId: currentChat.publicId})
        displayMessage(message)
        return
    }
    
    if (chats.get(message.chat)) {
        chats.addMessage(message)
        document.querySelector(`#${message.chat}`).querySelector('.notification').style.display = 'block'
    }
    else {
        chats.add(chat)
        addChatButton(chat).querySelector('.notification').style.display = 'block'
    }
})