<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Smart Mess System

React frontend plus Express/Node.js backend for hostel mess menu, polls, ratings, and admin workflows.

## Run Locally

**Prerequisites:** Node.js and MongoDB

1. Install dependencies:
   `npm install`
2. Create `frontend/.env.local` from [`frontend/.env.example`](frontend/.env.example) and adjust the API URLs if your backend runs elsewhere.
3. Set `MONGO_URI` in your environment for the backend.
4. Start both apps:
   `npm run dev`

The frontend runs with Vite and the backend runs on Express + Socket.IO.

## Common Scripts

`npm run dev:server` starts the Express API.

`npm run dev:client` starts the React app.

`npm run build` builds the frontend for production.

`npm run seed` seeds users and menus into MongoDB.

## Backend API (Hostel-Scoped)

Base URL: `/api`

All protected routes require `Authorization: Bearer <token>`.

### Auth

- `POST /auth/login`
   - body: `{ hostel, roomNumber, pin }`
   - returns user token with hostel scope

- `POST /auth/admin/login`
   - body: `{ hostel, password }`
   - returns admin token with hostel scope

### Menu (per hostel)

- `GET /menu` (user/admin)
- `GET /menu/:day` (user/admin)
- `POST /menu/:day` (admin only)
- `PUT /menu/:day` (admin only)
- `DELETE /menu/:day` (admin only)

### Ratings (per hostel)

- `POST /ratings` (user only)
   - body: `{ day, mealType, itemName, rating }`
   - upserts one rating per user+hostel+day+meal

- `GET /ratings` (user/admin)
- `GET /ratings/item/:itemName` (user/admin)

### Socket.IO

- Connect then emit `joinHostel` with `{ token }`
- Server joins socket to hostel room from token
- Rating updates are emitted only to that hostel room

## Add Login Users and Hostel Menus

Edit [backend/src/scripts/seedData.js](backend/src/scripts/seedData.js):

1. Add users in `USER_SEED_DATA` with:
   `name`, `roomNumber`, `hostel`, `pin`
2. Add weekly menu for each hostel in `MENU_SEED_DATA`.

Then run:

`npm run seed`

Login works with Hostel + Room Number + 4-digit PIN from seeded users.
