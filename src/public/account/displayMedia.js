import generateMediaDisplay from '../utils/generateMediaDisplay.js'

const gallery = document.querySelector('#gallery')

const removeAnimation = [
    [
        { transform: 'scale(1)' },
        { transform: 'scale(1.1)' },
        { transform: 'scale(0)' }
    ],
    {
        duration: 400,
        easing: 'ease-out'
    }
]

export default ([publicId, mimetype]) => {
    const display = generateMediaDisplay(publicId, mimetype)
    const deleteButton = createElement('button', { className: 'delete' })
    deleteButton.append(createElement('img', { src: '/icons/delete.png' }))
    deleteButton.onclick = async () => {
        const { status } = await postJSON('/deleteMedia', { videoId: publicId })
        if (status === 200) {
            display.animate(...removeAnimation)
            setTimeout(() => {
                display.remove()
            }, 400)
        }
    }
    display.append(deleteButton)
    gallery.append(display)
}