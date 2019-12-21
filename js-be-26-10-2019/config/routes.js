const homeController = require('../controllers/home');
const authController = require('../controllers/auth');
const { auth } = require('../utils');
const userValidator = require('../utils/registrationValidator');
const expenseValidator = require('../utils/expenseValidator');

module.exports = (app) => {
   // users
    app.get('/login', authController.login);
    app.get('/register', authController.register);
    app.post('/login', authController.loginPost);
    app.post('/register', userValidator, authController.registerPost);
    app.get('/logout', authController.logout);
    app.get('/', auth(false), homeController.home);
    app.get('/user-profile', auth(), authController.getProfile);

    // expenses
    app.get('/addExpense', auth(), expenseValidator, homeController.getExpense);
    app.post('/addExpense', auth(), homeController.addExpense);
    app.post('/refill', auth(), homeController.refillAmount);
    app.get('/report/:id', auth(), homeController.getReport);
    app.get('/stopTracking/:id', auth(), homeController.deleteExpense);
};