
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv/config');

//handle errors
const handleErrors = (err) => {
    console.log(err.message, err.code);
    let errors = { email:'', password:''};



    //incorrect email

    if (err.message === 'incorrect email') {
        errors.email = 'that email is not registered';
    }
 
    //incorrect password

    if (err.message === 'incorrect password') {
        errors.email = 'that password is not incorrect';
    }



    //duplicate error code

    if (err.code === 11000) {
        errors.email = 'that email is already registered';
        return errors;
    }

    if (err.message.includes('user validation failed')) {
        Object.values(err.errors).forEach(({properties}) => {
          errors[properties.path] = properties.message;  
        })
    }

    return errors;
}

//function for JWT

const maxAge = 3 * 24 * 60 * 60;

const createToken  = (id) => {
    //second argument is string secret, dont share on repos
    return jwt.sign({id}, process.env.SECRET_KEY, { expiresIn: maxAge });
}




module.exports.signup_get = (req, res) => {
    res.render('signup');
}

module.exports.login_get = (req, res) => {
    res.render('login');
}

module.exports.signup_post = async (req, res) => {
    
    const { email, password, role } = req.body;
    if (role === "Admin" || role === "Customer") {
        try {
            const user = await User.create({ email, password, role });
    
            const token = createToken(user._id);

            const user_id = user._id;
            const user_email = user.email;
            const user_role = user.role;
    
            res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    
            res.status(201).json({
                user: {
                    id: user_id,
                    email: user_email,
                    role: user_role
                },
                token: token
            });
        } catch (err) {
            const errors = handleErrors(err);
            res.status(400).json({errors})
        }
    }
    else{
        res.status(400).json({
            error: "you have provided a wrong role input"
        })
    }
    

    
}

module.exports.login_post = async (req, res) => {
    
    const { email, password } = req.body;

    try {
        const user = await User.login(email, password);
        const token = createToken(user._id);

        const user_id = user._id;
        const user_email = user.email;
        const user_role = user.role;
    
        res.cookie('jwt', token, { httpOnly: true, maxAge: maxAge * 1000 });
    
        res.status(201).json({
            user: {
                id: user_id,
                email: user_email,
                role: user_role
            },
            token: token
        });

    } catch (err) {
        const errors = handleErrors(err)
        res.status(400).json({ errors });
    }

}

module.exports.logout_get = (req,res) => {
    res.cookie('jwt', '', { maxAge: 1 });
    res.redirect('/');
}