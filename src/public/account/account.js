import createForm from '../components/form/form.js'
import { showPortal } from '../components/portal/portal.js'
import displayMedia from './displayMedia.js'

const galleryContainer = document.querySelector('#gallery')

const form = createForm([
    {
        disabled: true,
        title: 'Team Number',
        info: 'Please contact us at ftcscrimmage6@gmail.com to change your team number.'
    },
    {
        title: 'Email'
    },
    {
        title: 'Instagram'
    },
    {
        type: 'file',
        accept: ['image/png', 'image/jpeg'],
        param: 'banner'
    },
    {
        title: 'Profile Color',
        type: 'color',
        param: 'color'
    }
], 'Save', '/updateAccount')
form.disable()
document.querySelector('#sidebar').insertBefore(form.element, sidebar.children[1])

const emailForm = createForm([
    {
        type: 'checkbox',
        title: 'Scrimmage Notifications',
        param: 'scrimmages'
    },
    {
        type: 'checkbox',
        title: 'Message Notifications',
        param: 'messages'
    }
], 'Save Preferences', '/updateEmailPreferences')
emailForm.disable()
document.querySelector('#email-preferences').append(emailForm.element)

fetch('/auth').then(async response => {
    const {isAuthenticated, teamNumber} = await response.json()

    if (!isAuthenticated) return showPortal()

    document.querySelector('#open-profile').onclick = () => window.location.href = `/profile/${teamNumber}`

    postJSON('/getProfile', {teamNumber}).then(async ({ info }) => {
        const { email, instagram, color = '#d31ed6' } = info

        form.populate({
            teamNumber,
            email,
            instagram,
            banner: `/cdn/banner/${teamNumber}`,
            color
        })
        form.enable()
        form.onSubmit = () => {}
    })

    postJSON('/getGallery', { teamNumber }).then(({ gallery }) => {
        gallery.forEach(displayMedia)
    })

    fetch('/getEmailPreferences').then(async response => {
        const { scrimmages, messages } = await response.json()
        
        emailForm.populate({
            scrimmages,
            messages
        })
        emailForm.enable()
        emailForm.onSubmit = () => {}
    })

    document.querySelector('#upload').oninput = async function() {
        const mediaFile = this.files[0]
        const formData = new FormData()
        formData.append('mediaFile', mediaFile)
        const loadingGIF = createElement('img', { src: '/loading.png' })

        const loadingSquare = createElement('div', { className: 'media float', children: [ loadingGIF ]})
        galleryContainer.append(loadingSquare)
        const { status, err, media } = await postForm('/uploadMedia', formData)
        loadingSquare.remove()
        switch (status) {
            case 200:
                displayMedia(media)
                break
            case 400:
                if (err) alert(err)
                break
        }
    }
})