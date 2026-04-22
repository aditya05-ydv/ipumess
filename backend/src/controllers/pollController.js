import Poll from '../models/Poll.js';
import { emitPollUpdate } from '../sockets/index.js';

export const createPoll = async (req, res) => {
    const { question, options } = req.body;
    if (!question || !options) {
        return res.status(400).json({ message: 'Missing required poll fields' });
    }

    try {
        const now = new Date();
        const type = req.auth.role === 'admin' ? 'admin' : 'user';

        if (type === 'user') {
            const activeUserPollsCount = await Poll.countDocuments({
                hostel: req.auth.hostel,
                type: 'user',
                expiresAt: { $gt: now }
            });

            if (activeUserPollsCount >= 2) {
                return res.status(400).json({
                    message: 'Maximum 2 active polls allowed per hostel. Wait for existing polls to expire.'
                });
            }
        }

        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const formattedOptions = options.map((opt) => ({ text: opt, votes: 0 }));

        const poll = await Poll.create({
            question,
            options: formattedOptions,
            type,
            hostel: req.auth.hostel,
            createdBy: req.auth.userId,
            expiresAt,
            isActive: true,
            votedUsers: []
        });

        return res.status(201).json({ message: 'Poll created successfully', poll });
    } catch (error) {
        console.error('Create poll error:', error);
        return res.status(500).json({ message: 'Internal server error while creating poll' });
    }
};

export const getPolls = async (req, res) => {
    try {
        const polls = await Poll.find({ hostel: req.auth.hostel }).sort({ createdAt: -1 });
        const pollsWithExpiry = polls.map(poll => {
            const isExpired = new Date() > poll.expiresAt;
            return { ...poll.toObject(), isExpired, isActive: !isExpired };
        });
        return res.status(200).json(pollsWithExpiry);
    } catch (error) {
        console.error('Fetch polls error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching polls' });
    }
};

export const getCurrentPolls = async (req, res) => {
    try {
        const now = new Date();

        const activeUserPolls = await Poll.find({
            hostel: req.auth.hostel,
            type: 'user',
            expiresAt: { $gt: now }
        }).sort({ createdAt: -1 });

        const adminPolls = await Poll.find({
            hostel: req.auth.hostel,
            type: 'admin',
            expiresAt: { $gt: now }
        }).sort({ createdAt: -1 });

        const userPollsData = activeUserPolls.map(poll => ({
            ...poll.toObject(),
            hasVoted: poll.votedUsers.some(v => v.userId === req.auth.userId),
            isExpired: false
        }));

        const adminPollsData = adminPolls.map(poll => ({
            ...poll.toObject(),
            hasVoted: poll.votedUsers.some(v => v.userId === req.auth.userId),
            isExpired: false
        }));

        return res.status(200).json({
            userPolls: userPollsData,
            adminPolls: adminPollsData,
            remainingSlots: Math.max(0, 2 - activeUserPolls.length)
        });
    } catch (error) {
        console.error('Fetch current polls error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching current polls' });
    }
};

export const voteInPoll = async (req, res) => {
    const { pollId, optionIndex } = req.body;
    if (!pollId || optionIndex === undefined) {
        return res.status(400).json({ message: 'Missing pollId or optionIndex' });
    }

    try {
        const poll = await Poll.findOne({ _id: pollId, hostel: req.auth.hostel });
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        if (new Date() > poll.expiresAt) {
            return res.status(410).json({ message: 'This poll has expired.' });
        }

        if (optionIndex < 0 || optionIndex >= poll.options.length) {
            return res.status(400).json({ message: 'Invalid option index' });
        }

        const existingVoteIndex = poll.votedUsers.findIndex(v => v.userId.toString() === req.auth.userId.toString());

        if (existingVoteIndex !== -1) {
            const previousOptionIndex = poll.votedUsers[existingVoteIndex].optionIndex;
            if (previousOptionIndex !== undefined) {
                if (previousOptionIndex === optionIndex) {
                    return res.status(409).json({ message: 'You already voted for this option.' });
                }
                poll.options[previousOptionIndex].votes -= 1;
            }
            poll.options[optionIndex].votes += 1;
            poll.votedUsers[existingVoteIndex].optionIndex = optionIndex;
            poll.votedUsers[existingVoteIndex].votedAt = new Date();
        } else {
            poll.options[optionIndex].votes += 1;
            poll.votedUsers.push({ userId: req.auth.userId, optionIndex, votedAt: new Date() });
        }

        await poll.save();

        emitPollUpdate({
            hostel: req.auth.hostel,
            pollId: poll._id,
            options: poll.options,
            totalVotes: poll.votedUsers.length
        });

        return res.status(200).json({ message: 'Vote recorded successfully', poll });
    } catch (error) {
        console.error('Vote in poll error:', error);
        return res.status(500).json({ message: 'Internal server error while voting' });
    }
};

export const getPollResults = async (req, res) => {
    const { pollId } = req.params;
    try {
        const poll = await Poll.findOne({ _id: pollId, hostel: req.auth.hostel });
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        const isExpired = new Date() > poll.expiresAt;
        if (!isExpired) {
            return res.status(403).json({ message: 'Poll results will be available after 24 hours.' });
        }

        return res.status(200).json({
            _id: poll._id,
            question: poll.question,
            options: poll.options,
            totalVotes: poll.votedUsers.length,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            results: poll.options.map((opt, idx) => ({
                index: idx,
                text: opt.text,
                votes: opt.votes,
                percentage: poll.votedUsers.length > 0
                    ? ((opt.votes / poll.votedUsers.length) * 100).toFixed(1) : 0
            }))
        });
    } catch (error) {
        console.error('Fetch poll results error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching results' });
    }
};

export const getExpiredPolls = async (req, res) => {
    try {
        const now = new Date();
        const expiredPolls = await Poll.find({
            hostel: req.auth.hostel,
            expiresAt: { $lte: now }
        }).sort({ expiresAt: -1 }).limit(10);

        const resultsData = expiredPolls.map(poll => ({
            _id: poll._id,
            question: poll.question,
            type: poll.type,
            options: poll.options,
            totalVotes: poll.votedUsers.length,
            createdAt: poll.createdAt,
            expiresAt: poll.expiresAt,
            results: poll.options.map((opt, idx) => ({
                index: idx,
                text: opt.text,
                votes: opt.votes,
                percentage: poll.votedUsers.length > 0
                    ? ((opt.votes / poll.votedUsers.length) * 100).toFixed(1) : 0
            }))
        }));

        return res.status(200).json(resultsData);
    } catch (error) {
        console.error('Fetch expired polls error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching expired polls' });
    }
};

export const deletePoll = async (req, res) => {
    const { pollId } = req.params;
    if (req.auth.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can delete polls' });
    }
    try {
        const poll = await Poll.findOne({ _id: pollId, hostel: req.auth.hostel });
        if (!poll) return res.status(404).json({ message: 'Poll not found' });

        await Poll.deleteOne({ _id: pollId, hostel: req.auth.hostel });
        return res.status(200).json({ message: 'Poll deleted successfully' });
    } catch (error) {
        console.error('Delete poll error:', error);
        return res.status(500).json({ message: 'Internal server error while deleting poll' });
    }
};

export const resetPolls = async (req, res) => {
    if (req.auth.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can reset polls' });
    }
    try {
        const result = await Poll.deleteMany({ hostel: req.auth.hostel, type: 'admin' });
        return res.status(200).json({ message: `Reset complete. ${result.deletedCount} admin poll(s) deleted.` });
    } catch (error) {
        console.error('Reset polls error:', error);
        return res.status(500).json({ message: 'Internal server error while resetting polls' });
    }
};