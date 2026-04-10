import StatCard from "./StatCard";
import { Users, Activity, CreditCard, Monitor } from "lucide-react";

const UserStatsCards = () => {
  const stats = [
    { label: "Total Users", value: 124, icon: Users, iconBg: "bg-orange-100" },
    { label: "Active Now", value: 18, icon: Activity, iconBg: "bg-green-100" },
    { label: "RFID Cards", value: 112, icon: CreditCard, iconBg: "bg-blue-100" },
    { label: "Equipment", value: "45 Units", icon: Monitor, iconBg: "bg-purple-100" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
};

export default UserStatsCards;
