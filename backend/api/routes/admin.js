'use strict'
const express = require('express');
const router = express.Router();
const checkAuth = require('../../middleware/check-auth');
const adminControler = require('../../controlers/admin');

/** Fetch user profile data */
router.get('/zaduzenja', checkAuth, adminControler.getZaduzenja);

module.exports = router;