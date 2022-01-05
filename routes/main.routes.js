const express = require('express');
const mainControllers = require('../controllers/main.controllers');
const router = express.Router();

router.get('/app', mainControllers.getApp);
router.get('/chat/:eventId', mainControllers.getChat);
router.post('/write', mainControllers.postWrite);
router.get('/search', mainControllers.getSearch);
router.get('/', mainControllers.getIndex);

module.exports = router;
