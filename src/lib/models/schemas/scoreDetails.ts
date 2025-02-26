import zlib from 'zlib'

class OpMode {
    constructor(
    public netSamples: Number,
    public lowSamples: Number,
    public highSamples: Number,
    public lowSpecimens: Number,
    public highSpecimens: Number,
    public parkPoints: Number,
    public ascentPoints: Number) {}
}

class Alliance {
    constructor(
        public auto : OpMode, 
        public teleop : OpMode, 
        public minorFouls : Number, 
        public majorFouls: Number) {}

    public static parse(rawAllianceData) {
        return new this(
            new OpMode(
                rawAllianceData.AutoSampleNet,
                rawAllianceData.AutoSampleLow,
                rawAllianceData.AutoSampleHigh,
                rawAllianceData.AutoSpecimenLow,
                rawAllianceData.AutoSpecimenHigh,
                rawAllianceData.AutoParkPoints,
                rawAllianceData.AutoAscentPoints
            ),
            new OpMode(
                rawAllianceData.TeleopSampleNet,
                rawAllianceData.TeleopSampleLow,
                rawAllianceData.TeleopSampleHigh,
                rawAllianceData.TeleopSpecimenLow,
                rawAllianceData.TeleopSpecimenHigh,
                rawAllianceData.TeleopParkPoints,
                rawAllianceData.TeleopAscentPoints
            ),
            rawAllianceData.MinorFouls,
            rawAllianceData.MajorFouls
        )
    }
}

class ScoreDetails {
    blue: Alliance
    red: Alliance

    constructor(blue : Alliance, red : Alliance) {
        this.blue = blue
        this.red = red
    }

    public static async parse(rawScoreDetails) {
        const decommpressedBuffer = zlib.gunzipSync(Buffer.from(rawScoreDetails))
            const parsed = JSON.parse(decommpressedBuffer.toString())

            const scoreDetails = new this(
                Alliance.parse(parsed.BlueAllianceScore),
                Alliance.parse(parsed.RedAllianceScore)
            )

            return scoreDetails
    }
}

export default ScoreDetails