const models = require('../models');
const utils = require('../utils');
const appConfig = require('../app-config');
const { validationResult } = require('express-validator');

function login(req, res) {
  res.render('login.hbs');
}

function loginPost(req, res, next) {
  const { username, password } = req.body;
  models.userModel.findOne({ username })
    .then(user => Promise.all([user, user.matchPassword(password)]))
    .then(([user, match]) => {
      if (!match) {
        res.render('login', { massage: 'Wrong password or username!' });
        return;
      }
      const token = utils.jwt.createToken({ id: user._id });
      res.cookie('userId', user._id);
      res.cookie('username', username);
      res.cookie(appConfig.authCookieName, token).redirect('/');
    }).catch(err => {
      if (err) {
        res.render('login', {
          message: 'Wrong password or username!'
        });
        return;
      }
      next(err);
    });
}

function register(req, res) {
  res.render('register');
}

function registerPost(req, res, next) {
  const { username, password, repeatPassword, amount } = req.body;
  if (password !== repeatPassword) {
    res.render('register', {
      message: 'Password and repeat password don\'t match!'
    });
    return;
  }

  const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('register', {
            message: errors.array()[0].msg,
            oldInput: req.body
        })
    }

  return models.userModel.create({ username, password, amount}).then(() => {
    res.redirect('/login');
  }).catch(err => {
    if (err.name === 'MongoError' && err.code === 11000) {
      res.render('register', {
        message: 'Username already taken!'
      });
      return;
    }
    next(err);
  });
}

function logout(req, res) {
  res.clearCookie('username');
  res.clearCookie(appConfig.authCookieName).redirect('/');
}

function getProfile(req,res,next) {
  const isLoggedIn = req.cookies[appConfig.authCookieName] !== undefined;
  const username = req.cookies.username;
  const userID = req.user.id;
  models.userModel.findById(userID)
    .populate('expenses')
    .then((user)=>{
      const amount = user.amount;
      const merchants = user.expenses.length;
      models.expenseModel.find()
        .where({user: userID})
        .then((expenses)=>{
          let totalAmount = 0;
          expenses.forEach(e=>{
            totalAmount += e.total
          })
          res.render('account', {amount, isLoggedIn, username, merchants, totalAmount});
        })
    })
    .catch((err)=>{
      next(err);
    })
}

module.exports = {
  login,
  loginPost,
  register,
  registerPost,
  logout,
  getProfile
};