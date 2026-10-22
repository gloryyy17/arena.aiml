import { Routes, Route, useLocation } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import RecommendationsScreen from './pages/RecommendationsScreen';
import TicketsScreen from './pages/TicketsScreen';
import ChatScreen from './pages/ChatScreen';
import ProfileScreen from './pages/ProfileScreen';
import LoginScreen from './pages/LoginScreen';
import BottomNavBar from './components/BottomNavBar';
import { useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

function AppContent() {
  const location = useLocation();
  const hideNavBar = location.pathname === '/login';
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen theme-bg flex items-center justify-center theme-text-secondary font-mono text-xs">
        Loading Arena...
      </div>
    );
  }

  return (
    <div className="min-h-screen theme-bg theme-text selection:bg-[#5B47FB]/30 transition-colors">
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/recommendations" element={<RecommendationsScreen />} />
        <Route path="/tickets" element={<TicketsScreen />} />
        <Route path="/chat" element={<ChatScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/login" element={<LoginScreen />} />
      </Routes>

      {!hideNavBar && <BottomNavBar />}
    </div>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

export default App;
