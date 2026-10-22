import { Routes, Route, useLocation } from 'react-router-dom';
import HomeScreen from './pages/HomeScreen';
import RecommendationsScreen from './pages/RecommendationsScreen';
import TicketsScreen from './pages/TicketsScreen';
import ChatScreen from './pages/ChatScreen';
import ProfileScreen from './pages/ProfileScreen';
import LoginScreen from './pages/LoginScreen';
import BottomNavBar from './components/BottomNavBar';
import { useAuth } from './context/AuthContext';

function App() {
  const location = useLocation();
  const hideNavBar = location.pathname === '/login';
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0F0F12] flex items-center justify-center text-zinc-400 font-mono text-xs">
        Loading Arena...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F12] text-white selection:bg-[#5B47FB]/30">
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

export default App;
