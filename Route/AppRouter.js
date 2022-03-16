const express = require('express');
const AppRouter =  express.Router();
const Controllers = require('../controllers/Controllers');


AppRouter.post('/login', Controllers.Login);
AppRouter.post('/register', Controllers.Register);




module.exports = AppRouter;