const appConfig = require('../app-config');
const userModel = require('../models/user');
const { validationResult } = require('express-validator');

function home(req, res, next) {
  const isLoggedIn = req.cookies[appConfig.authCookieName] !== undefined;
  const email = req.cookies.email;

  res.render('home', {isLoggedIn, email});
  
}

function notFound(req, res, next) {
  res.render('404');
}

module.exports = {
  home,
  notFound
};