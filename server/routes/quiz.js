const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const quizEngine = require('../services/quizEngine');
const gamificationEngine = require('../services/gamificationEngine');

const quizBankPath = path.join(__dirname, '../data/quizBank.json');
const quizStatePath = path.join(__dirname, '../data/quizState.json');

function loadQuizBank() {
  return JSON.parse(fs.readFileSync(quizBankPath, 'utf8'));
}

function loadQuizState() {
  if (!fs.existsSync(quizStatePath)) return {};
  return JSON.parse(fs.readFileSync(quizStatePath, 'utf8'));
}

function saveQuizState(state) {
  fs.writeFileSync(quizStatePath, JSON.stringify(state, null, 2));
}

router.get('/next-question', (req, res) => {
  const { userId, topic } = req.query;

  if (!userId || !topic) {
    return res.status(400).json({ error: 'userId and topic are required' });
  }

  const allState = loadQuizState();
  if (!allState[userId]) allState[userId] = {};
  const userState = allState[userId];

  if (!userState[topic]) userState[topic] = quizEngine.initTopicState();

  const questionBank = loadQuizBank();
  const seenQuestionIds = [];
  const question = quizEngine.pickQuestion(questionBank, topic, userState[topic].currentDifficulty, seenQuestionIds);

  saveQuizState(allState);

  if (!question) {
    return res.status(200).json({ message: 'No more questions available', mastered: userState[topic].mastered });
  }

  res.status(200).json({
    questionId: question.questionId,
    text: question.text,
    difficulty: question.difficulty,
    mastered: userState[topic].mastered
  });
});

router.post('/answer', (req, res) => {
  const { userId, topic, wasCorrect } = req.body;

  if (!userId || !topic || wasCorrect === undefined) {
    return res.status(400).json({ error: 'userId, topic, and wasCorrect are required' });
  }

  const allState = loadQuizState();
  if (!allState[userId]) allState[userId] = {};
  const userState = allState[userId];

  const wasAlreadyMastered = userState[topic] ? userState[topic].mastered : false;

  quizEngine.recordAnswer(userState, topic, wasCorrect);
  saveQuizState(allState);

  const pointsForThisAnswer = wasCorrect ? (userState[topic].currentDifficulty * 5) : 0;
  let gamificationResult = null;

  if (pointsForThisAnswer > 0) {
    gamificationResult = gamificationEngine.awardPoints(userId, pointsForThisAnswer);
  }

  if (userState[topic].mastered && !wasAlreadyMastered) {
    gamificationResult = gamificationEngine.awardTopicMasteryBadge(userId, topic);
  }

  res.status(200).json({
    newDifficulty: userState[topic].currentDifficulty,
    accuracy: quizEngine.rollingAccuracy(userState, topic),
    mastered: userState[topic].mastered,
    gamification: gamificationResult
  });
});

module.exports = router;