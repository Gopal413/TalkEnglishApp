const express = require('express');
const { startConversation, sendMessage, endConversation, checkGrammar } = require('../Controller/ConversationController');
const isUserMiddleware = require('../Middleware/isUser');
const router = express.Router();


// Map your exact documentation endpoints
router.post('/start',isUserMiddleware, startConversation);
router.post('/message', isUserMiddleware, sendMessage);
router.post('/end', isUserMiddleware, endConversation);


module.exports = router;