import React from 'react';
import { MapPin, Sparkles, Star } from 'lucide-react';
import type { IGuide } from '../../interface/IGuide';
import { authService } from '../../services/auth.service';
import { InviteGuideModal } from './InviteGuideModal';

interface GuideCardProps {
  guide: IGuide;
  variant?: 'compact' | 'standard' | 'mini';
}

export const GuideCard: React.FC<GuideCardProps> = ({ guide, variant = 'standard' }) => {
  const [showInviteModal, setShowInviteModal] = React.useState(false);
  const user = authService.getCurrentUser();
  const isTraveler = user && user.role === 'user';

  if (variant === 'mini') {
    return (
      <div className="flex items-center gap-3 bg-white p-3 rounded-2xl border border-slate-100 shadow-sm">
        <img
          src={guide.avatarURL || `https://ui-avatars.com/api/?name=${guide.name || 'G'}`}
          className="w-10 h-10 rounded-xl object-cover"
          alt=""
        />
        <div className="min-w-0">
          <p className="text-sm font-black text-slate-800 truncate">{guide.name}</p>
          <div className="flex items-center gap-1 text-[10px] text-amber-500 font-black">
            <Star size={10} fill="currentColor" />
            <span>{guide.averageRating?.toFixed(1) || '0.0'}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 flex flex-col sm:flex-row items-center sm:items-start gap-6 hover:shadow-2xl hover:shadow-indigo-100 transition-all duration-500 group relative overflow-hidden">
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full -mr-16 -mt-16 transition-transform group-hover:scale-150 duration-700 opacity-50" />

      <div className="relative">
        <img
          src={
            guide.avatarURL
              ? guide.avatarURL.startsWith('http')
                ? guide.avatarURL
                : `${import.meta.env.VITE_API_URL}${guide.avatarURL}`
              : 'https://api.dicebear.com/7.x/avataaars/svg?seed=' +
              (guide.userId?.name || guide.name || 'guide')
          }
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
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase leading-tight">
                {guide.userId?.name || guide.name}
              </h3>
              {guide.isVerified && (
                <div className="bg-emerald-50 text-emerald-600 p-1 rounded-full border border-emerald-100 shadow-sm">
                  <CheckCircle size={10} />
                </div>
              )}
            </div>

            <div className="flex items-center justify-center sm:justify-start gap-3 mt-1.5 flex-wrap">
              <p className="flex items-center gap-1 text-[10px] font-black text-indigo-500 uppercase tracking-[0.2em]">
                <MapPin className="w-3 h-3" /> {guide.serviceArea}
              </p>
              <div className="flex items-center gap-1.5 py-0.5 px-2 bg-amber-50 rounded-lg border border-amber-100/50">
                <Star size={12} className="text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-black text-amber-700">
                  {guide.averageRating?.toFixed(1) || '0.0'}
                </span>
                <span className="text-[10px] font-bold text-amber-900/40">
                  ({guide.reviewCount || 0})
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 text-white px-4 py-2 rounded-2xl flex flex-col items-center shadow-lg shadow-slate-900/20">
            <span className="text-lg font-black leading-none">₹{guide.dailyRate}</span>
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
              / Day
            </span>
          </div>
        </div>

        <p className="text-sm font-medium text-slate-500 mt-4 line-clamp-2 leading-relaxed text-center sm:text-left italic">
          "{guide.bio}"
        </p>

        <div className="mt-4 flex flex-wrap justify-center sm:justify-start gap-2">
          {guide.specialties?.slice(0, 3).map((s: string) => (
            <span
              key={s}
              className="text-[9px] uppercase tracking-widest font-black bg-slate-50 text-slate-600 px-3 py-1.5 rounded-xl border border-slate-100"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Languages */}
        {guide.languages && guide.languages.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center">
              Languages:
            </span>
            {guide.languages.map((lang: string) => (
              <span
                key={lang}
                className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-lg border border-indigo-100"
              >
                {lang}
              </span>
            ))}
          </div>
        )}

        {/* Social Links */}
        {guide.socialLinks && (guide.socialLinks.instagram || guide.socialLinks.linkedin || guide.socialLinks.website) && (
          <div className="mt-3 flex justify-center sm:justify-start gap-3">
            {guide.socialLinks.instagram && (
              <a href={guide.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-pink-500 hover:text-pink-600 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {guide.socialLinks.linkedin && (
              <a href={guide.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" clipRule="evenodd" />
                </svg>
              </a>
            )}
            {guide.socialLinks.website && (
              <a href={guide.socialLinks.website} target="_blank" rel="noopener noreferrer" className="text-slate-600 hover:text-slate-800 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </a>
            )}
          </div>
        )}

        {isTraveler && variant !== 'compact' && (
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
        <InviteGuideModal guide={guide} onClose={() => setShowInviteModal(false)} />
      )}
    </div>
  );
};

// Helper components if needed
const CheckCircle = ({ size }: { size: number }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
