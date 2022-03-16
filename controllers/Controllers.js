const Users = require('../models/User');



const Login = (req, res, next) => {
    Users.findOne({username: req.body.username})
    .then(user => {
        if(user){
            if(user.password ===  req.body.password){
                res.statusCode = 200;
                res.setHeader('Content-Type', 'text/plain');
                res.send('success');
            }else{
                res.statusCode = 403;
                res.setHeader('Content-Type', 'text/plain');
                res.send('Incorrect password!');
            }
        }else{
            res.statusCode = 403;
            res.setHeader('Content-Type', 'text/plain');
            res.send('Username does not exist!');
        }
    })
    .catch(err => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.send('Something broke!');
    });
}


const Register = (req, res, next) => {
    Users.insertMany({
        username: req.body.username,
        password: req.body.password
    })
    .then(user => {
        res.statusCode = 200;
        res.setHeader('Content-Type', 'text/plain');
        res.send('success');
    })
    .catch(err => {
        res.statusCode = 500;
        res.setHeader('Content-Type', 'text/plain');
        res.send('Something broke!');
    });
}



module.exports = {
    Login,
    Register,
}

