const token = `${process.env.FTC_USERNAME}:${process.env.FTC_PASSWORD}`
const encodedToken = Buffer.from(token).toString('base64')

export const headers = { 'Authorization': 'Basic '+ encodedToken }