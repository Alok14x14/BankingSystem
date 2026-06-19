const mongoose = require('mongoose');


const transactionSchema = new mongoose.Schema({

    fromAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'From account is required'],
        index: true
    },
    toAccount:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'To account is required'],
        index: true
    },
    status: {
        type: String,
        enum:{
            values: [ "PENDING", "SUCCESSFUL", "FAILED", "REFUNDED"],
            message: 'Status can be either PENDING, SUCCESSFUL, FAILED or REFUNDED'
        },
        default: "PENDING"
    },
    amount: {
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative']
    },
    idempotencyKey: {
        type: String,
        required: [true, 'Idempotency key is required'],
        unique: true,
        index: true
    }
},{
    timestamps: true
})


const transactionModel = mongoose.model('Transaction', transactionSchema);

module.exports = transactionModel;