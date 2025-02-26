export default (teamNumber, teamName, actionButton) => {
    const nameLabel = createElement('a', {textContent: `${teamNumber} ${teamName}`, href: `/profile/${teamNumber}`})
    const children = [nameLabel]
    if (actionButton) children.push(actionButton)
    return createElement('div', {className: 'team', children })
}