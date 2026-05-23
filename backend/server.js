const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const fs = require('fs');
const session = require('express-session');
const passport = require('./config/passport');
const connectDB = require('./config/db');

// Routes
const authRoutes = require('./routes/auth');
const resourceRoutes = require('./routes/resources');
const subjectRoutes = require('./routes/subjects');
const folderRoutes = require('./routes/folders');
const chatRoutes = require('./routes/chat');
const subjectChatRoutes = require('./routes/subjectChat');
const contactRoutes = require('./routes/contact');
const statsRoutes = require('./routes/stats');
const todoRoutes = require('./routes/todos');

const app = express();

// 🧠 Security & Middleware
app.use(helmet());
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin || true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  }
  next();
});
app.use(express.json());

// ✅ Session for passport (but disabled in Google callback)
app.use(session({
  secret: process.env.JWT_SECRET || 'your_secret_key',
  resave: false,
  saveUninitialized: false
}));

// ✅ Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

// 📁 Serve uploaded files
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);
app.use('/uploads', express.static(uploadDir, {
  setHeaders: (res, path) => {
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.set('Access-Control-Allow-Credentials', 'true');
    // Set proper content type for images
    if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
      res.set('Content-Type', 'image/jpeg');
    } else if (path.endsWith('.png')) {
      res.set('Content-Type', 'image/png');
    } else if (path.endsWith('.gif')) {
      res.set('Content-Type', 'image/gif');
    } else if (path.endsWith('.webp')) {
      res.set('Content-Type', 'image/webp');
    }
  }
}));

// 🛠 API Routes
app.use('/api/auth', authRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/folders', folderRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/subject-chat', subjectChatRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/todos', todoRoutes);
app.use('/api/users', require('./routes/userRoutes'));

// 📊 Stats Route (Inline) - keeping for backward compatibility
const User = require('./models/User');
const Resource = require('./models/Resource');

app.get('/api/stats', async (req, res) => {
  try {
    const users = await User.countDocuments();
    const uploadedResources = await Resource.countDocuments();
    const downloadResult = await Resource.aggregate([
      { $group: { _id: null, total: { $sum: '$downloads' } } }
    ]);
    const downloads = downloadResult.length > 0 ? downloadResult[0].total : 0;

    res.json({ users, resources: uploadedResources, downloads });
  } catch (err) {
    console.error('[Stats] Error fetching stats:', err.message);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ✅ MongoDB connection
connectDB();

// 🚀 Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[Server] Running at http://localhost:${PORT}`);
});