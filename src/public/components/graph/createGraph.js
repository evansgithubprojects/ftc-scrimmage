document.head.append(createElement('link', { href: '/components/graph/graph.css', rel: 'stylesheet' }))

export const createLine = (points, color) => {
    return { points, color, xCoords: [], yCoords: [] }
}

export const createGraph = (width, height, lines, parent = document.body) => {
    const graph = createElement('canvas', {
        className: 'graph',
        style: `width: ${width}px; height: ${height}px`,
        width,
        height
    })
    const ctx = graph.getContext('2d')

    const canvasCoordinates = []

    const padding = 0.2
    const rawPadding = 1 - padding

    const xCenter = width / 2
    const yCenter = height / 2

    let minX = 0
    let maxX = 0
    let maxY = 0
    let lowerY = 0

    const getRealCoordinates = (x, y) => {
        const xPercent = (x - minX) / (maxX - minX) || 0
        const yPercent = y / maxY
        const rawX = width * xPercent
        const rawY = height - (height * yPercent)
        const xOffsetFromCenter = xCenter - rawX
        const yOffsetFromCenter = yCenter - rawY
        const dataX = xOffsetFromCenter * rawPadding
        const dataY = yOffsetFromCenter * rawPadding
        const realX = xCenter - dataX
        const realY = yCenter - dataY

        return [realX, realY]
    }

    const drawGraphBorder = () => {
        const xOffset = width * rawPadding / 2

        ctx.strokeStyle = 'white'
        ctx.moveTo(xCenter - xOffset, lowerY)
        ctx.lineTo(xCenter + xOffset, lowerY)
        ctx.stroke()
    }

    const drawPoint = (index, canvasX, canvasY, color) => {
        ctx.fillStyle = color
        ctx.shadowColor = color
        ctx.shadowBlur = 8

        //dot
        ctx.strokeStyle = color
        ctx.beginPath()
        ctx.arc(canvasX, canvasY, 5, 0, 2 * Math.PI)
        ctx.fill()
        ctx.stroke()

        //connecting line
        if (index > 0) {
            const [lastX, lastY] = canvasCoordinates[index - 1]
            ctx.moveTo(canvasX, canvasY)
            ctx.lineTo(lastX, lastY)
            ctx.stroke()
        }
    }

    const drawText = (x, y, canvasX, canvasY, color) => {
        ctx.strokeStyle = color
        ctx.fillStyle = 'white'
        ctx.lineWidth = 2
        ctx.shadowBlur = 0
        //on point label
        ctx.font = '20px montserrat'
        ctx.textAlign = 'center'
        const xOffset = xCenter - canvasX
        ctx.strokeText(y, xCenter - xOffset, canvasY - 10)
        ctx.fillText(y, xCenter - xOffset, canvasY - 10)
        //x label
        const date = new Date(x)
        const dayString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
        ctx.font = '15px montserrat'
        ctx.fillText(dayString, canvasX, lowerY + 20)
    }

    const render = () => {
        const allXCoords = lines.map(({ xCoords }) => xCoords).flat()
        const allYCoords = lines.map(({ yCoords }) => yCoords).flat()
        minX = Math.min(...allXCoords)
        maxX = Math.max(...allXCoords)
        maxY = Math.max(...allYCoords)
        lowerY = yCenter + height / 2 * rawPadding

        drawGraphBorder()

        for (const { xCoords, yCoords, color } of lines) {
            for (let i = 0; i < xCoords.length; i++) {
                const coords = getRealCoordinates(xCoords[i], yCoords[i])
                canvasCoordinates[i] = coords
                const [x, y] = coords
                drawPoint(i, x, y, color)
                drawText(xCoords[i], yCoords[i], x, y, color)
            }
        }
    }

    for (const line of lines) {
        for (const point of line.points) {
            line.xCoords.push(new Date(point.date).getTime())
            line.yCoords.push(point.value)
        }
    }

    render()

    parent.append(graph)
}