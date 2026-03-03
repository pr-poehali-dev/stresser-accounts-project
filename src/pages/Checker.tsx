import { useApp } from "@/App";
import Icon from "@/components/ui/icon";
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const COMBOS_PER_SEC = 10000;
const WAIT_SECONDS = 300;

const SERVERS = ['HiTech', 'FunTime', 'ReallyWorld', 'SunRise', 'HolyWorld', 'AresMine', 'SpookyTime', 'CubeCraft', 'Hypixel', 'MinePlay'];

const fakePasswords: Record<string, string> = {
  'steve': '123qwe456',
  'alex': 'minecraft2024',
  'notch': 'helloworld',
};

const fakeIPs: Record<string, string> = {
  'steve': '185.60.114.23',
  'alex': '94.25.169.11',
  'notch': '212.188.44.102',
};

type Mode = 'nick' | 'ip' | 'password';
type HackState = 'idle' | 'waiting' | 'running' | 'done';

const Checker = () => {
  const { user, setUser } = useApp();
  const [mode, setMode] = useState<Mode>('nick');
  const [nick, setNick] = useState('');
  const [server, setServer] = useState('');
  const [step, setStep] = useState<'nick' | 'server'>('nick');
  const [result, setResult] = useState<string | null>(null);
  const [hackState, setHackState] = useState<HackState>('idle');
  const [waitLeft, setWaitLeft] = useState(WAIT_SECONDS);
  const [combos, setCombos] = useState(0);
  const [foundPass, setFoundPass] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const comboRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const canUse = user && user.attempts > 0;

  const clearTimers = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (comboRef.current) clearInterval(comboRef.current);
  };

  useEffect(() => () => clearTimers(), []);

  const startHack = () => {
    if (!canUse || hackState !== 'idle') return;

    if (user.attempts <= 0) return;

    const updated = { ...user, attempts: user.attempts - 1 };
    setUser(updated);

    setHackState('waiting');
    setWaitLeft(WAIT_SECONDS);
    setCombos(0);
    setFoundPass('');
    setResult(null);

    timerRef.current = setInterval(() => {
      setWaitLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          startCombos();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const startCombos = () => {
    setHackState('running');
    let count = 0;
    comboRef.current = setInterval(() => {
      count += COMBOS_PER_SEC / 10;
      setCombos(Math.floor(count));
      if (count >= COMBOS_PER_SEC * 8) {
        clearInterval(comboRef.current!);
        const pass = fakePasswords[nick.toLowerCase()] || `${nick.slice(0,3)}qwe${Math.floor(Math.random()*9999)}`;
        setFoundPass(pass);
        setHackState('done');
      }
    }, 100);
  };

  const handleCheck = () => {
    if (!nick.trim()) return;
    if (mode === 'nick') {
      setResult(`Игрок ${nick} найден. UUID: ${Math.random().toString(36).slice(2,18).toUpperCase()}`);
    } else if (mode === 'ip') {
      const ip = fakeIPs[nick.toLowerCase()] || `${Math.floor(Math.random()*200)+50}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}`;
      setResult(`IP игрока ${nick}: ${ip}`);
    } else if (mode === 'password') {
      if (step === 'nick') {
        setStep('server');
        return;
      }
      startHack();
    }
  };

  const resetAll = () => {
    clearTimers();
    setHackState('idle');
    setStep('nick');
    setNick('');
    setServer('');
    setResult(null);
    setFoundPass('');
    setCombos(0);
  };

  const modes: { key: Mode; label: string; icon: string; color: string }[] = [
    { key: 'nick', label: 'Посмотреть ник', icon: 'Eye', color: 'text-cyan-400' },
    { key: 'ip', label: 'Чекнуть IP', icon: 'Globe', color: 'text-green-400' },
    { key: 'password', label: 'Узнать пароль', icon: 'Lock', color: 'text-yellow-400' },
  ];

  const hasPlan = user && user.plan;

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <h1 className="font-oswald text-4xl font-bold text-white mb-3 tracking-wide">
          ЧЕКЕР <span className="text-cyan-400">АККАУНТОВ</span>
        </h1>
        {user ? (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-white/5 border border-white/10">
            <span className="text-gray-400 text-sm">Попыток осталось:</span>
            <span className="font-oswald text-lg font-bold" style={{ color: user.attempts > 0 ? '#4ade80' : '#f87171' }}>
              {user.attempts}
            </span>
            <span className="text-gray-600 text-sm">/ {user.maxAttempts}</span>
          </div>
        ) : (
          <p className="text-gray-400">Необходима регистрация и тариф для использования</p>
        )}
      </div>

      {!user ? (
        <div className="rounded-2xl border border-white/10 bg-white/3 p-12 text-center">
          <Icon name="Lock" size={48} className="text-gray-600 mx-auto mb-4" />
          <h3 className="font-oswald text-2xl font-bold text-white mb-3">ТРЕБУЕТСЯ АККАУНТ</h3>
          <p className="text-gray-400 mb-6">Зарегистрируйтесь и выберите тариф для доступа к чекеру</p>
          <Link to="/tariffs" className="px-6 py-3 rounded-xl btn-blue font-bold inline-flex items-center gap-2">
            <Icon name="Star" size={16} />
            Выбрать тариф
          </Link>
        </div>
      ) : !hasPlan ? (
        <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/5 p-12 text-center">
          <Icon name="AlertTriangle" size={48} className="text-yellow-400 mx-auto mb-4" />
          <h3 className="font-oswald text-2xl font-bold text-white mb-3">НЕТ АКТИВНОГО ТАРИФА</h3>
          <p className="text-gray-400 mb-6">Купите тариф, чтобы начать проверку аккаунтов</p>
          <Link to="/tariffs" className="px-6 py-3 rounded-xl btn-blue font-bold inline-flex items-center gap-2">
            <Icon name="ShoppingCart" size={16} />
            Купить тариф
          </Link>
        </div>
      ) : (
        <>
          <div className="flex gap-3 mb-8 p-1 rounded-xl bg-white/5 border border-white/10">
            {modes.map(m => (
              <button
                key={m.key}
                onClick={() => { setMode(m.key); resetAll(); }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${
                  mode === m.key
                    ? 'bg-white/10 text-white'
                    : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                <Icon name={m.icon as "Eye"} size={16} className={mode === m.key ? m.color : ''} />
                {m.label}
              </button>
            ))}
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#0e1220] p-8">
            {hackState === 'idle' && (
              <>
                {(mode !== 'password' || step === 'nick') && (
                  <div className="mb-4">
                    <label className="block text-xs text-gray-400 mb-2 font-semibold tracking-wide">НИК ИГРОКА</label>
                    <input
                      type="text"
                      value={nick}
                      onChange={(e) => setNick(e.target.value)}
                      placeholder="Введите ник игрока..."
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-cyan-500/50 transition-colors"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
                    />
                  </div>
                )}

                {mode === 'password' && step === 'server' && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon name="Server" size={14} className="text-yellow-400" />
                      <label className="text-xs text-gray-400 font-semibold tracking-wide">НАЗВАНИЕ СЕРВЕРА</label>
                    </div>
                    <p className="text-gray-500 text-sm mb-3">Введите название сервера, чтобы узнать пароль игрока <strong className="text-white">{nick}</strong></p>
                    <input
                      type="text"
                      value={server}
                      onChange={(e) => setServer(e.target.value)}
                      placeholder="Например: HiTech, FunTime, SunRise..."
                      list="servers-list"
                      className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-gray-600 focus:outline-none focus:border-yellow-500/50 transition-colors"
                      onKeyDown={(e) => { if (e.key === 'Enter') handleCheck(); }}
                    />
                    <datalist id="servers-list">
                      {SERVERS.map(s => <option key={s} value={s} />)}
                    </datalist>
                  </div>
                )}

                {user.attempts === 0 && (
                  <div className="mb-4 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-center gap-2">
                    <Icon name="XCircle" size={14} />
                    Попытки закончились. Купите новый тариф для продолжения.
                  </div>
                )}

                <div className="flex gap-3">
                  {mode === 'password' && step === 'server' && (
                    <button onClick={() => setStep('nick')} className="px-4 py-3 rounded-xl border border-white/10 text-gray-400 hover:text-white transition-colors text-sm">
                      ← Назад
                    </button>
                  )}
                  <button
                    onClick={handleCheck}
                    disabled={!nick.trim() || (mode === 'password' && step === 'server' && !server.trim()) || user.attempts === 0}
                    className="flex-1 py-3 rounded-xl btn-blue font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <Icon name={mode === 'password' && step === 'nick' ? 'ArrowRight' : 'Search'} size={16} />
                    {mode === 'password' && step === 'nick' ? 'Далее' : 'Проверить'}
                  </button>
                </div>

                {result && (
                  <div className="mt-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30">
                    <div className="flex items-center gap-2 text-green-400 font-semibold mb-1">
                      <Icon name="CheckCircle" size={16} />
                      Результат
                    </div>
                    <p className="text-white text-sm">{result}</p>
                  </div>
                )}
              </>
            )}

            {hackState === 'waiting' && (
              <div className="text-center py-8">
                <div className="w-20 h-20 rounded-full border-4 border-yellow-400/30 border-t-yellow-400 mx-auto mb-6 animate-spin" />
                <h3 className="font-oswald text-2xl font-bold text-yellow-400 mb-2">ПОДГОТОВКА ВЗЛОМА</h3>
                <p className="text-gray-400 mb-4">Ожидайте перед началом подбора пароля</p>
                <div className="font-oswald text-5xl font-black text-white mb-2">
                  {Math.floor(waitLeft / 60)}:{(waitLeft % 60).toString().padStart(2, '0')}
                </div>
                <p className="text-gray-500 text-sm">секунд до начала</p>
              </div>
            )}

            {hackState === 'running' && (
              <div className="text-center py-8">
                <div className="mb-4">
                  <Icon name="Zap" size={40} className="text-cyan-400 mx-auto animate-pulse" />
                </div>
                <h3 className="font-oswald text-2xl font-bold text-cyan-400 mb-2">ВЗЛОМ ВЫПОЛНЯЕТСЯ</h3>
                <p className="text-gray-400 mb-6">Подбираем пароль для <strong className="text-white">{nick}</strong> на <strong className="text-white">{server}</strong></p>
                <div className="hack-counter text-3xl mb-2">{combos.toLocaleString()}</div>
                <p className="text-gray-500 text-sm mb-4">комбинаций перебрано</p>
                <div className="progress-bar max-w-sm mx-auto">
                  <div className="progress-fill" style={{ width: `${Math.min((combos / (COMBOS_PER_SEC * 8)) * 100, 100)}%` }} />
                </div>
                <p className="text-gray-600 text-xs mt-2">~10 000 комбинаций/сек • Начало с 123qwe...</p>
              </div>
            )}

            {hackState === 'done' && (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Icon name="Unlock" size={28} className="text-green-400" />
                </div>
                <h3 className="font-oswald text-2xl font-bold text-green-400 mb-2">ПАРОЛЬ НАЙДЕН!</h3>
                <p className="text-gray-400 mb-4">Аккаунт: <strong className="text-white">{nick}</strong> · Сервер: <strong className="text-white">{server}</strong></p>
                <div className="inline-block px-6 py-3 rounded-xl bg-green-500/15 border border-green-500/30 mb-4">
                  <span className="text-gray-400 text-sm">Пароль: </span>
                  <span className="font-oswald text-2xl font-bold text-green-300">{foundPass}</span>
                </div>
                <p className="text-xs text-gray-600 mb-6">Перебрано {(COMBOS_PER_SEC * 8).toLocaleString()} комбинаций</p>
                <button onClick={resetAll} className="px-6 py-3 rounded-xl btn-blue font-bold text-sm">
                  Новая проверка
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Checker;
