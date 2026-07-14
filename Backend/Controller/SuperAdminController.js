const bcrypt = require('bcryptjs');
const UserModel = require('../Models/UserModel');
const LessonModel = require('../Models/LessonModel');
const ConversationModel = require('../Models/ConversationModel');

// =========================================================================
// 1. DASHBOARD STATS
// =========================================================================
async function getDashboardStats(req, res) {
    try {
        const totalUsers = await UserModel.countDocuments({ role: 'user' });
        const totalAdmins = await UserModel.countDocuments({ role: 'admin' });
        const totalLessons = await LessonModel.countDocuments({});
        const activeUsers = await UserModel.countDocuments({ role: 'user', isActive: true });

        // Top scorer: user with highest average lesson completion percentage
        const allUsers = await UserModel.find({ role: 'user' })
            .select('name email completedLessons streak level')
            .lean();

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

        const totalCompletions = allUsers.reduce((sum, u) => sum + (u.completedLessons?.length || 0), 0);

        return res.status(200).json({
            stats: { totalUsers, totalAdmins, totalLessons, activeUsers, totalCompletions },
            topScorers: leaderboard
        });
    } catch (err) {
        console.error('getDashboardStats error:', err);
        return res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
    }
}

// =========================================================================
// 2. USERS MANAGEMENT — Full CRUD (role: 'user' only)
// =========================================================================

// GET all users
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
            completedLessons: undefined // don't send full array in list view
        }));

        return res.status(200).json({ users: enriched, total, page: Number(page), limit: Number(limit) });
    } catch (err) {
        console.error('getAllUsers error:', err);
        return res.status(500).json({ error: 'Failed to fetch users.' });
    }
}

// GET single user with full progress
async function getUserById(req, res) {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id)
            .select('-password -otp -otpExpires')
            .lean();
        if (!user) return res.status(404).json({ error: 'User not found.' });

        // Get completed lesson details
        const completedIds = user.completedLessons?.map(c => c.lessonId) || [];
        const lessons = await LessonModel.find({ lessonId: { $in: completedIds } })
            .select('lessonId title category difficulty emoji')
            .lean();

        const enrichedCompletions = (user.completedLessons || []).map(c => {
            const lesson = lessons.find(l => l.lessonId === c.lessonId);
            return { ...c, lessonTitle: lesson?.title || c.lessonId, category: lesson?.category, emoji: lesson?.emoji };
        });

        // Get conversation count
        const conversationCount = await ConversationModel.countDocuments({ userId: id });

        return res.status(200).json({
            user: { ...user, completedLessons: enrichedCompletions },
            conversationCount,
            totalCompleted: enrichedCompletions.length,
            averageScore: enrichedCompletions.length > 0
                ? Math.round(enrichedCompletions.reduce((s, c) => s + c.percentage, 0) / enrichedCompletions.length)
                : 0
        });
    } catch (err) {
        console.error('getUserById error:', err);
        return res.status(500).json({ error: 'Failed to fetch user.' });
    }
}

// POST create a new user
async function createUser(req, res) {
    try {
        const { name, email, password, phone, age, state, country } = req.body;
        if (!name || !email || !password || !phone || !age || !state || !country) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await UserModel.create({
            name, email, password: hashedPassword, phone, age, state, country,
            isVerified: true, isOnboarded: false, role: 'user'
        });

        return res.status(201).json({
            message: 'User created successfully.',
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (err) {
        console.error('createUser error:', err);
        return res.status(500).json({ error: 'Failed to create user.' });
    }
}

// PUT update a user
async function updateUser(req, res) {
    try {
        const { id } = req.params;
        const { name, email, phone, age, state, country, level, goal } = req.body;

        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });

        if (name) user.name = name;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        if (age) user.age = Number(age);
        if (state) user.state = state;
        if (country) user.country = country;
        if (level) user.level = level;
        if (goal) user.goal = goal;

        await user.save();
        return res.status(200).json({ message: 'User updated successfully.' });
    } catch (err) {
        console.error('updateUser error:', err);
        return res.status(500).json({ error: 'Failed to update user.' });
    }
}

// DELETE a user
async function deleteUser(req, res) {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot delete SuperAdmin.' });

        await UserModel.findByIdAndDelete(id);
        return res.status(200).json({ message: 'User deleted successfully.' });
    } catch (err) {
        console.error('deleteUser error:', err);
        return res.status(500).json({ error: 'Failed to delete user.' });
    }
}

// PATCH toggle user active/inactive
async function toggleUserStatus(req, res) {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot disable SuperAdmin.' });

        user.isActive = !user.isActive;
        await user.save();
        return res.status(200).json({
            message: `User account ${user.isActive ? 'activated' : 'deactivated'} successfully.`,
            isActive: user.isActive
        });
    } catch (err) {
        console.error('toggleUserStatus error:', err);
        return res.status(500).json({ error: 'Failed to update user status.' });
    }
}

// =========================================================================
// 3. ADMINS MANAGEMENT — Full CRUD (role: 'admin')
// =========================================================================

// GET all admins with their lesson activity
async function getAllAdmins(req, res) {
    try {
        const { search = '' } = req.query;
        const query = { role: 'admin' };
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { email: { $regex: search, $options: 'i' } }
            ];
        }

        const admins = await UserModel.find(query)
            .select('name email phone state country isActive createdAt')
            .sort({ createdAt: -1 })
            .lean();

        // For each admin, count how many lessons they created
        const adminIds = admins.map(a => a._id);
        const lessonCounts = await LessonModel.aggregate([
            { $match: { createdBy: { $in: adminIds } } },
            { $group: { _id: '$createdBy', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        lessonCounts.forEach(lc => { countMap[lc._id.toString()] = lc.count; });

        const enriched = admins.map(a => ({
            ...a,
            lessonsCreated: countMap[a._id.toString()] || 0
        }));

        return res.status(200).json({ admins: enriched, total: enriched.length });
    } catch (err) {
        console.error('getAllAdmins error:', err);
        return res.status(500).json({ error: 'Failed to fetch admins.' });
    }
}

// GET single admin detail + their lessons
async function getAdminById(req, res) {
    try {
        const { id } = req.params;
        const admin = await UserModel.findById(id).select('-password -otp -otpExpires').lean();
        if (!admin || admin.role !== 'admin') return res.status(404).json({ error: 'Admin not found.' });

        const lessons = await LessonModel.find({ createdBy: id })
            .select('lessonId title category difficulty emoji estimatedMinutes createdAt')
            .sort({ createdAt: -1 })
            .lean();

        return res.status(200).json({ admin, lessonsCreated: lessons, totalLessons: lessons.length });
    } catch (err) {
        console.error('getAdminById error:', err);
        return res.status(500).json({ error: 'Failed to fetch admin detail.' });
    }
}

// POST create a new admin
async function createAdmin(req, res) {
    try {
        const { name, email, password, phone, age, state, country } = req.body;
        if (!name || !email || !password || !phone || !age || !state || !country) {
            return res.status(400).json({ error: 'All fields are required.' });
        }

        const existing = await UserModel.findOne({ email });
        if (existing) return res.status(400).json({ error: 'Email already in use.' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const admin = await UserModel.create({
            name, email, password: hashedPassword, phone, age, state, country,
            isVerified: true, isOnboarded: true, role: 'admin'
        });

        return res.status(201).json({
            message: 'Admin created successfully.',
            admin: { id: admin._id, name: admin.name, email: admin.email, role: admin.role }
        });
    } catch (err) {
        console.error('createAdmin error:', err);
        return res.status(500).json({ error: 'Failed to create admin.' });
    }
}

// PUT update an admin
async function updateAdmin(req, res) {
    try {
        const { id } = req.params;
        const { name, email, phone, age, state, country } = req.body;

        const admin = await UserModel.findById(id);
        if (!admin || admin.role !== 'admin') return res.status(404).json({ error: 'Admin not found.' });

        if (name) admin.name = name;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;
        if (age) admin.age = Number(age);
        if (state) admin.state = state;
        if (country) admin.country = country;

        await admin.save();
        return res.status(200).json({ message: 'Admin updated successfully.' });
    } catch (err) {
        console.error('updateAdmin error:', err);
        return res.status(500).json({ error: 'Failed to update admin.' });
    }
}

// PATCH promote user → admin
async function promoteToAdmin(req, res) {
    try {
        const { id } = req.params;
        const user = await UserModel.findById(id);
        if (!user) return res.status(404).json({ error: 'User not found.' });
        if (user.role === 'superadmin') return res.status(403).json({ error: 'Cannot demote SuperAdmin.' });

        user.role = 'admin';
        await user.save();
        return res.status(200).json({ message: `${user.name} has been promoted to Admin.` });
    } catch (err) {
        console.error('promoteToAdmin error:', err);
        return res.status(500).json({ error: 'Failed to promote user.' });
    }
}

// PATCH demote admin → user
async function demoteAdmin(req, res) {
    try {
        const { id } = req.params;
        const admin = await UserModel.findById(id);
        if (!admin || admin.role !== 'admin') return res.status(404).json({ error: 'Admin not found.' });

        admin.role = 'user';
        await admin.save();
        return res.status(200).json({ message: `${admin.name} has been demoted to User.` });
    } catch (err) {
        console.error('demoteAdmin error:', err);
        return res.status(500).json({ error: 'Failed to demote admin.' });
    }
}

// DELETE an admin
async function deleteAdmin(req, res) {
    try {
        const { id } = req.params;
        const admin = await UserModel.findById(id);
        if (!admin || admin.role !== 'admin') return res.status(404).json({ error: 'Admin not found.' });

        await UserModel.findByIdAndDelete(id);
        return res.status(200).json({ message: 'Admin deleted successfully.' });
    } catch (err) {
        console.error('deleteAdmin error:', err);
        return res.status(500).json({ error: 'Failed to delete admin.' });
    }
}

// PATCH toggle admin active/inactive
async function toggleAdminStatus(req, res) {
    try {
        const { id } = req.params;
        const admin = await UserModel.findById(id);
        if (!admin || admin.role !== 'admin') return res.status(404).json({ error: 'Admin not found.' });

        admin.isActive = !admin.isActive;
        await admin.save();
        return res.status(200).json({
            message: `Admin account ${admin.isActive ? 'activated' : 'deactivated'}.`,
            isActive: admin.isActive
        });
    } catch (err) {
        console.error('toggleAdminStatus error:', err);
        return res.status(500).json({ error: 'Failed to update admin status.' });
    }
}

// =========================================================================
// 4. LESSONS MANAGEMENT — Full CRUD
// =========================================================================

// GET all lessons (admin view — with creator info)
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
        console.error('getAllLessonsAdmin error:', err);
        return res.status(500).json({ error: 'Failed to fetch lessons.' });
    }
}

// GET single lesson with full content
async function getLessonAdmin(req, res) {
    try {
        const { id } = req.params;
        const lesson = await LessonModel.findOne({ lessonId: id }).lean();
        if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
        return res.status(200).json({ lesson });
    } catch (err) {
        console.error('getLessonAdmin error:', err);
        return res.status(500).json({ error: 'Failed to fetch lesson.' });
    }
}

// POST create a lesson
async function createLesson(req, res) {
    try {
        const { lessonId, title, category, difficulty, description, estimatedMinutes, emoji, unlockAfter, steps, quiz } = req.body;

        if (!lessonId || !title || !category || !difficulty || !description) {
            return res.status(400).json({ error: 'lessonId, title, category, difficulty, and description are required.' });
        }

        const existing = await LessonModel.findOne({ lessonId });
        if (existing) return res.status(400).json({ error: 'Lesson ID already exists. Choose a unique ID.' });

        const lesson = await LessonModel.create({
            lessonId, title, category, difficulty, description,
            estimatedMinutes: estimatedMinutes || 5,
            emoji: emoji || '📖',
            unlockAfter: unlockAfter || 0,
            steps: steps || [],
            quiz: quiz || [],
            createdBy: req.user.id,
            createdByName: req.user.name || 'SuperAdmin'
        });

        return res.status(201).json({ message: 'Lesson created successfully!', lesson });
    } catch (err) {
        console.error('createLesson error:', err);
        return res.status(500).json({ error: 'Failed to create lesson.' });
    }
}

// PUT update a lesson
async function updateLesson(req, res) {
    try {
        const { id } = req.params;
        const updates = req.body;

        const lesson = await LessonModel.findOne({ lessonId: id });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });

        Object.assign(lesson, updates);
        await lesson.save();

        return res.status(200).json({ message: 'Lesson updated successfully!', lesson });
    } catch (err) {
        console.error('updateLesson error:', err);
        return res.status(500).json({ error: 'Failed to update lesson.' });
    }
}

// DELETE a lesson
async function deleteLesson(req, res) {
    try {
        const { id } = req.params;
        const lesson = await LessonModel.findOneAndDelete({ lessonId: id });
        if (!lesson) return res.status(404).json({ error: 'Lesson not found.' });
        return res.status(200).json({ message: 'Lesson deleted successfully.' });
    } catch (err) {
        console.error('deleteLesson error:', err);
        return res.status(500).json({ error: 'Failed to delete lesson.' });
    }
}

// =========================================================================
// 5. LEADERBOARD — Top scoring users (display only)
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
        console.error('getLeaderboard error:', err);
        return res.status(500).json({ error: 'Failed to fetch leaderboard.' });
    }
}

// =========================================================================
// 6. SEED — Create SuperAdmin (one-time, disabled in production)
// =========================================================================
async function seedSuperAdmin(req, res) {
    try {
        if (process.env.NODE_ENV === 'production') {
            return res.status(403).json({ error: 'Seed is disabled in production.' });
        }

        const { secretKey, name, email, password, phone, age, state, country } = req.body;

        if (secretKey !== process.env.SEED_SECRET) {
            return res.status(403).json({ error: 'Invalid seed secret key.' });
        }

        const existing = await UserModel.findOne({ email });
        if (existing) {
            // If exists but not superadmin, promote them
            if (existing.role !== 'superadmin') {
                existing.role = 'superadmin';
                await existing.save();
                return res.status(200).json({ message: 'User promoted to SuperAdmin successfully.' });
            }
            return res.status(400).json({ error: 'SuperAdmin already exists with this email.' });
        }

        const hashedPassword = await bcrypt.hash(password || 'superadmin123', 10);
        const superAdmin = await UserModel.create({
            name: name || 'SuperAdmin',
            email,
            password: hashedPassword,
            phone: phone || '0000000000',
            age: age || 25,
            state: state || 'N/A',
            country: country || 'India',
            isVerified: true,
            isOnboarded: true,
            role: 'superadmin'
        });

        return res.status(201).json({
            message: '✅ SuperAdmin created successfully! You can now log in.',
            email: superAdmin.email
        });
    } catch (err) {
        console.error('seedSuperAdmin error:', err);
        return res.status(500).json({ error: 'Failed to seed SuperAdmin.' });
    }
}

module.exports = {
    getDashboardStats,
    getAllUsers, getUserById, createUser, updateUser, deleteUser, toggleUserStatus,
    getAllAdmins, getAdminById, createAdmin, updateAdmin, deleteAdmin, promoteToAdmin, demoteAdmin, toggleAdminStatus,
    getAllLessonsAdmin, getLessonAdmin, createLesson, updateLesson, deleteLesson,
    getLeaderboard,
    seedSuperAdmin
};
