import stats from 'custom-utils/stats'
import { Totd } from 'lib/models'

export default () => {
    setInterval(() => {
        stats.update()
        Totd.refresh()
    }, 15 * 60 * 1000)
    stats.update()
    Totd.refresh()
}