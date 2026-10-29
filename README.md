<div align="center">
  <img width="1200" height="475" alt="Smart Mess System" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb4-6e31a0763ed6" />
</div>

# Smart Mess System

> A full-stack hostel mess platform where students view weekly menus, rate meals, vote in polls, register for fasting, and send feedback while hostel administrators manage mess operations.

Smart Mess is a hostel-scoped application for the four supported hostels at USICT. Every authenticated user, poll, rating, menu update, suggestion, and administrative action is associated with a hostel so that one hostel's data is not mixed with another's.

## Contents

- [Screenshots and demo](#screenshots-and-demo)
- [Features](#features)
- [Tech stack](#tech-stack)
- [How it works](#how-it-works)
- [Getting started](#getting-started)
- [Environment variables](#environment-variables)
- [Project structure](#project-structure)
- [API reference](#api-reference)
- [Scheduled maintenance](#scheduled-maintenance)
- [Challenges and learnings](#challenges-and-learnings)
- [Author](#author)

## Screenshots and demo

The repository does not currently include captured application screenshots or a recorded GIF. The banner above is the project's visual header, not a hosted application preview.

To capture the main flow locally:

1. Start the application using the [Getting started](#getting-started) instructions.
2. Open the Vite URL shown in the terminal.
3. Capture the flow: choose a hostel → open the weekly menu → sign in with a seeded student account → rate a meal or vote in a poll.
4. For an administrator flow, open the profile/admin portal and capture menu editing, poll management, and rating analytics.

The application also includes an About page, responsive navigation, hostel selection, notices, fasting registration, anonymous suggestions, and profile/session management.

## Features

- **Hostel-scoped weekly menus** for breakfast, lunch, snacks, and dinner across Shivalik BH1, Aravali BH2, Satpura GH1, and Nilgiri GH2.
- **Student authentication** using hostel, room number, and password/PIN, including first-login password changes and password reset by hostel administrators.
- **Meal ratings and analytics** with 1–5 ratings, daily and weekly summaries, item statistics, charts, and a 30-day reporting window.
- **Community polls** with user-created and administrator-created polls, one vote per user per poll, vote changes, 24-hour expiry, and delayed results.
- **Fasting register** that administrators can activate for a festival and students can submit, edit, or remove their own entry.
- **Anonymous suggestions and complaints** for the mess secretary, hostel warden, or chief warden, with optional email delivery.
- **Notice board** with public notice browsing and warden-office PDF upload/deletion through Cloudinary.
- **Role-based portals** for students, hostel admins, and warden offices, with hostel-specific permissions.
- **Real-time updates and notifications** for menu changes, rating updates, and poll changes using Socket.IO hostel rooms.

## Tech stack

### Frontend

- React 19 and React DOM
- Vite
- React Router
- Axios
- Tailwind CSS with the Tailwind Vite plugin
- Recharts for analytics
- Motion for UI animation
- Lucide React and React Icons
- Socket.IO Client
- `html2canvas` and `qrcode.react` for client-side utilities

### Backend

- Node.js with ES modules
- Express 5
- Mongoose 9 and MongoDB
- Socket.IO
- Multer for in-memory PDF uploads
- Cloudinary for notice storage
- Nodemailer for suggestion email delivery
- `node-cron` for scheduled cleanup jobs
- `dotenv` for configuration

### Developer tooling

- Concurrently for running frontend and backend together
- Vite React plugin and Tailwind CSS Vite integration
- Node's `--watch` mode for backend development

## How it works

```text
Visitor
  │
  ├─ Selects a hostel and reads the public weekly menu/notices
  │
  └─ Signs in with hostel + room number + password/PIN
       │
       ├─ Backend normalizes the hostel and verifies the stored HMAC hash
       ├─ Backend issues a signed, hostel-scoped token
       └─ Frontend stores the session and sends an Authorization Bearer credential
            │
            ├─ Student rates meals, votes, registers for fasting, or sends feedback
            ├─ Admin edits the menu, manages polls, ratings, and fasting registration
            └─ Warden office publishes or removes hostel notices
```

### Data isolation and duplicate prevention

- The hostel is included in authentication payloads and used in backend queries.
- Protected routes verify the token before controller logic runs; role middleware limits admin and warden-office actions.
- A MongoDB unique index on `userId + hostel + date + mealType + itemName` prevents duplicate ratings for the same user and meal. Rating submission uses an upsert, so a user's existing rating can be updated rather than duplicated.
- Poll votes are tracked in each poll's `votedUsers` array. A user can change their selected option, but cannot count twice for the same option.
- User-created polls are limited to two active polls per hostel and all polls expire after 24 hours.
- Socket.IO clients authenticate when joining their hostel room, and updates are emitted only to that room.

## Getting started

### Prerequisites

- Node.js 18 or newer
- npm
- MongoDB running locally or a MongoDB Atlas connection string
- Cloudinary credentials if warden-office notice uploads are required
- Gmail SMTP app credentials if email delivery for suggestions is required

### 1. Clone the repository

```bash
git clone https://github.com/aditya05-ydv/smart-mess.git
cd smart-mess
```

### 2. Install dependencies

Install dependencies for the root scripts, backend, and frontend:

```bash
npm install
cd backend
npm install
cd ../frontend
npm install
cd ..
```

### 3. Configure environment variables

Create `backend/.env` and `frontend/.env` using the names in [Environment variables](#environment-variables). Never commit real secrets.

For a local MongoDB installation, the backend can use its default:

```text
MONGO_URI=mongodb://localhost:27017/smart-mess
```

### 4. Seed the database

The seed script creates administrator records, adds users that do not already exist, and adds missing hostel/day menu records:

```bash
npm run seed
```

Seeded users are defined in [seedData.js](backend/src/scripts/seedData.js). Their initial PINs are stored in that local seed file and users are prompted to change the password on first login. Do not publish or reuse real credentials.

### 5. Run the application

From the repository root:

```bash
npm run dev
```

This starts:

- Frontend: Vite development server, normally at `h`
- Backend: Express and Socket.IO server, normally at `h`

Useful scripts:

| Command | Purpose |
|---|---|
| `npm run dev` | Run frontend and backend together |
| `npm run dev:client` | Run only the Vite frontend |
| `npm run dev:server` | Run only the Node/Express backend |
| `npm run build` | Build the frontend for production |
| `npm run preview` | Preview the frontend production build |
| `npm run seed` | Seed admins, users, and missing menu records |
| `npm run lint` | Run the repository's configured Node syntax check |
| `npm run clean` | Remove the frontend production build directory |

## Environment variables

The repository currently uses local `.env` files rather than checked-in `.env.example` files. The following are the variable names only; supply values locally and keep the files out of version control.

### `backend/.env`

```dotenv
PORT=
MONGO_URI=
NODE_ENV=
AUTH_TOKEN_SECRET=
PASSWORD_SECRET=
EMAIL_USER=
EMAIL_APP_PASS=
WARDEN_SHIVALIK_PASSWORD=
WARDEN_ARAVALI_PASSWORD=
WARDEN_SATPURA_PASSWORD=
WARDEN_NILGIRI_PASSWORD=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

- `MONGO_URI` defaults to `mongodb:///smart-mess` when omitted.
- `PORT` defaults to `5`.
- `AUTH_TOKEN_SECRET` signs session tokens.
- `PASSWORD_SECRET` hashes user and admin passwords.
- The four `WARDEN_*_PASSWORD` variables configure warden-office login for the corresponding hostel.
- Cloudinary variables are needed for PDF notice uploads.
- Email variables are needed when suggestions should be forwarded by email.

### `frontend/.env`

```dotenv
VITE_API_URL=
VITE_SOCKET_URL=
```

- `VITE_API_URL` defaults to ``.
- `VITE_SOCKET_URL` defaults to ``.

## Project structure

```text
smart-mess/
├── package.json                  # Root development and seed scripts
├── README.md
├── backend/
│   ├── package.json
│   └── src/
│       ├── app.js                # Express middleware and API mounting
│       ├── server.js             # MongoDB, HTTP, Socket.IO, and cron startup
│       ├── config/               # Database, security, hostels, email, Cloudinary
│       ├── controllers/          # Request handlers and business rules
│       ├── jobs/                 # Scheduled rating/poll/fasting cleanup
│       ├── middleware/           # Token and role authorization
│       ├── models/               # Mongoose schemas and indexes
│       ├── routes/               # REST endpoint definitions
│       ├── scripts/               # Seed data and database seeding
│       └── sockets/              # Socket.IO rooms and events
└── frontend/
    ├── package.json
    ├── public/                   # Icons, manifest, sitemap, and branding
    └── src/
        ├── App.jsx               # Providers and route composition
        ├── components/           # Layout, menu, polls, admin, and auth UI
        ├── context/              # Auth, notifications, and Socket.IO state
        ├── data/                 # Hostel and local display data
        ├── lib/                  # Shared UI helpers
        ├── pages/                # Route-level screens
        ├── services/             # Axios API service functions
        └── utils/                # Time and display utilities
```

## API reference

Base URL: `http://localhost:3000/api` (or the value of `VITE_API_URL`).

Protected endpoints require an `Authorization` header using the `Bearer` scheme and the signed session credential returned by login.

| Area | Method | Endpoint | Access | Purpose |
|---|---:|---|---|---|
| Health | GET | `/health` | Public | Check API availability |
| Auth | POST | `/auth/login` | Public | Student login |
| Auth | POST | `/auth/admin/login` | Public | Hostel-admin or warden-office login |
| Auth | POST | `/auth/change-password` | Public/first-login flow | Change a student password |
| Auth | POST | `/auth/reset-password` | Admin | Reset a student's password |
| Menu | GET | `/menu/:hostel` | Public | Get a hostel's weekly menu |
| Menu | GET | `/menu/:hostel/:day` | Public | Get one day's menu |
| Menu | PUT | `/menu/:hostel/:day` | Hostel admin | Create or update a day menu |
| Menu | DELETE | `/menu/:hostel/:day` | Hostel admin | Delete a day menu |
| Ratings | POST | `/ratings` | Student | Submit or update a meal rating |
| Ratings | GET | `/ratings` | Authenticated | Get recent hostel ratings |
| Ratings | GET | `/ratings/item/:itemName` | Authenticated | Get item statistics |
| Ratings | GET | `/ratings/weekly-graph` | Authenticated | Get current-week chart data |
| Ratings | GET | `/ratings/weekly-averages` | Authenticated | Get 30-day or selected-date averages |
| Ratings | GET | `/ratings/my-ratings` | Authenticated | Get the current user's ratings |
| Ratings | GET | `/ratings/day-meal-ratings` | Authenticated | Get ratings by day and meal |
| Ratings | POST | `/ratings/admin/reset` | Hostel admin | Reset recent hostel ratings |
| Polls | GET | `/poll` | Authenticated | List hostel polls |
| Polls | GET | `/poll/current` | Authenticated | List active polls and remaining user slots |
| Polls | POST | `/poll` | Authenticated | Create a user or admin poll |
| Polls | POST | `/poll/vote` | Authenticated | Vote or change a vote |
| Polls | GET | `/poll/results/:pollId` | Authenticated | Get results after expiry |
| Polls | GET | `/poll/expired` | Authenticated | List recent expired poll results |
| Polls | DELETE | `/poll/:pollId` | Hostel admin | Delete an admin poll |
| Polls | POST | `/poll/reset` | Hostel admin | Delete admin polls for the hostel |
| Fasting | GET | `/fasting` | Authenticated | Get register status and entries |
| Fasting | POST | `/fasting/activate` | Hostel admin | Activate/reset a festival register |
| Fasting | POST | `/fasting/deactivate` | Hostel admin | Deactivate the register |
| Fasting | POST | `/fasting/submit` | Student | Add a fasting entry |
| Fasting | PUT | `/fasting/edit` | Student | Edit the student's own entry |
| Fasting | DELETE | `/fasting/entry` | Student | Delete the student's own entry |
| Suggestions | POST | `/suggestions/submit` | Authenticated | Submit an anonymous suggestion/complaint |
| Suggestions | GET | `/suggestions/mess/:hostel` | Authenticated/admin UI | Read anonymized mess-secretary suggestions |
| Notices | GET | `/notices` | Public | List published notices |
| Notices | POST | `/notices` | Warden office | Upload a PDF notice |
| Notices | DELETE | `/notices/:id` | Warden office | Delete a notice from that hostel |

### Socket.IO events

After connecting to the configured socket URL, the client emits `joinHostel` with its token. The server verifies the token and joins the socket to the matching hostel room.

| Event | Direction | Purpose |
|---|---|---|
| `joinHostel` | Client → server | Authenticate and join a hostel room |
| `joinedHostel` | Server → client | Confirm the joined hostel |
| `socketError` | Server → client | Report a failed room join |
| `menuUpdated` | Server → hostel room | Notify clients that a menu changed |
| `ratingUpdated` | Server → hostel room | Notify clients about rating changes |
| `pollUpdate` | Server → hostel room | Notify clients about poll creation or voting |

## Scheduled maintenance

Both cron jobs run daily at midnight:

- Ratings older than 30 days are removed.
- Polls older than three days and fasting registers older than one week are removed.
- Fasting registers also enforce their own expiry when accessed.
- Suggestions have a MongoDB TTL index that removes them after approximately 90 days.

## Challenges and learnings

- Keeping every operation hostel-scoped required the hostel to travel through login tokens, query filters, role checks, and Socket.IO room membership.
- Meal ratings use a compound unique MongoDB index plus an upsert to prevent duplicate records while still allowing a user to revise a rating.
- Polls combine expiry windows, per-user vote tracking, result locking until expiry, and real-time notifications.
- Operational features such as Cloudinary notice storage, Nodemailer delivery, and scheduled cleanup are kept behind environment configuration so local development can run without publishing secrets.

## Author

**Aditya Yadav** — Full Stack Developer
USICT 2023–2027

- [GitHub](https://github.com/aditya05-ydv)
- [LinkedIn](https://www.linkedin.com/in/adityayadav25/)

## Related documentation

- [Admin login guide](ADMIN_LOGIN_GUIDE.md)
- [Seed data](backend/src/scripts/seedData.js)
