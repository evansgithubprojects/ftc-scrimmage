export default (req, res) => {
    const payload = {
        status: 200, 
        isAuthenticated: req.isAuthenticated()
    }

    if (payload.isAuthenticated) {
        payload.teamNumber = req.user.number
    }
    res.json(payload)
}