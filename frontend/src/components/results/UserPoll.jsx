import React, { useState } from 'react';
import { getTimeUntilPollExpiry } from '../../utils/timeUtils';

const UserPoll = ({ poll, onVote, isLoading }) => {
    const [selectedOption, setSelectedOption] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(getTimeUntilPollExpiry(poll?.createdAt));

    React.useEffect(() => {
        if (!poll) return;
        const interval = setInterval(() => {
            setTimeRemaining(getTimeUntilPollExpiry(poll.createdAt));
        }, 1000);
        return () => clearInterval(interval);
    }, [poll]);

    if (!poll) {
        return (
            <div className="card text-center py-12">
                <div className="text-4xl mb-4">🍽️</div>
                <p className="text-slate-400 text-sm">No active poll at the moment. Check back later!</p>
            </div>
        );
    }

    const hasVoted = poll.hasVoted;
    const isExpired = timeRemaining.expired;

    const handleVote = async (optionIndex) => {
        if (hasVoted || isExpired) return;
        setSelectedOption(optionIndex);
        await onVote(poll._id, optionIndex);
    };

    return (
        <div className="card space-y-5">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-xl">🍽️</span>
                    <h3 className="text-white font-semibold text-base">Food Poll</h3>
                </div>
                <span className="badge badge-blue">User Poll</span>
            </div>

            {/* Question */}
            <p className="text-slate-200 font-medium text-sm leading-relaxed">
                {poll.question}
            </p>

            {/* Status Messages */}
            {hasVoted && !isExpired && (
                <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-3">
                    <span className="text-emerald-400 text-sm">✓</span>
                    <p className="text-emerald-400 text-sm font-medium">
                        You've voted! Results will be available after 24 hours.
                    </p>
                </div>
            )}

            {isExpired && (
                <div className="flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl px-4 py-3">
                    <span className="text-amber-400 text-sm">⏱️</span>
                    <p className="text-amber-400 text-sm font-medium">
                        This poll has expired. Check results below!
                    </p>
                </div>
            )}

            {/* Options */}
            <div className="space-y-3">
                {poll.options.map((option, idx) => {
                    const isSelected = selectedOption === idx;
                    const disabled = hasVoted || isExpired || isLoading;

                    return (
                        <button
                            key={idx}
                            onClick={() => handleVote(idx)}
                            disabled={disabled}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all
                                ${isSelected
                                    ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                                    : disabled
                                        ? 'bg-slate-800/40 border-slate-700/30 text-slate-500 cursor-not-allowed'
                                        : 'bg-slate-800/60 border-slate-700/40 text-slate-300 hover:border-blue-500/40 hover:bg-blue-600/10 hover:text-blue-300 cursor-pointer'
                                }`}
                        >
                            <span>{option.text}</span>
                            {!isExpired && (
                                <span className={`text-xs px-2 py-0.5 rounded-full border
                                    ${isSelected
                                        ? 'bg-blue-500/20 border-blue-500/30 text-blue-400'
                                        : 'bg-slate-700/50 border-slate-600/30 text-slate-500'
                                    }`}>
                                    {option.votes} votes
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Timer */}
            {!isExpired && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-700/40">
                    <span className="text-slate-500 text-xs">⏱️</span>
                    <span className="text-slate-500 text-xs">
                        {timeRemaining.hours}h {timeRemaining.minutes}m remaining
                    </span>
                </div>
            )}
        </div>
    );
};

export default UserPoll;