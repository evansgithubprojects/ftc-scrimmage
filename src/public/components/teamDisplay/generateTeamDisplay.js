document.head.append(createElement('link', {href: '/components/teamDisplay/teamDisplay.css', rel: 'stylesheet'}))

export default ({ number, name }) => {
    const nameLabel = createElement('a', { textContent: `${number} ${name}`, href: `/profile/${number}` })
    const element = createElement('div', { className: 'team', children: [nameLabel] })
    return {
        element,
        icon(type) {
            let src = `/icons/${type}.png`
            const container = createElement('div', { className: 'sections' })
            container.append(createElement('img', { src, style: 'height: 1.5em' }), nameLabel)
            element.insertBefore(container, element.firstChild)
        },
        stat(value) {
            element.append(createElement('span', { textContent: value }))
            return this
        }
    }
}