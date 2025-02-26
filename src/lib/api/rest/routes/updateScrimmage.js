import { Scrimmage } from 'lib/models'
import {fromZonedTime, toZonedTime} from 'date-fns-tz'

export default async (req, res) => {
    const {scrimmageCode, timezone, fields} = req.body
    const scrimmage = await Scrimmage.getFromCode(scrimmageCode)
    if (!scrimmage) return res.json({status: 404})
    if (scrimmage.host != req.user.number) return res.json({status: 401})
    if (scrimmage.date - Date.now() < 0) return res.json({status: 401})

    for (const [fieldName, newValue] of Object.entries(fields)) {
        switch (fieldName) {
            case 'date': {
                const [year, month, day] = newValue.split('-')
                scrimmage.date.setFullYear(year, month - 1, day)
                scrimmage.markModified('date')
                } break
            case 'time':
                const [hour, minute] = newValue.split(':')
                //scrimmage.date is in UTC
                const date = scrimmage.date
                const localDate = toZonedTime(date, timezone)
                localDate.setHours(hour, minute)
                const newDate = fromZonedTime(localDate, timezone)
                if (scrimmage.date != newDate && newDate != 'Invalid Date') {
                    scrimmage.date = newDate
                    scrimmage.markModified('date')
                }
                break
            case 'street':
            case 'city':
            case 'state':
            if (!(fieldName in scrimmage.address)) return res.json({status: 400})
                if (scrimmage.address[fieldName] != newValue) {
                    scrimmage.address[fieldName] = newValue
                    scrimmage.markModified('address')
                }
                break
            default:
                if (!(fieldName in scrimmage)) return res.json({status: 400})
                if (scrimmage[fieldName] != newValue) {
                    scrimmage[fieldName] = newValue
                }
        }
    }
    
    await scrimmage.save()

    return res.json({status: 200})
}