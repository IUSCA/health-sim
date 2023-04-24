const express = require('express');

const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/health', (req, res) => { res.send('OK'); });
router.use('/auth', require('./auth'));
router.use('/batches', require('./batches'));
router.use('/reports', require('./reports'));
router.use('/metrics', require('./metrics'));
router.use('/raw_data', require('./raw_data'));
router.use('/data_products', require('./data_products'));

// From this point on, all routes require authentication.
router.use(authenticate);

router.use('/users', require('./users'));
router.use('/workflows', require('./workflows'));

module.exports = router;
