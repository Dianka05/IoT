import StatCard from "../statCard";
import { Users, Activity, CreditCard, Monitor } from "lucide-react";

const UserStatsCards = ({ users = [], devices = [] }) => {
  const totalUsers = users.length;
  const activeUsers = users.filter((user) => user.active === true).length;

  const rfidCards = users.reduce((total, user) => {
    return total + (Array.isArray(user.cards) ? user.cards.length : 0);
  }, 0);

  const stats = [
    {
      label: "Total Users",
      value: totalUsers,
      icon: Users,
      iconBg: "bg-orange-100",
    },
    {
      label: "Active Users",
      value: activeUsers,
      icon: Activity,
      iconBg: "bg-green-100",
    },
    {
      label: "RFID Cards",
      value: rfidCards,
      icon: CreditCard,
      iconBg: "bg-blue-100",
    },
    {
      label: "Equipment",
      value: `${devices.length} Units`,
      icon: Monitor,
      iconBg: "bg-purple-100",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {stats.map((s, i) => (
        <StatCard key={i} {...s} />
      ))}
    </div>
  );
};

export default UserStatsCards;
