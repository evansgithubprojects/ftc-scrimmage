import { createGenericField, createFileField } from "./field.js"
import generateReqs from "./generateReqs.js"

const formFieldLabel = createElement('p', {className: 'form-field-label'})
const formFieldInfo = createElement('p', {className: 'snormal'})
const formFieldError = createElement('p', {className: 'form-field-error'})
const fieldTemplate = createElement('div', {className: 'form-field column', children: [formFieldLabel, formFieldInfo, formFieldError]})

export default (form, schema, data) => {
    let {
        type = 'text',
        accept,
        max_characters,
        autocomplete,
        placeholder = '',
        title,
        param,
        reqs = [],
        info,
        disabled = false,
        value = ''
    } = data

    let element = fieldTemplate.cloneNode(true)
    const errorDisplay = element.querySelector('.form-field-error')

    let field

    if (type !== 'file') {
        const input = createElement(type === 'text' ? 'textarea' : 'input', {
            className: 'form-input',
            placeholder,
            disabled,
            value
        })
        if (input.tagName != 'TEXTAREA') {
            input.type = type || 'text'

            if (type === 'checkbox') input.value = value === '' ? false : value
        }
        else {
            input.oninput = function() {
                this.style.height = ""
                this.style.height = this.scrollHeight + 3 + "px"
            }
        }
        if (max_characters) {
            input.maxLength = max_characters
        }
        if (autocomplete) {
            input.autocomplete = autocomplete
        }
        element.insertBefore(input, element.lastChild)
        const fieldTitle = title
        if (!param) {
            let parsedName = fieldTitle.split(' ').join('')
            param = parsedName.charAt(0).toLowerCase() +  parsedName.slice(1)
        }
        element.querySelector('.form-field-label').textContent = fieldTitle
        field = createGenericField(type, input, null, errorDisplay)
        
        const reqList = generateReqs(field, reqs)
        element.appendChild(reqList)
    
        element.querySelector('.snormal').textContent = info
    }
    else {
        field = createFileField(accept, null, errorDisplay, element)

        element.querySelector('.snormal').textContent = info
    }

    field.defaultDisabledValue = disabled

    schema.fields[param] = field

    const fieldsContainer = form.querySelector('.form-fields')
    fieldsContainer.insertBefore(element, fieldsContainer.firstChild)
}