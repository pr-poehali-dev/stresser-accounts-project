import { useApp, User } from "@/App";
import Icon from "@/components/ui/icon";
import { useState } from "react";

const TARIFFS = [
  {
    name: 'VIP',
    price: 150,
    period: 'месяц',
    periodLabel: 'МЕСЯЦ',
    color: 'blue',
    glowClass: 'card-glow-blue',
    btnClass: 'btn-blue',
    borderColor: '#00d4ff',
    titleColor: '#00d4ff',
    attempts: 8,
    features: [
      'Просмотр ника игрока',
      'Чекнуть IP адрес',
      'Узнать пароль аккаунта',
      'Функция ДЕКОДЕР',
      'Функция ПАРСЕР',
      'Скрыть 1 ник',
    ],
    note: 'Доступ выдаётся на 30 дней, после оплаты',
    planKey: 'VIP-150',
    days: 30,
  },
  {
    name: 'VIP',
    price: 250,
    period: 'три месяца',
    periodLabel: 'ТРИ МЕСЯЦА',
    color: 'green',
    glowClass: 'card-glow-green',
    btnClass: 'btn-green',
    borderColor: '#4ade80',
    titleColor: '#4ade80',
    attempts: 16,
    features: [
      'Просмотр ника игрока',
      'Чекнуть IP адрес',
      'Узнать пароль аккаунта',
      'Функция ДЕКОДЕР',
      'Функция ПАРСЕР',
      'Скрыть 2 ника',
      'PHONE-CHECKER',
    ],
    note: 'Доступ выдаётся на 90 дней, после оплаты',
    planKey: 'VIP-250',
    days: 90,
  },
  {
    name: 'VIP',
    price: 450,
    period: 'навсегда',
    periodLabel: 'НАВСЕГДА',
    color: 'yellow',
    glowClass: 'card-glow-yellow',
    btnClass: 'btn-yellow',
    borderColor: '#facc15',
    titleColor: '#facc15',
    attempts: 32,
    features: [
      'Просмотр ника игрока',
      'Чекнуть IP адрес',
      'Узнать пароль аккаунта',
      'AUTO-CHECKER',
      'PHONE-CHECKER',
      'IP-CHECKER FULL',
      'Функция ДЕКОДЕР',
      'Функция HARD-ДЕКОДЕР',
      'Функция ПАРСЕР',
    ],
    note: 'Доступ выдаётся навсегда, после оплаты',
    planKey: 'VIP-450',
    days: 99999,
  },
  {
    name: 'DELUXE',
    price: 850,
    period: 'месяц',
    periodLabel: 'МЕСЯЦ',
    color: 'red',
    glowClass: 'card-glow-red',
    btnClass: 'btn-red',
    borderColor: '#f87171',
    titleColor: '#f87171',
    attempts: 64,
    features: [
      'Доступ к ЭЛИТНЫМ БАЗАМ',
      'Доступ к ЛОГАМ СЕРВЕРОВ',
      'Возможности статусов ниже',
      'Моментальная окупаемость',
      'Скидка на функцию ПАРСЕР+',
      'Все функции VIP тарифов',
    ],
    note: 'Доступ выдаётся на 30 дней, после оплаты',
    planKey: 'DELUXE',
    days: 30,
  },
];

const PayModal = ({ tariff, onClose }: { tariff: typeof TARIFFS[0]; onClose: () => void }) => {
  const { user, setUser, setShowAuth, setAuthTab } = useApp();
  const [step, setStep] = useState<'pay' | 'success'>('pay');

  const handleBuy = () => {
    if (!user) {
      onClose();
      setAuthTab('register');
      setShowAuth(true);
      return;
    }
    const expiry = new Date(Date.now() + tariff.days * 86400000).toISOString();
    const updated: User = {
      ...user,
      plan: tariff.planKey,
      planExpiry: expiry,
      attempts: tariff.attempts,
      maxAttempts: tariff.attempts,
    };
    setUser(updated);
    setStep('success');
  };

  const methods = [
    { icon: '💳', label: 'Банковские карты', sub: 'VISA · МИР' },
    { icon: '🟢', label: 'СберБанк', sub: 'Онлайн' },
    { icon: '✈️', label: 'Telegram Бот', sub: 'Быстрый' },
    { icon: '₿', label: 'Криптовалюта', sub: 'TON · BTC' },
    { icon: '🤖', label: 'CryptoBot', sub: 'Telegram' },
    { icon: '⚡', label: 'СБП', sub: 'Быстро' },
  ];

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="w-full max-w-md animate-fade-in rounded-2xl border bg-[#0e1220] p-8" style={{ borderColor: tariff.borderColor, boxShadow: `0 0 40px ${tariff.borderColor}30` }}>
        {step === 'success' ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-green-400" />
            </div>
            <h3 className="font-oswald text-2xl font-bold text-white mb-2">ТАРИФ АКТИВИРОВАН!</h3>
            <p className="text-gray-400 mb-2">Тариф <span className="text-white font-bold">{tariff.name} {tariff.price}₽</span> активирован</p>
            <p className="text-cyan-400 text-sm mb-6">Доступно попыток: <strong>{tariff.attempts}</strong></p>
            <button onClick={onClose} className="px-6 py-3 rounded-xl btn-blue font-bold">Отлично!</button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <span className="font-oswald text-2xl font-bold" style={{ color: tariff.titleColor }}>{tariff.name}</span>
                <span className="font-oswald text-3xl font-black text-white ml-2">{tariff.price}₽</span>
              </div>
              <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                <Icon name="X" size={20} />
              </button>
            </div>

            {!user && (
              <div className="mb-4 px-4 py-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-sm flex items-center gap-2">
                <Icon name="AlertTriangle" size={14} />
                Для покупки необходима регистрация
              </div>
            )}

            <p className="text-gray-400 text-sm mb-4">Выберите способ оплаты:</p>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {methods.map((m, i) => (
                <button
                  key={i}
                  onClick={handleBuy}
                  className="flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all text-left"
                >
                  <span className="text-xl">{m.icon}</span>
                  <div>
                    <div className="text-white text-xs font-semibold">{m.label}</div>
                    <div className="text-gray-500 text-xs">{m.sub}</div>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-600 text-center">
              {user ? `Попыток взлома после покупки: ${tariff.attempts}` : 'Зарегистрируйтесь, чтобы приобрести тариф'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

const Tariffs = () => {
  const [selected, setSelected] = useState<typeof TARIFFS[0] | null>(null);
  const { user } = useApp();

  return (
    <div className="relative z-10 max-w-6xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="font-oswald text-4xl md:text-5xl font-bold text-white mb-4 tracking-wide">
          ВЫБЕРИТЕ <span className="text-cyan-400">ТАРИФ</span>
        </h1>
        <p className="text-gray-400">
          {user ? `Текущий тариф: ${user.plan || 'Нет'}` : 'Зарегистрируйтесь, чтобы купить тариф'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {TARIFFS.map((t, i) => (
          <div
            key={i}
            className={`rounded-2xl border-2 bg-[#0a0d1a] p-6 flex flex-col ${t.glowClass} transition-all hover:scale-[1.02]`}
          >
            <div className="text-center mb-4">
              <div className="font-oswald text-lg font-bold mb-1" style={{ color: t.titleColor }}>
                {t.name}
              </div>
              <div className="font-oswald text-5xl font-black text-white">{t.price}₽</div>
              <div className="text-xs font-bold mt-1 px-3 py-1 rounded-full inline-block" style={{ color: t.titleColor, border: `1px solid ${t.borderColor}40`, background: `${t.borderColor}15` }}>
                {t.periodLabel}
              </div>
            </div>

            <div className="border-t border-white/10 my-4" />

            <ul className="space-y-2 flex-1 mb-4">
              {t.features.map((f, fi) => (
                <li key={fi} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: t.borderColor }} />
                  {f}
                </li>
              ))}
            </ul>

            <div className="border-t border-white/10 my-4" />

            <div className="text-xs text-gray-500 text-center mb-4">
              {t.note}
            </div>

            <div className="text-xs text-center mb-3" style={{ color: t.titleColor }}>
              Попыток взлома: <strong>{t.attempts}</strong>
            </div>

            <button
              onClick={() => setSelected(t)}
              className={`w-full py-3 rounded-xl ${t.btnClass} font-bold text-sm tracking-wide transition-all hover:scale-105 active:scale-95`}
            >
              Выбрать
            </button>
          </div>
        ))}
      </div>

      {selected && <PayModal tariff={selected} onClose={() => setSelected(null)} />}
    </div>
  );
};

export default Tariffs;
