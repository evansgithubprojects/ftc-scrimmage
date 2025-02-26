import { matchOverlay } from "./results.js"
import generateOpmodeString from "./generateOpmodeString.js"
import {calculateAutoPoints, calculateTeleopPoints, calculateTotalPoints} from './calculatePoints.js'
import createForm from '../components/form/form.js'

const updateMatchOverlay = document.querySelector('#update-match-overlay')

const updateMatchForm = createForm([
    {
        title: 'Red Team',
        max_characters: 5,
        info: 'Team 1',
        param: 'red1',
        type: 'number'
    },
    {
        max_characters: 5,
        info: 'Team 2',
        param: 'red2',
        type: 'number'
    },
    {
        title: 'Blue Team',
        max_characters: 5,
        info: 'Team 1',
        param: 'blue1',
        type: 'number'
    },
    {
        max_characters: 5,
        info: 'Team 2',
        param: 'blue2',
        type: 'number'
    }
], 'Update', '/updateAlliance')

updateMatchForm.onSubmit = () => {
    window.location.reload()
}

updateMatchOverlay.insertBefore(updateMatchForm.element, updateMatchOverlay.firstChild)

const getFullName = team => {
    return `${team.number} ${team.name}`
}

export default (matchNumber, match, isHost, isIncomplete) => {
    const { blue, red } = match.scoreDetails
    const autos = {
        blue: blue.auto,
        red: red.auto
    }
    const teleops = {
        blue: blue.teleop,
        red: red.teleop
    }

    const totalRedPoints = calculateTotalPoints(red)
    const totalBluePoints = calculateTotalPoints(blue)

    const redWin = totalRedPoints > totalBluePoints

    if (matchOverlay.childElementCount > 1) {
        matchOverlay.querySelector('.match-display').remove()
    }
    const aOrP = window.dateFns.format(match.startTime, 'aaaaa').toUpperCase()
    const hourMinute = window.dateFns.format(match.startTime, 'h:mm')

    const template = document.createElement('template')
    template.innerHTML = `<div class="match-display row align-start sections">
        <div class="column small-gap">
            <span id="time" class="ledium">Match ${matchNumber} (Started @${hourMinute}${aOrP}M)</span>
            <div class="divider"></div>
            ${isIncomplete ? `
                <div class="warning">
                    <img src="/icons/warning.png"></img>
                    <span>This match's data is incomplete. ${!isHost ? 'Ask the host of this scrimmage to update this match.' : ''}</span>
                </div>
            ` : ''}
            ${isHost ? `
                <button id="update-match">Update Alliances</button>
            ` : ''}
            <div class="column sections match-display-section align-start">
                <div class="row max width space-between">
                    <div class="column">
                        <p class="alliance-member red ${redWin ? 'winner' : ''}">${match.red[0] ? getFullName(match.red[0]) : '?'}</p>
                        <p class="alliance-member red ${redWin ? 'winner' : ''}">${match.red[1] ? getFullName(match.red[1]) : '?'}</p>
                    </div>
                    <span class="red final-score" style="${redWin ? 'text-shadow: 0 0 20px red; font-weight: bolder;' : ''}">${totalRedPoints}</span>
                </div>
                <div class="divider"></div>
                <div class="row max width space-between">
                    <div class="column">
                        <p class="alliance-member blue ${!redWin ? 'winner' : ''}">${match.blue[0] ? getFullName(match.blue[0]) : '?'}</p>
                        <p class="alliance-member blue ${!redWin ? 'winner' : ''}">${match.blue[1] ? getFullName(match.blue[1]) : '?'}</p>
                    </div>
                    <span class="blue final-score" style="${!redWin ? 'text-shadow: 0 0 20px #4287f5; font-weight: bolder;' : ''}">${totalBluePoints}</span>
                </div>
            </div>
        </div>
        <div class="column">
            <p class="large">
                Auto / 
                <span class="red">${calculateAutoPoints(autos.red)}</span>
                - 
                <span class="blue">${calculateAutoPoints(autos.blue)}</span>
            </p>
            ${generateOpmodeString(autos)}
            <p class="large">
                TeleOp / 
                <span class="red">${calculateTeleopPoints(teleops.red)}</span>
                - 
                <span class="blue">${calculateTeleopPoints(teleops.blue)}</span>
            </p>
            ${generateOpmodeString(teleops)}
        </div>
    </div>`
    matchOverlay.insertBefore(template.content.firstChild, matchOverlay.firstChild)

    const [red1, red2] = match.red
    const [blue1, blue2] = match.blue

    if (isHost) {
        document.querySelector('#update-match').onclick = () => {
            updateMatchForm.populate({
                red1: red1 ? red1.number : '',
                red2: red2 ? red2.number : '',
                blue1: blue1 ? blue1.number : '',
                blue2: blue2 ? blue2.number : ''
            })
            updateMatchForm.setDefaultPayload({matchId: match.publicId})
            updateMatchOverlay.classList.add('enabled')
        }
    }
}