const bcrypt = require('bcryptjs');
const LessonModel = require('../Models/LessonModel');
const User = require('../Models/UserModel');

// =========================================================================
// AUTO SEED: Creates SuperAdmin, Admin, and 10 progressive lessons if empty
// Called once on server startup
// =========================================================================
async function autoSeedAccounts() {
    try {
        // ── SuperAdmin ──────────────────────────────────────────────────────
        const saEmail = process.env.SUPERADMIN_EMAIL;
        const saPassword = process.env.SUPERADMIN_PASSWORD;
        const saName = process.env.SUPERADMIN_NAME;
        const saPhone = process.env.SUPERADMIN_PHONE;

        if (saEmail && saPassword) {
            const existingSA = await User.findOne({ email: saEmail });
            if (!existingSA) {
                const hash = await bcrypt.hash(saPassword, 10);
                await User.create({
                    name: saName || 'SuperAdmin',
                    email: saEmail,
                    password: hash,
                    phone: saPhone || '0000000000',
                    age: 25,
                    state: 'HQ',
                    country: 'India',
                    role: 'superadmin',
                    isActive: true,
                    isOnboarded: true,
                    level: 'advanced',
                    goal: 'business',
                });
                console.log(`✅ [AUTO-SEED] SuperAdmin created: ${saEmail}`);
            } else {
                // If already exists but role is wrong, fix it
                if (existingSA.role !== 'superadmin') {
                    existingSA.role = 'superadmin';
                    await existingSA.save();
                    console.log(`🔄 [AUTO-SEED] Fixed role for SuperAdmin: ${saEmail}`);
                } else {
                    console.log(`ℹ️  [AUTO-SEED] SuperAdmin already exists: ${saEmail}`);
                }
            }
        }

        // ── Admin ───────────────────────────────────────────────────────────
        const adEmail = process.env.ADMIN_EMAIL;
        const adPassword = process.env.ADMIN_PASSWORD;
        const adName = process.env.ADMIN_NAME;
        const adPhone = process.env.ADMIN_PHONE;

        if (adEmail && adPassword) {
            const existingAdmin = await User.findOne({ email: adEmail });
            if (!existingAdmin) {
                const hash = await bcrypt.hash(adPassword, 10);
                await User.create({
                    name: adName || 'Admin',
                    email: adEmail,
                    password: hash,
                    phone: adPhone || '0000000001',
                    age: 25,
                    state: 'HQ',
                    country: 'India',
                    role: 'admin',
                    isActive: true,
                    isOnboarded: true,
                    level: 'advanced',
                    goal: 'business',
                });
                console.log(`✅ [AUTO-SEED] Admin created: ${adEmail}`);
            } else {
                if (existingAdmin.role !== 'admin' && existingAdmin.role !== 'superadmin') {
                    existingAdmin.role = 'admin';
                    await existingAdmin.save();
                    console.log(`🔄 [AUTO-SEED] Fixed role for Admin: ${adEmail}`);
                } else {
                    console.log(`ℹ️  [AUTO-SEED] Admin already exists: ${adEmail}`);
                }
            }
        }

        // ── Seed 10 Default Progressive Lessons ──────────────────────────────
        await LessonModel.deleteMany({});
        const lessonCount = 0;
        if (lessonCount === 0) {
            const defaultLessons = [
                {
                    lessonId: "lesson_001",
                    title: "Present Simple Routine",
                    category: "grammar",
                    difficulty: "beginner",
                    description: "Learn how to speak about daily routines, habits, and universal facts.",
                    estimatedMinutes: 5,
                    emoji: "📝",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Describing Daily Life",
                            explanation: "The Present Simple describes things we do repeatedly. Add an 's' or 'es' ending to third-person singular subjects (he, she, it).",
                            example: "She practices English vocabulary every morning.",
                            tip: "For negative routine statements, use 'do not' or 'does not' plus the base verb."
                        }
                    ],
                    quiz: [
                        {
                            question: "Choose the correct sentence representing a routine:",
                            options: ["She speak English daily.", "She speaks English daily.", "She speaking English daily.", "She spoken English daily."],
                            correctIndex: 1
                        },
                        {
                            question: "Complete: They ____ to school by bus.",
                            options: ["go", "goes", "going", "gone"],
                            correctIndex: 0
                        }
                    ]
                },
                {
                    lessonId: "lesson_002",
                    title: "Essential Day-to-Day Verbs",
                    category: "vocabulary",
                    difficulty: "beginner",
                    description: "Build confidence describing your morning and evening habits.",
                    estimatedMinutes: 4,
                    emoji: "📖",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Action Verbs",
                            explanation: "Use action verbs like get up, prepare, commute, and relax to organize descriptions of your calendar day.",
                            example: "I get up at 7:00 AM and prepare a hot breakfast.",
                            tip: "Difference: 'Wake up' means opening your eyes; 'Get up' means leaving your bed."
                        }
                    ],
                    quiz: [
                        {
                            question: "Which verb means physically leaving your bed?",
                            options: ["Wake up", "Get up", "Sleep in", "Lie down"],
                            correctIndex: 1
                        }
                    ]
                },
                {
                    lessonId: "lesson_003",
                    title: "Ordering at a Local Café",
                    category: "phrases",
                    difficulty: "beginner",
                    description: "Speak politely to baristas using polite request frames.",
                    estimatedMinutes: 5,
                    emoji: "💬",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Polite Request Frames",
                            explanation: "Use 'Could I have...' or 'I would like...' to place café orders politely instead of demanding 'I want...'.",
                            example: "Could I have a medium latte and a croissant, please?",
                            tip: "End with 'please' and follow up with 'thank you' to make a good impression."
                        }
                    ],
                    quiz: [
                        {
                            question: "What is the most polite order phrase?",
                            options: ["Give me tea.", "I want tea.", "I would like some tea, please.", "Tea now."],
                            correctIndex: 2
                        }
                    ]
                },
                {
                    lessonId: "lesson_004",
                    title: "English Vowel Sounds",
                    category: "pronunciation",
                    difficulty: "beginner",
                    description: "Differentiate between short and long vowel sound structures.",
                    estimatedMinutes: 5,
                    emoji: "👅",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Short 'a' vs Long 'a'",
                            explanation: "Short 'a' is open and relaxed (cat, hat). Long 'a' sounds like the name of the letter itself (cake, plate).",
                            example: "The black cat ate a sweet cake from the plate.",
                            tip: "Look in a mirror: your mouth drops wider for the short 'a' sound."
                        }
                    ],
                    quiz: [
                        {
                            question: "Which word contains a long 'a' sound?",
                            options: ["Bat", "Rate", "Map", "Tap"],
                            correctIndex: 1
                        }
                    ]
                },
                {
                    lessonId: "lesson_005",
                    title: "Connecting Past and Present",
                    category: "grammar",
                    difficulty: "intermediate",
                    description: "Master the present perfect tense for life experiences and current achievements.",
                    estimatedMinutes: 6,
                    emoji: "⏳",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Present Perfect Tense",
                            explanation: "Use present perfect (has/have + past participle) for actions that happened at an unspecified time in the past and still matter now.",
                            example: "I have lived in Mumbai for five years.",
                            tip: "Do not specify exact times (like 'yesterday') when using Present Perfect."
                        }
                    ],
                    quiz: [
                        {
                            question: "Complete: She ____ finished her homework already.",
                            options: ["have", "has", "is", "was"],
                            correctIndex: 1
                        }
                    ]
                },
                {
                    lessonId: "lesson_006",
                    title: "Interview Strengths & Skills",
                    category: "vocabulary",
                    difficulty: "intermediate",
                    description: "Learn keywords to describe your professional capabilities confidently.",
                    estimatedMinutes: 5,
                    emoji: "💼",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Describing Competence",
                            explanation: "Use positive adjectives like proactive, collaborative, and adaptable to present yourself in a workplace interview.",
                            example: "I am a proactive team worker who is highly adaptable.",
                            tip: "Always back up these descriptors with brief examples of past achievements."
                        }
                    ],
                    quiz: [
                        {
                            question: "Which word describes taking initiative before being asked?",
                            options: ["Lazy", "Passive", "Proactive", "Hesitant"],
                            correctIndex: 2
                        }
                    ]
                },
                {
                    lessonId: "lesson_007",
                    title: "Handling Airport Queries",
                    category: "phrases",
                    difficulty: "intermediate",
                    description: "Learn travel expressions to check luggage and locate boarding gates.",
                    estimatedMinutes: 5,
                    emoji: "✈️",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Checking In and Directions",
                            explanation: "Ask travelers or airport staff politely for directions using indirect questions.",
                            example: "Excuse me, could you tell me where the baggage claim is?",
                            tip: "Start with 'Excuse me' to grab attention politely."
                        }
                    ],
                    quiz: [
                        {
                            question: "How do you check bag claim directions?",
                            options: ["Where is the baggage claim?", "Give me my bags.", "Where is terminal 2?", "Is my flight delayed?"],
                            correctIndex: 0
                        }
                    ]
                },
                {
                    lessonId: "lesson_008",
                    title: "The Hard 'TH' Sounds",
                    category: "pronunciation",
                    difficulty: "intermediate",
                    description: "Learn to produce voiced and unvoiced 'th' sounds.",
                    estimatedMinutes: 5,
                    emoji: "🗣️",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Voiced vs Unvoiced 'TH'",
                            explanation: "Voiced 'th' vibrates the vocal cords (this, that, they). Unvoiced 'th' releases only air (think, bath, thin).",
                            example: "They think this theater is awesome.",
                            tip: "Place the tip of your tongue slightly between your front teeth to blow air."
                        }
                    ],
                    quiz: [
                        {
                            question: "Which word contains a voiced 'th' sound?",
                            options: ["Thin", "Think", "Their", "Bath"],
                            correctIndex: 2
                        }
                    ]
                },
                {
                    lessonId: "lesson_009",
                    title: "Speculating on the Past",
                    category: "grammar",
                    difficulty: "advanced",
                    description: "Formulate conditional structures to speculate on past decisions.",
                    estimatedMinutes: 6,
                    emoji: "🧠",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Third Conditional",
                            explanation: "Use third conditional (if + past perfect, would have + past participle) to talk about imaginary outcomes of past situations.",
                            example: "If I had studied harder, I would have passed the exam.",
                            tip: "This conditional expresses regret or relief about past possibilities."
                        }
                    ],
                    quiz: [
                        {
                            question: "Identify the third conditional sentence:",
                            options: ["If it rains, I will stay.", "If I were rich, I would travel.", "If I had known, I would have called.", "If you heat ice, it melts."],
                            correctIndex: 2
                        }
                    ]
                },
                {
                    lessonId: "lesson_010",
                    title: "Diplomatic Disagreement",
                    category: "phrases",
                    difficulty: "advanced",
                    description: "Politely negotiate and disagree in formal workspaces.",
                    estimatedMinutes: 6,
                    emoji: "🤝",
                    unlockAfter: 0,
                    steps: [
                        {
                            title: "Soft Disagreement Frames",
                            explanation: "Avoid blunt statements. Use softeners like 'I see your point, however...' or 'I respectfully look at this differently'.",
                            example: "I see your point on cost savings, however, we cannot compromise on quality.",
                            tip: "Softeners maintain professional relationships while establishing boundaries."
                        }
                    ],
                    quiz: [
                        {
                            question: "Which is the most diplomatic negotiation phrase?",
                            options: ["You are completely wrong.", "I see your point, however, we should explore other options.", "No way, I disagree.", "That makes no sense."],
                            correctIndex: 1
                        }
                    ]
                }
            ];
            await LessonModel.insertMany(defaultLessons);
            console.log(`✅ [AUTO-SEED] 10 progressive lessons seeded successfully.`);
        }
    } catch (err) {
        console.error('❌ [AUTO-SEED] Error during seeding:', err.message);
    }
}

module.exports = { autoSeedAccounts };
