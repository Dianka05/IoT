import { UserPlus, Radio, AlertCircle, Share2 } from 'lucide-react';

const ActivityItem = ({ icon: Icon, title, desc, time, color }) => (
  <div className="flex gap-4 pb-6 last:pb-0">
    <div className={`p-2 h-fit rounded-full ${color} text-white`}><Icon size={16} /></div>
    <div className="flex-1 border-b border-slate-50 pb-4 last:border-0">
      <div className="flex justify-between mb-1">
        <h4 className="text-sm font-bold text-slate-800">{title}</h4>
        <span className="text-[10px] font-bold text-slate-300 uppercase">{time}</span>
      </div>
      <p className="text-xs text-slate-500 leading-relaxed" dangerouslySetInnerHTML={{ __html: desc }} />
    </div>
  </div>
);

const LiveActivity = () => (
  <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm p-6">
    <div className="space-y-6">
      <ActivityItem icon={Share2} title="Session Started" time="2m" color="bg-green-500" desc="<strong>Marcus Thorne</strong> activated 3D Printer." />
      <ActivityItem icon={AlertCircle} title="Access Denied" time="15m" color="bg-red-500" desc="Invalid RFID at <strong>Main Workshop.</strong>" />
      <ActivityItem icon={Radio} title="Device Online" time="1h" color="bg-orange-500" desc="<strong>Device C</strong> reconnected to gateway." />
      <ActivityItem icon={UserPlus} title="New User" time="3h" color="bg-slate-400" desc="Admin <strong>Sarah Chen</strong> added profile." />
    </div>
    <button className="w-full mt-6 py-3 border border-slate-100 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 transition-all">
      Load Older Activity
    </button>
  </div>
);

export default LiveActivity;