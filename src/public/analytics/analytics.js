const usersGraph = document.querySelector('#users')
usersGraph.width = usersGraph.clientWidth
usersGraph.height = usersGraph.clientHeight
const ctx = usersGraph.getContext('2d')

const xCoords = []
const yCoords = []
const canvasCoordinates = []

const padding = 0.1
const rawPadding = 1 - padding

const width = usersGraph.width
const height = usersGraph.height

const xCenter = width / 2
const yCenter = height / 2

let minX = 0
let maxX = 0
let maxY = 0

const getRealCoordinates = (x, y) => {
    const xPercent = (x - minX) / (maxX - minX)
    const yPercent = y / maxY
    const rawX = width * xPercent
    const rawY = height - (height * yPercent)
    const xOffsetFromCenter = xCenter - rawX
    const yOffsetFromCenter = yCenter - rawY
    const dataX = xOffsetFromCenter * rawPadding
    const dataY = yOffsetFromCenter * rawPadding
    const realX = xCenter - dataX + 20
    const realY = yCenter - dataY

    return [realX, realY]
}

const drawGraphBorder = () => {
    const lowerY = yCenter + height / 2 * rawPadding
    const xOffset = width * rawPadding / 2

    ctx.moveTo(xCenter - xOffset + 20, lowerY)
    ctx.lineTo(xCenter + xOffset + 20, lowerY)
    ctx.stroke()
}

const drawLine = (realX, realY) => {
    //y line
    ctx.strokeStyle = 'white'
    ctx.moveTo(realX, yCenter + height / 2 * rawPadding)
    ctx.lineTo(realX, realY)
    ctx.stroke()
}

const drawPoint = (index, canvasX, canvasY) => {
    ctx.fillStyle = '#d31ed6'
    ctx.shadowColor = '#d31ed6'
    ctx.shadowBlur = 8

    //dot
    ctx.strokeStyle = '#d31ed6'
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

const drawText = (x, y, canvasX, canvasY) => {
    ctx.fillStyle = 'white'
    ctx.shadowBlur = 0
    //left-side label
    ctx.font = '20px montserrat'
    ctx.fillText(y, 20, canvasY + 5)
    //on point label
    const xOffset = xCenter - canvasX
    ctx.fillText(y, xCenter - xOffset - 30, canvasY)
    //x label
    const date = new Date(x)
    const dayString = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate()
    ctx.font = '10px montserrat'
    ctx.fillText(dayString, canvasX - 25, yCenter + height / 2 * rawPadding + 16)
}

const render = () => {
    drawGraphBorder()

    minX = Math.min(...xCoords)
    maxX = Math.max(...xCoords)
    maxY = Math.max(...yCoords)

    for (let i = 0; i < xCoords.length; i++) {
        const coords = getRealCoordinates(xCoords[i], yCoords[i])
        const [x, y] = coords
        canvasCoordinates[i] = coords
        drawLine(x, y)
    }
    
    for (let i = 0; i < xCoords.length; i++) {
        const [x, y] = canvasCoordinates[i]
        drawPoint(i, x, y)
        drawText(xCoords[i], yCoords[i], x, y)
    }
}

fetch('/getAnalytics').then(async response => {
    const {analytics} = await response.json()
    const {teams} = analytics
    for (const team of teams) {
        xCoords.push(new Date(team.date).getTime())
        yCoords.push(team.teamCount)
    }

    render()
})