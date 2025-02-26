import { Scrimmage } from 'lib/models'

export default async (req, res, next) => {
    if (!req.isAuthenticated()) return res.redirect('/')
    
    const scrimmage = await Scrimmage.getFromCode(req.params.scrimmageId)
    
    if (!scrimmage) return res.redirect('/')
    
    if (scrimmage.host != req.user.number) return res.redirect(`/scrimmage/${req.params.scrimmageId}`)

    next()
}