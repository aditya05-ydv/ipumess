import { ChevronRight, Star, TrendingUp, Users } from 'lucide-react';

export const Hero = ({ onStart }) => {
  return (
    <div className="bg-[#f8fafc] px-6 py-20 flex flex-col items-center">
      <div className="text-center w-full max-w-2xl">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold bg-[#eff6ff] border border-[#bfdbfe] text-[#2563eb] mb-8 uppercase tracking-wide">
          <span className="w-1.5 h-1.5 rounded-full bg-[#2563eb] inline-block" />
          Hostel Mess Management System
        </div>

        {/* Heading */}
        <h1 className="text-5xl font-extrabold leading-[1.1] tracking-tight mb-6">
          <span className="text-[#0f172a]">Your Hostel Dining,</span>
          <br />
          <span className="text-[#2563eb]">Reimagined.</span>
        </h1>

        {/* Subtext */}
        <p className="text-base text-[#64748b] leading-relaxed mb-10 max-w-md mx-auto">
          A student-driven platform for transparent meal ratings,
          live polls, and weekly menu planning — all in one place.
        </p>

        {/* CTA Buttons */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onStart}
            className="flex items-center gap-2 px-7 py-3 rounded-lg font-semibold text-sm text-white bg-[#2563eb] hover:bg-[#1d4ed8] border border-[#2563eb]"
          >
            Enter Mess Portal
            <ChevronRight size={16} />
          </button>

          <button
            className="flex items-center gap-2 px-6 py-3 rounded-lg font-medium text-sm bg-white border border-[#e2e8f0] text-[#64748b] hover:border-[#cbd5e1] hover:text-[#0f172a]"
          >
            Learn More
          </button>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-center gap-4 mt-14 flex-wrap">
          {[
            { label: 'Active Students', value: '700+', icon: Users },
            { label: 'Avg Rating',      value: '4.8★', icon: Star },
            { label: 'Meals Rated',     value: '2.4k', icon: TrendingUp },
          ].map(({ label, value, icon: Icon }) => (
            <div
              key={label}
              className="bg-white border border-[#e2e8f0] rounded-xl px-7 py-5 text-center min-w-[130px]"
            >
              <Icon size={16} className="text-[#2563eb] mx-auto mb-2.5" />
              <p className="text-xl font-bold text-[#0f172a] mb-1">{value}</p>
              <p className="text-xs text-[#64748b]">{label}</p>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};