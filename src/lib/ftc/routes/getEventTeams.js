import axios from 'axios'
import {params} from 'lib/ftc'

const reqURL = `http://ftc-api.firstinspires.org/v2.0/2024/teams`

export default async eventCode => {
    const teams = []

    const {data} = await axios.get(reqURL + `?eventCode=${eventCode}`, {
        headers: params.headers
    })
    const pageCount = data.pageTotal
    teams.push(...data.teams)

    if (pageCount > 1) {
        for (let page = 2; page <= pageCount; page++) {
            teams.push(...(await axios.get(reqURL + `?eventCode=${eventCode}?page=${page}`, {
                headers: params.headers
            })).data.teams)
        }
    }

    return teams
}