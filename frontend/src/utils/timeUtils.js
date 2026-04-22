// Meal unlock times (24hr format)
export const MEAL_UNLOCK_TIMES = {
  breakfast: 8,      // 8:00 AM
  lunch: 12.5,       // 12:30 PM
  snacks: 17,        // 5:00 PM
  dinner: 20,        // 8:00 PM
};

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// ✅ UPDATED
export const canRateMeal = (dayName, mealType) => {
  const now = new Date();
  const todayIndex = now.getDay();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const targetDayIndex = DAYS.indexOf(dayName);
  if (targetDayIndex === -1) return false;

  // Sunday: Mon–Sat freely allowed, Sunday itself is time-locked
  if (todayIndex === 0) {
    if (targetDayIndex === 0) {
      return currentHour >= MEAL_UNLOCK_TIMES[mealType];
    }
    if (targetDayIndex >= 1 && targetDayIndex <= 6) return true;
    return false;
  }

  // Mon–Sat: Sunday always blocked
  if (targetDayIndex === 0) return false;

  // Future days blocked
  if (targetDayIndex > todayIndex) return false;

  // Past day this week: always allow
  if (targetDayIndex < todayIndex) return true;

  // Today: check meal unlock time
  return currentHour >= MEAL_UNLOCK_TIMES[mealType];
};

// ✅ UPDATED
export const getMealLockReason = (dayName, mealType) => {
  const now = new Date();
  const todayIndex = now.getDay();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  const targetDayIndex = DAYS.indexOf(dayName);

  const formatTime = (unlockHour) => {
    const hours = Math.floor(unlockHour);
    const minutes = Math.round((unlockHour % 1) * 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHour = hours > 12 ? hours - 12 : hours;
    return `${displayHour}:${minutes === 0 ? '00' : minutes} ${period}`;
  };

  // Sunday
  if (todayIndex === 0) {
    if (targetDayIndex === 0 && currentHour < MEAL_UNLOCK_TIMES[mealType]) {
      return `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} opens after ${formatTime(MEAL_UNLOCK_TIMES[mealType])}`;
    }
    return null;
  }

  // Sunday blocked on Mon–Sat
  if (targetDayIndex === 0) {
    return "Sunday's meals can only be rated on Sunday";
  }

  // Future day
  if (targetDayIndex > todayIndex) {
    return `${dayName}'s menu isn't available yet`;
  }

  // Today but meal not unlocked yet
  if (targetDayIndex === todayIndex && currentHour < MEAL_UNLOCK_TIMES[mealType]) {
    return `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} opens after ${formatTime(MEAL_UNLOCK_TIMES[mealType])}`;
  }

  return null;
};

// ✅ NO CHANGES BELOW THIS LINE

export const isWeekendWindow = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  if (dayOfWeek === 5 && hours >= 12) return true;
  if (dayOfWeek === 6) return true;
  if (dayOfWeek === 0 && hours < 5) return true;
  return false;
};

export const getTimeUntilWeekend = () => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const hours = now.getHours();
  let nextOpen = new Date(now);
  if (dayOfWeek === 5 && hours >= 12) {
    nextOpen.setDate(nextOpen.getDate() + (0 - dayOfWeek + 7) % 7);
    nextOpen.setHours(5, 0, 0, 0);
  } else if (dayOfWeek === 6) {
    nextOpen.setDate(nextOpen.getDate() + 1);
    nextOpen.setHours(5, 0, 0, 0);
  } else if (dayOfWeek === 0 && hours < 5) {
    nextOpen.setDate(nextOpen.getDate() + 5);
    nextOpen.setHours(12, 0, 0, 0);
  } else {
    const daysUntilFriday = (5 - dayOfWeek + 7) % 7;
    nextOpen.setDate(nextOpen.getDate() + daysUntilFriday);
    nextOpen.setHours(12, 0, 0, 0);
  }
  const diff = nextOpen - now;
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hrs = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { days, hrs, mins };
};

export const isPollExpired = (createdAt) => {
  const pollTime = new Date(createdAt);
  const now = new Date();
  const diffHours = (now - pollTime) / (1000 * 60 * 60);
  return diffHours >= 24;
};

export const getTimeUntilPollExpiry = (createdAt) => {
  const pollTime = new Date(createdAt);
  const expiryTime = new Date(pollTime.getTime() + 24 * 60 * 60 * 1000);
  const now = new Date();
  const diff = expiryTime - now;
  if (diff <= 0) return { hours: 0, minutes: 0, seconds: 0, expired: true };
  return {
    hours: Math.floor(diff / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false,
  };
};
