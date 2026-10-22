import { NavLink } from 'react-router-dom';
import { Home, Compass, Ticket, MessageSquare, User } from 'lucide-react';

const tabs = [
  { label: 'Events', to: '/', icon: Home },
  { label: 'For You', to: '/recommendations', icon: Compass },
  { label: 'Tickets', to: '/tickets', icon: Ticket },
  { label: 'AI Chat', to: '/chat', icon: MessageSquare },
  { label: 'Profile', to: '/profile', icon: User },
];

const BottomNavBar = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 pb-[max(env(safe-area-inset-bottom),8px)] pt-2 px-4 glass-panel border-t border-white/10">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-2xl transition-all ${
                  isActive
                    ? 'text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div
                    className={`p-1.5 rounded-xl transition-all ${
                      isActive ? 'bg-[#5B47FB] text-white shadow-md shadow-[#5B47FB]/30' : 'bg-transparent'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <span className="text-[10px] tracking-tight">{tab.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;
