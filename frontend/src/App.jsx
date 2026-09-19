import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/DashboardRouter';
import CreateEvent from './pages/faculty/CreateEvent';
import ProtectedRoute from './components/ProtectedRoute';
<<<<<<< HEAD
import MyRegistrations from './pages/student/MyRegistrations';
import EventRegistrations from './pages/faculty/EventRegistrations';
// ...

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardRouter />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/create"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <CreateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/registrations"
        element={
          <ProtectedRoute allowedRoles={['student']}>
            <MyRegistrations />
          </ProtectedRoute>
        }   
      />
      <Route
        path="/dashboard/events/:eventId/registrations"
        element={
          <ProtectedRoute allowedRoles={['faculty']}>
            <EventRegistrations />
          </ProtectedRoute>
        }
      />
    </Routes>
      
=======
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
>>>>>>> b5eade6dd82a7ac4eb45ee39014e8e6f0cf09347
  );
}

export default App;