import populateMatch from './populateMatch.js'
import {calculateTotalPoints} from './calculatePoints.js'
import {updateOPRs, getOPRs} from './opr.js'
import teamInspector from './components/teamInspector.js'

const rankingsContainer = document.querySelector('#rankings')

let isHost

const compareOPRs = (opr, otherOpr) => {
    if (!opr && otherOpr) return 1
    if (!otherOpr && opr) return -1
    if (!otherOpr && !opr) return 0
    const totalOpr = opr.auto + opr.teleop + opr.endgame
    const totalOtherOpr = otherOpr.auto + otherOpr.teleop + otherOpr.endgame
    return totalOtherOpr - totalOpr
}

export const displayRankings = scrimmage => {
    const { participants, rankings } = scrimmage
    let finalRankings = rankings

    if (scrimmage.results) {
        updateOPRs(scrimmage)

        const oprs = getOPRs()

        finalRankings = Object.entries(oprs).sort(([teamNumber, opr], [otherTeamNumber, otherOpr]) => {
            return compareOPRs(opr, otherOpr)
        }).map(([teamNumber]) => parseInt(teamNumber))
    }

    for (let i = 0; i < finalRankings.length; i++) {
        const teamNumber = finalRankings[i]
        const initialRanking = rankings.indexOf(teamNumber)
        const diff = initialRanking - i
        const team = participants.find(({ number }) => number === teamNumber)
        const fullName = `${team.number} ${team.name}`
        const displayRank = i + 1
        const rankLabel = createElement('span', { className: 'large', textContent: displayRank })
        const nameLabel = createElement('span', { lassName: 'name', textContent: fullName })
        const button = createElement('button', { className: 'fancy', children: [nameLabel] })

        const rankChange = createElement('span', { className: 'rank-change significant' })
        if (diff != 0) {
            const positive = diff >= 0
            rankChange.textContent = `${positive ? '▲' : '▼'}${Math.abs(diff)}`
            rankChange.setAttribute(positive ? 'positive' : 'negative', '')
            button.append(rankChange)
        }
        else {
            rankChange.textContent = '-'
            button.append(rankChange)
        }
        button.onclick = () => teamInspector(teamNumber, fullName)

        const display = createElement('div', {className: 'ranking', children: [rankLabel, button]})
        rankingsContainer.append(display)

        if (i === 2) rankingsContainer.append(createElement('div', {className: 'divider'}))
    }
}

const matchesContainer = document.querySelector('#matches')
export const matchOverlay = document.querySelector('#match-overlay')

matchOverlay.querySelector('#close').onclick = () => matchOverlay.classList.remove('enabled')

const url = new URL(window.location)

const matchDB = {}

const openMatch = match => {
    const isIncomplete = match.red.length != 2 || match.blue.length != 2
    populateMatch(match.number, match, isHost, isIncomplete)
    url.searchParams.set('match', match.publicId)
    window.history.replaceState({}, url)
    matchOverlay.classList.add('enabled')
}

export const displayMatches = ({ matches }) => {
    if (matches) {
        document.querySelector('#rankings-title').textContent = 'Rankings'

        for (let i = 0; i < matches.length; i++) {
            const match = matches[i]
            const matchNumber = i + 1
            match.number = matchNumber
            matchDB[match.publicId] = match
            const redScore = calculateTotalPoints(match.scoreDetails.red)
            const blueScore = calculateTotalPoints(match.scoreDetails.blue)
            const redWin = redScore > blueScore
            const matchLabel = createElement('span', {textContent: `Match ${matchNumber}`})
            const redLabel = createElement('span', {className: `red ${redWin ? 'winner' : ''}`, textContent: redScore})
            const dash = createElement('span', {textContent: ' - '})
            const blueLabel = createElement('span', {className: `blue ${!redWin ? 'winner' : ''}`, textContent: blueScore})
            const children = [redLabel, dash, blueLabel]
            const isIncomplete = match.red.length != 2 || match.blue.length != 2
            if (isHost && isIncomplete) {
                children.push(createElement('img', {src: '/icons/warning.png'}))
            }
            const scoreDiv = createElement('div', {className: 'score', children})
            const button = createElement('button', {className: 'match fancy', children: [matchLabel, scoreDiv]})
            button.onclick = () => {
                openMatch(match)
            }
            matchesContainer.append(button)
        }
    }
    else {
        matchesContainer.append(createElement('img', { src: '/icons/no-matches.png'}))
        matchesContainer.append(createElement('p', { textContent: 'No matches have been played yet'}))
    }
}

export const initResults = scrimmage => {
    isHost = scrimmage.host === myTeamNumber

    const matchToOpen = url.searchParams.get('match')
    if (matchToOpen) {
        openMatch(matchDB[matchToOpen])
    }
}

for (const button of document.querySelectorAll('#close')) {
    button.onclick = function() {
        this.parentElement.classList.remove('enabled')
    }
}