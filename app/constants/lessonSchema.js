export const TEEN_LESSONS = [
  {
    id: 'l1',
    title: 'Build Your Go-Bag',
    emoji: '🎒',
    xp: 20,
    exercises: [
      {
        type: 'select',
        prompt: 'What is the main purpose of a go-bag?',
        options: ['To look stylish', 'To grab quickly and leave fast in an emergency', 'To store snacks for later'],
        correct: 1
      },
      {
        type: 'wordbank',
        prompt: 'Build the sentence: the three most important things in a go-bag.',
        answer: ['Water', 'food', 'and', 'a', 'flashlight'],
        bank: ['Water', 'food', 'and', 'a', 'flashlight', 'television', 'perfume', 'games']
      },
      {
        type: 'truefalse',
        prompt: 'You should keep your go-bag somewhere hard to reach so it stays safe.',
        correct: false,
        explain: 'Keep it somewhere easy to grab — you may only have seconds to leave.'
      },
      {
        type: 'select',
        prompt: 'Which item does NOT belong in a go-bag?',
        options: ['A power bank', 'A games console', 'A small first-aid kit'],
        correct: 1
      }
    ]
  },
  {
    id: 'l2',
    title: 'Flood Smarts',
    emoji: '🌊',
    xp: 20,
    exercises: [
      {
        type: 'select',
        prompt: 'How much moving water can knock an adult off their feet?',
        options: ['About 15 cm (ankle deep)', 'About 1 metre (waist deep)', 'Only if it is over your head'],
        correct: 0
      },
      {
        type: 'truefalse',
        prompt: 'It is safe to drive through floodwater if it looks shallow.',
        correct: false,
        explain: 'Never drive through floodwater — just 60 cm can float a car, and you cannot see hazards underneath.'
      },
      {
        type: 'wordbank',
        prompt: 'Build the safety rule for a flood warning.',
        answer: ['Move', 'to', 'higher', 'ground', 'early'],
        bank: ['Move', 'to', 'higher', 'ground', 'early', 'the', 'basement', 'slowly', 'later']
      },
      {
        type: 'select',
        prompt: 'If told to evacuate before a flood, when should you go?',
        options: ['Early, as soon as you are told', 'After packing everything you own', 'Only once water reaches your door'],
        correct: 0
      }
    ]
  },
  {
    id: 'l3',
    title: 'Earthquake Response',
    emoji: '🏚️',
    xp: 20,
    exercises: [
      {
        type: 'wordbank',
        prompt: 'Build the three-step earthquake rule.',
        answer: ['Drop', 'Cover', 'Hold', 'On'],
        bank: ['Drop', 'Cover', 'Hold', 'On', 'Run', 'Jump', 'Outside', 'Climb']
      },
      {
        type: 'select',
        prompt: 'During shaking, where is the safest place?',
        options: ['Next to a large window', 'Under sturdy furniture', 'In a lift'],
        correct: 1
      },
      {
        type: 'truefalse',
        prompt: 'You should run outside immediately when shaking starts.',
        correct: false,
        explain: 'Most injuries happen from falling debris — Drop, Cover and Hold On until the shaking stops.'
      },
      {
        type: 'select',
        prompt: 'If you are in bed during an earthquake, you should...',
        options: ['Run to the kitchen', 'Stay and protect your head with a pillow', 'Stand in the doorway'],
        correct: 1
      }
    ]
  }
];
