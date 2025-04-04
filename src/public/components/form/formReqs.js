export default {
    'signUp': {
        'username': [
            {
            label: 'Only numbers, letters, and underscores, and periods are allowed',
            test: /^[a-zA-Z0-9._]+$/
            }
        ],
        'email': [
            {
                label: 'Must be a valid email address',
                test: /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/
            }
        ],
        'password': [
            {
                label: 'Minimum of 8 characters',
                test: /^.{8,}$/
            },
            {
                label: 'At least one number (0-9)',
                test: /[0-9]/
            },
            {
                label: 'One special character (!@#$%&?)',
                test: /[!@#$%&?]/
            }
        ]
    }
}