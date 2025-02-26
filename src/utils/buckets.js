import { GridFSBucket } from "mongodb"
import mongoose from "mongoose"

export let scrimmageDataBucket
export let bannerBucket
export let galleryBucket
export let bannerCollection
export let galleryCollection

const createBucket = name => new GridFSBucket(mongoose.connection.db, { bucketName: name })

export default () => {
  scrimmageDataBucket = createBucket('scrimmageData')
  bannerBucket = createBucket('banners')
  galleryBucket = createBucket('galleries')
  bannerCollection = mongoose.connection.db.collection('banners.files')
  galleryCollection = mongoose.connection.db.collection('galleries.files')
}