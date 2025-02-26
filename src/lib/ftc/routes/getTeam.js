import axios from 'axios'
import {params} from 'lib/ftc'

const reqURL = `http://ftc-api.firstinspires.org/v2.0/2024/teams`

export default async teamNumber => {
    try {
        const response = await axios.get(reqURL + `?teamNumber=${teamNumber}`, {
            headers: params.headers
        })
        return response.data.teams[0]
    }
    catch (err) {}
}