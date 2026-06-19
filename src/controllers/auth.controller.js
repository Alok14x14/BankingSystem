const userModel = require('../models/user.model');
const tokenBlacklistModel = require('../models/blacklist.model');
const jwt = require('jsonwebtoken');
const emailService = require('../services/email.service');

/**
* - user register controller
* - POST /api/auth/register
*/
async function userRegisterController (req,res) {

    const {email, name, password} = req.body;

    const isExist = await userModel.findOne({email});

    if(isExist){
        return res.status(422).json({
            message : 'User already exists with this email',
            status: 'failed'
        })
    }

    const user = await userModel.create({
        email,
        name,
        password
    })

    emailService.sendRegistrationEmail(user.email, user.name);
    
    const token = jwt.sign({
        id : user._id
    },process.env.JWT_SECRET,{
        expiresIn: "3d"
    })
    
    res.cookie('token', token)

    res.status(201).json({
        message: "User registered successfully",
        status: "success",
        data: user
    })
}

/**
 * - user login controller
 * - POST /api/auth/login
 */

async function userLoginController (req,res) {

    const {email, password} = req.body;

    const user = await userModel.findOne({email}).select('+password')

    if(!user){
        return res.status(401).json({
            message : 'No user found with this email',
            status: 'failed'
        })
    }

    const isValidPassword = await user.comparePassword(password);

    if(!isValidPassword){
        return res.status(401).json({
            message : 'Invalid password',
            status: 'failed'
        })
    }

    const token = jwt.sign({
        id:user._id
    },process.env.JWT_SECRET,{
        expiresIn: "3d"
    })

    res.cookie('token', token)

    // Fire and forget a login alert email for extra security
    emailService.sendAccountAlertEmail(user.email, user.name, 'A new login was detected on your account.');

    return res.status(200).json({
        message: "User logged in successfully",
        status: "success",
        data: {
            email: user.email,
            name: user.name
        }
    })

}

async function userLogoutController(req, res) {

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    await tokenBlacklistModel.create({ token: token });

    res.clearCookie('token');

    return res.status(200).json({
        message: "User logged out successfully",
        status: "success"
    });
}

module.exports = {userRegisterController,userLoginController, userLogoutController}