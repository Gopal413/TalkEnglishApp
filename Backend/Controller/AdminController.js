const UserModel = require('../Models/UserModel');
const LessonModel = require('../Models/LessonModel');
const ConversationModel = require('../Models/ConversationModel');

// =========================================================================
// 1. DASHBOARD STATS (Scoped to Admin)
// =========================================================================
async function getDashboardStats(req, res) {
    try {
        const adminId = req.user.id;

        const totalUsers = await UserModel.countDocuments({ role: 'user' });
        const activeUsers = await UserModel.countDocuments({ role: 'user', isActive: true });
        
        // Lessons created by this admin
        const adminLessons = await LessonModel.find({ createdBy: adminId }).select('lessonId').lean();
        const totalLessons = adminLessons.length;
        const adminLessonIds = adminLessons.map(l => l.lessonId);

        // Count completions of lessons created by this admin across all users
        const allUsers = await UserModel.find({ role: 'user' })
            .select('name email completedLessons streak level')
            .lean();

        let totalCompletions = 0;
        allUsers.forEach(u => {
            const completions = u.completedLessons || [];
            completions.forEach(c => {
                if (adminLessonIds.includes(c.lessonId)) {
                    totalCompletions++;
                }
            });
        });

        // Top scorers leaderboard (General view)
        const leaderboard = allUsers
            .map(u => {
                const completions = u.completedLessons || [];
                const avg = completions.length > 0
                    ? Math.round(completions.reduce((sum, c) => sum + c.percentage, 0) / completions.length)
                    : 0;
                return {
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    level: u.level || 'beginner',
                    totalCompleted: completions.length,
                    averageScore: avg,
                    streak: u.streak || 0
                };
            })
            .sort((a, b) => b.averageScore - a.averageScore)
            .slice(0, 5);

        return res.status(200).json({
            stats: { 
                totalUsers, 
                totalLessons, // Admin's own lessons count
                activeUsers, 
                totalCompletions // completions of this admin's lessons
            },
            topScorers: leaderboard
        });
    } catch (err) {
        console.error('Admin getDashboardStats error:', err);
        return res.status(500).json({ error: 'Failed to fetch admin dashboard stats.' });
    }
}

// =========================================================================
// 2. USERS READ-ONLY VIEW
// =========================================================================
async function getAllUsers(req, res) {
    try {
        const { search = '', page = 1, limit = 20 } = req.query;
        const skip = (page - 1) * limit;

        const query = { role: 'user' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const users = await UserModel.find(query)
            .select('name email phone age state country level goal streak isActive isOnboarded completedLessons createdAt')
            .skip(skip)
            .limit(Number(limit))
            .sort({ createdAt: -1 })
            .lean();

        const total = await UserModel.countDocuments(query);

        const enriched = users.map(u => ({
            ...u,
            lessonsCompleted: u.completedLessons?.length || 0,
            averageScore: u.completedLessons?.length > 0
                ? Math.round(u.completedLessons.reduce((s, c) => s + c.percentage, 0) / u.completedLessons.length)
                : 0,
            completedLessons: undefined // omit raw completions array in list view
        }));

        return res.status(200).json({ users: enriched, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error('Admin getAllUsers error:', err);
        return res.status(500).json({ error: 'Failed to fetch users.' });
    }
}

async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id)
            .select('-password -otp -otpExpires')
            .lean();

        if (!user || user.role !== 'user') {
            return res.status(404).json({ error: 'User profile not found.' });
        }

        return res.status(200).json({ user });
    } catch (err) {
        console.error('Admin getUserById error:', err);
        return res.status(500).json({ error: 'Failed to fetch user details.' });
    }
}

// =========================================================================
// 3. LESSONS CRUD (with ownership filters for updates/deletes)
// =========================================================================
async function getAllLessonsAdmin(req, res) {
    try {
        const { search = '', category = '', difficulty = '' } = req.query;
        const query = {};
        if (search) query.title = { $regex: search, $options: 'i' };
        if (category) query.category = category;
        if (difficulty) query.difficulty = difficulty;

        const lessons = await LessonModel.find(query)
            .select('lessonId title category difficulty description estimatedMinutes emoji unlockAfter createdBy createdByName steps quiz createdAt')
            .sort({ createdAt: -1 })
            .lean();

        // Fetch user records to correlate completion details
        const users = await UserModel.find({ role: 'user' }, 'name email completedLessons').lean();

        const enriched = lessons.map(lesson => {
            const completions = [];
            users.forEach(u => {
                const record = (u.completedLessons || []).find(c => c.lessonId === lesson.lessonId);
                if (record) {
                    completions.push({
                        userId: u._id,
                        name: u.name,
                        email: u.email,
                        completedAt: record.completedAt,
                        score: record.score,
                        total: record.total,
                        percentage: record.percentage
                    });
                }
            });
            return {
                ...lesson,
                completionsCount: completions.length,
                completions
            };
        });

        return res.status(200).json({ lessons: enriched, total: enriched.length });
    } catch (err) {
        console.error('Admin getAllLessonsAdmin error:', err);
        return res.status(500).json({ error: 'Failed to fetch lessons.' });
    }
}

async function getLessonAdmin(req, res) {
    try {
        const { id } = req.params;
        const lesson = await LessonModel.findOne({ lessonId: id }).lean();
        if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
        return res.status(200).json({ lesson });
    } catch (err) {
        console.error('Admin getLessonAdmin error:', err);
        return res.status(500).json({ error: 'Failed to fetch lesson details.' });
    }
}

async function createLesson(req, res) {
    try {
        const { lessonId, title, category, difficulty, description, estimatedMinutes, emoji, unlockAfter, steps, quiz } = req.body;

        if (!lessonId || !title || !category || !difficulty || !description) {
            return res.status(400).json({ error: 'lessonId, title, category, difficulty, and description are required.' });
        }

        const existing = await LessonModel.findOne({ lessonId });
        if (existing) return res.status(400).json({ error: 'Lesson ID already exists. Choose a unique ID.' });

        // Retrieve admin's name
        const adminUser = await UserModel.findById(req.user.id);

        const lesson = await LessonModel.create({
            lessonId, title, category, difficulty, description,
            estimatedMinutes: estimatedMinutes || 5,
            emoji: emoji || '📖',
            unlockAfter: unlockAfter || 0,
            steps: steps || [],
            quiz: quiz || [],
            createdBy: req.user.id,
            createdByName: adminUser?.name || 'Admin'
        });

        return res.status(201).json({ message: 'Lesson created successfully!', lesson });
    } catch (err) {
        console.error('Admin createLesson error:', err);
        return res.status(500).json({ error: 'Failed to create lesson.' });
    }
}

async function updateLesson(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const lesson = await LessonModel.findOne({ lessonId: id });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

        // Do not overwrite creator details if they are already defined
        delete updates.createdBy;
        delete updates.createdByName;

        Object.assign(lesson, updates);
        await lesson.save();

        return res.status(200).json({ message: 'Lesson updated successfully!', lesson });
    } catch (err) {
        console.error('Admin updateLesson error:', err);
        return res.status(500).json({ error: 'Failed to update lesson.' });
    }
}

async function deleteLesson(req, res) {
    try {
        const { id } = req.params;

        const lesson = await LessonModel.findOne({ lessonId: id });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

        await LessonModel.deleteOne({ lessonId: id });
        return res.status(200).json({ message: 'Lesson deleted successfully.' });
    } catch (err) {
        console.error('Admin deleteLesson error:', err);
        return res.status(500).json({ error: 'Failed to delete lesson.' });
    }
}

// =========================================================================
// 4. LEADERBOARD DISPLAY
// =========================================================================
async function getLeaderboard(req, res) {
    try {
        const users = await UserModel.find({ role: 'user', isActive: true })
            .select('name email level streak completedLessons createdAt')
            .lean();

        const ranked = users
            .map(u => {
                const completions = u.completedLessons || [];
                const avg = completions.length > 0
                    ? Math.round(completions.reduce((s, c) => s + c.percentage, 0) / completions.length)
                    : 0;
                return {
                    id: u._id,
                    name: u.name,
                    email: u.email,
                    level: u.level || 'beginner',
                    streak: u.streak || 0,
                    totalCompleted: completions.length,
                    averageScore: avg,
                    joinedAt: u.createdAt
                };
            })
            .sort((a, b) => b.averageScore - a.averageScore || b.totalCompleted - a.totalCompleted);

        return res.status(200).json({ leaderboard: ranked });
    } catch (err) {
        console.error('Admin getLeaderboard error:', err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
}

module.exports = {
    getDashboardStats,
    getAllUsers,
    getUserById,
    getAllLessonsAdmin,
    getLessonAdmin,
    createLesson,
    updateLesson,
    deleteLesson,
    getLeaderboard
};
