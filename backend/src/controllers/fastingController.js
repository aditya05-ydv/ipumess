// ============================================================
// FASTING REGISTER FEATURE - CONTROLLER
// To remove this feature: delete this entire file
// ============================================================

import Fasting from '../models/Fasting.js';

// ADMIN: Activate the fasting register with a festival name
export const activateFasting = async (req, res) => {
    if (req.auth.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can activate fasting register' });
    }
    const { festivalName } = req.body;
    if (!festivalName || !festivalName.trim()) {
        return res.status(400).json({ message: 'Festival name is required' });
    }
    try {
        const activatedAt = new Date();
        const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 days from now

        const register = await Fasting.findOneAndUpdate(
            { hostel: req.auth.hostel },
            {
                isActive: true,
                festivalName: festivalName.trim(),
                activatedAt,
                expiresAt,
                entries: [], // reset entries on each new activation
            },
            { upsert: true, new: true }
        );
        return res.status(200).json({ message: 'Fasting register activated', register });
    } catch (error) {
        console.error('Activate fasting error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ADMIN: Deactivate the fasting register
export const deactivateFasting = async (req, res) => {
    if (req.auth.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can deactivate fasting register' });
    }
    try {
        const register = await Fasting.findOneAndUpdate(
            { hostel: req.auth.hostel },
            { isActive: false },
            { new: true }
        );
        if (!register) {
            return res.status(404).json({ message: 'No fasting register found for this hostel' });
        }
        return res.status(200).json({ message: 'Fasting register deactivated', register });
    } catch (error) {
        console.error('Deactivate fasting error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ALL USERS: Get the fasting register for their hostel
export const getFasting = async (req, res) => {
    try {
        const register = await Fasting.findOne({ hostel: req.auth.hostel });
        if (!register) {
            return res.status(200).json({
                isActive: false,
                festivalName: '',
                entries: [],
                hasSubmitted: false,
            });
        }

        // Auto-expire check: if 48 hours passed, mark inactive
        if (register.isActive && register.expiresAt && new Date() > register.expiresAt) {
            register.isActive = false;
            await register.save();
        }

        const hasSubmitted = register.entries.some(e => e.userId === req.auth.userId);

        return res.status(200).json({
            isActive: register.isActive,
            festivalName: register.festivalName,
            activatedAt: register.activatedAt,
            expiresAt: register.expiresAt,
            entries: register.entries,
            hasSubmitted,
            userEntry: register.entries.find(e => e.userId === req.auth.userId) || null,
        });
    } catch (error) {
        console.error('Get fasting error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// USER: Submit their name to the fasting register
export const submitFasting = async (req, res) => {
    const { name, roomNumber } = req.body;
    if (!name || !name.trim() || !roomNumber || !roomNumber.trim()) {
        return res.status(400).json({ message: 'Name and room number are required' });
    }
    try {
        const register = await Fasting.findOne({ hostel: req.auth.hostel });
        if (!register || !register.isActive) {
            return res.status(403).json({ message: 'Fasting register is not active' });
        }

        // Auto-expire check
        if (register.expiresAt && new Date() > register.expiresAt) {
            register.isActive = false;
            await register.save();
            return res.status(403).json({ message: 'Fasting register has expired' });
        }

        // One entry per user
        const alreadySubmitted = register.entries.some(e => e.userId === req.auth.userId);
        if (alreadySubmitted) {
            return res.status(409).json({ message: 'You have already submitted your name' });
        }

        register.entries.push({
            userId: req.auth.userId,
            name: name.trim(),
            roomNumber: roomNumber.trim(),
        });

        await register.save();
        return res.status(201).json({ message: 'Entry submitted successfully', entries: register.entries });
    } catch (error) {
        console.error('Submit fasting error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// USER: Edit their own entry (only if register is active)
export const editFasting = async (req, res) => {
    const { name, roomNumber } = req.body;
    if (!name || !name.trim() || !roomNumber || !roomNumber.trim()) {
        return res.status(400).json({ message: 'Name and room number are required' });
    }
    try {
        const register = await Fasting.findOne({ hostel: req.auth.hostel });
        if (!register || !register.isActive) {
            return res.status(403).json({ message: 'Fasting register is not active' });
        }

        const entryIndex = register.entries.findIndex(e => e.userId === req.auth.userId);
        if (entryIndex === -1) {
            return res.status(404).json({ message: 'No entry found to edit' });
        }

        register.entries[entryIndex].name = name.trim();
        register.entries[entryIndex].roomNumber = roomNumber.trim();
        await register.save();

        return res.status(200).json({ message: 'Entry updated successfully', entries: register.entries });
    } catch (error) {
        console.error('Edit fasting error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// USER: Delete their own entry (only if register is active)
export const deleteFastingEntry = async (req, res) => {
    try {
        const register = await Fasting.findOne({ hostel: req.auth.hostel });
        if (!register || !register.isActive) {
            return res.status(403).json({ message: 'Fasting register is not active' });
        }

        const entryIndex = register.entries.findIndex(e => e.userId === req.auth.userId);
        if (entryIndex === -1) {
            return res.status(404).json({ message: 'No entry found to delete' });
        }

        register.entries.splice(entryIndex, 1);
        await register.save();

        return res.status(200).json({ message: 'Entry removed successfully', entries: register.entries });
    } catch (error) {
        console.error('Delete fasting entry error:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

// ============================================================
// END FASTING REGISTER FEATURE - CONTROLLER
// ============================================================