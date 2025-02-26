import axios from 'axios'
import {params} from 'lib/ftc'

const reqURL = `http://ftc-api.firstinspires.org/v2.0/2024/events`

export default async teamNumber => {
    let {events} = (await axios.get(reqURL + `?teamNumber=${teamNumber}`, {
        headers: params.headers
    })).data

    return events
}