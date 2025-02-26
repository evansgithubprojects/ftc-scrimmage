document.head.append(createElement('script', { src: 'https://cdn.jsdelivr.net/npm/handlebars@latest/dist/handlebars.min.js' }))

import generateVideoPoster from './generateVideoPoster.js'
import { inspectMedia } from '../components/mediaInspector/mediaInspector.js'

const isMobile = mobileCheck()

export default (publicId, mimetype) => {
    const linkImage = createElement('img', { src: '/icons/link.png' })
    const copyLinkButton = createElement('button', { className: 'copy-link', children: [linkImage] })

    let copied = false

    copyLinkButton.onclick = async () => {
        if (copied) return
        copied = true
        copyLinkButton.querySelector('img').src = '/loading.png'
        await navigator.clipboard.writeText(`${window.location.origin}/post/${publicId}`)
        await postJSON('/share', { publicId })
        copyLinkButton.querySelector('img').src = '/icons/checkmark.png'
    }
    
    const footer = createElement('div', { 
        className: 'frozen-row border max width centered-content small-padding small-gap', 
        children: [copyLinkButton] 
    })

    fetch(`/postData/${publicId}`).then(async response => {
        const { data } = await response.json()
        footer.append(
            createElement('span', { textContent: `Views: ${data.views.length}` }),
            createElement('span', { textContent: `Shares: ${data.shares.length}`})
        )
    })

    postJSON(`/viewPost`, { publicId })

    const display = createElement('div', { className: 'media small-padding column float', children: [footer] })

    const isVideo = mimetype === 'mp4'
    const media = createElement(isVideo ? 'video' : 'img', { className: 'fancy', draggable: false, src: `/cdn/media/${publicId}` })
    
    if (isVideo) {
        if (!isMobile) {
            const playButton = createElement('img', { className: 'play', src: '/icons/play.png' })
            playButton.style.pointerEvents = 'none'
            playButton.onclick = () => inspectMedia(true, src)
            display.append(playButton)
        }
        else {
            generateVideoPoster(media)
            media.loop = true
            media.controls = true
        }
    }

    if (!mobileCheck()) {
        media.onclick = () => inspectMedia(isVideo, publicId)
    }

    display.insertBefore(media, footer)

    return display
}