import Rating from '../models/Rating.js';
import { emitRatingUpdate } from '../sockets/index.js';

const getDateString = (date = new Date()) => {
    return date.toISOString().split('T')[0]; // "2026-04-06"
};

const getDayName = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

const getDateRange = (days = 30) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return {
        startDate: getDateString(start),
        endDate: getDateString(end)
    };
};

export const submitRating = async (req, res) => {
    const { day, mealType, itemName, rating } = req.body;
    if (!day || !mealType || !itemName || !rating) {
        return res.status(400).json({ message: 'Missing required rating fields' });
    }

    if (req.auth.role !== 'user') {
        return res.status(403).json({ message: 'Only users can submit ratings' });
    }

    // Validate hostel from auth token exists
    if (!req.auth.hostel) {
        return res.status(403).json({ message: 'User hostel not found in token' });
    }

    const userId = req.auth.userId;
    const hostel = req.auth.hostel;
    const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
const dayIndex = DAY_ORDER.indexOf(day);
const now = new Date();
const todayJS = now.getDay();
const mondayOffset = todayJS === 0 ? 6 : todayJS - 1;
const monday = new Date(now);
monday.setDate(now.getDate() - mondayOffset);
monday.setHours(0, 0, 0, 0);
const targetDate = new Date(monday);
targetDate.setDate(monday.getDate() + dayIndex);
const date = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

console.log('submitRating - day:', day, 'dayIndex:', dayIndex, 'calculatedDate:', date); // ← add this

    try {
        // Check if user already rated THIS meal
         const existingRating = await Rating.findOne({ userId, hostel, day, mealType, itemName });
if (existingRating) {
    return res.status(409).json({ message: 'You already rated this meal. You cannot rate it again.' });
}

        const updatedRating = await Rating.create({ userId, hostel, date, day, mealType, itemName, rating });

        const stats = await Rating.aggregate([
            { $match: { hostel, date, mealType, itemName } },
            {
                $group: {
                    _id: null,
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);

        const resultStats = stats.length > 0
            ? { avgRating: stats[0].avgRating.toFixed(1), count: stats[0].count }
            : { avgRating: rating.toFixed(1), count: 1 };

        emitRatingUpdate({ hostel, day, mealType, itemName, ...resultStats });

        return res.status(200).json({
            message: 'Rating submitted successfully',
            rating: updatedRating,
            stats: resultStats
        });
    } catch (error) {
        console.error('Submit rating error:', error);
        return res.status(500).json({ message: 'Internal server error while submitting rating' });
    }
};

export const getHostelRatings = async (req, res) => {
    const hostel = req.auth.hostel;
    const { startDate, endDate } = getDateRange(30);
    try {
        const ratings = await Rating.find({
            hostel,
            date: { $gte: startDate, $lte: endDate }
        }).sort({ createdAt: -1 });
        return res.status(200).json(ratings);
    } catch (error) {
        console.error('Fetch hostel ratings error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching hostel ratings' });
    }
};

export const getItemRatings = async (req, res) => {
    const { itemName } = req.params;
    const hostel = req.auth.hostel;
    const { startDate, endDate } = getDateRange(30);
    try {
        const stats = await Rating.aggregate([
            { $match: { hostel, date: { $gte: startDate, $lte: endDate }, itemName } },
            {
                $group: {
                    _id: '$itemName',
                    avgRating: { $avg: '$rating' },
                    count: { $sum: 1 }
                }
            }
        ]);
        if (stats.length === 0) {
            return res.status(404).json({ message: `No ratings found for item: ${itemName}` });
        }
        return res.status(200).json(stats[0]);
    } catch (error) {
        console.error('Fetch item ratings error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching item ratings' });
    }
};

export const getWeeklyGraphData = async (req, res) => {
    const hostel = req.auth.hostel;

    // Get this week's Monday to Sunday dates
    const now = new Date();
    const todayJS = now.getDay();
    const mondayOffset = todayJS === 0 ? 6 : todayJS - 1;
    const monday = new Date(now);
    monday.setDate(now.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    const startDate = getDateString(monday);
    const endDate = getDateString(sunday);

    try {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

        const weeklyData = await Rating.aggregate([
            { $match: { hostel, date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$day',
                    avgRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 },
                    totalUsers: { $addToSet: '$userId' }
                }
            }
        ]);

        const formattedData = days.map(day => {
            const dayData = weeklyData.find(d => d._id === day);
            if (!dayData) {
                return { day, avgRating: 0, voteCount: 0, uniqueUsers: 0, quality: 'No Data' };
            }

            const avgRating = parseFloat(dayData.avgRating.toFixed(1));
            const quality =
                avgRating >= 4.5 ? 'Very Good' :
                avgRating >= 3.5 ? 'Good' :
                avgRating >= 2.5 ? 'Average' : 'Bad';

            return {
                day,
                avgRating,
                voteCount: dayData.totalRatings,
                uniqueUsers: dayData.totalUsers.length,
                quality
            };
        });

        return res.status(200).json(formattedData);
    } catch (error) {
        console.error('Fetch weekly graph data error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching weekly graph data' });
    }
};

// Get last 30 days with daily averages + date filter support
export const getWeeklyAverages = async (req, res) => {
    const hostel = req.auth.hostel;
    const { startDate, endDate } = getDateRange(30);
    const selectedDate = req.query.date || null;

    try {
        if (selectedDate) {
            // Return specific date meal breakdown
            const mealData = await Rating.aggregate([
                { $match: { hostel, date: selectedDate } },
                {
                    $group: {
                        _id: '$mealType',
                        avgRating: { $avg: '$rating' },
                        totalRatings: { $sum: 1 }
                    }
                }
            ]);

            const meals = ['breakfast', 'lunch', 'snacks', 'dinner'];
            const formattedMeals = meals.map(meal => {
                const mealStats = mealData.find(m => m._id === meal);
                return {
                    mealType: meal,
                    avgRating: mealStats ? parseFloat(mealStats.avgRating.toFixed(1)) : null,
                    totalRatings: mealStats ? mealStats.totalRatings : 0
                };
            });

            const overallAvg = formattedMeals
                .filter(m => m.avgRating !== null)
                .reduce((sum, m, _, arr) => sum + m.avgRating / arr.length, 0);

            return res.status(200).json({
                type: 'single',
                date: selectedDate,
                dayName: getDayName(new Date(selectedDate + 'T00:00:00')),
                meals: formattedMeals,
                overallAvg: overallAvg ? parseFloat(overallAvg.toFixed(1)) : null
            });
        }

        // Return last 30 days overview
        const ratingsData = await Rating.aggregate([
            { $match: { hostel, date: { $gte: startDate, $lte: endDate } } },
            {
                $group: {
                    _id: '$date',
                    avgRating: { $avg: '$rating' },
                    totalRatings: { $sum: 1 },
                    day: { $first: '$day' }
                }
            },
            { $sort: { _id: -1 } }
        ]);

        const formattedData = ratingsData.map(d => {
            const avgRating = parseFloat(d.avgRating.toFixed(1));
            const quality =
                avgRating >= 4.5 ? 'Very Good' :
                avgRating >= 3.5 ? 'Good' :
                avgRating >= 2.5 ? 'Average' : 'Bad';

            return {
                date: d._id,
                day: d.day,
                avgRating,
                totalRatings: d.totalRatings,
                quality,
                isPast: true
            };
        });

        return res.status(200).json({ type: 'overview', data: formattedData });
    } catch (error) {
        console.error('Fetch weekly averages error:', error);
        return res.status(500).json({ message: 'Internal server error while fetching weekly averages' });
    }
};

export const resetAllRatings = async (req, res) => {
    if (req.auth.role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can reset ratings' });
    }

    try {
        const hostel = req.auth.hostel;
        const { startDate, endDate } = getDateRange(30);
        const result = await Rating.deleteMany({
            hostel,
            date: { $gte: startDate, $lte: endDate }
        });

        emitRatingUpdate({
            hostel,
            reset: true,
            message: 'All ratings have been reset'
        });

        return res.status(200).json({
            message: 'All ratings reset successfully',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        console.error('Reset ratings error:', error);
        return res.status(500).json({ message: 'Internal server error while resetting ratings' });
    }
}

export const getMyRatings = async (req, res) => {
  const userId = req.auth.userId;
  const hostel = req.auth.hostel;
  const { day } = req.query;
  try {
    const ratings = await Rating.find({ userId, hostel, day });
    return res.status(200).json(ratings);
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

export const getDayMealRatings = async (req, res) => {
  const hostel = req.auth.hostel;
  const { day, weekOffset = 0 } = req.query;

  try {
    const DAY_ORDER = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const dayIndex = DAY_ORDER.indexOf(day);
    if (dayIndex === -1) return res.status(400).json({ message: 'Invalid day' });

    const now = new Date();
    const todayJS = now.getDay();
    const mondayOffset = todayJS === 0 ? 6 : todayJS - 1;

    const thisMonday = new Date(now);
    thisMonday.setDate(now.getDate() - mondayOffset - (Number(weekOffset) * 7));
    thisMonday.setHours(0, 0, 0, 0);

    const targetDate = new Date(thisMonday);
    targetDate.setDate(thisMonday.getDate() + dayIndex);
    const targetDateStr = `${targetDate.getFullYear()}-${String(targetDate.getMonth() + 1).padStart(2, '0')}-${String(targetDate.getDate()).padStart(2, '0')}`;

    const weekStart = `${thisMonday.getFullYear()}-${String(thisMonday.getMonth() + 1).padStart(2, '0')}-${String(thisMonday.getDate()).padStart(2, '0')}`;
    const weekEndDate = new Date(thisMonday);
    weekEndDate.setDate(thisMonday.getDate() + 6);
    const weekEnd = `${weekEndDate.getFullYear()}-${String(weekEndDate.getMonth() + 1).padStart(2, '0')}-${String(weekEndDate.getDate()).padStart(2, '0')}`;

    const mealData = await Rating.aggregate([
      { $match: { 
        hostel,
        day: day,
        date: { $gte: weekStart, $lte: weekEnd }
      }},
      {
        $group: {
          _id: '$mealType',
          avgRating: { $avg: '$rating' },
          totalRatings: { $sum: 1 }
        }
      }
    ]);

    if (mealData.length === 0) {
      return res.status(200).json({ hasData: false, date: targetDateStr, meals: [] });
    }

    const MEALS = ['breakfast', 'lunch', 'snacks', 'dinner'];
    const meals = MEALS.map(meal => {
      const found = mealData.find(m => m._id === meal);
      return {
        mealType: meal,
        avgRating: found ? parseFloat(found.avgRating.toFixed(1)) : null,
        totalRatings: found ? found.totalRatings : 0
      };
    });

    const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    const MEAL_UNLOCK_HOURS = {
      breakfast: 8,
      lunch: 12.5,
      snacks: 17,
      dinner: 20,
    };

    const currentHour = now.getHours() + now.getMinutes() / 60;

    const filteredMeals = meals.map(meal => {
      if (targetDateStr === todayStr) {
        const unlockHour = MEAL_UNLOCK_HOURS[meal.mealType];
        if (currentHour < unlockHour) {
          return { ...meal, avgRating: null, totalRatings: 0 };
        }
      }
      return meal;
    });

    const hasAnyValidMeal = filteredMeals.some(m => m.avgRating !== null);

    return res.status(200).json({ 
      hasData: hasAnyValidMeal, 
      date: targetDateStr, 
      day, 
      meals: filteredMeals 
    });

  } catch (error) {
    console.error('getDayMealRatings error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};