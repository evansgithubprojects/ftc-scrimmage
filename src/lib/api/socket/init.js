import { Server } from 'socket.io'
import { sessionMiddleware } from 'lib/session'

let io

const socketIDs = {}

export const sockets = {
    exists (teamNumber) {
        return socketIDs[teamNumber] != null
    },
    emit (teamNumber, message, data) {
        for (const socketID of socketIDs[teamNumber]) {
            io.to(socketID).emit(message, data)
        }
    },
    remove (teamNumber) {
        socketIDs[teamNumber] = null
    }
}

export default (server) => {
    io = new Server(server)

    io.use((socket, next) => {
        sessionMiddleware(socket.request, {}, next)
    })

    io.on('connection', socket => {
        const {passport} = socket.request.session
        if (passport) {
            const teamNumber = passport.user
            if (!socketIDs[teamNumber]) socketIDs[teamNumber] = []
            let idList = socketIDs[teamNumber]
            socket.on('disconnect', () => {
                if (idList.length === 1) {
                    delete socketIDs[teamNumber]
                }
                else {
                    idList.splice(idList.indexOf(socket.id), 1)
                }
            })
            idList.push(socket.id)
        }
    })
}