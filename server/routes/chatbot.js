const express = require('express');
const router = express.Router();
const chatbotService = require('../services/chatbotService');

router.post('/ask', async (req, res) => {
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }

  try {
    const reply = await chatbotService.askChatbot(message);
    res.status(200).json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Chatbot request failed' });
  }
});

module.exports = router;