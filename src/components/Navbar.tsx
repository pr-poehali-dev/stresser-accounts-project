import { Link, useLocation } from "react-router-dom";
import { useApp } from "@/App";
import Icon from "@/components/ui/icon";

const Navbar = () => {
  const location = useLocation();
  const { user, setUser, setShowAuth, setAuthTab } = useApp();

  const links = [
    { path: "/", label: "Главная" },
    { path: "/tariffs", label: "Тарифы" },
    { path: "/checker", label: "Чекер" },
    { path: "/profile", label: "Профиль" },
  ];

  const handleLogin = () => {
    setAuthTab('login');
    setShowAuth(true);
  };

  const handleLogout = () => {
    setUser(null);
  };

  return (
    <nav className="relative z-50 border-b border-white/10 backdrop-blur-md bg-black/30">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
            <Icon name="Zap" size={16} className="text-white" />
          </div>
          <span className="font-oswald font-bold text-xl tracking-wider">
            <span className="text-white">STRESSER</span>
            <span className="text-cyan-400"> ACCOUNTS</span>
          </span>
        </Link>

        <div className="flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.path}
              to={l.path}
              className={`nav-link text-sm font-medium transition-colors ${
                location.pathname === l.path ? 'active text-cyan-400' : 'text-gray-400 hover:text-white'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
                <Icon name="User" size={14} className="text-cyan-400" />
                <span className="text-sm text-white font-medium">{user.username}</span>
                {user.plan && (
                  <span className="text-xs px-1.5 py-0.5 rounded bg-purple-500/30 text-purple-300 border border-purple-500/40">
                    {user.plan}
                  </span>
                )}
              </div>
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-300 transition-colors"
                title="Выйти"
              >
                <Icon name="LogOut" size={16} />
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              className="px-4 py-2 rounded-lg btn-blue text-sm font-semibold transition-all hover:scale-105 active:scale-95"
            >
              Войти
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
