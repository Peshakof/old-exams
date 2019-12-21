const tripsModel = require('../models/trip');
const userModel = require('../models/user');

const tripValidator = require('../utils/tripValidator');

function getAll(req, res, next) {
  tripsModel.find()
    .then((trips) => {
      res.render('sharedTripps', {trips});
    })
}

function getOfferTrip(req, res, next) {
  res.render('offerTripp');
}

async function offerTripp(req, res, next) {
  const {destination, date, carImage, seats, description } = req.body;
  if(destination.indexOf(' - ') == -1) {
    res.render('offerTripp', {
      message: 'start and end pont must be separated with " - " .'
    })
    return;
  }

  if(date.indexOf(' - ') === -1) {
    res.render('offerTripp', {
      message: 'date and time must be separated with " - " .'
    })
    return;
  }

  const [start, end] = destination.split(' - ');
  const [currDate, time] = date.split(' - ');
  const userId = req.user.id;
  const availableSeats = seats - 1;

  if(start.length < 4 || end < 4) {
    res.render('offerTripp', {message: 'start point and end point must be at least 4 charachters long each.'})
    return;
  }

  if(currDate.length < 6 || time.length < 6) {
    res.render('offerTripp', {message: 'date and time must be at least 6 charachters long each.'}) 
    return;
  }
  
  const trip = {
    startPoint: start,
    endPoint: end,
    carImage,
    seats: availableSeats,
    date: currDate,
    time: time,
    description,
    buddies: [userId],
    creator: userId
  }

  try {
    await tripsModel.create(trip);
    const newtrip = await tripsModel.findOne({creator: userId});
    await userModel.updateOne({_id: userId}, {$push: {tripsHistory: newtrip._id }})
    res.redirect('/trips');
  } catch (error) {
    next(error);
  };
}

async function details(req, res, next) {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    const trip = await tripsModel.findById(tripId);
    const creator = await userModel.findOne({_id: trip.creator});
    const email = creator.email;
    const buddies = [];

    if(trip.buddies.length) {
      for (const b of trip.buddies) {
        const buddie = await userModel.findById(b._id);
        buddies.push(buddie.email);
      }
    }

    const isCreator = trip.creator.toString() === userId.toString();
    const isJoined = trip.buddies.includes(userId);
    const availableSeats = trip.seats > 0;

    res.render('driverTrippDetails', {trip, buddies, isCreator, email, isJoined, availableSeats});
    
  } catch (error) {
    next(error);
  };
}

async function remove(req, res, next) {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    await tripsModel.findByIdAndRemove(tripId);
    await userModel.updateOne({_id: userId}, {$pull: {tripsHistory: tripId}});
    res.redirect('/trips');
  } catch (error) {
    next(error);
  }
}

async function join(req, res, next) {
  const tripId = req.params.id;
  const userId = req.user.id;

  try {
    const trip = await tripsModel.findById(tripId);
    let availableSeats = trip.seats - 1;
   
    await tripsModel.updateOne({_id: tripId}, {$push: {buddies: userId}});
    await tripsModel.updateOne({_id: tripId}, {seats: availableSeats});
    res.redirect(`/details/${tripId}`);

  } catch (error) {
    next(error);
  }

}

module.exports = {
  getAll,
  getOfferTrip,
  offerTripp, 
  details,
  remove,
  join
}