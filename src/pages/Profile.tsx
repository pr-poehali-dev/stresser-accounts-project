import { useApp } from "@/App";
import Icon from "@/components/ui/icon";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const UPTIME_START = new Date('2024-01-15T00:00:00Z').getTime();

const Profile = () => {
  const { user, setUser, setShowAuth, setAuthTab } = useApp();
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    const calc = () => {
      const diff = Date.now() - UPTIME_START;
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const mins = Math.floor((diff % 3600000) / 60000);
      const secs = Math.floor((diff % 60000) / 1000);
      setUptime(`${days}д ${hours.toString().padStart(2,'0')}:${mins.toString().padStart(2,'0')}:${secs.toString().padStart(2,'0')}`);
    };
    calc();
    const t = setInterval(calc, 1000);
    return () => clearInterval(t);
  }, []);

  if (!user) {
    return (
      <div className="relative z-10 max-w-4xl mx-auto px-4 py-24 text-center">
        <Icon name="User" size={64} className="text-gray-700 mx-auto mb-6" />
        <h2 className="font-oswald text-3xl font-bold text-white mb-4">ПРОФИЛЬ НЕ НАЙДЕН</h2>
        <p className="text-gray-400 mb-8">Войдите или зарегистрируйтесь, чтобы управлять аккаунтом</p>
        <div className="flex gap-4 justify-center">
          <button
            onClick={() => { setAuthTab('login'); setShowAuth(true); }}
            className="px-6 py-3 rounded-xl btn-blue font-bold"
          >
            Войти
          </button>
          <button
            onClick={() => { setAuthTab('register'); setShowAuth(true); }}
            className="px-6 py-3 rounded-xl border border-white/10 bg-white/5 text-white font-bold hover:bg-white/10 transition-colors"
          >
            Зарегистрироваться
          </button>
        </div>
      </div>
    );
  }

  const attemptsPercent = user.maxAttempts > 0 ? (user.attempts / user.maxAttempts) * 100 : 0;
  const spent = user.maxAttempts - user.attempts;

  const planExpiry = user.planExpiry
    ? new Date(user.planExpiry).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : null;

  const registeredAt = new Date(user.registeredAt).toLocaleDateString('ru-RU', {
    day: '2-digit', month: '2-digit', year: 'numeric'
  });

  const planColors: Record<string, string> = {
    'VIP-150': '#00d4ff',
    'VIP-250': '#4ade80',
    'VIP-450': '#facc15',
    'DELUXE': '#f87171',
  };
  const planColor = user.plan ? (planColors[user.plan] || '#a78bfa') : '#6b7280';

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
      <h1 className="font-oswald text-4xl font-bold text-white mb-8 tracking-wide">
        МОЙ <span className="text-cyan-400">ПРОФИЛЬ</span>
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* User card */}
        <div className="md:col-span-2 rounded-2xl border border-white/10 bg-[#0e1220] p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${planColor}20`, border: `2px solid ${planColor}40` }}>
              <Icon name="User" size={28} style={{ color: planColor }} />
            </div>
            <div className="flex-1">
              <h2 className="font-oswald text-2xl font-bold text-white">{user.username}</h2>
              <p className="text-gray-500 text-sm">{user.email}</p>
              <div className="flex items-center gap-2 mt-2">
                {user.plan ? (
                  <span className="text-xs px-3 py-1 rounded-full font-bold" style={{ background: `${planColor}20`, color: planColor, border: `1px solid ${planColor}40` }}>
                    {user.plan}
                  </span>
                ) : (
                  <span className="text-xs px-3 py-1 rounded-full bg-gray-500/20 text-gray-400 border border-gray-500/30 font-bold">
                    БЕЗ ТАРИФА
                  </span>
                )}
                {planExpiry && (
                  <span className="text-xs text-gray-500">до {planExpiry}</span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <div className="font-oswald text-2xl font-bold text-white">{user.attempts}</div>
              <div className="text-xs text-gray-500 mt-1">Попыток осталось</div>
            </div>
            <div className="text-center border-x border-white/10">
              <div className="font-oswald text-2xl font-bold text-red-400">{spent}</div>
              <div className="text-xs text-gray-500 mt-1">Потрачено попыток</div>
            </div>
            <div className="text-center">
              <div className="font-oswald text-2xl font-bold text-gray-400">{user.maxAttempts}</div>
              <div className="text-xs text-gray-500 mt-1">Всего попыток</div>
            </div>
          </div>

          {user.maxAttempts > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Использовано</span>
                <span>{spent} / {user.maxAttempts}</span>
              </div>
              <div className="progress-bar">
                <div
                  className="progress-fill"
                  style={{
                    width: `${attemptsPercent}%`,
                    background: attemptsPercent > 50
                      ? 'linear-gradient(90deg, #6366f1, #00d4ff)'
                      : attemptsPercent > 20
                        ? 'linear-gradient(90deg, #ca8a04, #facc15)'
                        : 'linear-gradient(90deg, #dc2626, #f87171)'
                  }}
                />
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Попытки не восстанавливаются — купите новый тариф
              </p>
            </div>
          )}
        </div>

        {/* Side stats */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-[#0e1220] p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <Icon name="Activity" size={14} className="text-green-400" />
              АПТАЙМ СЕРВЕРА
            </div>
            <div className="font-oswald text-lg font-bold text-green-400">{uptime}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e1220] p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <Icon name="Calendar" size={14} className="text-cyan-400" />
              РЕГИСТРАЦИЯ
            </div>
            <div className="font-oswald text-lg font-bold text-white">{registeredAt}</div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e1220] p-4">
            <div className="flex items-center gap-2 text-gray-400 text-xs mb-2">
              <Icon name="Wallet" size={14} className="text-yellow-400" />
              БАЛАНС
            </div>
            <div className="font-oswald text-lg font-bold text-yellow-400">{user.balance} ₽</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {!user.plan ? (
          <Link
            to="/tariffs"
            className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-5 flex items-center gap-4 hover:bg-cyan-500/15 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center">
              <Icon name="ShoppingCart" size={22} className="text-cyan-400" />
            </div>
            <div>
              <div className="font-bold text-white">Купить тариф</div>
              <div className="text-gray-400 text-sm">Получите доступ к чекеру</div>
            </div>
            <Icon name="ArrowRight" size={18} className="text-gray-600 ml-auto group-hover:text-cyan-400 transition-colors" />
          </Link>
        ) : (
          <Link
            to="/checker"
            className="rounded-xl border border-green-500/30 bg-green-500/10 p-5 flex items-center gap-4 hover:bg-green-500/15 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
              <Icon name="Search" size={22} className="text-green-400" />
            </div>
            <div>
              <div className="font-bold text-white">Перейти в чекер</div>
              <div className="text-gray-400 text-sm">Осталось {user.attempts} попыток</div>
            </div>
            <Icon name="ArrowRight" size={18} className="text-gray-600 ml-auto group-hover:text-green-400 transition-colors" />
          </Link>
        )}

        <Link
          to="/tariffs"
          className="rounded-xl border border-purple-500/30 bg-purple-500/10 p-5 flex items-center gap-4 hover:bg-purple-500/15 transition-all group"
        >
          <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center">
            <Icon name="Star" size={22} className="text-purple-400" />
          </div>
          <div>
            <div className="font-bold text-white">Все тарифы</div>
            <div className="text-gray-400 text-sm">Сравните возможности</div>
          </div>
          <Icon name="ArrowRight" size={18} className="text-gray-600 ml-auto group-hover:text-purple-400 transition-colors" />
        </Link>
      </div>

      <div className="mt-6 text-right">
        <button
          onClick={() => setUser(null)}
          className="text-gray-600 hover:text-red-400 transition-colors text-sm flex items-center gap-2 ml-auto"
        >
          <Icon name="LogOut" size={14} />
          Выйти из аккаунта
        </button>
      </div>
    </div>
  );
};

export default Profile;
