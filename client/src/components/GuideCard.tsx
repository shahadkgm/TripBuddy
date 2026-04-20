import React from 'react';
import { MapPin, Sparkles } from 'lucide-react';
import type { IGuide } from '../interface/IGuide';
import { authService } from '../services/c.authService';
import { InviteGuideModal } from './InviteGuideModal';

export const GuideCard: React.FC<{ guide: IGuide }> = ({ guide }) => {
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const user = authService.getCurrentUser();
  const isTraveler = user && user.role === 'user'; // 'user' is the traveler role

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 opacity-50" />
      
      <div className="relative">
        <img
          src={guide.avatarURL ? (guide.avatarURL.startsWith('http') ? guide.avatarURL : `${import.meta.env.VITE_API_URL}${guide.avatarURL}`) : "https://api.dicebear.com/7.x/avataaars/svg?seed=" + (guide.userId?.name || 'guide')}
          className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] object-cover border-4 border-white shadow-lg ring-1 ring-slate-100"
          alt="Guide"
        />
        <div className="absolute -bottom-2 -right-2 bg-indigo-600 text-white p-2 rounded-xl shadow-lg border-2 border-white">
          <Sparkles size={14} />
        </div>
      </div>

      <div className="grow w-full">
        <div className="flex flex-col sm:flex-row justify-between items-center sm:items-start gap-2">
          <div className="text-center sm:text-left">
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">
              {guide.userId?.name || guide.name}
            </h3>
            <p className="flex items-center justify-center sm:justify-start gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em] mt-1">
              <MapPin className="w-3 h-3" /> {guide.serviceArea}
            </p>
          </div>
          <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex flex-col items-center">
            <span className="text-lg font-black leading-none">₹{guide.hourlyRate}</span>
            <span className="text-[8px] font-black uppercase tracking-widest opacity-60">per day</span>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 mt-4 line-clamp-2 leading-relaxed text-center sm:text-left italic">
          "{guide.bio}"
        </p>

        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
          {guide.specialties?.slice(0, 3).map((s: string) => (
            <span key={s} className="text-[9px] uppercase tracking-widest font-black bg-indigo-50 text-indigo-600 px-3 py-1.5 rounded-xl border border-indigo-100/50">
              {s}
            </span>
          ))}
        </div>

        {isTraveler && (
          <button 
            onClick={() => setShowInviteModal(true)}
            className="w-full mt-6 py-4 bg-slate-900 text-white rounded-[1.25rem] text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 hover:bg-indigo-600 transition-all active:scale-95 flex items-center justify-center gap-2 group/btn"
          >
            Invite to Trip
            <Sparkles size={14} className="group-hover/btn:rotate-12 transition-transform" />
          </button>
        )}
      </div>

      {showInviteModal && (
        <InviteGuideModal 
          guide={guide} 
          onClose={() => setShowInviteModal(false)} 
        />
      )}
    </div>
  );
};