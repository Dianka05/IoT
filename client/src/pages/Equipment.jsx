import { useState, useEffect } from "react";
import axios from "axios";
import SidebarEquipment from "../components/AdminSidebar";
import HeaderEquipment from "../components/Equipment/HeaderEquipment";
import UserSelectorEquipment from "../components/Equipment/UserSelectorEquipment";
import ActionsEquipment from "../components/Equipment/ActionsEquipment";
import ListEquipment from "../components/Equipment/ListEquipment";
import ReminderEquipment from "../components/Equipment/ReminderEquipment";
import UserEquipmentGrid from "../components/Equipment/UserEquipmentGrid";

const Equipment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [role, setRole] = useState("admin"); 
  const [loading, setLoading] = useState(false);
  
  const [users, setUsers] = useState([
    {
      id: "user_123", 
      name: "Alex Rivera",
      role: "Admin",
      permissions: [
        { id: "dev_01", name: "Industrial Fan-01", access: true, status: "FREE" },
        { id: "dev_02", name: "Servo Hub A", access: true, status: "RESERVED" },
        { id: "dev_03", name: "Thermal Sensor Node", access: true, status: "FREE" },
      ],
    },
  ]);

  const [selectedUser, setSelectedUser] = useState(null);
  const currentUser = users[0];

  useEffect(() => {
    if (users.length > 0) setSelectedUser(users[0]);
  }, [users]);

  const handleStartSession = async (deviceId) => {
    setLoading(true);
    try {
      const response = await axios.post("http://localhost:3000/sessions", {
        uid: currentUser.id,
        boxId: deviceId, 
      });

      if (response.data) {
        console.log("Session started:", response.data);
        setUsers(prev => prev.map(u => ({
          ...u,
          permissions: u.permissions.map(p => 
            p.id === deviceId ? { ...p, status: "IN USE" } : p
          )
        })));
      }
    } catch (error) {
      console.error("Error starting session:", error);
      alert("Failed to start session. Check if backend is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = (permId) => {
    setUsers(prev => prev.map(u => u.id === selectedUser?.id
      ? { ...u, permissions: u.permissions.map(p => p.id === permId ? { ...p, access: !p.access } : p) }
      : u
    ));
  };

  const handleLimitChange = (permId, value) => {
    setUsers(prev => prev.map(u => u.id === selectedUser?.id
      ? { ...u, permissions: u.permissions.map(p => p.id === permId ? { ...p, sessionLimit: Number(value) } : p) }
      : u
    ));
  };

  return (
    <div className="h-screen flex bg-[#f8fafc] overflow-hidden">
      <SidebarEquipment isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <main className="flex-1 p-6 md:p-8 overflow-y-auto relative">
        <HeaderEquipment 
          title={role === "admin" ? "Equipment Permissions" : "My Equipment"} 
          setSidebarOpen={setSidebarOpen} 
        />

        {role === "admin" ? (
          <div className="space-y-6">
            <UserSelectorEquipment users={users} selectedUser={selectedUser} onSelect={setSelectedUser} />
            <ActionsEquipment user={selectedUser} onSave={() => console.log("Saved")} />
            {selectedUser && (
              <ListEquipment
                permissions={selectedUser.permissions}
                onToggle={handleToggle}
                onLimitChange={handleLimitChange}
              />
            )}
          </div>
        ) : (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <p className="text-slate-500 mb-8 -mt-4">Select a device to start your session.</p>
            <UserEquipmentGrid 
              permissions={currentUser?.permissions?.filter(p => p.access) || []} 
              onStart={handleStartSession}
              isLoading={loading}
            />
          </div>
        )}

        <ReminderEquipment />

        <div className="fixed bottom-6 right-6 bg-slate-900 p-2 pl-4 rounded-full shadow-2xl z-50 flex items-center gap-3">
          <span className="text-white text-[10px] font-bold uppercase opacity-70">Mode: {role}</span>
          <button 
            onClick={() => setRole(role === "admin" ? "user" : "admin")}
            className="bg-white text-slate-900 px-4 py-2 rounded-full text-xs font-black hover:bg-orange-500 hover:text-white transition-colors"
          >
            SWITCH
          </button>
        </div>
      </main>
    </div>
  );
};

export default Equipment;