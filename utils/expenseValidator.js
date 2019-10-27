const { body } = require('express-validator');

module.exports = [
    
    body('description', 'description should be between 10 an 50 symbols!')
        .isLength({ min: 10 })
        .isLength({ max: 50 }),

    body('category', 'category is required') 
        .isEmpty(),
        
    body('merchant')
        .isLength({ min: 4 }),    
        
    body('total')
        .custom((value)=>{
            if(value < 0){
                throw new Error('total must be positive number!');
            }
            return true;
        })    
];