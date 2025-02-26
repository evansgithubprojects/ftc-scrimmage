import { getOPR } from '../opr.js'

const teamOverlay = document.querySelector('#team-overlay')
const teamName = teamOverlay.querySelector('#team-name')
const [totalOPR, totalChangeSpan] = teamOverlay.querySelector('#total-opr').children
const [autoOPR, autoChangeSpan] = teamOverlay.querySelector('#auto-opr').children
const [teleopOPR, teleopChangeSpan] = teamOverlay.querySelector('#teleop-opr').children
const [endgameOPR, endgameChangeSpan] = teamOverlay.querySelector('#endgame-opr').children

const analyzeChange = (newValue, average, span) => {
    const percentChange = parseFloat(((newValue - average) / Math.abs(average) * 100 || 0).toFixed(2))
    const isGreaterThanZero = percentChange >= 0
    if (isGreaterThanZero) {
        span.setAttribute('positive', '')
    }
    else if (percentChange != 0) {
        span.setAttribute('negative', '')
    }
    
    if (Math.abs(percentChange) > 5) span.classList.add('significant')
    span.textContent = `${isGreaterThanZero ? '▲' : '▼'} ${percentChange}%`
}

export default (teamNumber, fullName) => {
    const { opr, average } = getOPR(teamNumber)
    teamName.textContent = fullName
    teamName.href = `/profile/${teamNumber}`
    if (opr) {
        const total = (opr.auto + opr.teleop + opr.endgame).toFixed(2)
        const totalAvg = average.auto + average.teleop + average.endgame

        totalOPR.textContent = `Total: ${total}`
        autoOPR.textContent = `Auto: ${opr.auto}`
        teleopOPR.textContent = `Teleop: ${opr.teleop}`
        endgameOPR.textContent = `Endgame: ${opr.endgame}`

        analyzeChange(total, totalAvg, totalChangeSpan)
        analyzeChange(opr.auto, average.auto, autoChangeSpan)
        analyzeChange(opr.teleop, average.teleop, teleopChangeSpan)
        analyzeChange(opr.endgame, average.endgame, endgameChangeSpan)
    }
    else {
        totalOPR.textContent = 'None'
        for (const span of [autoOPR, teleopOPR, endgameOPR, totalChangeSpan, autoChangeSpan, teleopChangeSpan, endgameChangeSpan]) {
            span.textContent = ''
        }
    }
    
    teamOverlay.classList.add('enabled')
}

teamOverlay.querySelector('#close').onclick = () => teamOverlay.classList.remove('enabled')