const transactionModel = require('../models/transaction.model');
const ledgerModel = require('../models/ledger.model');
const accountModel = require('../models/account.model');
const emailService = require('../services/email.service');
const mongoose = require('mongoose');
const ApiResponse = require('../utility/apiResponse.js')

/**
 * - Create a new transaction
 * The 10-step transfer Flow:
    * 1. Validate request
    * 2. validate idempotency key
    * 3. Check account status
    * 4. Derive sender balance from ledger
    * 5. create transaction (PENDING)
    * 6. Create DEBIT ledger entry
    * 7. Create CREDIT ledger entry
    * 8. Mark transaction COMPLETED
    * 9. commit MongoDB session
    * 10. send email verification
 */

async function createTransaction(req, res) {

    /**
     * 1. Validate request
     */

    const { fromAccount, toAccount, amount, idempotencyKey } = req.body;

    if (!fromAccount || !toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'Missing required fields',
            status: 'failed'
        })
    }

    if (fromAccount === toAccount) {
        return res.status(400).json({
            message: 'Cannot transfer to the same account',
            status: 'failed'
        })
    }

    const fromAccountData = await accountModel.findById({ _id: fromAccount });
    const toAccountData = await accountModel.findById({ _id: toAccount });

    if (!fromAccountData || !toAccountData) {
        return res.status(404).json({
            message: 'Account not found',
            status: 'failed'
        })
    }

    /**
     * 2. validate idempotency key
     */

    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey });

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === 'SUCCESSFUL') {
            return res.status(200).json({
                message: 'Transaction already processed',
                status: 'success',
                data: isTransactionAlreadyExists
            })
        }

        if (isTransactionAlreadyExists.status === 'PENDING') {
            return res.status(200).json({
                message: 'Transaction is being processed',
                status: 'success'
            })
        }

        if (isTransactionAlreadyExists.status === 'FAILED') {
            return res.status(200).json({
                message: 'Transaction already processed and failed',
                status: 'failed'
            })
        }

        if (isTransactionAlreadyExists.status === 'REFUNDED') {
            return res.status(200).json({
                message: 'Transaction already processed and refunded',
                status: 'failed'
            })
        }
    }

    /**
     * 3. Check account status
     */

    if (fromAccountData.status !== 'ACTIVE' || toAccountData.status !== 'ACTIVE') {
        return res.status(400).json({
            message: 'Both accounts must be active',
            status: 'failed'
        })
    }

    /**
     * 4. Derive sender balance from ledger
     */

    const senderBalance = await fromAccountData.getBalance();

    if (senderBalance < amount) {
        return res.status(400).json({
            message: `Insufficient balance. Current balance is ${senderBalance}. Required amount is ${amount}`,
            status: 'failed'
        })
    }

    /**
     * 5. create transaction (PENDING)
     */

    let transaction;

    try {

        const session = await transactionModel.startSession();
        session.startTransaction();

        [transaction] = await transactionModel.create([{
            fromAccount,
            toAccount,
            amount,
            idempotencyKey,
            status: 'PENDING'
        }], { session });

        const debitLedgerEntry = await ledgerModel.create([{
            account: fromAccount,
            transaction: transaction._id,
            type: 'DEBIT',
            amount: amount
        }], { session });

        const creditLedgerEntry = await ledgerModel.create([{
            account: toAccount,
            transaction: transaction._id,
            type: 'CREDIT',
            amount: amount
        }], { session });

        await transactionModel.findByIdAndUpdate({ _id: transaction._id }, { status: 'SUCCESSFUL' }, { session });

        await session.commitTransaction();
        session.endSession();

    } catch (err) {
        return res.status(400).json({
            message: 'Transaction is still being processed. Please try again later',
            status: 'failed',
            error: err.message
        })
    }
    /**
     * 10. send email verification
     */

    emailService.sendTransactionEmail(req.user.email, req.user.name, amount, toAccountData._id);

    return res.status(200).json({
        message: 'Transaction processed successfully',
        status: 'success',
        data: transaction
    })

}

async function createInitialFunds(req, res) {
    const { toAccount, amount, idempotencyKey } = req.body;

    if (!toAccount || !amount || !idempotencyKey) {
        return res.status(400).json({
            message: 'Missing required fields',
            status: 'failed'
        })
    }

    const isTransactionAlreadyExists = await transactionModel.findOne({ idempotencyKey: idempotencyKey });

    if (isTransactionAlreadyExists) {
        if (isTransactionAlreadyExists.status === 'SUCCESSFUL') {
            return res.status(200).json({
                message: 'Transaction already processed',
                status: 'success',
                data: isTransactionAlreadyExists
            })
        }

        if (isTransactionAlreadyExists.status === 'PENDING') {
            return res.status(200).json({
                message: 'Transaction is being processed',
                status: 'success'
            })
        }

        if (isTransactionAlreadyExists.status === 'FAILED') {
            return res.status(200).json({
                message: 'Transaction already processed and failed',
                status: 'failed'
            })
        }

        if (isTransactionAlreadyExists.status === 'REFUNDED') {
            return res.status(200).json({
                message: 'Transaction already processed and refunded',
                status: 'failed'
            })
        }
    }

    const toAccountData = await accountModel.findById({ _id: toAccount });

    if (!toAccountData) {
        return res.status(404).json({
            message: 'Account not found',
            status: 'failed'
        })
    }

    const fromUserAccount = await accountModel.findOne({
        user: req.user._id
    });

    if (!fromUserAccount) {
        return res.status(404).json({
            message: 'System account not found for the user',
            status: 'failed'
        })
    }

    const session = await transactionModel.startSession();
    session.startTransaction();

    const [transaction] = await transactionModel.create([{
        fromAccount: fromUserAccount._id,
        toAccount,
        amount,
        idempotencyKey,
        status: 'PENDING'
    }], { session });

    const debitLedgerEntry = await ledgerModel.create([{
        account: fromUserAccount._id,
        transaction: transaction._id,
        type: 'DEBIT',
        amount: amount
    }], { session });

    const creditLedgerEntry = await ledgerModel.create([{
        account: toAccount,
        transaction: transaction._id,
        type: 'CREDIT',
        amount: amount
    }], { session });

    await transactionModel.findByIdAndUpdate({ _id: transaction._id }, { status: 'SUCCESSFUL' }, { session });

    await session.commitTransaction();
    session.endSession();

    return res.status(200).json({
        message: 'Initial funds transaction processed successfully',
        status: 'success',
        data: transaction
    })

}

async function transactionHistory(req, res) {
    const { accountId } = req.params
    const { user } = req
    console.log({ accountId, user })
    if (!accountId) {
        return res.status(400).json({
            message: 'Missing accountId',
            status: 'failed'
        })
    }

    try {
        const targetId = new mongoose.Types.ObjectId(accountId);
        const history = await transactionModel.aggregate([
            {
                $match: {
                    $or: [
                        { fromAccount: targetId },
                        { toAccount: targetId }
                    ]
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        return res.status(200).json(ApiResponse.success(200, 'transaction history fetched successfully', history))
    } catch (err) {
        return res.status(400).json({
            message: 'Cannot fetch history. Please try again later',
            status: 'failed',
            error: err.message
        })
    }
}

module.exports = { createTransaction, createInitialFunds, transactionHistory }
