const tabs = ["All Users", "Admins", "Technicians", "User"];

const UserTabs = ({ activeTab, setActiveTab }) => {
  return (
    <div className="flex gap-6 border-b border-slate-200 space-y-6">
      {tabs.map((t) => (
        <button
          key={t}
          onClick={() => setActiveTab(t)}
          className={`
            pb-3 text-[13px] font-bold uppercase tracking-wide transition-all
            cursor-pointer
            hover:text-orange-400
            ${activeTab === t 
              ? "text-orange-500 border-b-2 border-orange-500" 
              : "text-slate-400"
            }
          `}
        >
          {t}
        </button>
      ))}
    </div>
  );
};

export default UserTabs;
