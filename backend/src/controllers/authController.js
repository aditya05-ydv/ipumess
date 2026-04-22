import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { getHostelId, normalizeHostel } from '../config/hostels.js';
import { createAuthToken, verifySecret } from '../config/security.js';

export const login = async (req, res) => {
    const { hostel, roomNumber, pin } = req.body;
    if (!hostel || !roomNumber || !pin) {
        return res.status(400).json({ message: 'All fields (hostel, roomNumber, pin) are required.' });
    }
    if (!/^\d{4}$/.test(String(pin).trim())) {
        return res.status(400).json({ message: 'PIN must be a 4-digit number.' });
    }
    try {
        const normalizedHostel = normalizeHostel(hostel);
        if (!normalizedHostel) {
            return res.status(400).json({ message: 'Invalid hostel selected.' });
        }
        const user = await User.findOne({ hostel: normalizedHostel, roomNumber: roomNumber.trim(), pin: pin.trim() });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials. Please check your Hostel, Room Number, and PIN.' });
        }
        const token = createAuthToken({
            role: 'user',
            userId: user._id.toString(),
            hostel: user.hostel,
            roomNumber: user.roomNumber,
            name: user.name, // change by antigracity — added so req.auth.name is available in suggestionController
        });
        // Return user info on success
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
    }
    catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

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
