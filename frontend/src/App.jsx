import { Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import DashboardRouter from './pages/DashboardRouter';
import CreateEvent from './pages/faculty/CreateEvent';
import ProtectedRoute from './components/ProtectedRoute';
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
      
  );
}

export default App;