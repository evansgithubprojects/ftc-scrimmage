import generateTeamDisplay from '/components/teamDisplay/generateTeamDisplay.js'

const lists = {
    opr: document.querySelector('#opr'),
    matchesPlayed: document.querySelector('#matches-played'),
    scrimmagesPlayed: document.querySelector('#scrimmages-played')
}

export const displayLeaderboards = ({ leaderboards }) => {
    for ( const [leaderboard, rankings] of Object.entries(leaderboards)) {
        const list = lists[leaderboard]
        if (rankings.length === 0) {
            list.append(createElement('span', { textContent: 'None' }))
        }
        else {
            for (let i = 0; i < rankings.length; i++) {
                const team = rankings[i]
                const display = generateTeamDisplay(team).stat(team.value)
                if (i === 0) {
                    display.icon('crown')
                }
                list.append(display.element)
            }
        }
    }
}