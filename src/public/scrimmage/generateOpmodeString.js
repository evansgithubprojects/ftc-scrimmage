import generateScoreDisplay from './generateScoreDisplay.js'

export default opmodeData => {
    const {red, blue} = opmodeData

    return `<div class="column match-display-section sections align-start">
        <div class="row align-start small-gap max width space-between">
            <div class="column small-gap">
                <span class="ledium">Samples</span>
                <div class="divider"></div>
                <div class="column max width">
                    <div class="frozen-row space-between small-gap max width">
                        <span class="ledium">High</span>
                        ${generateScoreDisplay(red.highSamples, blue.highSamples)}
                    </div>
                    <div class="frozen-row space-between small-gap max width">
                        <span class="ledium">Low</span>
                        ${generateScoreDisplay(red.lowSamples, blue.lowSamples)}
                    </div>
                    <div class="frozen-row space-between small-gap max width">
                        <span class="ledium">Net</span>
                        ${generateScoreDisplay(red.netSamples, blue.netSamples)}
                    </div>
                </div>
            </div>
            <div class="column small-gap">
                <span class="ledium">Specimens</span>
                <div class="divider"></div>
                <div class="column max width">
                    <div class="frozen-row space-between small-gap max width">
                        <span class="ledium">High</span>
                        ${generateScoreDisplay(red.highSpecimens, blue.highSpecimens)}
                    </div>
                    <div class="frozen-row space-between small-gap max width">
                        <span class="ledium">Low</span>
                        ${generateScoreDisplay(red.lowSpecimens, blue.lowSpecimens)}
                    </div>
                </div>
            </div>
        </div>
        <div class="row align-start small-gap max width space-between">
            <div class="column small-gap">
                <span class="ledium">Park Points</span>
                <div class="divider"></div>
                <div class="frozen-row small-gap max width centered-content">
                    ${generateScoreDisplay(red.parkPoints, blue.parkPoints)}
                </div>
            </div>
            <div class="column small-gap">
                <span class="ledium">Ascent Points</span>
                <div class="divider"></div>
                <div class="frozen-row small-gap max width centered-content">
                    ${generateScoreDisplay(red.ascentPoints, blue.ascentPoints)}
                </div>
            </div>
        </div>
    </div>`
}