import { useState, useEffect } from "react";
import { X, Fingerprint, ChevronDown, Loader2, Search } from "lucide-react";
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true
});

export default function AddUserModal({ isOpen, onClose, userToEdit = null, onRefresh }) {
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    uid: "",
    name: "",
    role: "user",
    email: "",
    active: true,
    allowedDeviceIds: []
  });

  const [newDeviceId, setNewDeviceId] = useState("");
  const [isAddingDevice, setIsAddingDevice] = useState(false);

  useEffect(() => {
    if (userToEdit) {
      setFormData({
        uid: userToEdit.id || "",
        name: userToEdit.name || "",
        role: userToEdit.role || "user",
        email: userToEdit.email || "",
        active: userToEdit.active ?? true,
        allowedDeviceIds: userToEdit.allowedDeviceIds || []
      });
      setError(null);
    } else {
      setFormData({ uid: "", name: "", role: "user", email: "", active: true, allowedDeviceIds: [] });
      setSearchQuery("");
      setError(null);
    }
  }, [userToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(`/users/by-uid/${searchQuery.trim()}`);
      const user = res.data.item;
      setFormData({
        uid: user.id,
        name: user.name || "",
        role: user.role || "user",
        email: user.email || "",
        active: user.active ?? true,
        allowedDeviceIds: user.allowedDeviceIds || []
      });
    } catch (err) {
      console.error("Search error:", err);
      setError("User not found in system database.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.uid) return setError("Please find a user first");
    
    setLoading(true);
    try {
      await api.patch(`/users/${formData.uid}`, {
        name: formData.name,
        role: formData.role,
        active: formData.active,
        email: formData.email
      });

      await api.patch(`/users/${formData.uid}/allowedDeviceIds`, {
        allowedDeviceIds: formData.allowedDeviceIds
      });

      onRefresh?.();
      onClose();
    } catch (err) {
      console.error("Update error:", err);
      setError("Failed to update user access.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddDevice = () => {
    if (newDeviceId.trim() && !formData.allowedDeviceIds.includes(newDeviceId)) {
      setFormData({
        ...formData,
        allowedDeviceIds: [...formData.allowedDeviceIds, newDeviceId.trim()]
      });
      setNewDeviceId("");
      setIsAddingDevice(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={onClose} />

      <div className="relative bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
        
        <div className="p-8 pb-4 flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {userToEdit ? "Edit Permissions" : "Add Existing User"}
            </h2>
            <p className="text-sm text-slate-500 mt-1">Configure system access for users.</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={22} />
          </button>
        </div>

        <div className="p-8 pt-4 space-y-6">
          {!userToEdit && !formData.uid && (
            <div className="space-y-3 p-4 bg-orange-50 rounded-2xl border border-orange-100">
              <label className="text-[10px] font-black text-orange-600 uppercase tracking-widest italic">
                Identify User (UID / Card ID)
              </label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  placeholder="e.g. A27A7B38"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-white border border-orange-200 rounded-xl px-4 py-2 text-sm outline-none"
                />
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-orange-500 text-white p-2 px-4 rounded-xl hover:bg-orange-600 disabled:opacity-50"
                >
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
              </div>
              {error && <p className="text-[10px] text-red-500 font-bold uppercase">{error}</p>}
            </div>
          )}

          <div className={`${(!userToEdit && !formData.uid) ? 'opacity-30 pointer-events-none' : 'opacity-100'} space-y-6`}>
            
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Display Name</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full border-b border-slate-200 py-2 focus:border-orange-500 outline-none text-sm transition-colors" 
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Access Level</label>
                <div className="relative">
                  <select 
                    value={formData.role}
                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                    className="w-full border-b border-slate-200 py-2 focus:border-orange-500 outline-none text-sm appearance-none bg-transparent"
                  >
                    <option value="user">User</option>
                    <option value="technician">Technician</option>
                    <option value="admin">Admin</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-0 top-3 text-slate-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Devices</label>
              <div className="flex flex-wrap gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-100 min-h-[54px] items-center">
                {formData.allowedDeviceIds.map(id => (
                  <span key={id} className="flex items-center gap-1 bg-white border border-slate-200 px-2 py-1 rounded-lg text-[11px] font-bold text-slate-600 shadow-sm">
                    {id} 
                    <button onClick={() => setFormData({...formData, allowedDeviceIds: formData.allowedDeviceIds.filter(d => d !== id)})} className="hover:text-red-500 ml-1">
                      <X size={12} />
                    </button>
                  </span>
                ))}
                {isAddingDevice ? (
                  <input 
                    autoFocus
                    className="bg-transparent outline-none text-[11px] font-bold w-20 border-b border-orange-400"
                    value={newDeviceId}
                    onChange={(e) => setNewDeviceId(e.target.value)}
                    onBlur={handleAddDevice}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddDevice()}
                  />
                ) : (
                  <button onClick={() => setIsAddingDevice(true)} className="text-[11px] font-bold text-orange-600 hover:text-orange-700 ml-2">
                    + Add ID
                  </button>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div>
                <p className="text-sm font-bold text-slate-800">Account Access</p>
                <p className="text-[11px] text-slate-500">Allow user to interact with the system.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={formData.active}
                  onChange={(e) => setFormData({...formData, active: e.target.checked})} 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-orange-500 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50 flex items-center justify-end gap-4">
          <button onClick={onClose} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={loading || (!userToEdit && !formData.uid)}
            className="bg-[#ff6200] text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase shadow-lg hover:bg-[#e55600] transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm Changes
          </button>
        </div>
      </div>
    </div>
  );
}