function tripValidator(startPoint, endPoint, date, time, seats, description) {
  if(startPoint.length < 4 || endPoint < 4) {
    return {message: 'start point and end point must be at least 4 charachters long each.'}
  }

  if(date.length < 6 || time.length < 6) {
    return {message: 'date and time must be at least 6 charachters long each.'}
  }
}

module.exports = tripValidator;