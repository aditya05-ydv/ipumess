import cron from 'node-cron';
import Poll from '../models/Poll.js';
import Fasting from '../models/Fasting.js';

export const startCleanupJob = () => {
    cron.schedule('0 0 * * *', async () => {
        try {
            // Delete polls older than 3 days
            console.log('🔄 Cleanup Job: Removing polls older than 3 days...');
            const pollCutoff = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
            const pollResult = await Poll.deleteMany({
                createdAt: { $lt: pollCutoff }
            });
            console.log(`✅ Deleted ${pollResult.deletedCount} old polls`);

            // Delete fasting registers older than 1 week
            console.log('🔄 Cleanup Job: Removing fasting registers older than 1 week...');
            const fastingCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            const fastingResult = await Fasting.deleteMany({
                activatedAt: { $lt: fastingCutoff }
            });
            console.log(`✅ Deleted ${fastingResult.deletedCount} old fasting registers`);

        } catch (error) {
            console.error('❌ Cleanup Job Error:', error);
        }
    });

    console.log('📅 Cleanup Job: Scheduled for every day at midnight');
};