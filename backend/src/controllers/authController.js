import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { getHostelId, normalizeHostel } from '../config/hostels.js';
import { createAuthToken, verifySecret, hashSecret } from '../config/security.js';

// ── USER LOGIN ──
export const login = async (req, res) => {
    const { hostel, roomNumber, pin } = req.body;

    if (!hostel || !roomNumber || !pin) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    try {
        const normalizedHostel = normalizeHostel(hostel);
        if (!normalizedHostel) {
            return res.status(400).json({ message: 'Invalid hostel selected.' });
        }

        const user = await User.findOne({
            hostel: normalizedHostel,
            roomNumber: roomNumber.trim()
        });

        if (!user || !verifySecret(pin.trim(), user.password)) {
            return res.status(401).json({ message: 'Invalid credentials. Please check your Room Number and Password.' });
        }

        // If first login — don't give full token yet, tell frontend to show change password screen
        if (user.isFirstLogin) {
            return res.status(200).json({
                isFirstLogin: true,
                message: 'Please set your new password.',
                userId: user._id,
                hostel: user.hostel,
                roomNumber: user.roomNumber,
            });
        }

        const token = createAuthToken({
            role: 'user',
            userId: user._id.toString(),
            hostel: user.hostel,
            roomNumber: user.roomNumber,
            name: user.name,
        });

        return res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                roomNumber: user.roomNumber,
                hostel: user.hostel,
                hostelId: getHostelId(user.hostel)
            }
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ── CHANGE PASSWORD (first login or voluntary) ──
export const changePassword = async (req, res) => {
    const { userId, currentPassword, newPassword } = req.body;

    if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ message: 'All fields are required.' });
    }

    if (newPassword.length < 4 || newPassword.length > 20) {
        return res.status(400).json({ message: 'New password must be 4-20 characters.' });
    }

    try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        if (!verifySecret(currentPassword.trim(), user.password)) {
            return res.status(401).json({ message: 'Current password is incorrect.' });
        }

        user.password = hashSecret(newPassword.trim());
        user.isFirstLogin = false;
        await user.save();

        const token = createAuthToken({
            role: 'user',
            userId: user._id.toString(),
            hostel: user.hostel,
            roomNumber: user.roomNumber,
            name: user.name,
        });

        return res.status(200).json({
            message: 'Password changed successfully.',
            token,
            user: {
                id: user._id,
                name: user.name,
                roomNumber: user.roomNumber,
                hostel: user.hostel,
                hostelId: getHostelId(user.hostel)
            }
        });

    } catch (error) {
        console.error('Change password error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ── RESET PASSWORD (admin resets student to default 1234) ──
export const resetPassword = async (req, res) => {
    const { roomNumber, hostel } = req.body;

    // Only admin can call this
    if (req.auth?.role !== 'admin') {
        return res.status(403).json({ message: 'Forbidden. Admins only.' });
    }

    if (!roomNumber || !hostel) {
        return res.status(400).json({ message: 'Room number and hostel are required.' });
    }

    try {
        const normalizedHostel = normalizeHostel(hostel);
        const user = await User.findOne({ hostel: normalizedHostel, roomNumber: roomNumber.trim() });

        if (!user) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        user.password = hashSecret('1234');
        user.isFirstLogin = true;
        await user.save();

        return res.status(200).json({ message: `Password reset to 1234 for Room ${roomNumber}.` });

    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ── ADMIN LOGIN ──
export const adminLogin = async (req, res) => {
    const { hostel, password } = req.body;

    if (!hostel || !password) {
        return res.status(400).json({ message: 'Both hostel and password are required.' });
    }

    try {
        const normalizedHostel = normalizeHostel(hostel);
        if (!normalizedHostel) {
            return res.status(400).json({ message: 'Invalid hostel selected.' });
        }

        const admin = await Admin.findOne({ hostel: normalizedHostel });
        if (!admin || !verifySecret(password, admin.passwordHash)) {
            return res.status(401).json({ message: 'Invalid admin credentials.' });
        }

        const token = createAuthToken({
            role: 'admin',
            adminId: admin._id.toString(),
            userId: admin._id.toString(),
            hostel: admin.hostel,
        });

        return res.status(200).json({
            message: 'Admin login successful',
            token,
            admin: {
                id: admin._id,
                name: admin.name,
                hostel: admin.hostel,
                hostelId: getHostelId(admin.hostel),
            },
        });

    } catch (error) {
        console.error('Admin login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};
