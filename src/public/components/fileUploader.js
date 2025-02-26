export default (labelText, accept) => {
    const schema = {}

    const input = createElement('input',{ type: 'file', accept})
    const label = createElement('span', { textContent: labelText })
    const mask = createElement('label', { className: 'upload-mask fancy', children: [input, label] })

    schema.appendTo = parent => parent.append(mask)

    input.oninput = function() {
        if (schema.onUpload) {
            schema.onUpload(this.files)
        }
        else {
            console.warn('No file upload listener!')
        }
    }

    return schema
}