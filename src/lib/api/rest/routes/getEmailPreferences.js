export default (req, res) => {
    const { scrimmageNotifications, messageNotifications } = req.user
    return res.json({ 
        scrimmages: scrimmageNotifications,
        messages: messageNotifications
    })
}