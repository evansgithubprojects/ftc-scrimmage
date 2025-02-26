export default (redScore, blueScore) => {
    const tie = redScore == blueScore
    const redWin = redScore > blueScore

    return `
    <div class="frozen-row small-gap">
        <span class="red ${redWin ? 'winner' : ''}">${redScore}</span>
        <span class="blue ${!redWin && !tie ? 'winner' : ''}">${blueScore}</span>
    </div>`
}