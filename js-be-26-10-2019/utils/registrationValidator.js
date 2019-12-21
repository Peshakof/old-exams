const { body } = require('express-validator');

module.exports = [
    
    body('username', 'username should be atleast 4 symbols long!')
        .isLength({ min: 4})
        .isAlphanumeric(),

    body('password', 'password should be atleast 8 characters long!')
        .isLength({ min: 8 })    
];