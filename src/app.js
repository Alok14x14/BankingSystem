const express = require('express')
const cookieParser = require('cookie-parser');

const app = express();

app.use(express.json());
app.use(cookieParser());

app.get('/', (req, res) => {
    res.status(200).json({
        message: 'Welcome to the Banking System API',
        status: 'success'
    })
})

/**
* - Routes required
*/
const authRouter = require('../src/routes/auth.routes');
const accountRouter = require('./routes/account.routes');
const transactionRoutes = require('./routes/transaction.routes');

/**
* - use Routes
*/
app.use('/api/auth', authRouter);
app.use('/api/accounts', accountRouter);
app.use('/api/transactions', transactionRoutes);


module.exports = app;