const mongoose = require('mongoose');


const ledgerSchema = new mongoose.Schema({
    account:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'account',
        required: [true, 'Account is required'],
        index: true,
        immutable: true
    },
    amount:{
        type: Number,
        required: [true, 'Amount is required'],
        min: [0, 'Amount cannot be negative'],
        immutable: true
    },
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'transaction',
        required: [true, 'Transaction is required'],
        index: true,
        immutable: true
    },
    type:{
        type: String,
        enum:{
            values: [ "CREDIT", "DEBIT"],
            message: 'Type can be either CREDIT or DEBIT'
        },
        required: [true, 'Type is required'],
        immutable: true
    }
},{
    timestamps: true
})

function preventLedgerModification() {
    throw new Error("Ledger cannot be modified")
}

ledgerSchema.pre('findOneAndDelete', preventLedgerModification)
ledgerSchema.pre('findOneAndReplace', preventLedgerModification)
ledgerSchema.pre('findOneAndUpdate', preventLedgerModification)
ledgerSchema.pre('updateOne', preventLedgerModification)
ledgerSchema.pre('updateMany', preventLedgerModification)
ledgerSchema.pre('deleteOne', preventLedgerModification)
ledgerSchema.pre('deleteMany', preventLedgerModification)
ledgerSchema.pre('remove', preventLedgerModification)

const ledgerModel = mongoose.model('Ledger', ledgerSchema);

module.exports = ledgerModel;