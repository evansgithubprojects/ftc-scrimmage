export default async (req, res) => {
    let {
        scrimmages,
        messages
    } = req.body

    scrimmages = scrimmages === 'true'
    messages = messages === 'true'

    req.user.scrimmageNotifications = scrimmages
    req.user.messageNotifications = messages
    await req.user.save()

    res.json({ status: 200 })
}