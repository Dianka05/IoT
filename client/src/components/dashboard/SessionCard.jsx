import React, { useState, useEffect } from 'react';

const SessionCard = ({ id, technician }) => {
  const [secondsLeft, setSecondsLeft] = useState(15900);

  useEffect(() => {
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer); 
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return [hrs, mins, secs]
      .map((v) => (v < 10 ? '0' + v : v)) 
      .join(':');
  };

  return (
    <section className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6">
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
          <div className="w-10 h-12 border-2 border-orange-400 rounded-md flex flex-col items-center pt-2 relative">
            <div className="w-4 h-4 bg-orange-400 rounded-full mb-1" />
            <div className="w-6 h-1 bg-orange-400 rounded-full" />
          </div>
        </div>
        <div>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{id}</h2>
          <p className="text-slate-400 font-bold text-sm">{technician}</p>
          <div className="mt-2 inline-flex items-center gap-2 bg-slate-100 px-3 py-1 rounded-lg text-[10px] font-mono font-bold text-slate-500 uppercase">
             88 - 34 - EF - 90
          </div>
        </div>
      </div>

      <div className="bg-orange-50/50 border border-orange-100 rounded-[24px] px-10 py-6 text-center min-w-[260px]">
        <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">
          Remaining Session Time
        </p>
        <div className="text-5xl font-mono font-black text-orange-500 tracking-widest">
          {formatTime(secondsLeft)}
        </div>
      </div>
    </section>
  );
};

export default SessionCard;