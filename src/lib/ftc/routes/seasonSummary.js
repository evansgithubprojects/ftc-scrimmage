import axios from 'axios'
import {params} from 'lib/ftc'

const reqURL = `http://ftc-api.firstinspires.org/v2.0/2024`

export default async () => {
    const response = await axios.get(reqURL, {
        headers: params.headers
    })
    return response.data
}