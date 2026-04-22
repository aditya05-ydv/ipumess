import { ChevronLeft, Heart, BarChart3, Users, ExternalLink, Code2, Sparkles } from 'lucide-react';

export const AboutPage = ({ onBack }) => {
  return (
    <div className="min-h-screen bg-[#f8fafc] pt-20 pb-16">
      <div className="max-w-3xl mx-auto px-4">

        {/* Back */}
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 mb-8 px-4 py-2 rounded-xl border border-[#e2e8f0] bg-white text-[#64748b] text-sm font-semibold cursor-pointer hover:border-[#bfdbfe] hover:text-[#2563eb] transition-colors"
        >
          <ChevronLeft size={15} /> Back
        </button>

        {/* Hero */}
        <div className="mb-10">
          <div className="inline-block mb-4 px-3 py-1 rounded-full bg-[#eff6ff] border border-[#bfdbfe] text-[10px] font-bold text-[#2563eb] tracking-widest uppercase">
            About the Project
          </div>
          <h1 className="text-4xl font-black text-[#0f172a] tracking-tight leading-tight mb-4">
            Better Food.<br />
            <span className="text-[#2563eb]">Better Living.</span>
          </h1>
          <p className="text-sm text-[#64748b] leading-relaxed max-w-lg">
            Smart Mess connects students with mess management through real-time feedback.
            Quality meals and student satisfaction drive academic excellence.
          </p>
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          {[
            { icon: <Heart size={16} />, title: 'Quality Focus', desc: 'Rate every meal and help maintain high food standards.', accent: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
            { icon: <BarChart3 size={16} />, title: 'Real Analytics', desc: 'View meal trends and ratings in an interactive dashboard.', accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
            { icon: <Users size={16} />, title: 'Community', desc: 'Student voices shaping hostel dining together.', accent: '#2563eb', bg: '#eff6ff', border: '#bfdbfe' },
          ].map(({ icon, title, desc, accent, bg, border }) => (
            <div
              key={title}
              className="p-4 rounded-xl border border-[#e2e8f0] bg-white hover:border-[#bfdbfe] transition-colors"
            >
              <div
                className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center"
                style={{ background: bg, border: `1px solid ${border}`, color: accent }}
              >
                {icon}
              </div>
              <h3 className="text-sm font-700 text-[#0f172a] font-bold mb-1">{title}</h3>
              <p className="text-xs text-[#64748b] leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>

        {/* Developer Card */}
        <div className="rounded-2xl border border-[#e2e8f0] bg-white overflow-hidden">
          <div className="h-0.5 bg-[#2563eb]" />

          <div className="p-6">
            {/* Label */}
            <div className="flex items-center gap-2 mb-5">
              <Code2 size={13} color="#2563eb" />
              <p className="text-[10px] font-bold text-[#2563eb] tracking-widest uppercase">Created By</p>
            </div>

            <div className="flex items-center gap-5 flex-wrap">

              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-16 h-16 rounded-2xl bg-[#eff6ff] border-2 border-[#bfdbfe] flex items-center justify-center text-xl font-black text-[#2563eb]">
                  AY
                </div>
                <div className="absolute bottom-0.5 right-0.5 w-3 h-3 rounded-full bg-[#f97316] border-2 border-white" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-[200px]">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h3 className="text-lg font-extrabold text-[#0f172a] tracking-tight">
                    Aditya Yadav
                  </h3>
                  <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-[#eff6ff] border border-[#bfdbfe] text-[9px] font-bold text-[#2563eb] uppercase tracking-wider">
                    <Sparkles size={8} /> Open to Work
                  </div>
                </div>

                <p className="text-xs text-[#2563eb] font-semibold tracking-widest uppercase mb-1">
                  Full Stack Developer
                </p>
                <p className="text-xs text-[#64748b] mb-1">USICT 2023–2027 🎓</p>

                <p className="text-xs text-[#64748b] leading-relaxed mb-4 max-w-sm">
                  This platform comes from real hostel experience — the frustration, the jokes, the daily struggles.
                  Smart Mess turns those into a system where students can rate, vote, and influence what they eat.
                </p>

                <a
                  href="https://www.linkedin.com/in/adityayadav25/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#2563eb] text-white text-xs font-bold no-underline hover:bg-[#1d4ed8] transition-colors"
                >
                  <ExternalLink size={12} />
                  Connect on LinkedIn
                </a>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
