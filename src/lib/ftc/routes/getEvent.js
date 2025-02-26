import axios from 'axios'
import {params} from 'lib/ftc'

const reqURL = `http://ftc-api.firstinspires.org/v2.0/2024/events`

export default async eventCode => {
    try {
        const response = await axios.get(reqURL + `?eventCode=${eventCode}`, {
            headers: params.headers
        })
        return response.data.events[0]
    }
    catch (err) {}
}