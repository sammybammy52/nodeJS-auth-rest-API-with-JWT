const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = (req, res, next) => {
    const {token} = req.body;

    //check if webtoken exists and is verifed

    if (token) {
        jwt.verify(token, process.env.SECRET_KEY, (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.status(400).json({
                    error: "unverified"
                });
            }
            else{
                console.log(decodedToken);
                next();
            }
        });
    }
    else{
        res.status(400).json({
            error: "unverified"
        });
    }
}


const checkUser = (req, res, next) => {
    const {token} = req.body;

    if (token) {
        jwt.verify(token, 'sammybammy', async (err, decodedToken) => {
            if (err) {
                console.log(err.message);
                res.locals.user = null;
                next();
            }
            else{
                console.log(decodedToken);
                let user = await User.findById(decodedToken.id);
                res.locals.user = user;
                next();
            }
        });
    }
    else{
        res.locals.user = null;
        next();
    }

} 
module.exports = { requireAuth, checkUser };