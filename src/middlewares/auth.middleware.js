const accountModel = require('../models/account.model');
const userModel = require('../models/user.model');
const transactionModel = require('../models/transaction.model');
const tokenBlacklistModel = require('../models/blacklist.model');
const jwt = require('jsonwebtoken');




async function authMiddleware(req,res,next){

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({
            message : 'Unauthorized',
            status: 'failed'
        })
    }

    const isTokenBalcklisted = await tokenBlacklistModel.findOne({ token: token });

    if(isTokenBalcklisted){
        return res.status(401).json({
            message : 'Unauthorized, token is blacklisted',
            status: 'failed'
        })
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({
                message : 'Unauthorized',
                status: 'failed'
            })
        }

        req.user = await userModel.findById(decoded.id);
        res.user = req.user;

        next()

    }
    catch(err){
        return res.status(401).json({
            message : 'Unauthorized',
            status: 'failed'
        })
    }

    

}

async function authSystemUsermiddleware(req,res,next){

    const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

    if(!token){
        return res.status(401).json({
            message : 'Unauthorized',
            status: 'failed'
        })
    }

    const isTokenBalcklisted = await tokenBlacklistModel.findOne({ token: token });

    if(isTokenBalcklisted){
        return res.status(401).json({
            message : 'Unauthorized, token is blacklisted',
            status: 'failed'
        })
    }

    try{

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if(!decoded){
            return res.status(401).json({
                message : 'Unauthorized',
                status: 'failed'
            })
        }

        const user = await userModel.findById(decoded.id).select('+systemUser');

        if(!user.systemUser){
            return res.status(403).json({
                message : 'forbidden access, only system user can access this resource',
                status: 'failed'
            })
        }

        req.user = user;
        res.user = req.user;

        next()

    }
    catch(err){
        return res.status(401).json({
            message : 'Unauthorized access, token is invalid',
            status: 'failed'
        })
    }

}

module.exports = { authMiddleware, authSystemUsermiddleware };