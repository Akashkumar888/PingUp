# PingUp - Social Media Platform

PingUp is a full-stack social media app built with React (frontend) and Node.js/Express/MongoDB (backend).

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Frontend (client)](#frontend-client)
- [Backend (server)](#backend-server)
- [API Endpoints](#api-endpoints)
- [Setup & Installation](#setup--installation)
- [Environment Variables](#environment-variables)
- [License](#license)
- [Credits](#credits)

---

## Features

- User authentication (Clerk)
- Create, edit, and delete posts (text, image, text+image)
- Stories (text, image, video) with auto-expiry
- Real-time messaging (SSE)
- Comments, likes, and shares
- Connections, followers, following, requests
- Profile editing (bio, location, images)
- Discover users
- Notifications (email, in-app)
- Responsive UI (React + Tailwind)

---

## Tech Stack

**Frontend:**
- React
- Redux Toolkit
- Clerk (Authentication)
- Vite
- Tailwind CSS

**Backend:**
- Node.js
- Express
- MongoDB (Mongoose)
- Clerk (Authentication)
- Inngest (Background jobs/events)
- ImageKit (Media storage)
- Multer (File uploads)
- Nodemailer (Email notifications)

---

## Project Structure

```
PingUp/
│
├── client/           # Frontend (React)
│   ├── src/
│   │   ├── api/      # Axios API setup
│   │   ├── app/      # Redux store
│   │   ├── assets/   # Images and icons
│   │   ├── components/ # Reusable UI components
│   │   ├── features/ # Redux slices
│   │   └── pages/    # Main pages (Feed, Profile, ChatBox, etc.)
│   ├── public/
│   └── ...           # Configs, README, etc.
│
├── server/           # Backend (Node.js/Express)
│   ├── configs/      # DB, ImageKit, Multer, Nodemailer
│   ├── controllers/  # Business logic
│   ├── inngest/      # Background jobs/events
│   ├── middlewares/  # Auth middleware
│   ├── models/       # Mongoose models
│   ├── routes/       # API routes
│   └── server.js     # Server entry point
│
└── README.md         # Project documentation
```

---

## Frontend (client)

- **Location:** [`client/`](client/)
- **Start:**  
  ```sh
  cd client
  npm install
  npm run dev
  ```

### Main Files

- [`src/App.jsx`](client/src/App.jsx) - Main app and routes
- [`src/pages/`](client/src/pages/) - Page components (Feed, Profile, ChatBox, etc.)
- [`src/components/`](client/src/components/) - UI components (Sidebar, PostCard, StoryModel, etc.)
- [`src/features/`](client/src/features/) - Redux slices (user, connections, messages)
- [`src/api/axios.js`](client/src/api/axios.js) - API setup

---

## Backend (server)

- **Location:** [`server/`](server/)
- **Start:**  
  ```sh
  cd server
  npm install
  npm start
  ```

### Main Files

- [`server.js`](server/server.js) - Express server entry
- [`routes/`](server/routes/) - API routes (user, post, story, message, comment)
- [`controllers/`](server/controllers/) - Business logic
- [`models/`](server/models/) - Mongoose models
- [`configs/`](server/configs/) - DB, ImageKit, Multer, Nodemailer
- [`inngest/`](server/inngest/) - Background jobs/events

---

## API Endpoints

### User

- `GET /api/user/data` - Get current user data
- `POST /api/user/update` - Update profile (form-data: profile, cover)
- `POST /api/user/discover` - Discover users
- `POST /api/user/follow` - Follow user
- `POST /api/user/unfollow` - Unfollow user
- `POST /api/user/connect` - Send connection request
- `POST /api/user/accept` - Accept connection request
- `GET /api/user/connections` - Get connections/followers/following/pending
- `POST /api/user/profiles` - Get user profile by ID
- `GET /api/user/recent-messages` - Get recent messages

### Post

- `POST /api/post/add` - Create post (form-data: images, content, post_type)
- `GET /api/post/feed` - Get feed posts
- `POST /api/post/like` - Like/unlike post
- `DELETE /api/post/:postId` - Delete post

### Story

- `POST /api/story/create` - Create story (form-data: media, content, media_type, background_color)
- `GET /api/story/get` - Get stories
- `DELETE /api/story/:storyId` - Delete story

### Message

- `GET /api/message/:userId` - SSE for real-time messages
- `POST /api/message/send` - Send message (form-data: media, to_user_id, text)
- `POST /api/message/get` - Get chat messages
- `PUT /api/message/:id/edit` - Edit message
- `DELETE /api/message/:id/me` - Delete message for self
- `DELETE /api/message/:id/everyone` - Delete message for everyone

### Comment

- `POST /api/comment/add` - Add comment
- `GET /api/comment/:postId` - Get comments
- `PUT /api/comment/edit` - Edit comment
- `DELETE /api/comment/delete` - Delete comment

### Inngest (Background Jobs)

- `/api/inngest/*` - Event handler routes (background jobs, reminders)

---

## Setup & Installation

1. **Clone the repo**
2. **Install dependencies**  
   - `cd client && npm install`
   - `cd server && npm install`
3. **Configure environment variables**  
   - See `.env` files in both `client/` and `server/`
4. **Start backend**  
   - `npm start` (from `server/`)
5. **Start frontend**  
   - `npm run dev` (from `client/`)
6. **Access app**  
   - Frontend: `http://localhost:5173`
   - Backend: `http://localhost:4000`

---

## Environment Variables

- **Frontend:**  
  - `VITE_BASEURL` - Backend API base URL
  - `VITE_CLERK_PUBLISHABLE_KEY` - Clerk publishable key

- **Backend:**  
  - `MONGODB_URI` - MongoDB connection string
  - `CLERK_SECRET_KEY` - Clerk secret key
  - `IMAGEKIT_PUBLIC_KEY`, `IMAGEKIT_PRIVATE_KEY`, `IMAGEKIT_URL_ENDPOINT`
  - `EMAIL_USER`, `EMAIL_PASS` - For nodemailer

---

## License

MIT

---

## Credits

- [Clerk](https://clerk.com/)
- [ImageKit](https://imagekit.io/)
- [Inngest](https://inngest.com/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Vite](https://vitejs.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)