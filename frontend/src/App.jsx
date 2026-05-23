import { Routes, Route } from 'react-router-dom';
import IndexPage from './pages/IndexPage.jsx';
import AuthChoicePage from './pages/AuthChoicePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SignupPage from './pages/SignupPage.jsx';
import HomePage from './pages/HomePage.jsx';
import AdminDashboard from './pages/AdminDashboard.jsx';
import UploadPage from './pages/UploadPage.jsx';
import EditPage from './pages/EditPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import CommentsPage from './pages/CommentsPage.jsx';
import ForgotPasswordPage from './pages/ForgotPasswordPage.jsx';
import ErrorBoundary from './components/ErrorBoundary.jsx';
import Footer from './components/Footer.jsx';
import SubjectPage from './pages/SubjectPage.jsx';
import MyUploadsPage from './pages/MyUploadsPage.jsx';
import AboutPage from './pages/AboutPage.jsx';
import Analytics from './pages/Analytics.jsx';
import ChatBot from './components/ChatBot.jsx';
import { useState } from 'react';
import { StatsProvider } from './contexts/StatsContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
// ...existing code...

function App() {
  const [showChat, setShowChat] = useState(false);

  return (
    <ThemeProvider>
      <StatsProvider>
        <ErrorBoundary>
          <div className="app-container">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<IndexPage />} />
              <Route path="/auth" element={<AuthChoicePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/signup" element={<SignupPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />

              {/* Protected/Main Routes */}
              <Route path="/home" element={<HomePage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/upload" element={<UploadPage />} />
              <Route path="/edit/:id" element={<EditPage />} />
              <Route path="/explore" element={<ExplorePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/comments" element={<CommentsPage />} />
              <Route path="/subject" element={<SubjectPage />} />
              <Route path="/subject/:subjectName" element={<SubjectPage />} />
              <Route path="/myuploads" element={<MyUploadsPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/analytics" element={<Analytics />} />

              {/* NOTE: Catch-all 404 route removed - handled by app-level routing or server fallback */}
            </Routes>

            <Footer />
          </div>
          {!showChat && (
            <button className="chat-toggle" onClick={() => setShowChat(true)}>
              💬
            </button>
          )}
          {showChat && <ChatBot onClose={() => setShowChat(false)} />}
        </ErrorBoundary>
      </StatsProvider>
    </ThemeProvider>
  );
}

export default App;
