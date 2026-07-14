const LessonModel = require('../Models/LessonModel');
const UserModel = require('../Models/UserModel');


// =========================================================================
// 1. GET ALL LESSONS (with completion status for the logged-in user)
//    Lessons are created by Admin — no seed data here.
// =========================================================================
async function getAllLessons(req, res) {
    try {
        const lessons = await LessonModel.find(
            {},
            'lessonId title category difficulty description estimatedMinutes emoji unlockAfter'
        ).lean();

        // Sort lessons alphabetically by lessonId to establish a stable progression
        lessons.sort((a, b) => a.lessonId.localeCompare(b.lessonId));

        const user = await UserModel.findById(req.user.id)
            .select('completedLessons level')
            .lean();

        const completedIds = (user?.completedLessons || []).map(c => c.lessonId);

        const enriched = lessons.map((lesson, index) => {
            const isCompleted = completedIds.includes(lesson.lessonId);
            const completionData = user?.completedLessons?.find(c => c.lessonId === lesson.lessonId) || null;
            
            // Sequential Unlock: First lesson is always open, next opens only when previous completes
            let isLocked = false;
            if (index > 0) {
                const prevLesson = lessons[index - 1];
                isLocked = !completedIds.includes(prevLesson.lessonId);
            }

            return {
                ...lesson,
                isCompleted,
                completionData,
                isLocked
            };
        });

        return res.status(200).json({
            lessons: enriched,
            totalCompleted: completedIds.length
        });
    } catch (err) {
        console.error('getAllLessons error:', err.message);
        return res.status(500).json({ error: 'Failed to retrieve lessons.' });
    }
}

// =========================================================================
// 2. GET SINGLE LESSON BY ID (full content + quiz)
// =========================================================================
async function getLessonById(req, res) {
    try {
        const { lessonId } = req.params;
        const lesson = await LessonModel.findOne({ lessonId }).lean();

        if (!lesson) {
            return res.status(404).json({ error: 'Lesson not found.' });
        }

        const user = await UserModel.findById(req.user.id)
            .select('completedLessons')
            .lean();

        const completionData = user?.completedLessons?.find(c => c.lessonId === lessonId) || null;

        return res.status(200).json({
            lesson,
            isCompleted: !!completionData,
            completionData
        });
    } catch (err) {
        console.error('getLessonById error:', err.message);
        return res.status(500).json({ error: 'Failed to retrieve lesson.' });
    }
}

// =========================================================================
// 3. COMPLETE A LESSON — save quiz score (one-time, no repeats)
// =========================================================================
async function completeLesson(req, res) {
    try {
        const { lessonId } = req.params;
        const { score, total } = req.body;

        if (score === undefined || !total) {
            return res.status(400).json({ error: 'Score and total are required.' });
        }

        const user = await UserModel.findById(req.user.id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Prevent duplicate completion — quiz is locked after first attempt
        const alreadyDone = user.completedLessons.some(c => c.lessonId === lessonId);
        if (alreadyDone) {
            return res.status(200).json({
                message: 'Lesson already completed.',
                alreadyCompleted: true
            });
        }

        const percentage = Math.round((score / total) * 100);

        user.completedLessons.push({
            lessonId,
            score,
            total,
            percentage,
            completedAt: new Date()
        });

        // Streak bonus — update if not practiced today
        const today = new Date().toDateString();
        const lastDate = user.lastPracticeDate
            ? new Date(user.lastPracticeDate).toDateString()
            : null;

        if (lastDate !== today) {
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            if (lastDate === yesterday.toDateString()) {
                user.streak = (user.streak || 0) + 1;
            } else {
                user.streak = 1;
            }
            user.lastPracticeDate = new Date();
        }

        await user.save();

        return res.status(200).json({
            message: 'Lesson completed successfully!',
            percentage,
            score,
            total,
            streak: user.streak
        });
    } catch (err) {
        console.error('completeLesson error:', err.message);
        return res.status(500).json({ error: 'Failed to save lesson completion.' });
    }
}

module.exports = { getAllLessons, getLessonById, completeLesson };
