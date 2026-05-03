#  DriveBox 

A full-stack Google Drive-like web application with user authentication, nested folder management, and image uploads.


##  Tech Stack

| Layer      | Technology              |
|------------|-------------------------|
| Frontend   | React.js                |
| Backend    | Node.js                 |
| Database   | MongoDB (Compass/local) |
| Auth       | JWT (JSON Web Tokens)   |
| File Store | Multer (local disk)     |

##  Prerequisites

Before starting, make sure you have installed:

1. **Node.js** (v18 or higher)
   - Download: https://nodejs.org/
   - Verify: `node --version`

2. **MongoDB Community Server** (v6 or higher)
   - Download: https://www.mongodb.com/try/download/community
   - Install and keep it running locally

3. **MongoDB Compass** (GUI — optional but recommended)
   - Download: https://www.mongodb.com/try/download/compass
   - Connect to: `mongodb://localhost:27017`

4. **VS Code** (recommended editor)
   - Download: https://code.visualstudio.com/



##  Setup & Run in VS Code

### Step 1 — Open Project in VS Code

```
File → Open Folder → select the "drivebox" folder


Or from terminal:

code drivebox


### Step 2 — Install Backend Dependencies

Open the  terminal in VS Code then:


cd backend
npm install


This installs: express, mongoose, bcryptjs, jsonwebtoken, multer, cors, dotenv, uuid, nodemon.



### Step 3 — Configure Environment Variables

The `.env` file is already created at `backend/.env` with default values:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/drivebox
JWT_SECRET=drivebox_super_secret_jwt_key_2024
JWT_EXPIRE=7d
```

>  Make sure MongoDB is running on your system before proceeding.

---

### Step 4 — Install Frontend Dependencies

Open a **new terminal tab** in VS Code :


cd frontend

npm install


This installs: react, react-router-dom, @mui/material, @mui/icons-material, axios, etc.


### Step 5 — Setup Database (Optional but Recommended)

To create a demo user and sample folders:


cd database

npm install

node seed.js

### Step 6 — Start MongoDB

Make sure MongoDB is running On system.

### Step 7 — Start the Backend Server

In your terminal (from `backend/` folder):

npm run dev

You should see:

 MongoDB Connected to: mongodb://localhost:27017/drivebox
 Server running on port 5000

> The server uses **nodemon** — it auto-restarts when you edit files.


### Step 8 — Start the Frontend

Open another **new terminal tab** (from `frontend/` folder):

npm start

The web app will automatically open at:
**http://localhost:3000**

##  Test the Application

### Using the Demo Account (if you ran seed.js):
- Email: `demo@drivebox.com`
- Password: `demo123456`

### Or register a new account:
1. Go to http://localhost:3000/register
2. Fill in your name, email, password
3. You'll be redirected to the dashboard



##  Running Both Servers (VS Code Split Terminal)

Recommended workflow — use VS Code's split terminal:

1. `Ctrl+Shift+5` to split terminal
2. **Left terminal:** `cd backend && npm run dev`
3. **Right terminal:** `cd frontend && npm start`


##  Features Implemented

- ✅ **User Registration & Login** (JWT-based)
- ✅ **Secure Logout**
- ✅ **Create Nested Folders** (infinite depth like Google Drive)
- ✅ **Folder Size** (total size including all nested content)
- ✅ **Upload Images** with name + drag-and-drop support
- ✅ **User-Specific Access** (users see only their own data)
- ✅ **Rename & Delete Folders** (cascade deletes nested content)
- ✅ **Delete Images**
- ✅ **Image Preview** (click to view full size)

##  Login Credentials (Demo)

| Field    | Value                  |
|----------|------------------------|
| Email    | demo@drivebox.com      |
| Password | demo123456             |
