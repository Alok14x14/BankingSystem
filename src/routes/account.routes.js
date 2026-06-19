const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middlewares/auth.middleware');
const accountController = require('../controllers/account.controller');

router.post('/', authMiddleware, accountController.createAccount);
router.get('/accounts', authMiddleware, accountController.getAccounts);
router.get('/balance/:accountId', authMiddleware, accountController.getBalance);

module.exports = router;