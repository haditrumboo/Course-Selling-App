# CourseVault Frontend

React + Three.js frontend for the Course Selling App backend.

## Setup

### 1. Backend — enable CORS

Add this to your `server.js` before routes (install: `npm i cors`):

```js
const cors = require('cors');
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,          // required — cookies are used for auth
}));
```

### 2. Project structure

```
course-vault-frontend/
├── index.html
├── vite.config.js
├── package.json
└── src/
    ├── main.jsx
    └── App.jsx        ← all your UI is here
```

### 3. Install & run

```bash
# Create project folder
mkdir course-vault-frontend
cd course-vault-frontend

# Copy index.html, vite.config.js, package.json here
# Create src/ folder and put main.jsx and App.jsx inside

npm install
npm run dev
# Opens at http://localhost:5173
```

## Features

### Public (no login needed)
- Hero page with animated Three.js background (particle field + torus knots)
- Browse & search all courses
- Course detail modal with 3D hero scene

### Student (User)
- Register / Login
- Purchase courses (calls POST /api/courses/purchase/:courseId)
- My Courses dashboard — see all purchased courses with lesson count

### Instructor (Admin)
- Register / Login (separate flow, uses Instructor button in nav)
- Dashboard with stats (total courses, lessons, avg price)
- Create course with title, description, price, imageUrl, and lesson list
- Edit course (title, description, price)

## Three.js usage
- **Hero background** — animated particle cloud + two floating torus knot meshes, mouse-parallax camera
- **Navbar logo** — tiny rotating torus knot in 36×36 canvas
- **Course detail hero** — icosahedron wireframe + particles per course

## API base URL
Change the `API` constant at the top of `App.jsx` if your backend runs on a different port:
```js
const API = "http://localhost:3000/api";
```
