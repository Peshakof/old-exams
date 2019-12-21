const authController = require('../controllers/auth');
const homeController = require('../controllers/home');
const tripsController = require('../controllers/tripsController');
const { auth } = require('../utils');
const userValidator = require('../utils/registrationValidator');

module.exports = (app) => {
   // users
   app.get('/login', authController.login);
   app.get('/register', authController.register);
   app.get('/', auth(false), homeController.home);
   app.get('/logout', authController.logout);
   
   app.post('/register', userValidator, authController.registerPost);
   app.post('/login', authController.loginPost);


   // trips 
   app.get('/trips', auth(), tripsController.getAll);
   app.get('/offerTrip', auth(), tripsController.getOfferTrip);
   app.get('/details/:id', auth(), tripsController.details);
   app.get('/removeTrip/:id', auth(), tripsController.remove);

   app.post('/offerTrip', auth(), tripsController.offerTripp);
   app.get('/joinTrip/:id', auth(), tripsController.join); 

   // not found
   app.get('*', homeController.notFound);
};