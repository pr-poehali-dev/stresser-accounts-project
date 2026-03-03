import { useState } from "react";
import { useApp, User } from "@/App";
import Icon from "@/components/ui/icon";

const AuthModal = () => {
  const { setShowAuth, authTab, setAuthTab, setUser } = useApp();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = () => {
    if (!form.username || !form.email || !form.password) {
      setError('Заполните все поля');
      return;
    }
    if (form.username.length < 3) { setError('Ник минимум 3 символа'); return; }
    if (form.password.length < 6) { setError('Пароль минимум 6 символов'); return; }

    setLoading(true);
    setTimeout(() => {
      const users: Record<string, User> = JSON.parse(localStorage.getItem('sa_users') || '{}');
      if (users[form.username.toLowerCase()]) {
        setError('Этот ник уже занят');
        setLoading(false);
        return;
      }
      const newUser: User = {
        username: form.username,
        email: form.email,
        plan: null,
        planExpiry: null,
        attempts: 0,
        maxAttempts: 0,
        balance: 0,
        registeredAt: new Date().toISOString(),
      };
      users[form.username.toLowerCase()] = { ...newUser, password: form.password } as User & { password: string };
      localStorage.setItem('sa_users', JSON.stringify(users));
      setUser(newUser);
      setShowAuth(false);
      setLoading(false);
    }, 800);
  };

  const handleLogin = () => {
    if (!form.username || !form.password) { setError('Заполните все поля'); return; }
    setLoading(true);
    setTimeout(() => {
      const users: Record<string, User & { password: string }> = JSON.parse(localStorage.getItem('sa_users') || '{}');
      const found = users[form.username.toLowerCase()];
      if (!found || (found as User & { password: string }).password !== form.password) {
        setError('Неверный ник или пароль');
        setLoading(false);
        return;
      }
      const { password: _p, ...userData } = found as User & { password: string };
      setUser(userData);
      setShowAuth(false);
      setLoading(false);
    }, 600);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) setShowAuth(false); }}
    >
      <div className="w-full max-w-md animate-fade-in">
        <div className="rounded-2xl border border-white/10 bg-[#0e1220] p-8" style={{ boxShadow: '0 0 60px rgba(0,212,255,0.1)' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-oswald text-2xl font-bold text-white tracking-wide">
              {authTab === 'login' ? 'ВХОД' : 'РЕГИСТРАЦИЯ'}
            </h2>
            <button onClick={() => setShowAuth(false)} className="text-gray-500 hover:text-white transition-colors">
              <Icon name="X" size={20} />
            </button>
          </div>

          <div className="flex rounded-lg bg-white/5 p-1 mb-6">
            {(['login', 'register'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => { setAuthTab(tab); setError(''); }}
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition-all ${
                  authTab === tab ? 'bg-cyan-500 text-white' : 'text-gray-400 hover:text-white'
                }`}
              >
                {tab === 'login' ? 'Войти' : 'Зарегистрироваться'}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">НИК ИГРОКА</label>
              <input
                type="text"
                value={form.username}
                onChange={(e) => { setForm(f => ({ ...f, username: e.target.value })); setError(''); }}
                placeholder="Введите ник..."
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
              />
            </div>
            {authTab === 'register' && (
              <div>
                <label className="block text-xs text-gray-400 mb-1.5 font-medium">EMAIL</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => { setForm(f => ({ ...f, email: e.target.value })); setError(''); }}
                  placeholder="example@mail.ru"
                  className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-gray-400 mb-1.5 font-medium">ПАРОЛЬ</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => { setForm(f => ({ ...f, password: e.target.value })); setError(''); }}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors text-sm"
                onKeyDown={(e) => { if (e.key === 'Enter') { if (authTab === 'login') { handleLogin(); } else { handleRegister(); } } }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                <Icon name="AlertCircle" size={14} />
                {error}
              </div>
            )}

            <button
              onClick={authTab === 'login' ? handleLogin : handleRegister}
              disabled={loading}
              className="w-full py-3 rounded-lg btn-blue font-bold text-sm tracking-wide transition-all hover:scale-[1.02] active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  {authTab === 'login' ? 'Входим...' : 'Регистрируем...'}
                </span>
              ) : (
                authTab === 'login' ? 'Войти в аккаунт' : 'Создать аккаунт'
              )}
            </button>
          </div>

          <p className="mt-4 text-center text-xs text-gray-600">
            {authTab === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
            <button
              onClick={() => { setAuthTab(authTab === 'login' ? 'register' : 'login'); setError(''); }}
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              {authTab === 'login' ? 'Зарегистрироваться' : 'Войти'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;