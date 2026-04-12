import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Menu from '../models/Menu.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import { HOSTEL_NAMES } from '../config/hostels.js';
import { hashSecret } from '../config/security.js';
import { ADMIN_SEED_DATA, MENU_SEED_DATA, USER_SEED_DATA } from './seedData.js';
dotenv.config();

const flattenMenuSeedData = () => {
    const menuRows = [];
    for (const hostel of HOSTEL_NAMES) {
        const week = MENU_SEED_DATA[hostel] || [];
        for (const dayMenu of week) {
            menuRows.push({
                hostel,
                day: dayMenu.day,
                meals: {
                    breakfast: dayMenu.meals?.breakfast || [],
                    lunch: dayMenu.meals?.lunch || [],
                    snacks: dayMenu.meals?.snacks || [],
                    dinner: dayMenu.meals?.dinner || [],
                },
            });
        }
    }
    return menuRows;
};

const seedData = async () => {
    try {
        const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/smart-mess';
        console.log('Connecting to MongoDB...');
        await mongoose.connect(mongoUri);

        // Sync indexes so schema changes (like hostel+room unique) are applied.
        await User.syncIndexes();
        await Admin.syncIndexes();

        console.log('--- Clearing Existing User, Admin and Menu Data ---');
        await User.deleteMany({});
        await Admin.deleteMany({});
        await Menu.deleteMany({});

        console.log('--- Seeding Admins ---');
        if (ADMIN_SEED_DATA.length > 0) {
            const admins = ADMIN_SEED_DATA.map((admin) => ({
                hostel: admin.hostel,
                name: admin.name,
                passwordHash: hashSecret(admin.password),
            }));
            await Admin.insertMany(admins);
            console.log(`Admins seeded: ${admins.length}`);
        }

        console.log('--- Seeding Users ---');
        if (USER_SEED_DATA.length > 0) {
            await User.insertMany(USER_SEED_DATA);
            console.log(`Users seeded: ${USER_SEED_DATA.length}`);
        }

        const menuRows = flattenMenuSeedData();
        console.log('--- Seeding Menus ---');
        if (menuRows.length > 0) {
            await Menu.insertMany(menuRows);
            console.log(`Menu rows seeded: ${menuRows.length}`);
        }

        console.log('\nSeed complete.');
        process.exit(0);
    }
    catch (error) {
        console.error('Seeding failed:', error);
        process.exit(1);
    }
};
    seedData();
