export default media => {
    media.onloadedmetadata = () => {
        media.onseeked = () => {
            const canvas = createElement('canvas')
            canvas.width = media.videoWidth
            canvas.height = media.videoHeight
            canvas.getContext('2d').drawImage(media, 0, 0, canvas.width, canvas.height)
            media.poster = canvas.toDataURL('image/jpeg')
        }
        media.currentTime = 0
    }
    media.preload = 'metadata'
}