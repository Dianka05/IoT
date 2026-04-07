import React, { useState } from 'react';
import { Lock, Unlock, Loader2 } from 'lucide-react';

const LockControl = () => {
  // 1. Создаем состояние статуса (LOCKED или UNLOCKED)
  const [status, setStatus] = useState('LOCKED');
  
  // 2. Добавим состояние загрузки (имитация работы сервопривода)
  const [isLoading, setIsLoading] = useState(false);

  // Функция для имитации запроса к бэкенду
  const handleToggleLock = (newStatus) => {
    if (status === newStatus || isLoading) return;

    setIsLoading(true);

    // Имитируем задержку в 1 секунду (как будто замок физически открывается)
    setTimeout(() => {
      setStatus(newStatus);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 transition-all">
      <div className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-4">
          <div className={`p-3 rounded-xl transition-colors ${status === 'LOCKED' ? 'bg-orange-50 text-orange-500' : 'bg-green-50 text-green-500'}`}>
            {status === 'LOCKED' ? <Lock size={24} /> : <Unlock size={24} />}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-800">Lockbox System Control</h3>
            <p className="text-sm text-slate-400 font-medium">Centralized Servo Control</p>
          </div>
        </div>

        {/* Динамический индикатор статуса */}
        <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full border transition-all ${
          status === 'LOCKED' 
            ? 'bg-orange-50 border-orange-100 text-orange-600' 
            : 'bg-green-50 border-green-100 text-green-600'
        }`}>
          {isLoading ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            status === 'LOCKED' ? <Lock size={14} /> : <Unlock size={14} />
          )}
          <span className="text-[11px] font-black uppercase tracking-tighter">
            Status: {isLoading ? 'Processing...' : status}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Кнопка OPEN */}
        <button 
          onClick={() => handleToggleLock('UNLOCKED')}
          disabled={isLoading || status === 'UNLOCKED'}
          className={`group flex items-center justify-center gap-3 py-5 rounded-2xl font-black text-lg shadow-lg uppercase transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
            status === 'UNLOCKED' 
              ? 'bg-green-500 shadow-green-100 text-white' 
              : 'bg-orange-500 shadow-orange-100 text-white hover:bg-orange-600'
          }`}
        >
          {isLoading && status === 'LOCKED' ? <Loader2 className="animate-spin" /> : <Unlock size={24} />}
          Open Box
        </button>

        {/* Кнопка CLOSE */}
        <button 
          onClick={() => handleToggleLock('LOCKED')}
          disabled={isLoading || status === 'LOCKED'}
          className="flex items-center justify-center gap-3 bg-[#0f172a] hover:bg-black text-white py-5 rounded-2xl font-black text-lg uppercase transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading && status === 'UNLOCKED' ? <Loader2 className="animate-spin" /> : <Lock size={24} />}
          Close Box
        </button>
      </div>
    </section>
  );
};

export default LockControl;