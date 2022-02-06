const express = require('express');
const mainControllers = require('../controllers/main.controllers');
const router = express.Router();

// Assign all routes to a controller
router.get('/app', mainControllers.getApp);
router.get('/chat/:eventId', mainControllers.getChat);
router.post('/write', mainControllers.postWrite);
router.get('/search', mainControllers.getSearch);
router.get('/', mainControllers.getIndex);
router.get('/profilepicture/:userId', mainControllers.getProfilePicture);

module.exports = router;
