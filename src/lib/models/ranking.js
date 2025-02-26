import mongoose from "mongoose";

export default mongoose.model('Ranking', new mongoose.Schema({
    teamNumber: Number,
    opr: Number,
    oprRank: Number,
    matchesPlayed: Number,
    matchesPlayedRank: Number,
    scrimmagesPlayed: Number,
    scrimmagesPlayedRank: Number
}, {
    statics: {
        async getTeam(teamNumber) {
            return this.findOne({ teamNumber })
        }
    }
}))