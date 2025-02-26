import initHTTP from './rest/init.js'
import initSockets from './socket/init.js'
export { sockets } from './socket/init.js'

export default (server, app) => {
    initHTTP(app)
    initSockets(server)
}