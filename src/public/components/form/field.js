import fileUploader from "../fileUploader.js"

const toBase64 = file => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
})

const generateBaseSchema = (type, input, initialValue, errorDisplay) => {
    return {
        type,
        input,
        value: initialValue,
        error(text) {
            errorDisplay.textContent = text
        }
    }
}

export const createFileField = (accept, initialValue, errorDisplay, fieldElement)  => {
    const uploader = fileUploader('Update Banner', accept.join(','))
    uploader.appendTo(fieldElement)
    const valueDisplay = createElement('img')
    fieldElement.append(valueDisplay)
    uploader.onUpload = async ([ file ]) => {
        schema.value = file
        valueDisplay.src = await toBase64(file)
    }
    const schema = generateBaseSchema('file', null, initialValue, errorDisplay)

    schema.populate = (file) => {
        if (typeof file === 'string') {
            valueDisplay.src = file
        }
        else {
            const { mimetype, data } = file
            valueDisplay.src = `data:${mimetype};base64,${data}`
        }
    }

    return schema
}

export const createGenericField = (type, input, initialValue, errorDisplay) => {
    const schema = generateBaseSchema(type, input, initialValue, errorDisplay)

    const valueProp = type === 'checkbox' ? 'checked' : 'value'

    schema.populate = (newValue) => {
        if (!newValue) return
        input[valueProp] = newValue
    }

    input.oninput = function() {
        schema.value = this[valueProp]
    }

    return schema
}