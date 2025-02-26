import fs from 'fs'
import mongoose from "mongoose"
import path from 'path'
import sqlite3 from 'sqlite3'
import Match from "./match.js"
import Team from './team.js'

const dataFolderPath = path.join(process.cwd(), 'src/tmp/')

const SQL = sqlite3.verbose()

const getTable = (db, query) => {
    return new Promise((resolve, reject) => {
        db.all(query, [], (err, rows) => {
            if (err) {
                reject(err)
            }

            resolve(JSON.stringify(rows))
        })
    })
}

const parseDB = async (db) => {
    const matches = JSON.parse(await getTable(db, 'SELECT * FROM Match'))
    const scheduleStation = JSON.parse(await getTable(db, 'SELECT * FROM ScheduleStation'))
    const teams = JSON.parse(await getTable(db, 'SELECT * FROM Team'))

    return [ matches, scheduleStation, teams ]
}

export default mongoose.model('Results', new mongoose.Schema({
    scrimmageCode: String
}, {
    methods: {
        async sanitize() {
            const data = this.toObject()

            delete data.scrimmageCode
            delete data._id
            delete data.__v

            return data
        }
    },
    statics: {
        parse(scrimmageCode) {
            const fileName = `${scrimmageCode}.db`
            const dbPath = dataFolderPath + fileName

            const db = new SQL.Database(dbPath, SQL.OPEN_READONLY, (err) => {
                return new Promise(async (resolve, reject) => {
                    if (err) reject(err)

                    const session = await mongoose.startSession()
    
                    try {
                        session.startTransaction()

                        await Match.deleteMany({scrimmageCode}, {session})
                        await this.deleteOne({scrimmageCode}, {session})
    
                        const results = new this({scrimmageCode})
    
                        const matchDocs = []
                        const [ matches, scheduleStation, teams ] = await parseDB(db)
                        for (const match of matches) {
                            const doc = await Match.parse(scrimmageCode, match, scheduleStation, teams)
                            matchDocs.push(doc)
                            await doc.save({session})
                        }

                        for (const match of matchDocs) {
                            for (const alliance of [match.red, match.blue]) {
                                for (const teamNumber of alliance) {
                                    const team = await Team.getFromNumber(teamNumber)
                                    if (!team) continue
                                    await team.updateOPR()
                                }
                            }
                        }
    
                        db.close()
    
                        setTimeout(() => {
                            fs.unlinkSync(dbPath)
                        }, 5000)
    
                        await results.save({session})
    
                        await session.commitTransaction()
    
                        resolve(results)
                    }
                    catch (err) {
                        await session.abortTransaction()
    
                        reject(err)
                    } 
                    finally {
                        session.endSession()
                    }
                })
            })
        }
    }
}))