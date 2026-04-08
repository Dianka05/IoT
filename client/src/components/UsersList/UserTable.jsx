import UserRow from "./UserRow";
import { useState } from "react";
import Pagination from "./Pagination";


const UserTable = ({ activeTab }) => {
  const users = [
  { name: "Alex Rivera", role: "Admin", rfid: "RF-9928", equipment: ["CNC", "Lathe", "3D Printer"], limit: "Unlimited", status: "Active" },
  { name: "Jordan Smith", role: "Technician", rfid: "RF-4412", equipment: ["3D Printer", "Laser Cutter"], limit: "4 Hours", status: "Active" },
  { name: "Taylor Chen", role: "User", rfid: "RF-1195", equipment: ["3D Printer"], limit: "2 Hours", status: "Inactive" },
  { name: "Maria Lopez", role: "Admin", rfid: "RF-2211", equipment: ["Lathe"], limit: "3 Hours", status: "Active" },
  { name: "Ethan Walker", role: "Technician", rfid: "RF-8821", equipment: ["CNC"], limit: "5 Hours", status: "Active" },
  { name: "Sofia Patel", role: "User", rfid: "RF-5523", equipment: ["Laser Cutter"], limit: "1 Hour", status: "Inactive" },
  { name: "Liam Carter", role: "User", rfid: "RF-9912", equipment: ["3D Printer"], limit: "2 Hours", status: "Active" },
  { name: "Noah Kim", role: "Technician", rfid: "RF-4419", equipment: ["CNC", "Laser Cutter"], limit: "6 Hours", status: "Active" },
  { name: "Emma Davis", role: "Admin", rfid: "RF-7712", equipment: ["Lathe"], limit: "Unlimited", status: "Active" },
  { name: "Olivia Brown", role: "User", rfid: "RF-3312", equipment: ["3D Printer"], limit: "1 Hour", status: "Inactive" },
  { name: "Mason Lee", role: "Technician", rfid: "RF-1234", equipment: ["CNC"], limit: "4 Hours", status: "Active" },
  { name: "Ava Wilson", role: "User", rfid: "RF-5678", equipment: ["Laser Cutter"], limit: "2 Hours", status: "Active" },
  { name: "Isabella Clark", role: "Admin", rfid: "RF-9101", equipment: ["Lathe"], limit: "Unlimited", status: "Active" },
  { name: "Lucas Hall", role: "Technician", rfid: "RF-1122", equipment: ["3D Printer"], limit: "3 Hours", status: "Inactive" },
  { name: "Mia Young", role: "User", rfid: "RF-3344", equipment: ["CNC"], limit: "1 Hour", status: "Active" },
  { name: "James King", role: "Admin", rfid: "RF-5566", equipment: ["Laser Cutter"], limit: "Unlimited", status: "Active" },
  { name: "Benjamin Scott", role: "Technician", rfid: "RF-7788", equipment: ["Lathe"], limit: "5 Hours", status: "Active" },
  { name: "Charlotte Green", role: "User", rfid: "RF-9900", equipment: ["3D Printer"], limit: "2 Hours", status: "Inactive" },
  { name: "Amelia Adams", role: "Technician", rfid: "RF-2468", equipment: ["CNC"], limit: "4 Hours", status: "Active" },
  { name: "Harper Baker", role: "User", rfid: "RF-1357", equipment: ["Laser Cutter"], limit: "1 Hour", status: "Active" },
];


  const filteredUsers = users.filter((u) => {
    if (activeTab === "All Users") return true;
    if (activeTab === "Admins") return u.role === "Admin";
    if (activeTab === "Technicians") return u.role === "Technician";
    if (activeTab === "User") return u.role === "User";
    return true;
  });

  const itemsPerPage = 8;
  const [page, setPage] = useState(1);
  const start = (page - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedUsers = filteredUsers.slice(start, end);

  return (
    <div>
    <div className="bg-white rounded-[24px] border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-left border-collapse">
        <thead className="bg-slate-50/50 border-b border-slate-100">
          <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            <th className="px-6 py-4">User Name</th>
            <th className="px-6 py-4">Role</th>
            <th className="px-6 py-4">RFID Card ID</th>
            <th className="px-6 py-4">Allowed Equipment</th>
            <th className="px-6 py-4">Session Time Limit</th>
            <th className="px-6 py-4">Status</th>
            <th className="px-6 py-4">Actions</th>
          </tr>
        </thead>

        <tbody className="divide-y divide-slate-50">
          {paginatedUsers.map((u, i) => (
            <UserRow key={i} {...u} />
          ))}
        </tbody>
      </table>
    </div>
    <Pagination 
        page={page}
        setPage={setPage}
        totalPages={Math.ceil(filteredUsers.length / itemsPerPage)}
      />
    </div>
  );
};

export default UserTable;
