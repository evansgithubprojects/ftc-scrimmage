export default (req, res) => {
    return res.json({status: 200, teamNumber: req.user.number})
}