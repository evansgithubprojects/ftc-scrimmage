import * as math from 'mathjs'

const calculateAutoPoints = auto => {
    const {
        netSamples,
        lowSamples,
        highSamples,
        lowSpecimens,
        highSpecimens,
        ascentPoints,
        parkPoints
    } = auto
    return netSamples * 2 + lowSamples * 4 + highSamples * 8 + lowSpecimens * 6 + highSpecimens * 10 + ascentPoints + parkPoints
}

const calculateTeleopPoints = teleop => {
    const {
        netSamples,
        lowSamples,
        highSamples,
        lowSpecimens,
        highSpecimens
    } = teleop

    return netSamples * 2 + lowSamples * 4 + highSamples * 8 + lowSpecimens * 6 + highSpecimens * 10
}

export const calculateEndgamePoints = teleop => {
    return teleop.ascentPoints + teleop.parkPoints
}

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

export default (matches, teamNumber) => {
    if (matches.length === 0) {
        return {
            auto: 0,
            teleop: 0,
            endgame: 0
        }
    }

    const playedMatches = matches.reduce((acc, match) => {
        if (match.red.includes(teamNumber)) {
            acc.push([match, 'red'])
        }
        else if (match.blue.includes(teamNumber)) {
            acc.push([match, 'blue'])
        }

        return acc
    }, [])

    /*
    if they have only played one match the determinant of the alliance matrix will be zero, 
    so just return their alliance's score / 2
    */
    if (playedMatches.length === 1) {
        const [match, color] = playedMatches[0]
        const { auto, teleop } = match.scoreDetails[color]
        return {
            auto: calculateAutoPoints(auto) / 2,
            teleop: calculateTeleopPoints(teleop) / 2,
            endgame: calculateEndgamePoints(teleop) / 2
        }
    }

    const participants = matches.reduce((acc, match) => {
        for (const color of ['red', 'blue']) {
            const alliance = match[color]
            for (let i = 0; i < alliance.length; i++) {
                if (acc.indexOf(alliance[i]) === -1) {
                    acc.push(alliance[i])
                }
            }
        }

        return acc
    }, [])

    //odd indices are red, even are blue
    let allianceMatrix = []
    const scores = []

    const Oprs = {}

    const teamIndex = participants.findIndex(team => team === teamNumber)

    for (const match of matches) {
        for (const color of ['red', 'blue']) {
            const alliance = match[color]
            let row = Array(participants.length).fill(0)
            const team1Index = participants.findIndex(number => number === alliance[0])
            const team2Index = participants.findIndex(number => number === alliance[1])
            row[team1Index] = 1
            row[team2Index] = 1
            //remove all trailing zeros
            const last = team1Index > team2Index ? team1Index : team2Index
            for (let i = last + 1; i < participants.length; i++) {
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

    const myOpr = {}
    for (const phase of ['auto', 'teleop', 'endgame']) {
        myOpr[phase] = Oprs[phase][teamIndex]
    }
    return myOpr
}