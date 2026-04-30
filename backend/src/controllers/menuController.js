import Menu from '../models/Menu.js';
import { normalizeHostel } from '../config/hostels.js';
import { getIO } from '../sockets/index.js';

const DAY_ORDER = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const formatMenuItem = (menuDoc) => ({
    day: menuDoc.day,
    menu: {
        breakfast: (menuDoc.meals?.breakfast || []).join(' + '),
        lunch: (menuDoc.meals?.lunch || []).join(' + '),
        snacks: (menuDoc.meals?.snacks || []).join(' + '),
        dinner: (menuDoc.meals?.dinner || []).join(' + '),
    },
});

export const getMyHostelWeeklyMenu = async (req, res) => {
    const normalizedHostel = normalizeHostel(req.params.hostel);
    if (!normalizedHostel) {
        return res.status(400).json({ message: 'Invalid hostel selected.' });
    }
    try {
        const menus = await Menu.find({ hostel: normalizedHostel });
        const sortedMenus = menus.sort((a, b) => DAY_ORDER.indexOf(a.day) - DAY_ORDER.indexOf(b.day));
        return res.status(200).json({
            hostel: normalizedHostel,
            weeklyMenu: sortedMenus.map(formatMenuItem),
        });
    }
    catch (error) {
        console.error('Fetch weekly menu error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching hostel menu' });
    }
};

export const getMyHostelDayMenu = async (req, res) => {
    const { day } = req.params;
    const normalizedHostel = normalizeHostel(req.params.hostel);
    if (!normalizedHostel) {
        return res.status(400).json({ message: 'Invalid hostel selected.' });
    }
    try {
        const menu = await Menu.findOne({ hostel: normalizedHostel, day });
        if (!menu) {
            return res.status(404).json({ message: `No menu found for ${normalizedHostel} on ${day}` });
        }
        return res.status(200).json({
            hostel: normalizedHostel,
            ...formatMenuItem(menu),
        });
    }
    catch (error) {
        console.error('Fetch day menu error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching day menu' });
    }
};

export const upsertMyHostelDayMenu = async (req, res) => {
    const normalizedHostel = normalizeHostel(req.params.hostel);
    const { day } = req.params;
    const { meals } = req.body;

    if (!normalizedHostel) {
        return res.status(400).json({ message: 'Invalid hostel selected.' });
    }

    if (!day || !meals) {
        return res.status(400).json({ message: 'Both day and meals are required.' });
    }

    if (req.auth.hostel !== normalizedHostel) {
        return res.status(403).json({ message: 'You can only edit your own hostel menu.' });
    }

    try {
        const updated = await Menu.findOneAndUpdate({ hostel: normalizedHostel, day }, { meals }, { new: true, upsert: true });

        // 🔴 Notify all users of this hostel that menu changed
        try {
            getIO().to(normalizedHostel).emit('menuUpdated', { hostel: normalizedHostel, day });
        } catch (e) {
            console.error('Socket emit error:', e);
        }

        return res.status(200).json({ message: 'Menu saved successfully', menu: updated });
    }
    catch (error) {
        console.error('Upsert menu error:', error);
        return res.status(500).json({ message: 'Internal server error while saving menu' });
    }
};

export const deleteMyHostelDayMenu = async (req, res) => {
    const normalizedHostel = normalizeHostel(req.params.hostel);
    const { day } = req.params;
    if (!normalizedHostel) {
        return res.status(400).json({ message: 'Invalid hostel selected.' });
    }

    if (req.auth.hostel !== normalizedHostel) {
        return res.status(403).json({ message: 'You can only edit your own hostel menu.' });
    }

    try {
        const deleted = await Menu.findOneAndDelete({ hostel: normalizedHostel, day });
        if (!deleted) {
            return res.status(404).json({ message: `No menu found for ${normalizedHostel} on ${day}` });
        }

        // 🔴 Notify all users of this hostel that menu changed
        try {
            getIO().to(normalizedHostel).emit('menuUpdated', { hostel: normalizedHostel, day });
        } catch (e) {
            console.error('Socket emit error:', e);
        }

        return res.status(200).json({ message: 'Menu deleted successfully' });
    }
    catch (error) {
        console.error('Delete menu error:', error);
        return res.status(500).json({ message: 'Internal server error while deleting menu' });
    }
};