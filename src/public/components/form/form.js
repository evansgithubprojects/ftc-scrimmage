document.head.appendChild(createElement('link', {href: '/components/form/form.css', rel: 'stylesheet'}))

import generateField from "./generateField.js"

const fields = createElement('div', {className: 'form-fields'})
const formSubmitButton = createElement('button')
const successMessage = createElement('p', {className: 'success-message'})
const globalError = createElement('p', {className: 'global-error'})
const formTemplate = createElement('div', {className: 'form column', children: [fields, formSubmitButton, successMessage, globalError]})

const getFormData = (form, defaultPayload) => {
    const data = new FormData()
    if (defaultPayload) {
        for (const [paramName, value] of Object.entries(defaultPayload)) {
            data.append(paramName, value)
        }
    }
    for (const [paramName, { value }] of Object.entries(form.fields)) {
        if (!value && typeof value !== 'boolean') continue
        data.append(paramName, value)
    }
    return data
}
 
export default (fields, submitLabel, path, defaultPayload) => {
    const form = formTemplate.cloneNode(true)
    if (fields.length > 5 && !mobileCheck()) {
        form.classList.add('expanded')
    }
    const submitButton = form.querySelector('button')
    submitButton.textContent = submitLabel
    const schema = {
        fields: {},
        element: form,
        onSubmit() {
            console.error("no listener!")
        },
        populate(values) {
            for (const [fieldName, value] of Object.entries(values)) {
                const field = this.fields[fieldName]
                field.populate(value)
            }
        },
        reload() {
            for (const { input } of Object.values(this.fields)) {
                input.value = ''
            }
        },
        disable() {
            submitButton.textContent = ''
            submitButton.disabled = true
            submitButton.append(createElement('img', { src: '/loading.png' }))
            for (const { input } of Object.values(this.fields)) {
                if (!input) continue
                input.disabled = true
            }
        },
        enable() {
            submitButton.querySelector('img').remove()
            submitButton.textContent = submitLabel
            submitButton.disabled = false
            for (const { input, defaultDisabledValue } of Object.values(this.fields)) {
                if (!input) continue
                input.disabled = defaultDisabledValue
            }
        },
        setDefaultPayload(newDefaultPayload) {
            defaultPayload = newDefaultPayload
        }
    }

    fields.slice().reverse().forEach((field) => generateField(form, schema, field))

    const globalError = form.querySelector('.global-error')
    const successMessage = form.querySelector('.success-message')

    const submitForm = async () => {
        submitButton.disabled = true
        submitButton.textContent = ''
        globalError.textContent = ''
        successMessage.textContent = ''
        for (const field of Object.values(schema.fields)) {
            field.error.textContent = ''
        }
        const response = await postForm(path, getFormData(schema, defaultPayload))
        submitButton.textContent = submitLabel
        submitButton.disabled = false
        submitButton.textContent = submitLabel
        switch(response.status) {
            case 200:
                const successText = schema.onSubmit(response)
                if (successText) {
                    successMessage.textContent = successText
                }
                break
            case 500:
                globalError.textContent = 'An unknown error occurred. Please try again.'
                break
            default:
                const [field, message] = response.err
                if (field === 'global') {
                    globalError.textContent = message
                }
                else {
                    schema.fields[field].error(message)
                }
                break
        }
    }

    submitButton.onclick = () => submitForm()

    main.insertBefore(form, main.firstChild)

    return schema
}