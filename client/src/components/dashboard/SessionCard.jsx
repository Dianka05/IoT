import { useState, useEffect } from 'react';
import { CreditCard } from 'lucide-react';
import SurfaceCard from '../surfaceCard';

const RFID_TONE_CLASSES = {
  default: 'bg-slate-100 text-slate-500',
  muted: 'bg-slate-100 text-slate-400',
  danger: 'bg-red-50 text-red-500',
};

const SessionCard = ({
  title,
  subtitle,
  rfid = 'No card yet',
  rfidTone = 'default',
  initialSecondsLeft = 0,
  showTimer = false,
}) => {
  const [secondsLeft, setSecondsLeft] = useState(initialSecondsLeft);

  useEffect(() => {
    setSecondsLeft(initialSecondsLeft);
  }, [initialSecondsLeft]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      return undefined;
    }

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
  }, [secondsLeft]);

  const formatTime = (totalSeconds) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;

    return [hrs, mins, secs]
      .map((v) => (v < 10 ? '0' + v : v))
      .join(':');
  };

  return (
    <SurfaceCard
      as="section"
      className="flex flex-col items-center justify-between gap-6 p-8 md:flex-row"
    >
      <div className="flex items-center gap-6">
        <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center border border-orange-100">
          <CreditCard size={34} className="text-orange-400" />
        </div>
        <div className='flex flex-col items-start gap-1.5'>
          <h2 className="text-3xl font-black text-slate-800 tracking-tighter">{title}</h2>
          <p className="text-slate-400 font-bold text-sm">{subtitle}</p>
          <div
            className={`mt-2 inline-flex items-center gap-2 px-3 py-1 rounded-lg text-[10px] font-mono font-bold uppercase ${
              RFID_TONE_CLASSES[rfidTone] || RFID_TONE_CLASSES.default
            }`}
          >
            <CreditCard size={12} />
            {rfid}
          </div>
        </div>
      </div>

      {showTimer && (
        <div className="bg-orange-50/50 border border-orange-100 rounded-[24px] px-10 py-6 text-center min-w-[260px]">
          <p className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em] mb-1">
            Remaining Session Time
          </p>
          <div className="text-5xl font-mono font-black text-orange-500 tracking-widest">
            {formatTime(secondsLeft)}
          </div>
        </div>
      )}
    </SurfaceCard>
  );
};

export default SessionCard;
