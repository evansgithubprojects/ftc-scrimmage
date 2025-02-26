export default async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/')
    
    if (req.user.number != '12649') return res.redirect('/')

    next()
}