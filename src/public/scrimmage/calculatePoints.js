export const calculateAutoPoints = auto => {
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

export const calculateTeleopPoints = teleop => {
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

export const calculateTotalPoints = alliance => {
    const autoTotal = calculateAutoPoints(alliance.auto)
    const teleopTotal = calculateTeleopPoints(alliance.teleop)
    return autoTotal + teleopTotal
}