

# AI-Powered Quiz App — Frontend 🎨

A colorful, modern React frontend for the AI Quiz Generator. Users can register, login, generate quizzes from their study notes or PDFs, take quizzes, and track their progress on a personal dashboard.

## 🛠️ Tech Stack

- **Framework:** React.js (Create React App)
- **Routing:** React Router DOM v6
- **HTTP Client:** Axios
- **Styling:** Inline styles with gradients
- **State Management:** React Context API (Auth)

## 📁 Folder Structure

```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── context/
│   │   └── AuthContext.js     # Global auth state
│   ├── pages/
│   │   ├── Login.js           # Login page
│   │   ├── Register.js        # Register page
│   │   ├── Dashboard.js       # User dashboard with stats
│   │   ├── GenerateQuiz.js    # Generate quiz from text/PDF
│   │   ├── TakeQuiz.js        # Take quiz page
│   │   └── Results.js         # Quiz results with review
│   ├── api.js                 # Axios instance with auth interceptor
│   ├── App.js                 # Routes and protected route logic
│   └── index.js               # Entry point
└── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Backend server running (see backend README)

### Installation

```bash
git clone https://github.com/saloniojha123/AI-Powered-Quiz.git
cd AI-Powered-Quiz/frontend
npm install
```

### Environment Setup

Create a `.env` file in the `frontend/` folder:

```env
REACT_APP_API_URL=http://localhost:5000/api
```

Update `src/api.js` baseURL if deploying to production.

### Run the app

```bash
npm start
```

App runs on `http://localhost:3000`

## 📱 Pages & Features

### 🔐 Login & Register
- JWT-based authentication
- Form validation with error messages
- Redirects to dashboard on success

### 📊 Dashboard
- Stats cards showing total quizzes, average score, best score, best topic
- Recent quiz history with color-coded scores
- Generate New Quiz button

### ✨ Generate Quiz
- Toggle between text input and PDF upload
- Custom topic title input
- Sends request to backend AI endpoint

### 🧠 Take Quiz
- One question at a time
- Progress bar
- Option selection with visual feedback
- Auto-submits score on completion

### 🏆 Results
- Score summary with emoji feedback
- Percentage calculation
- Full answer review showing correct/incorrect answers

## 🔒 Protected Routes

All pages except Login and Register are protected. Unauthenticated users are redirected to `/login`.

```js
const PrivateRoute = ({ children }) => {
    const { token } = useAuth();
    return token ? children : <Navigate to="/login" />;
};
```

## 🎨 Design

- Colorful gradient theme (purple → pink)
- Responsive layout
- Color-coded score chips (green/yellow/red)
- Smooth progress bar animation

## 🌐 Deployment

Deployed on **Vercel** :
🌐 Live Demo: https://ai-powered-quiz-1tns.vercel.app
🔧 Backend API: https://ai-powered-quiz-o6jz.onrender.com

## 🔗 Backend

Backend API: [https://github.com/saloniojha123/AI-Powered-Quiz/tree/main/backend](https://github.com/saloniojha123/AI-Powered-Quiz/tree/main/backend)

## 👤 Author

**Saloni Kumari**
- GitHub: [@saloniojha123](https://github.com/saloniojha123)

## 📄 License

MIT License
