import mongoose from "mongoose"

const getRandomChar = () => {
    return 'ABCDEFGHJKLMNOPQRSTUVWXYZ1234567890'[Math.floor(Math.random() * 35)]
}

const genRandomString = (length) => {
    let string = ''
    for (let i = 0; i < length; i++) {
      string += getRandomChar()
    }
    return string
}

const isTaken = async (id, collection) => {
  if (typeof collection === 'string') {
    return await mongoose.connection.db.collection(collection).countDocuments({ metadata: { publicId: id } }) > 0
  }
  return await collection.countDocuments({publicId: id}) > 0
}

export default async collection => {
    let id = genRandomString(6)
    while (await isTaken(id, collection)) {
      id = genRandomString(6)
    }
    return id
}