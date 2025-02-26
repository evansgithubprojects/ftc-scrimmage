import { calculateEndgamePoints, calculateTeleopPoints, calculateAutoPoints } from "./calculatePoints.js"

const oprs = {}
const averages = {}

const calculatePhaseOprs = (allianceMatrix, scores, phase) => {
    try {
        const transpose = math.transpose(allianceMatrix)
        const TAM = math.multiply(transpose, allianceMatrix)
        const pInv = math.pinv(TAM)
        const TS = math.multiply(transpose, scores.map(score => score[phase]))
        const Oprs = math.multiply(pInv, TS)
        return Oprs.map(opr => Math.round(opr * 100) / 100) 
    }
    catch (err) {
        console.log(err, allianceMatrix, scores)
    }
}

export const updateOPRs = scrimmage => {
    let { participants, matches } = scrimmage

    const participantsThatPlayed = participants.filter(({ number: teamNumber }) => {
        for (const { red, blue } of matches) {
            const redNumbers = red.map(({ number }) => number)
            const blueNumbers = blue.map(({ number }) => number)
            if (redNumbers.includes(teamNumber) || blueNumbers.includes(teamNumber)) return true
        }
    })

    //odd indices are red, even are blue
    let allianceMatrix = []
    const scores = []

    const Oprs = {}

    for (const match of matches) {
        for (const color of ['red', 'blue']) {
            const alliance = match[color]

            let row = Array(participants.length).fill(0)
            const team1Index = participantsThatPlayed.findIndex(({ number }) => number === alliance[0].number)
            const team2Index = participantsThatPlayed.findIndex(({ number }) => number === alliance[1].number)
            row[team1Index] = 1
            row[team2Index] = 1
            //remove all trailing zeros
            const last = team1Index > team2Index ? team1Index : team2Index
            for (let i = last + 1; i < participantsThatPlayed.length; i++) {
                row.splice(last + 1, 1)
            }
            allianceMatrix.push(row)

            const { auto, teleop } = match.scoreDetails[color]

            scores.push({
                auto: calculateAutoPoints(auto),
                teleop: calculateTeleopPoints(teleop),
                endgame: calculateEndgamePoints(teleop)
            })
        }
    }
    //create square matrix
    const longest = allianceMatrix.reduce((acc, val) => val.length > acc.length ? val : acc, []).length
    for (const teamList of allianceMatrix) {
        if (teamList.length < longest) {
            const thisLength = teamList.length
            for (let i = 0; i < longest - thisLength; i++) {
                teamList.push(0)
            }
        }
    }
    const longestRow = allianceMatrix.reduce((longest, current) => current.length > longest.length ? current : longest).length
    for (let i = 0; i < allianceMatrix.length; i++) {
        const row = allianceMatrix[i]
        if (row.length != longestRow) {
            for (let i = 0; i < longestRow - row.length + 1; i++) {
                row.push(0)
            }
        }
    }

    //get oprs for each phase
    for (const phase of ['auto', 'teleop', 'endgame']) {
        Oprs[phase] = calculatePhaseOprs(allianceMatrix, scores, phase)
    }

    for (const team of participantsThatPlayed) {
        const { number : teamNumber, opr } = team

        averages[teamNumber] = opr

        if (!matches) {
            oprs[teamNumber] = opr
            continue
        }
        const myOpr = {}
        const teamIndex = participantsThatPlayed.findIndex(({ number }) => number === teamNumber)
        for (const phase of ['auto', 'teleop', 'endgame']) {
            myOpr[phase] = Oprs[phase][teamIndex]
        }
        oprs[teamNumber] = myOpr
    }
}

export const getOPR = teamNumber => {
    return {
        opr: oprs[teamNumber],
        average: averages[teamNumber]
    }
}

export const getOPRs = () => oprs