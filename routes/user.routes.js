const express = require('express');
const userControllers = require('../controllers/user.controllers');
const router = express.Router();

router.get('/login', userControllers.getLogin);
router.post('/register', userControllers.postRegister);
router.get('/register', userControllers.getRegister);
router.get('/profile/:userId', userControllers.getProfile);
router.post('/profile', userControllers.postProfile);
router.get('/delete', userControllers.getDelete);
router.get('/logout', userControllers.getLogout);
router.post('/login', userControllers.postLogin);
router.post('/changepassword', userControllers.postChangePassword);

module.exports = router;
