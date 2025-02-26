import { Scrimmage } from 'lib/models'
import generateId from 'custom-utils/generateId'

export default async (req, res) => {
    const { title, info, date, time, street, city, state, isPublic = false } = req.body

    const dateString = date + ' ' + time

    for (const [key, val] of Object.entries({ title, info, date, time, street, city, state, isPublic })) {
        if (val === null || val === undefined) return res.json({status: 400, err: [key, 'Required']})
        if (typeof(val) === 'string' && val.trim().length === 0) return res.json({status: 400, err: [key, 'Required']})
        switch (key) {
            case 'info':
                if (val.length > 500) return res.json({ status: 400, err: ['info', 'Over character limit (500)']})
                break
            case 'title':
                if (val.length > 200) return res.json({ status: 400, err: ['title', 'Over character limit (200)']})
                break
            case 'date':
                if (isNaN(Date.parse(dateString))) return res.json({ status: 400, err: ['date', 'Invalid date']})
        }
    }

    const code = await generateId(Scrimmage)

    const scrimmage = new Scrimmage({
        code,
        host: req.user.number,
        title,
        info,
        date: new Date(dateString),
        address: {
          street,
          city,
          state
        },
        participants: [req.user.number],
        public: isPublic
      })
      await scrimmage.save()

    return res.json({status: 200, scrimmageCode: code})
}