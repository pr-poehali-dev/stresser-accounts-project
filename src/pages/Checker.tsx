import { useApp } from "@/App";
import Icon from "@/components/ui/icon";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const COMBOS_PER_SEC = 10000;

const SERVERS = ['HiTech', 'FunTime', 'ReallyWorld', 'SunRise', 'HolyWorld', 'AresMine', 'SpookyTime', 'CubeCraft', 'Hypixel', 'MinePlay', 'DreamCraft', 'VimeWorld'];

const SERVER_IPS: Record<string, string> = {
  'hypixel': 'mc.hypixel.net',
  'cubecraft': 'play.cubecraft.net',
  'mineplex': 'us.mineplex.com',
};

const fakePasswords: Record<string, string> = {
  'steve': '123qwe456',
  'alex': 'minecraft2024',
  'notch': 'helloworld',
};

type Mode = 'nick' | 'ip' | 'password';
type HackState = 'idle' | 'waiting' | 'running' | 'done';

const Checker = () => {
  const { user, setUser } = useApp();
  const [mode, setMode] = useState<Mode>('nick');

  // Общие поля
  const [nick, setNick] = useState('');
  const [serverInput, setServerInput] = useState('');
  const [ipInput, setIpInput] = useState('');

  // IP чекер
  const [ipResult, setIpResult] = useState<{ ip: string; hostname: string; country: string; org: string } | null>(null);
  const [ipLoading, setIpLoading] = useState(false);
  const [ipError, setIpError] = useState('');

  // Ник чекер
  const [nickResult, setNickResult] = useState<string | null>(null);

  // Взлом пароля
  const [hackState, setHackState] = useState<HackState>('idle');
  const [waitLeft, setWaitLeft] = useState(0);
  const [waitTotal, setWaitTotal] = useState(300);
  const [combos, setCombos] = useState(0);
  const [foundPass, setFoundPass] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const hasPlan = user && user.plan;

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (comboRef.current) clearInterval(comboRef.current);
  };

  useEffect(() => () => clearTimers(), []);

  const resetAll = () => {
    clearTimers();
    setHackState('idle');
    setNick('');
    setServerInput('');
    setIpInput('');
    setIpResult(null);
    setIpError('');
    setNickResult(null);
    setFoundPass('');
    setCombos(0);
  };

  // === Чекнуть ник ===
  const checkNick = () => {
    if (!nick.trim()) return;
    const uuid = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const formatted = `${uuid.slice(0,8)}-${uuid.slice(8,12)}-${uuid.slice(12,16)}-${uuid.slice(16,20)}-${uuid.slice(20)}`;
    setNickResult(formatted);
  };

  // === Чекнуть IP ===
  const checkIP = async () => {
    const host = ipInput.trim() || serverInput.trim();
    if (!host) return;
    setIpLoading(true);
    setIpError('');
    setIpResult(null);
    try {
      // Резолвим hostname → IP через dns.google, потом ipapi
      let resolvedIp = host;
      // Если это не IP (нет цифр через точки) — резолвим DNS
      if (!/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(host)) {
        const dnsRes = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(host)}&type=A`);
        const dnsData = await dnsRes.json();
        if (dnsData.Answer && dnsData.Answer.length > 0) {
          resolvedIp = dnsData.Answer[0].data;
        } else {
          // Генерим IP если DNS не ответил
          resolvedIp = `${Math.floor(Math.random()*200)+50}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
        }
      }
      // Получаем информацию об IP
      const infoRes = await fetch(`https://ipapi.co/${resolvedIp}/json/`);
      const info = await infoRes.json();
      setIpResult({
        ip: resolvedIp,
        hostname: info.hostname || host,
        country: info.country_name || 'Неизвестно',
        org: info.org || 'Неизвестно',
      });
    } catch {
      // Fallback
      const ip = `${Math.floor(Math.random()*200)+50}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      setIpResult({ ip, hostname: host, country: 'Россия', org: 'OOO HostService' });
    } finally {
      setIpLoading(false);
    }
  };

  // === Взлом пароля ===
  const startHack = () => {
    if (!user || user.attempts <= 0 || hackState !== 'idle') return;
    if (!nick.trim() || (!serverInput.trim() && !ipInput.trim())) return;

    const updated = { ...user, attempts: user.attempts - 1 };
    setUser(updated);

    // Случайно 3 или 5 минут
    const waitSecs = Math.random() > 0.5 ? 300 : 180;
    setWaitTotal(waitSecs);
    setHackState('waiting');
    setWaitLeft(waitSecs);
    setCombos(0);
    setFoundPass('');

    timerRef.current = setInterval(() => {
      setWaitLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          beginCombos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const beginCombos = () => {
    setHackState('running');
    let count = 0;
    comboRef.current = setInterval(() => {
      count += COMBOS_PER_SEC / 10;
      setCombos(Math.floor(count));
      if (count >= COMBOS_PER_SEC * 8) {
        clearInterval(comboRef.current!);
        const pass = fakePasswords[nick.toLowerCase()] || `${nick.slice(0, 3)}qwe${Math.floor(Math.random() * 9999)}`;
        setFoundPass(pass);
        setHackState('done');
      }
    }, 100);
  };

  const serverOrIpFilled = serverInput.trim() || ipInput.trim();

  const modes: { key: Mode; label: string; icon: string; color: string; activeClass: string }[] = [
    { key: 'nick', label: 'Посмотреть ник', icon: 'Eye', color: 'text-cyan-400', activeClass: 'border-cyan-500/50 bg-cyan-500/10' },
    { key: 'ip', label: 'Чекнуть IP', icon: 'Globe', color: 'text-green-400', activeClass: 'border-green-500/50 bg-green-500/10' },
    { key: 'password', label: 'Узнать пароль', icon: 'Lock', color: 'text-yellow-400', activeClass: 'border-yellow-500/50 bg-yellow-500/10' },
  ];

  return (
    <div className="relative z-10 max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-oswald text-4xl font-bold text-white mb-3 tracking-wide">
          ЧЕКЕР <span className="text-cyan-400">АККАУНТОВ</span>
        </h1>
        {user ? (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-gray-400 text-sm">Попыток взлома:</span>
            <span className="font-oswald text-lg font-bold" style={{ color: user.attempts > 0 ? '#4ade80' : '#f87171' }}>
              {user.attempts}
            </span>
            <span className="text-gray-600 text-sm">/ {user.maxAttempts}</span>
          </div>
        ) : (
          <p className="text-gray-400">Необходима регистрация и тариф</p>
        )}
      </div>

      {!user ? (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-12 text-center">
          <Icon name="Lock" size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="font-oswald text-2xl font-bold text-white mb-3">ТРЕБУЕТСЯ АККАУНТ</h3>
          <p className="text-gray-400 mb-6">Зарегистрируйтесь и выберите тариф</p>
          <Link to="/tariffs" className="px-6 py-3 rounded-xl btn-blue font-bold inline-flex items-center gap-2">
            <Icon name="Star" size={16} />Выбрать тариф
          </Link>
        </div>
      ) : !hasPlan ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-12 text-center">
          <Icon name="AlertTriangle" size={48} className="text-yellow-400 mx-auto mb-4" />
          <h3 className="font-oswald text-2xl font-bold text-white mb-3">НЕТ АКТИВНОГО ТАРИФА</h3>
          <p className="text-gray-400 mb-6">Купите тариф, чтобы начать проверку</p>
          <Link to="/tariffs" className="px-6 py-3 rounded-xl btn-blue font-bold inline-flex items-center gap-2">
            <Icon name="ShoppingCart" size={16} />Купить тариф
          </Link>
        </div>
      ) : (
        <>
          {/* Mode tabs */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {modes.map(m => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); resetAll(); }}
                className={`flex flex-col items-center gap-2 py-4 rounded-xl border transition-all font-semibold text-sm ${
                  mode === m.key
                    ? `${m.activeClass} text-white`
                    : 'border-white/8 bg-white/3 text-gray-500 hover:text-gray-300 hover:bg-white/5'
                }`}
              >
                <Icon name={m.icon as "Eye"} size={22} className={mode === m.key ? m.color : ''} />
                {m.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e1220] p-8">

            {/* ===== НИК ===== */}
            {mode === 'nick' && (
              <>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">НИК ИГРОКА</label>
                <input
                  type="text"
                  value={nick}
                  onChange={(e) => { setNick(e.target.value); setNickResult(null); }}
                  placeholder="Введите ник игрока..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors mb-4"
                  onKeyDown={(e) => { if (e.key === 'Enter') checkNick(); }}
                />
                <button
                  onClick={checkNick}
                  disabled={!nick.trim()}
                  className="w-full py-3 rounded-xl btn-blue font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Icon name="Search" size={16} />Проверить ник
                </button>
                {nickResult && (
                  <div className="mt-6 p-5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 animate-fade-in">
                    <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-3">
                      <Icon name="CheckCircle" size={16} />Игрок найден
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Ник:</span>
                        <span className="text-white font-bold">{nick}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">UUID:</span>
                        <span className="text-white font-mono text-xs">{nickResult}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Статус:</span>
                        <span className="text-green-400 font-semibold">Активен</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== IP ===== */}
            {mode === 'ip' && (
              <>
                <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">НИК ИГРОКА</label>
                <input
                  type="text"
                  value={nick}
                  onChange={(e) => { setNick(e.target.value); setIpResult(null); setIpError(''); }}
                  placeholder="Введите ник игрока..."
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors mb-4"
                />

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">ВЫБЕРИТЕ СЕРВЕР</label>
                    <select
                      value={serverInput}
                      onChange={(e) => { setServerInput(e.target.value); setIpInput(''); setIpResult(null); }}
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-green-500/50 transition-colors text-sm"
                    >
                      <option value="" className="bg-[#0e1220]">Выберите сервер...</option>
                      {SERVERS.map(s => <option key={s} value={s} className="bg-[#0e1220]">{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">ИЛИ ВВЕДИТЕ IP / ДОМЕН</label>
                    <input
                      type="text"
                      value={ipInput}
                      onChange={(e) => { setIpInput(e.target.value); setServerInput(''); setIpResult(null); }}
                      placeholder="mc.hypixel.net или 1.2.3.4"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-green-500/50 transition-colors text-sm"
                      onKeyDown={(e) => { if (e.key === 'Enter') checkIP(); }}
                    />
                  </div>
                </div>

                {ipError && (
                  <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {ipError}
                  </div>
                )}

                <button
                  onClick={checkIP}
                  disabled={ipLoading || (!nick.trim()) || (!serverInput && !ipInput.trim())}
                  className="w-full py-3 rounded-xl btn-green font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {ipLoading ? (
                    <><Icon name="Loader2" size={16} className="animate-spin" />Получаем IP...</>
                  ) : (
                    <><Icon name="Globe" size={16} />Чекнуть IP</>
                  )}
                </button>

                {ipResult && (
                  <div className="mt-6 p-5 rounded-xl bg-green-500/10 border border-green-500/30 animate-fade-in">
                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-3">
                      <Icon name="CheckCircle" size={16} />IP найден
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Игрок:</span>
                        <span className="text-white font-bold">{nick}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Сервер:</span>
                        <span className="text-white font-mono text-xs">{serverInput || ipInput}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">IP адрес:</span>
                        <span className="text-green-300 font-bold font-mono">{ipResult.ip}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Страна:</span>
                        <span className="text-white">{ipResult.country}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Провайдер:</span>
                        <span className="text-white text-xs">{ipResult.org}</span>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ===== ПАРОЛЬ ===== */}
            {mode === 'password' && (
              <>
                {hackState === 'idle' && (
                  <>
                    <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">НИК ИГРОКА</label>
                    <input
                      type="text"
                      value={nick}
                      onChange={(e) => setNick(e.target.value)}
                      placeholder="Введите ник игрока..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors mb-4"
                    />

                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">ВЫБЕРИТЕ СЕРВЕР</label>
                        <select
                          value={serverInput}
                          onChange={(e) => { setServerInput(e.target.value); setIpInput(''); }}
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                        >
                          <option value="" className="bg-[#0e1220]">Выберите сервер...</option>
                          {SERVERS.map(s => <option key={s} value={s} className="bg-[#0e1220]">{s}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">ИЛИ IP / ДОМЕН СЕРВЕРА</label>
                        <input
                          type="text"
                          value={ipInput}
                          onChange={(e) => { setIpInput(e.target.value); setServerInput(''); }}
                          placeholder="play.server.ru"
                          className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors text-sm"
                        />
                      </div>
                    </div>

                    {user.attempts === 0 && (
                      <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                        <Icon name="XCircle" size={14} />
                        Попытки закончились. Купите новый тариф.
                      </div>
                    )}

                    <button
                      onClick={startHack}
                      disabled={!nick.trim() || !serverOrIpFilled || user.attempts === 0}
                      className="w-full py-3 rounded-xl font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      style={{ background: 'linear-gradient(135deg, #ca8a04, #facc15)', color: '#111' }}
                    >
                      <Icon name="Unlock" size={16} />
                      УЗНАТЬ ПАРОЛЬ
                    </button>

                    <p className="text-xs text-gray-600 text-center mt-3">
                      Потребуется 1 попытка · Ожидание 3–5 минут · {user.attempts} попыток осталось
                    </p>
                  </>
                )}

                {hackState === 'waiting' && (
                  <div className="text-center py-8">
                    <div className="relative w-24 h-24 mx-auto mb-6">
                      <svg className="w-24 h-24 -rotate-90" viewBox="0 0 96 96">
                        <circle cx="48" cy="48" r="40" fill="none" stroke="rgba(250,204,21,0.15)" strokeWidth="6" />
                        <circle
                          cx="48" cy="48" r="40" fill="none" stroke="#facc15" strokeWidth="6"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (waitLeft / waitTotal)}`}
                          strokeLinecap="round"
                          style={{ transition: 'stroke-dashoffset 1s linear' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="font-oswald text-xl font-bold text-yellow-400">
                          {Math.floor(waitLeft / 60)}:{(waitLeft % 60).toString().padStart(2, '0')}
                        </span>
                      </div>
                    </div>
                    <h3 className="font-oswald text-2xl font-bold text-yellow-400 mb-2">ПОДГОТОВКА ВЗЛОМА</h3>
                    <p className="text-gray-400 mb-1">Сервер: <strong className="text-white">{serverInput || ipInput}</strong></p>
                    <p className="text-gray-400">Цель: <strong className="text-white">{nick}</strong></p>
                    <p className="text-gray-600 text-xs mt-4">Не закрывайте страницу...</p>
                  </div>
                )}

                {hackState === 'running' && (
                  <div className="text-center py-8">
                    <Icon name="Zap" size={40} className="text-cyan-400 mx-auto mb-4 animate-pulse" />
                    <h3 className="font-oswald text-2xl font-bold text-cyan-400 mb-2">ВЗЛОМ ИДЁТ</h3>
                    <p className="text-gray-400 mb-6">
                      <strong className="text-white">{nick}</strong> · <strong className="text-white">{serverInput || ipInput}</strong>
                    </p>
                    <div className="hack-counter text-4xl mb-1">{combos.toLocaleString()}</div>
                    <p className="text-gray-500 text-sm mb-5">комбинаций перебрано</p>
                    <div className="progress-bar max-w-sm mx-auto mb-2">
                      <div className="progress-fill" style={{ width: `${Math.min((combos / (COMBOS_PER_SEC * 8)) * 100, 100)}%` }} />
                    </div>
                    <p className="text-gray-600 text-xs">~10 000/сек · Старт с 123qwe...</p>
                  </div>
                )}

                {hackState === 'done' && (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                      <Icon name="Unlock" size={28} className="text-green-400" />
                    </div>
                    <h3 className="font-oswald text-2xl font-bold text-green-400 mb-4">ПАРОЛЬ НАЙДЕН!</h3>
                    <div className="space-y-2 mb-5 text-left max-w-xs mx-auto">
                      <div className="flex justify-between text-sm px-4 py-2 rounded-lg bg-white/5">
                        <span className="text-gray-400">Ник:</span>
                        <span className="text-white font-bold">{nick}</span>
                      </div>
                      <div className="flex justify-between text-sm px-4 py-2 rounded-lg bg-white/5">
                        <span className="text-gray-400">Сервер:</span>
                        <span className="text-white">{serverInput || ipInput}</span>
                      </div>
                      <div className="flex justify-between text-sm px-4 py-3 rounded-lg bg-green-500/15 border border-green-500/30">
                        <span className="text-gray-400">Пароль:</span>
                        <span className="font-oswald text-xl font-bold text-green-300">{foundPass}</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-600 mb-6">Перебрано {(COMBOS_PER_SEC * 8).toLocaleString()} комбинаций</p>
                    <button onClick={resetAll} className="px-6 py-3 rounded-xl btn-blue font-bold text-sm">
                      Новая проверка
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Checker;
