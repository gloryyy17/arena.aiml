import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { label: 'My Events', to: '/dashboard' },
  { label: 'Create Event', to: '/dashboard/create' },
];

const FacultyDashboard = () => (
  <DashboardLayout navItems={navItems}>
    <h1 className="font-display text-2xl font-semibold mb-6">Faculty Dashboard</h1>
    <p className="opacity-60 text-sm">Coming next step 🚧</p>
  </DashboardLayout>
);

export default FacultyDashboard;