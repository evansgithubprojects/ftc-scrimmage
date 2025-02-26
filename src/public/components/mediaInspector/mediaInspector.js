document.head.appendChild(createElement('link', {href: '/utils/mediaInspector/mediaInspector.css', rel: 'stylesheet'}))

const overlay = createElement('div', { id: 'media-inspector', className: 'overlay' })

let mediaHovered = false

let mediaDisplay

export const inspectMedia = (isVideo, publicId) => {
    mediaDisplay = createElement(isVideo ? 'video' : 'img', { src: `/cdn/media/${publicId}` })

    if (isVideo) {
        mediaDisplay.loop = true
        mediaDisplay.controls = true
        mediaDisplay.autoplay = true
    }

    mediaDisplay.onmouseenter = () => mediaHovered = true
    mediaDisplay.onmouseleave = () => mediaHovered = false
    
    overlay.append(mediaDisplay)
    overlay.classList.add('enabled')
}

overlay.onclick = () => {
    if (mediaHovered) return

    overlay.classList.remove('enabled')
    mediaDisplay.remove()
}

document.body.append(overlay)