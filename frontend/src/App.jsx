import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import EventDetails from './pages/EventDetails';
import DashboardRouter from './pages/DashboardRouter';
import ProtectedRoute from './components/ProtectedRoute';
import ChatWidget from './components/ChatWidget';

// AI Hub Pages
import AIHub from './pages/ai-hub/AIHub';
import PosterGenerator from './pages/ai-hub/PosterGenerator';
import EventDescriptionGenerator from './pages/ai-hub/EventDescriptionGenerator';
import EmailStudio from './pages/ai-hub/EmailStudio';
import ChatbotPage from './pages/ai-hub/ChatbotPage';
import FeedbackAnalysis from './pages/ai-hub/FeedbackAnalysis';
import RecommendationsView from './pages/ai-hub/RecommendationsView';
import PromptSystemView from './pages/ai-hub/PromptSystemView';

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/events/:id" element={<EventDetails />} />
        
        {/* Protected Dashboard Route */}
        <Route
          path="/dashboard/*"
          element={
            <ProtectedRoute>
              <DashboardRouter />
            </ProtectedRoute>
          }
        />

        {/* AI Hub Routes */}
        <Route
          path="/ai-hub"
          element={
            <ProtectedRoute>
              <AIHub />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/poster"
          element={
            <ProtectedRoute>
              <PosterGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/description"
          element={
            <ProtectedRoute>
              <EventDescriptionGenerator />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/email"
          element={
            <ProtectedRoute>
              <EmailStudio />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/chat"
          element={
            <ProtectedRoute>
              <ChatbotPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/feedback"
          element={
            <ProtectedRoute>
              <FeedbackAnalysis />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/recommendations"
          element={
            <ProtectedRoute>
              <RecommendationsView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ai-hub/prompts"
          element={
            <ProtectedRoute>
              <PromptSystemView />
            </ProtectedRoute>
          }
        />
      </Routes>

      {/* Global Floating AI Concierge Chatbot Widget */}
      <ChatWidget />
    </>
  );
}

export default App;