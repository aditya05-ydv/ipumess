export const HOSTELS = [
    { id: 'bh1', name: 'Shivalik BH1', color: 'bg-blue-50' },
    { id: 'bh2', name: 'Aravali BH2', color: 'bg-green-50' },
    { id: 'gh1', name: 'Satpura GH1', color: 'bg-pink-50' },
    { id: 'gh2', name: 'Nilgiri GH2', color: 'bg-purple-50' },
];
export const MENU_DATA = {
    bh1: [
        {
            day: 'Monday',
            menu: {
                breakfast: 'Bread Omelette + Aaloo Sandwich + Milk + Tea',
                lunch: 'Rice + Dal + Aloo Sayobeen + Dahi',
                snacks: 'Samosa + Tea',
                dinner: 'Rice + Chole + Kheer + Puri',
            },
        },
        {
            day: 'Tuesday',
            menu: {
                breakfast: 'Paneer Parantha + Milk + Tea + Chutney',
                lunch: 'Rajma + Seasonal Vegetable + Rice + Salad',
                snacks: 'Pav Bhaji + Tea',
                dinner: 'Rice + Gatte + Halwa',
            },
        },
        {
            day: 'Wednesday',
            menu: {
                breakfast: 'Uttapam + coconut Chutney + Tea',
                lunch: 'Rice + Masoor Dal + Lauki Gheeiya Chane + Dahi',
                snacks: 'Maggi + Tea',
                dinner: 'Rice + Chicken + Paneer + Ice Cream/Rabdi',
            },
        },
        {
            day: 'Thursday',
            menu: {
                breakfast: 'Paneer Chilla + Chutni + Tea + Milk',
                lunch: 'Kadi + Aloo + Chawal + Salad',
                snacks: 'Fruit + Tea',
                dinner: 'Rice + Mix Veg + Dal Makhani + Sweet Dish',
            },
        },
        {
            day: 'Friday',
            menu: {
                breakfast: 'Mix Paratha + Tea + Milk',
                lunch: 'Rice + Dal + Aloo Shimla Mirch + Raita',
                snacks: 'Kachori + Aloo Ki Sabji + Tea',
                dinner: 'Rice + Egg Curry + Paneer + Gulab jamun',
            },
        },
        {
            day: 'Saturday',
            menu: {
                breakfast: 'Dosa + Sambar + Chutney + Tea',
                lunch: 'Rice + Chole Bhature + Dahi + Salad',
                snacks: 'Tea',
                dinner: 'Rice + Dal + Chokha + Raita',
            },
        },
        {
            day: 'Sunday',
            menu: {
                breakfast: 'Aalo Pyaz Parantha + Milk + Tea + Chutney',
                lunch: 'Kale Chane + soyabeen rice + Aloo Gobi + Raita',
                snacks: 'Bhelpuri/Poha + Tea',
                dinner: 'Rice + Chicken + Matar Paneer + Ice Cream',
            },
        },
    ],
};
// Mock data for other hostels (cloning BH1 for demo)
HOSTELS.forEach(hostel => {
    if (hostel.id !== 'bh1') {
        MENU_DATA[hostel.id] = MENU_DATA.bh1.map(item => ({ ...item }));
    }
});
export const POLL_DATA = [
    {
        id: 1,
        question: 'How was the Paneer Parantha today?',
        options: [
            { label: 'Excellent', votes: 45 },
            { label: 'Good', votes: 30 },
            { label: 'Average', votes: 15 },
            { label: 'Poor', votes: 10 },
        ],
    },
    {
        id: 2,
        question: 'Which snack do you prefer for next week?',
        options: [
            { label: 'Samosa', votes: 60 },
            { label: 'Pav Bhaji', votes: 40 },
        ],
    },
];
export const RATING_STATS = [
    { name: 'Mon', rating: 4.2 },
    { name: 'Tue', rating: 3.8 },
    { name: 'Wed', rating: 4.5 },
    { name: 'Thu', rating: 3.5 },
    { name: 'Fri', rating: 4.0 },
    { name: 'Sat', rating: 4.1 },
    { name: 'Sun', rating: 4.8 },
];
