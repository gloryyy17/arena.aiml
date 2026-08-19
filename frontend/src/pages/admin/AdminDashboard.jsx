import DashboardLayout from '../../components/DashboardLayout';

const navItems = [
  { label: 'Approvals', to: '/dashboard' },
  { label: 'All Users', to: '/dashboard/users' },
];

const AdminDashboard = () => (
  <DashboardLayout navItems={navItems}>
    <h1 className="font-display text-2xl font-semibold mb-6">Admin Dashboard</h1>
    <p className="opacity-60 text-sm">Coming next step 🚧</p>
  </DashboardLayout>
);

export default AdminDashboard;