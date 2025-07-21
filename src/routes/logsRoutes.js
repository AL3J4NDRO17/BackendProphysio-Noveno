const express = require('express');
const router = express.Router();
const LogsController = require('../controllers/logsController');

router.get('/getLogs/:date', LogsController.getLogsByDate);

module.exports = router;
