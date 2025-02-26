import mongoose from "mongoose";
import Team from "./team.js";

export default mongoose.model('Totd', new mongoose.Schema({
    number: Number,
    lastUpdate: Date
}, {
    collection: 'totd',
    statics: {
        refresh() {
            this.findOne().then(async totd => {
                const now = new Date()
                if (now.getDay() != totd.lastUpdate.getDay()) {
                    totd.number = (await Team.aggregate().sample(1))[0].number
                    totd.lastUpdate = now
                    await totd.save()
                }
            })
        }
    }
}))