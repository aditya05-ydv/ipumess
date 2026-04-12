import cron from 'node-cron';
import Rating from '../models/Rating.js';

const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0]; // "2026-04-06"
};

export const startRatingResetJob = () => {
    // Run every day at midnight
    // Cron format: minute hour day-of-month month day-of-week
    // 0 0 * * * = midnight every day
    cron.schedule('0 0 * * *', async () => {
        try {
            console.log('🔄 Rating Cleanup Job: Removing ratings older than 30 days...');

            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - 30);
            const cutoffDateString = getDateString(cutoffDate);

            const result = await Rating.deleteMany({
                date: { $lt: cutoffDateString }
            });

            console.log(`✅ Rating Cleanup Job: Deleted ${result.deletedCount} ratings older than ${cutoffDateString}`);
        } catch (error) {
            console.error('❌ Rating Cleanup Job Error:', error);
        }
    });

    console.log('📅 Rating Cleanup Job: Scheduled for every day at midnight');
};