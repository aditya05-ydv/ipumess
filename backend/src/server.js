import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initSocket } from './sockets/index.js';
import { startRatingResetJob } from './jobs/ratingResetJob.js';
// CLEANUP JOB - remove this line to delete feature
import { startCleanupJob } from './jobs/cleanupJob.js';

const PORT = process.env.PORT || 3000;
const startServer = async () => {
    try {
        // 1. Connect to Database
        await connectDB();
        // 2. Create HTTP Server
        const server = http.createServer(app);
        // 3. Initialize Socket.IO
        initSocket(server);
        // 4. Start Cron Jobs
        startRatingResetJob();
        startCleanupJob(); // CLEANUP JOB - remove this line to delete feature
        // 5. Start Server
        server.listen(PORT, () => {
            console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on http://localhost:${PORT}`);
        });
    }
    catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};
startServer();
