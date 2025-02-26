import { showPortal } from "../portal/portal.js"

document.head.appendChild(createElement('link', {href: '/components/header/header.css', rel: 'stylesheet'}))
document.body.appendChild(createElement('script', {src: '/components/portal/portal.js', type: 'module'}))

let messagesButton

const generateActionButton = (labelText, onclick) => {
    const label = createElement('span', {textContent: labelText})
    const notification = createElement('div', {className: 'notification'})
    const button = createElement('button', {className: 'header-button', children: [label, notification]})
    button.onclick = onclick
    return button
}

const openDiscord = () => window.open('https://discord.gg/9BReJsmd6R', '_blank').focus()
const goHome = () => navigate('/home')

const createDropdown = (text, options) => {
    const label = createElement('span', {textContent: text})
    const buttons = []
    for (const [label, path] of options) {
        buttons.push(createElement('button', {textContent: label, onclick: () => navigate(path)}))
    }
    const dropdownOptions = createElement('div', {className: 'dropdown-options column', children: buttons})
    return createElement('div', {className: 'dropdown column', children: [label, dropdownOptions]})
}

const authedPaths = [
    '/messages',
    '/dashboard',
    '/account'
]

let isAuthenticated

const navigate = path => {
    if (authedPaths.includes(path) && !isAuthenticated) {
        showPortal()
        return
    }
    window.location.href = path
}

const loadingCircle = createElement('img', { src: '/loading.png' })
const header = createElement('div', {className: 'header', children: [ loadingCircle ]})

document.body.insertBefore(header, document.body.firstChild)

fetch('/auth').then(async response => {
    response = await response.json()
    isAuthenticated = response.isAuthenticated

    const branding = `<div class="branding">
        <img id='home-link' src="/absolutelogo.png"></img>
        <span id="text-home-link" class="ledium title">FTC Scrimmage</span>
    </div>`

    header.innerHTML = branding
    header.querySelector('#home-link').onclick = goHome
    header.querySelector('#text-home-link').onclick = goHome

    const isMobile = mobileCheck()

    let actionsContainer
    if (isMobile) {
        const actionsToggle = createElement('button', {className: 'hamburger column'})
        actionsContainer = createElement('div', {className: 'overlay'})
        actionsToggle.onclick = () => actionsContainer.classList.add('enabled')
        header.append(actionsToggle)
        document.body.append(actionsContainer)
    }
    else {
        actionsContainer = createElement('div', {className: 'header-actions'})
    }

    const authButton = generateActionButton(isAuthenticated ? 'Logout' : 'Login', () => {
        if (isAuthenticated) {
            fetch('/logout', {method: 'POST'}).then(async (response) => {
                response = await response.json()
                switch (response.status) {
                    case 401:
                        break;
                    case 200:
                        window.location.reload()
                }
            })
        }
        else {
            showPortal()
        }
    })

    const profileButton = generateActionButton('Profile', () => isAuthenticated ? navigate(`/profile/${myTeamNumber}`) : showPortal())

    messagesButton = generateActionButton('Messages', () => isAuthenticated ? navigate('/messages') : showPortal())

    const discordButton = generateActionButton('Discord', openDiscord)
    const exploreButton = generateActionButton('Explore', () => navigate('/explore'))
    const accountDropdown = createDropdown('Account', [
        ['My Scrimmages', '/dashboard'],
        ['Account/Profile Settings', '/account']
    ])
    actionsContainer.append(discordButton, profileButton, exploreButton, messagesButton, accountDropdown, authButton)

    if (isMobile) {
        const homeButton = generateActionButton('Home', goHome)
        actionsContainer.insertBefore(homeButton, actionsContainer.firstChild)
        const discordButton = generateActionButton('Discord', openDiscord)
        actionsContainer.append(discordButton)
        const closeButton = createElement('button', { textContent: 'Close' })
        closeButton.onclick = () => actionsContainer.classList.remove('enabled')
        actionsContainer.append(closeButton)
    }

    header.append(actionsContainer)

    socket.on('newMessage', message => {
        if (window.location.pathname != '/messages/') {
            messagesButton.querySelector('.notification').style.display = 'block'
        }
    }) 
})