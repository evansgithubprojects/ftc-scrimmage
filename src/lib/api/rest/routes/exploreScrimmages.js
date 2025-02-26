import { Scrimmage, Team } from 'lib/models'

export default async (req, res) => {
    const search = req.body.search.trim()
    let scrimmages
    let teams
    if (search) {
        const searchRegex = {$regex: search, $options: 'i'}
        scrimmages = await Scrimmage.find({
            private: false, 
            $or: [
                {title: searchRegex}, 
                {code: searchRegex},
                {info: searchRegex},
                {'address.street': searchRegex},
                {'address.city': searchRegex},
                {'address.state': searchRegex}
            ]
        }).limit(10)
        teams = await Team.aggregate([
            {
                $addFields: {
                    numberAsString: { $toString: '$number' }
                }
            },
            {
                $match: {
                    numberAsString: searchRegex
                }
            }
        ]).limit(10)
    }
    else {
        scrimmages = await Scrimmage.aggregate([
            {
                $match: {private: false}
            },
            {
                $addFields: {participantCount: {$size: '$participants'}}
            },
            {
                $sort: {participantCount: -1}
            }
        ]).limit(10)
        scrimmages = scrimmages.map(doc => new Scrimmage(doc))
        teams = await Team.aggregate([
            {
                $match: { profileViews: { $exists: true } }
            },
            {
                $addFields: { profileViews: { $size: '$profileViews' } }
            },
            {
                $sort: { profileViews: -1 }
            }
        ]).limit(10)
    }
    scrimmages = await Promise.all(scrimmages.map(async scrimmage => await scrimmage.sanitize(true)))
    teams = await Promise.all(teams.map(async doc => await new Team(doc).sanitize()))
    return res.json({status: 200, scrimmages, teams})
}