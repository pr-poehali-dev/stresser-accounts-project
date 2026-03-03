import { Link } from "react-router-dom";
import { useApp } from "@/App";
import Icon from "@/components/ui/icon";
import { useEffect, useState } from "react";

const UPTIME_START = new Date('2024-01-15T00:00:00Z').getTime();

const Index = () => {
  const { setShowAuth, setAuthTab } = useApp();
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

  const stats = [
    { label: 'Аккаунтов проверено', value: '1 247 835', icon: 'Shield' },
    { label: 'Активных пользователей', value: '3 412', icon: 'Users' },
    { label: 'Аптайм сервера', value: uptime, icon: 'Activity' },
    { label: 'Серверов в базе', value: '842', icon: 'Server' },
  ];

  const features = [
    { icon: 'Eye', title: 'Просмотр ника', desc: 'Найдите информацию о любом игроке Minecraft', color: 'text-cyan-400' },
    { icon: 'Globe', title: 'Чекнуть IP', desc: 'Узнайте IP-адрес игрока на сервере', color: 'text-green-400' },
    { icon: 'Lock', title: 'Узнать пароль', desc: 'Получите данные аккаунта с указанного сервера', color: 'text-yellow-400' },
    { icon: 'Zap', title: 'Быстрый взлом', desc: 'До 10 000 комбинаций паролей в секунду', color: 'text-red-400' },
  ];

  return (
    <div className="relative z-10">
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-6">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          СЕРВЕР ОНЛАЙН
        </div>

        <h1 className="font-oswald text-5xl md:text-7xl font-bold mb-4 leading-tight">
          <span className="text-white">STRESSER</span>
          <br />
          <span style={{ background: 'linear-gradient(135deg, #00d4ff, #6366f1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            ACCOUNTS
          </span>
        </h1>

        <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8 leading-relaxed">
          Лучший чекер для проверки данных Minecraft аккаунтов.<br />
          Проверьте ник, узнайте пароль и IP любого игрока.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Link
            to="/checker"
            className="px-8 py-4 rounded-xl btn-blue font-bold text-base tracking-wide transition-all hover:scale-105 active:scale-95 inline-flex items-center justify-center gap-2"
          >
            <Icon name="Search" size={18} />
            Начать проверку
          </Link>
          <button
            onClick={() => { setAuthTab('register'); setShowAuth(true); }}
            className="px-8 py-4 rounded-xl border border-white/10 bg-white/5 text-white font-bold text-base tracking-wide transition-all hover:bg-white/10 hover:scale-105 inline-flex items-center justify-center gap-2"
          >
            <Icon name="UserPlus" size={18} />
            Зарегистрироваться
          </button>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((s, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-4 backdrop-blur-sm">
              <Icon name={s.icon as "Shield"} size={20} className="text-cyan-400 mx-auto mb-2" />
              <div className="font-oswald text-xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-oswald text-3xl font-bold text-center text-white mb-10 tracking-wide">
          ЧТО УМЕЕТ <span className="text-cyan-400">STRESSER ACCOUNTS</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div key={i} className="rounded-xl border border-white/8 bg-white/3 p-6 hover:bg-white/6 transition-all hover:scale-[1.02]">
              <div className={`${f.color} mb-4`}>
                <Icon name={f.icon as "Eye"} size={32} />
              </div>
              <h3 className="font-bold text-white text-lg mb-2">{f.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16">
        <h2 className="font-oswald text-3xl font-bold text-center text-white mb-10 tracking-wide">
          СПОСОБЫ <span className="text-cyan-400">ОПЛАТЫ</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
          {[
            { icon: '💳', title: 'Банковские карты', sub: 'VISA · МИР', color: 'border-blue-500/30 bg-blue-500/5' },
            { icon: '🟢', title: 'СберБанк', sub: 'Онлайн', color: 'border-green-500/30 bg-green-500/5' },
            { icon: '✈️', title: 'Telegram Бот', sub: 'Быстрый перевод', color: 'border-blue-400/30 bg-blue-400/5' },
            { icon: '₿', title: 'Криптовалюта', sub: 'TON · BTC · ETH · XMR', color: 'border-yellow-500/30 bg-yellow-500/5' },
            { icon: '🤖', title: 'CryptoBot', sub: 'Telegram', color: 'border-purple-500/30 bg-purple-500/5' },
            { icon: '⚡', title: 'СБП', sub: 'Быстрые платежи', color: 'border-orange-500/30 bg-orange-500/5' },
          ].map((p, i) => (
            <div key={i} className={`rounded-xl border ${p.color} p-4 flex items-center gap-3`}>
              <span className="text-2xl">{p.icon}</span>
              <div>
                <div className="text-white font-semibold text-sm">{p.title}</div>
                <div className="text-gray-500 text-xs">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-12">
          <h2 className="font-oswald text-4xl font-bold text-white mb-4">ГОТОВ НАЧАТЬ?</h2>
          <p className="text-gray-400 mb-8">Зарегистрируйся и выбери тариф — первая проверка уже сегодня</p>
          <Link
            to="/tariffs"
            className="px-10 py-4 rounded-xl btn-blue font-bold text-lg tracking-wide transition-all hover:scale-105 inline-flex items-center gap-2"
          >
            <Icon name="Star" size={20} />
            Выбрать тариф
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Index;
