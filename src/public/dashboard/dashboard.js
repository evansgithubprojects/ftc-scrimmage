import {displayScrimmage} from './displayScrimmage.js'
import createForm from '../components/form/form.js'

const scrimmagesContainer = document.querySelector('#scrimmages')

const loadingCircle = document.querySelector('#loading')

let scrimmages

const hiddenScrimmageTypes = []

const refreshScrimmages = () => {
    loadingCircle.style.display = 'block'
    while (scrimmagesContainer.firstChild) {
        scrimmagesContainer.firstChild.remove()
    }
    for (const scrimmage of scrimmages) {
        if (hiddenScrimmageTypes.includes('participations') && scrimmage.host != myTeamNumber) continue
        if (hiddenScrimmageTypes.includes('hosts') && scrimmage.host === myTeamNumber) continue
        displayScrimmage(scrimmage)
    }
    loadingCircle.style.display = 'none'
}

fetch('/getScrimmages').then(async response => {
    scrimmages = (await response.json()).scrimmages
    refreshScrimmages()
})

for (const checkbox of document.querySelectorAll('input[type="checkbox"')) {
    checkbox.oninput = function() {
        if (this.checked) {
            hiddenScrimmageTypes.splice(hiddenScrimmageTypes.indexOf(this.id), 1)
        }
        else {
            hiddenScrimmageTypes.push(this.id)
        }

        refreshScrimmages()
    }
}

const createScrimmageForm = createForm([
    {
        max_characters: 200,
        placeholder: 'My Awesome Scrimmage',
        title: 'Title',
        param: 'title'
    },
    {
        type: 'date',
        title: 'Date'
    },
    {
        type: 'time',
        title: 'Time'
    },
    {
        title: 'Street Address',
        param: 'street'
    },
    {
        title: 'City',
    },
    {
        title: 'State/Province',
        param: 'state'
    },
    {
        title: 'Info',
        type: 'text',
        max_characters: 500
    },
    {
        type: 'checkbox',
        title: 'Public?',
        param: 'isPublic'
    }
], 'Create', '/createScrimmage')

createScrimmageForm.onSubmit = ({ scrimmageCode }) => {
    window.location.href = `/scrimmage/${scrimmageCode}`
    return 'Redirecting...'
}

const overlay = document.querySelector("#create-overlay")
overlay.insertBefore(createScrimmageForm.element, overlay.firstChild)

document.querySelector('#cancel').onclick = () => overlay.classList.remove('enabled')
document.querySelector('#create').onclick = () => overlay.classList.add('enabled')