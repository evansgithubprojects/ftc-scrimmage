const isMobile = mobileCheck()

const createSection = (title, content) => {
    const titleElement = createElement('span', {textContent: title})
    const contentElement = createElement('p', {textContent: content})
    return createElement('div', {className: 'section column', children: [titleElement, contentElement]})
}

export default scrimmage => {
    const title = createElement('a', {className: 'ledium title', textContent: scrimmage.title, href: `/scrimmage/${scrimmage.code}`})
    const shareCode = createElement('span', {textContent: `Share Code: ${scrimmage.code}`})
    const {address} = scrimmage
    const location = createSection('Location', `${address.street}, ${address.city}, ${address.state}`)
    const info = createSection('Info', scrimmage.info)
    const sections = createElement('div', {className: 'sections', children: [location, info]})
    const children = [title, shareCode, sections]
    return createElement('div', {className: 'scrimmage column', children})
}