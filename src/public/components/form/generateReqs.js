const createReqDisplay = (req, input) => {
    const reqDisplay = createElement('li', {textContent: req.label})
    input.addEventListener('input', () => {
        reqDisplay.style.color = req.test.test(input.value) ? '#00bbff' : 'var(--light)'
    })
    return reqDisplay
}

export default (field, reqs) => {
    const reqList = createElement('ul', {className: 'form-reqs'})
    reqs.forEach(req => {
        const display = createReqDisplay(req, field.input)
        field.reqs[req.label] = {
            test: req.test,
            display
        }
        reqList.appendChild(display)
    })
    return reqList
}