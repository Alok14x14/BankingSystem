const { Router } = require('express');
const authMiddleware = require('../middlewares/auth.middleware');
const transactionRoutes = Router();
const transactionController = require('../controllers/transaction.controller')

/**
 * - POST /api/transactions/
 * - Create a new transaction
*/

transactionRoutes.post('/', authMiddleware.authMiddleware, transactionController.createTransaction);
/**
 * - POST /api/transactions/system/initial-funds
 * - Create initial funds transaction from system user 
 */

transactionRoutes.post('/system/initial-funds', authMiddleware.authSystemUsermiddleware, transactionController.createInitialFunds)
transactionRoutes.get('/history/:accountId', authMiddleware.authMiddleware, transactionController.transactionHistory)

module.exports = transactionRoutes;