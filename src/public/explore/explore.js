import generateScrimmageDisplay from "./generateScrimmageDisplay.js"
import generateTeamDisplay from "/components/teamDisplay/generateTeamDisplay.js"
import { displayLeaderboards } from "./leaderboards.js"

const search = document.querySelector('#search')
let processing = false

const loadingCircle = document.querySelector('#loading')

const scrimmagesContainer = document.querySelector('#scrimmages')
const teamsContainer = document.querySelector('#teams')

const resultsContainer = scrimmagesContainer.parentElement.parentElement

const nothingMessages = [
    'The void stares back. Try another search?',
    'We asked the universe for answers. It sent back silence.',
    'We asked the robots, but all we got was static.',
    'Results not found. The bots blame the humans.',
    'Scanning... scanning... Nope, still no results in the mainframe.',
    'All circuits are functioning, but your results are MIA.'
]

const getRandomMessage = () => nothingMessages[Math.floor(Math.random() * nothingMessages.length)]

const processSearch = async () => {
    if (processing) return

    processing = true

    resultsContainer.style.display = 'none'
    loadingCircle.style.display = 'flex'

    const { scrimmages, teams } = await postJSON('/exploreScrimmages', {search: search.value})

    scrimmagesContainer.innerHTML = ''
    teamsContainer.innerHTML = ''

    if (scrimmages.length > 0) {
        for (const scrimmage of scrimmages) {
            const display = generateScrimmageDisplay(scrimmage)
            scrimmagesContainer.append(display)
        }
    }
    else {
        scrimmagesContainer.append(createElement('span', { className: 'dull', textContent: getRandomMessage()}))
    }

    if (teams.length > 0) {
        for (const team of teams) {
            const display = generateTeamDisplay(team)
            teamsContainer.append(display.element)
        }
    }
    else {
        teamsContainer.append(createElement('span', { className: 'dull', textContent: getRandomMessage()}))
    }

    processing = false

    loadingCircle.style.display = 'none'
    resultsContainer.style.display = 'flex'
}
processSearch()

search.onkeypress = (event) => {
    if (event.key === 'Enter') {
        processSearch()
    }
}

fetch('/leaderboards').then(async response => {
    displayLeaderboards(await response.json())
})