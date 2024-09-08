// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const tokenController = require('../controllers/tokenController');


router.get('/callback', tokenController.getCode);
//get access token, refresh token
router.post('/auth/tokens', tokenController.getTokens);
//get new accesstoken by refresh token
router.post('/auth/refresh', tokenController.refreshToken);
//verify access token by google endpoint
router.post('/auth/verify/accesstoken', authController.verifyAccessToken);
//verify id token by google endpoint
router.post('/auth/verify/idtoken/google', authController.verifyIdTokenByGoogle);
//verify access token by JWT verifying
router.post('/auth/verify/idtoken/server', authController.verifyIdTokenByServer);

module.exports = router;
