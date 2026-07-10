const express = require('express');
const router = express.Router();
const isUserMiddleware = require('../Middleware/isUser');
const { checkGrammar } = require('../Controller/CheckGrammer');



router.post('/grammar', isUserMiddleware, checkGrammar);

module.exports = router;