const mongoose = require('mongoose');
const ledgerModel = require('./ledger.model');

const accountSchema = new mongoose.Schema({

    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required'],
        index: true
    },
    status: {
        type: String,
        enum:{
            values: [ "ACTIVE", "FROZEN", "CLOSED"],
            message: 'Status can be either ACTIVE, FROZEN or CLOSED'
        },
        default: "ACTIVE"
    },
    currency: {
        type: String,
        required: [true, 'Currency is required'],
        default: "INR"
    }

},{
    timestamps: true
})

accountSchema.index({ user: 1, status: 1 });

accountSchema.methods.getBalance = async function() {
    // Implementation for getting account balance
    const balancedata = await ledgerModel.aggregate([
        { $match: { account: this._id } },
        {
            $group:{
                _id: null,
                totalDebit:{
                    $sum:{
                        $cond:{
                            if:{ $eq: [ "$type", "DEBIT" ] },
                            then: "$amount",
                            else: 0
                        }
                    }
                },
                totalCredit:{
                    $sum:{
                        $cond:{
                            if:{ $eq: [ "$type", "CREDIT" ] },
                            then: "$amount",
                            else: 0
                        }
                    }
                }
            }
        },
        {
            $project:{
                _id: 0,
                balance: { $subtract: [ "$totalCredit", "$totalDebit" ] }
            }
        }

    ])

    if(balancedata.length === 0){
        return 0;
    }

    return balancedata[0].balance;
    
};

const accountModel = mongoose.model('Account', accountSchema);

module.exports = accountModel;