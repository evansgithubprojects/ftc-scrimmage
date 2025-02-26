import {generateScrimmageTemplate} from './scrimmageTemplate.js'

export const displayScrimmage = (scrimmage) => {
    const display = generateScrimmageTemplate(scrimmage)
    main.querySelector('#scrimmages').appendChild(display)
}