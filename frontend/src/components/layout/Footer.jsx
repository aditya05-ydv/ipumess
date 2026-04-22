import { UtensilsCrossed, Mail, Heart } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

export const Footer = ({ show, onNavigate }) => {
  if (!show) return null;

  const links = [
    { label: 'Home',       view: 'home' },
    { label: 'Menu',       view: 'menu' },
    { label: 'Polls',      view: 'polls' },
    { label: 'Results',    view: 'results' },
    { label: 'Suggestion', view: 'suggestions' },
    { label: 'About',      view: 'about' },
  ];

  return (
    <footer className="w-full mt-auto bg-white border-t-2 border-[#e2e8f0] lg:pl-60">

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#2563eb] flex items-center justify-center">
                <UtensilsCrossed size={15} color="white" />
              </div>
              <div>
                <p className="text-[#0f172a] font-bold text-sm">Smart Mess</p>
                <p className="text-[#94a3b8] text-xs">Student Initiative</p>
              </div>
            </div>
            <p className="text-sm text-[#64748b] leading-relaxed">
              A student-led platform to improve hostel dining through transparent feedback and real-time ratings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">
              Quick Links
            </p>
            <ul className="space-y-2">
              {links.map(({ label, view }) => (
                <li key={label}>
                  <button
                    onClick={() => onNavigate?.(view)}
                    className="text-sm text-[#64748b] hover:text-[#2563eb] text-left"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer */}
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-widest text-[#94a3b8] mb-4">
              Developer
            </p>
            <div className="space-y-3">
              <a
                href="https://www.linkedin.com/in/adityayadav25/"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#2563eb]"
              >
                <FaLinkedin size={14} />
                Aditya Yadav
              </a>
              <a
                href="mailto:adityaayadav@gmail.com"
                className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#2563eb]"
              >
                <Mail size={14} />
                adityaayadav@gmail.com
              </a>
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 text-sm text-[#64748b] hover:text-[#2563eb]"
              >
                <FaGithub size={14} />
                View on GitHub
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-[#e2e8f0] px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#94a3b8]">© 2026 Smart Mess System. All rights reserved.</p>
          <p className="text-xs text-[#94a3b8] flex items-center gap-1">
            Made with <Heart size={11} color="#ef4444" fill="#ef4444" /> by Aditya Yadav
          </p>
        </div>
      </div>

    </footer>
  );
};
