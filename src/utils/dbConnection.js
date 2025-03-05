import mongoose from 'mongoose'
import createBuckets from 'custom-utils/buckets'

const env = process.argv[2] === '--dev' ? 'dev' : 'prod'
export const dbString = `${process.env.DB_STRING}/${env}?retryWrites=true&w=majority&appName=${process.env.DB_APP_NAME}`

export default async () => {
    await mongoose.connect(dbString).then(async () => {
        createBuckets()
    })
}