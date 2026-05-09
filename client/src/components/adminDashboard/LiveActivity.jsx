import { UserPlus, Radio, AlertCircle, Share2, ShieldAlert, LogIn, LogOut } from 'lucide-react';
import SurfaceCard from '../surfaceCard';

const ActivityItem = ({ icon: Icon, title, desc, time, color }) => (
  <div className="flex gap-4 pb-6 last:pb-0">
    <div className={`p-2 h-fit rounded-full ${color} text-white`}><Icon size={16} /></div>
    <div className="flex-1 border-b border-slate-50 pb-4 last:border-0">
      <div className="flex justify-between mb-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <span className="text-[10px] font-bold text-slate-300 uppercase">{time}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const defaultItems = [
  { id: '1', type: 'session_started', time: '2m', description: 'Marcus Thorne activated 3D Printer.' },
  { id: '2', type: 'auth_denied', time: '15m', description: 'Invalid RFID at Main Workshop.' },
  { id: '3', type: 'device_online', time: '1h', description: 'Device C reconnected to gateway.' },
  { id: '4', type: 'user_created', time: '3h', description: 'Admin Sarah Chen added profile.' },
];

function getMeta(type) {
  switch (type) {
    case 'session_started':
    case 'auth_granted':
      return { icon: LogIn, title: 'Session Started', color: 'bg-green-500' };
    case 'session_ended':
      return { icon: LogOut, title: 'Session Ended', color: 'bg-slate-400' };
    case 'auth_denied':
      return { icon: ShieldAlert, title: 'Access Denied', color: 'bg-red-500' };
    case 'user_created':
      return { icon: UserPlus, title: 'New User', color: 'bg-slate-400' };
    case 'device_online':
      return { icon: Radio, title: 'Device Online', color: 'bg-orange-500' };
    case 'mqtt_handler_error':
      return { icon: AlertCircle, title: 'MQTT Error', color: 'bg-red-500' };
    default:
      return { icon: Share2, title: 'System Activity', color: 'bg-slate-500' };
  }
}

const LiveActivity = ({ items = defaultItems }) => (
  <SurfaceCard className="p-6">
    <div className="space-y-6">
      {items.length === 0 && (
        <p className="text-sm text-slate-400">No recent activity yet.</p>
      )}

      {items.map((item) => {
        const meta = getMeta(item.type);

        return (
          <ActivityItem
            key={item.id}
            icon={meta.icon}
            title={meta.title}
            time={item.time}
            color={meta.color}
            desc={item.description}
          />
        );
      })}
    </div>
  </SurfaceCard>
);

export default LiveActivity;
