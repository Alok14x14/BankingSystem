const accountModel = require('../models/account.model');

async function createAccount(req, res) {
    try {
        const { currency, status } = req.body || {};
        const user = req.user || res.user;

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'failed'
            });
        }

        const account = await accountModel.create({
            user: user._id,
            currency: currency || 'INR',
            status: status || 'ACTIVE'
        });

        return res.status(201).json({
            message: 'Account created successfully',
            status: 'success',
            data: account
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || 'Failed to create account',
            status: 'failed'
        });
    }
}

async function getAccounts(req, res) {
    try {
        const user = req.user || res.user;

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'failed'
            });
        }

        const accounts = await accountModel.find({ user: user._id });

        return res.status(200).json({
            message: 'Accounts retrieved successfully',
            status: 'success',
            data: accounts
        });
    } catch (error) {
        return res.status(400).json({
            message: error.message || 'Failed to retrieve accounts',
            status: 'failed'
        });
    }
}

async function getBalance(req, res) {
    try {
        const user = req.user || res.user;
        const { accountId } = req.params;

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized',
                status: 'failed'
            });
        }

        const account = await accountModel.findOne({ _id: accountId, user: user._id });

        if (!account) {
            return res.status(404).json({
                message: 'Account not found',
                status: 'failed'
            });
        }

        const balance = await account.getBalance();

        return res.status(200).json({
            message: 'Balance retrieved successfully',
            status: 'success',
            data: { balance }
        });
        
    } catch (error) {
        return res.status(400).json({
            message: error.message || 'Failed to retrieve balance',
            status: 'failed'
        });
    }
}

module.exports = {
    createAccount,
    getAccounts,    
    getBalance
};