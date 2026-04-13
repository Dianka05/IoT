import { useState, useEffect } from "react";
import SidebarEquipment from "../components/Equipment/SidebarEquipment";
import HeaderEquipment from "../components/Equipment/HeaderEquipment";
import UserSelectorEquipment from "../components/Equipment/UserSelectorEquipment";
import ActionsEquipment from "../components/Equipment/ActionsEquipment";
import ListEquipment from "../components/Equipment/ListEquipment";
import ReminderEquipment from "../components/Equipment/ReminderEquipment";

const Equipment = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [users, setUsers] = useState([
  {
    id: 1,
    name: "Alex Rivera",
    role: "Admin",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: true, sessionLimit: 120 },
      { id: 2, name: "Nimbus 2000", access: true, sessionLimit: 480 },
      { id: 3, name: "Choto krutoje", access: false, sessionLimit: 0 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },
  {
    id: 2,
    name: "Jordan Smith",
    role: "Technician",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: false, sessionLimit: 0 },
      { id: 2, name: "Nimbus 2000", access: true, sessionLimit: 60 },
      { id: 3, name: "Choto krutoje", access: true, sessionLimit: 30 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },
  {
    id: 3,
    name: "Taylor Chen",
    role: "User",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: false, sessionLimit: 0 },
      { id: 2, name: "Nimbus 2000", access: false, sessionLimit: 0 },
      { id: 3, name: "Choto krutoje", access: false, sessionLimit: 0 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },

  {
    id: 4,
    name: "Maria Lopez",
    role: "Admin",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: true, sessionLimit: 300 },
      { id: 2, name: "Nimbus 2000", access: false, sessionLimit: 0 },
      { id: 3, name: "Choto krutoje", access: true, sessionLimit: 45 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },
  {
    id: 5,
    name: "Ethan Walker",
    role: "Technician",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: true, sessionLimit: 90 },
      { id: 2, name: "Nimbus 2000", access: true, sessionLimit: 120 },
      { id: 3, name: "Choto krutoje", access: false, sessionLimit: 0 },
      { id: 4, name: "Atomovka", access: true, sessionLimit: 20 },
    ],
  },
  {
    id: 6,
    name: "Sofia Patel",
    role: "User",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: false, sessionLimit: 0 },
      { id: 2, name: "Nimbus 2000", access: false, sessionLimit: 0 },
      { id: 3, name: "Choto krutoje", access: true, sessionLimit: 15 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },
  {
    id: 7,
    name: "Liam Carter",
    role: "User",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: true, sessionLimit: 60 },
      { id: 2, name: "Nimbus 2000", access: false, sessionLimit: 0 },
      { id: 3, name: "Choto krutoje", access: false, sessionLimit: 0 },
      { id: 4, name: "Atomovka", access: true, sessionLimit: 10 },
    ],
  },
  {
    id: 8,
    name: "Noah Kim",
    role: "Technician",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: true, sessionLimit: 200 },
      { id: 2, name: "Nimbus 2000", access: true, sessionLimit: 300 },
      { id: 3, name: "Choto krutoje", access: true, sessionLimit: 120 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },
  {
    id: 9,
    name: "Emma Davis",
    role: "Admin",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: false, sessionLimit: 0 },
      { id: 2, name: "Nimbus 2000", access: true, sessionLimit: 240 },
      { id: 3, name: "Choto krutoje", access: false, sessionLimit: 0 },
      { id: 4, name: "Atomovka", access: true, sessionLimit: 30 },
    ],
  },
  {
    id: 10,
    name: "Olivia Brown",
    role: "User",
    permissions: [
      { id: 1, name: "Super Fan 3000", access: true, sessionLimit: 20 },
      { id: 2, name: "Nimbus 2000", access: false, sessionLimit: 0 },
      { id: 3, name: "Choto krutoje", access: false, sessionLimit: 0 },
      { id: 4, name: "Atomovka", access: false, sessionLimit: 0 },
    ],
  },
]);


  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    if (users.length > 0) setSelectedUser(users[0]);
  }, [users]);

  const handleToggle = (permId) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              permissions: u.permissions.map(p =>
                p.id === permId ? { ...p, access: !p.access } : p
              ),
            }
          : u
      )
    );
  };

  const handleLimitChange = (permId, value) => {
    setUsers(prev =>
      prev.map(u =>
        u.id === selectedUser.id
          ? {
              ...u,
              permissions: u.permissions.map(p =>
                p.id === permId ? { ...p, sessionLimit: Number(value) } : p
              ),
            }
          : u
      )
    );
  };

  const handleSave = () => {
    console.log("Saving permissions for:", selectedUser.name);
    console.log(selectedUser.permissions);
  };

  const handleDelete = (permId) => {
  setUsers(prev =>
    prev.map(u => ({
      ...u,
      permissions: u.permissions.filter(p => p.id !== permId)
    }))
  );
};

  return (
  <div className="h-screen flex bg-[#f8fafc] overflow-hidden">

    <SidebarEquipment 
      isOpen={sidebarOpen}
      setIsOpen={setSidebarOpen}
    />

    <main className="flex-1 p-6 md:p-8 overflow-y-auto">

      <HeaderEquipment 
        title="Equipment Permissions"
        setSidebarOpen={setSidebarOpen}
      />

      <UserSelectorEquipment
        users={users}
        selectedUser={selectedUser}
        onSelect={setSelectedUser}
      />

      <ActionsEquipment
        user={selectedUser}
        onSave={handleSave}
      />

      {selectedUser && (
        <ListEquipment
          permissions={selectedUser.permissions}
          onToggle={handleToggle}
          onLimitChange={handleLimitChange}
          onDelete={handleDelete}
        />
      )}

      <ReminderEquipment />

    </main>
  </div>
);

};

export default Equipment;
