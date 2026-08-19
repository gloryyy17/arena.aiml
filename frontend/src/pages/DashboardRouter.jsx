import { useAuth } from '../context/AuthContext';
import StudentDashboard from './student/StudentDashboard';
import FacultyDashboard from './faculty/FacultyDashboard';
import AdminDashboard from './admin/AdminDashboard';

const DashboardRouter = () => {
  const { user } = useAuth();

  if (user.role === 'student') return <StudentDashboard />;
  if (user.role === 'faculty') return <FacultyDashboard />;
  if (user.role === 'admin') return <AdminDashboard />;

  return null;
};

export default DashboardRouter;