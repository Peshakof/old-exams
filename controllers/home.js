const appConfig = require('../app-config');
const expenseModel = require('../models/expense');
const userModel = require('../models/user');
const { validationResult } = require('express-validator');

function home(req, res, next) {
  const isLoggedIn = req.cookies[appConfig.authCookieName] !== undefined;
  const username = req.cookies.username;
  const userId = req.cookies.userId
  expenseModel.find()
  .where({user: userId})
  .then((expenses)=>{
     
      res.render('home', {isLoggedIn, username, expenses});
    })
    .catch((err)=>{
      next(err);
    })
}

function getExpense (req,res) {
  const username = req.cookies.username;
  const isLoggedIn = req.cookies[appConfig.authCookieName] !== undefined;
  res.render('new-expense', {username, isLoggedIn});
}

async function addExpense(req,res,next){
  const{merchant, total, category, description, report} = req.body;
  const isReported = report == 'on';
  const userID = req.user.id;

  const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.render('new-expense', {
            message: errors.array()[0].msg,
            
        })
    }
  
  try {
    await expenseModel.create({merchant, total, category, description,report: isReported, user: userID});
    const newExpense = await expenseModel.findOne({user: userID})
    await userModel.updateOne({_id: userID}, {$push: {expenses: newExpense._id }});
    res.redirect('/');
  } catch (err) {
    next(err);
  }
}

async function refillAmount(req,res,next){
  let amountToRefill = req.body.amount;
  amountToRefill = Number(amountToRefill);
  const id = req.user.id;
  
  try {
    let currentUser = await userModel.findById(id);
    let currentAmount = currentUser.amount; 
    currentAmount += amountToRefill;
    await userModel.updateOne({_id:id}, {amount: currentAmount})
    res.redirect('/');
    
  } catch (error) {
    next(error);
  }   
 }

function getReport(req,res,next){
  const username = req.cookies.username;
  const isLoggedIn = req.cookies[appConfig.authCookieName] !== undefined;

  const expenseId = req.params.id;
  expenseModel.findById(expenseId)
    .then((expense)=>{
      res.render('report', {expense,isLoggedIn,username});
    })
}

function deleteExpense(req,res,next){
  const expenseId = req.params.id;
  const userId = req.user.id; 
  Promise.all([
    expenseModel.findByIdAndRemove(expenseId),
    userModel.updateOne({_id:userId},{$pull:{expenses:expenseId}})
  ])
  .then(()=>{
    res.redirect('/');
  })
  .catch((err)=>{
    next(err);
  })
}

module.exports = {
  home,
  getExpense,
  addExpense,
  refillAmount,
  getReport,
  deleteExpense
};