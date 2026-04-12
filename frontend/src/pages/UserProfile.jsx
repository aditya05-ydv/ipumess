import { motion } from 'motion/react';
import { ChevronLeft, CheckCircle2, BarChart3, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const UserProfile = ({ onBack, onAdminSwitch }) => {
  const { user, logout } = useAuth();

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Back Button */}
      <div className="flex justify-start mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-slate-400 font-semibold hover:text-blue-400 transition-all"
        >
          <ChevronLeft size={20} /> Back
        </button>
      </div>

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-[#0f1623] border border-slate-700/50 p-10 rounded-3xl text-center shadow-2xl"
      >
        {/* Avatar */}
        <div className="relative inline-block mb-8">
          <div className="w-32 h-32 bg-gradient-to-tr from-blue-600 to-indigo-500 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-lg">
            {(user?.name || 'U').split(' ').map((part) => part[0]).slice(0, 2).join('')}
          </div>
          <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 border-4 border-[#0f1623] rounded-full flex items-center justify-center text-white">
            <CheckCircle2 size={18} />
          </div>
        </div>

        {/* Name & Role */}
        <h2 className="text-3xl font-black text-white mb-1">
          {user?.name || 'Student'}
        </h2>
        <p className="text-slate-400 font-medium mb-8">
          {user?.role === 'admin' ? 'Hostel Admin' : 'Hostel Resident • Active User'}
        </p>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 mb-10">
          <div className="bg-slate-800/60 border border-slate-700/40 p-6 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Room No
            </p>
            <p className="text-xl font-black text-white">
              {user?.roomNumber || 'Admin'}
            </p>
          </div>
          <div className="bg-slate-800/60 border border-slate-700/40 p-6 rounded-2xl">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
              Hostel
            </p>
            <p className="text-xl font-black text-white">
              {user?.hostel || 'Unknown'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          
            <button
              onClick={onAdminSwitch}
              className="w-full py-4 rounded-2xl bg-blue-600/10 border border-blue-500/30 text-blue-400 font-bold hover:bg-blue-600/20 hover:border-blue-400 transition-all flex items-center justify-center gap-3"
            >
              <BarChart3 size={20} /> Go to Admin Portal
            </button>
         
          <button
            onClick={logout}
            className="w-full py-4 rounded-2xl bg-slate-800/60 border border-slate-700/40 text-slate-400 font-bold hover:bg-red-500/10 hover:border-red-500/40 hover:text-red-400 transition-all flex items-center justify-center gap-3"
          >
            <LogOut size={20} /> Logout
          </button>
        </div>
      </motion.div>
    </div>
  );
};