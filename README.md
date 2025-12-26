# 📋 TaskMaster

A full-stack MERN task management application with secure authentication and modern UI.

**Live Demo:** [taskmaster-sigma-orpin.vercel.app](https://taskmaster-sigma-orpin.vercel.app)  
**API:** [taskmaster-backend-dzsl.onrender.com](https://taskmaster-backend-dzsl.onrender.com)  
**GitHub:** [github.com/Deepanghsh/TaskMaster](https://github.com/Deepanghsh/TaskMaster)

## ✨ Features

- **Task Management** - Dashboard, calendar view, priority levels, and color-coded categories
- **Security** - JWT authentication, password-protected changes, and GitHub-style account deletion
- **User Experience** - Dark/light mode, responsive design, and intuitive interface

## 🛠️ Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, React Router, Axios  
**Backend:** Node.js, Express, MongoDB Atlas, JWT, bcrypt, Nodemailer  
**Deployment:** Vercel (frontend), Render (backend)

## 🚀 Quick Start

### Prerequisites
- Node.js v16+
- MongoDB Atlas account
- Git

### Installation

**1. Clone repository**
```bash
git clone https://github.com/Deepanghsh/TaskMaster.git
cd TaskMaster
```

**2. Backend setup**
```bash
cd back-end
npm install
```

Create `back-end/.env`:
```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_jwt_secret
EMAIL_SERVICE=gmail
EMAIL_USER=your_email
EMAIL_PASSWORD=your_app_password
FRONTEND_URL=http://localhost:3000
```

Start backend:
```bash
npm start
```

**3. Frontend setup**
```bash
cd ../front-end
npm install
```

Create `front-end/.env`:
```env
VITE_API_URL=http://localhost:5000
```

Start frontend:
```bash
npm run dev
```

**4. Access**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
TaskMaster/
├── front-end/          # React app
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── context/
│   └── package.json
└── back-end/           # Express API
    ├── models/
    ├── routes/
    ├── controllers/
    └── package.json
```

## 🔑 API Endpoints

**Authentication**
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login
- `GET /api/auth/verify` - Verify token

**Tasks**
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task

**User**
- `GET /api/user/profile` - Get profile
- `PUT /api/user/profile` - Update profile
- `DELETE /api/user/account` - Delete account

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

MIT License - see LICENSE file for details.

## 👨‍💻 Author

**Deepanghsh Naik**  
GitHub: [@Deepanghsh](https://github.com/Deepanghsh)

---

⭐ Star this repo if you found it helpful!
