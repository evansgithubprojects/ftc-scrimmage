import stats from 'custom-utils/stats'

export default async (req, res) => {
 return res.json({status: 200, stats: stats.get()})
}