import React, { useState, useEffect } from "react";
import { 
  Users, 
  Settings, 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  ChevronRight,
  Loader2,
  RefreshCcw
} from "lucide-react";
import axios from "axios";
import AddUserModal from "../components/adminDashboard/AddUserModal";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data.items || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.id?.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] p-8">
      <div className="max-w-7xl mx-auto mb-10 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Users</h1>
          <p className="text-slate-500 mt-2 font-medium">Manage access levels and device permissions</p>
        </div>
        
        <button 
          onClick={handleAddUser}
          className="bg-[#ff6200] hover:bg-[#e55600] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-orange-200 transition-all flex items-center gap-2 active:scale-95"
        >
          <Plus size={18} strokeWidth={3} />
          ADD USER
        </button>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 mb-4">
            <Users size={20} />
          </div>
          <p className="text-slate-500 text-xs font-black uppercase tracking-widest">Total Users</p>
          <h3 className="text-2xl font-bold text-slate-900">{users.length}</h3>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mb-6 flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name, email or UID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-4 outline-none focus:border-orange-500 transition-colors shadow-sm text-sm"
          />
        </div>
        <button 
          onClick={fetchUsers}
          className="bg-white border border-slate-200 p-3 rounded-2xl text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
        >
          <RefreshCcw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      <div className="max-w-7xl mx-auto bg-white rounded-[32px] shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100">
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">User Details</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Role</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Devices</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-[0.1em]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <Loader2 className="mx-auto animate-spin text-orange-500 mb-2" size={32} />
                    <p className="text-sm text-slate-400 font-medium">Loading database...</p>
                  </td>
                </tr>
              ) : filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-xs border border-slate-200">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-slate-800">{user.name || "Unknown"}</div>
                        <div className="text-[11px] text-slate-400 font-medium">{user.email || user.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 
                      user.role === 'technician' ? 'bg-blue-100 text-blue-600' : 
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex gap-1">
                      {user.allowedDeviceIds?.length > 0 ? (
                        <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                          {user.allowedDeviceIds.length} devices
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-300 italic font-medium">No devices</span>
                      )}
                    </div>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                      <div className={`w-1.5 h-1.5 rounded-full ${user.active ? 'bg-green-500' : 'bg-slate-300'}`} />
                      <span className={`text-[11px] font-bold uppercase tracking-widest ${user.active ? 'text-green-600' : 'text-slate-400'}`}>
                        {user.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <button 
                      onClick={() => handleEditUser(user)}
                      className="p-2 text-slate-400 hover:text-orange-500 hover:bg-orange-50 rounded-xl transition-all"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        userToEdit={selectedUser}
        onRefresh={fetchUsers}
      />
    </div>
  );
}