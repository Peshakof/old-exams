const { body } = require('express-validator');

module.exports = [

    body('email', 'this is not a valid email')
      .isEmail(),

    body('password', 'password should be atleast 6 characters long!')
        .isLength({ min: 8 })    
];