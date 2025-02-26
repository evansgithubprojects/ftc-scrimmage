document.head.appendChild(createElement('link', {href: '/components/portal/portal.css', rel: 'stylesheet'}))

import createForm from '/components/form/form.js'

const form = createForm([
    {
        type: 'number',
        title: 'Team Number',
        max_characters: 5,
        param: 'teamID'
    },
    {
        type: 'email',
        title: 'Team Email',
        info: "This field is only required if you are signing up.",
        max_characters: 254,
        param: 'email'
    },
    {
        type: 'password',
        title: 'Password',
        info: "If you are signing up, whatever you enter in the box below will become your password."
    }
], 'Login', '/login')

form.onSubmit = ({status}) => {
    switch (status) {
        case 200:
            window.location.reload()
    }
}

const cancel = createElement('button', {textContent: 'Cancel'})
cancel.onclick = () => overlay.classList.remove('enabled')
const overlay = createElement('div', {id: 'portal-overlay', className: 'overlay', children: [form.element, cancel]})
document.body.appendChild(overlay)

export const showPortal = (canCancel = true) => {
    cancel.style.display = canCancel ? 'block' : 'none'
    overlay.classList.add('enabled')
}