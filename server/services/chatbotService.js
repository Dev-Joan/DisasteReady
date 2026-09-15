require('dotenv').config({ quiet: true });
const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

const SYSTEM_PROMPT = `You are the DisasterReady preparedness assistant. You ONLY answer questions about disaster preparedness topics: earthquakes, floods, severe weather, general emergency planning, evacuation, emergency kits, and related safety guidance.

If a question is outside this scope (e.g. medical advice, legal advice, general chit-chat, or anything unrelated to disaster preparedness), respond ONLY with:
"I'm scoped to disaster-preparedness questions. For anything else, please consult the appropriate professional or official source."

Keep answers concise, practical, and safety-focused. For anything involving an active emergency, always recommend contacting official emergency services rather than relying solely on this chatbot.`;

async function askChatbot(userMessage) {
  const response = await anthropic.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 600,
    system: SYSTEM_PROMPT,
    messages: [
      { role: 'user', content: userMessage }
    ]
  });

  return response.content[0].text;
}

module.exports = { askChatbot };