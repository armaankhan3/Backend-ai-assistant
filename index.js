import express from 'express';
import dotenv from 'dotenv';
dotenv.config();
import connectdb from './config/db.js';
import authRouter from './routes/auth.route.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import userRouter from './routes/UserRoutes.js';
import morgan from 'morgan';
import geminiResponse from './Gemini.js';

const app = express();
// Load environment variables
// dotenv.config();

const allowedOrigins = [
  'https://frontend-ai-virtual.vercel.app',
  'http://localhost:5173'
];

// CORS MUST BE FIRST
app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
  allowedHeaders: ["Content-Type", "Authorization"], // Allow Authorization header for JWT
}));

const PORT = process.env.PORT || 8000;
app.use(morgan('dev'));
// Middleware
app.use(express.json());
app.use(cookieParser());


app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/gemini", geminiResponse);

app.get("/", (req, res) => {
  res.status(200).json({ message: "API is running 🚀" });
});

// Fallback CORS handler for 404 and error responses
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "https://frontend-ai-virtual.vercel.app");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  res.header("Access-Control-Allow-Methods", "GET,POST,PUT,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// Start server
const startServer = async () => {
    try {
        await connectdb();
        app.listen(PORT, () => {
            console.log(`Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
};

startServer();
