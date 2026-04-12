import { UtensilsCrossed, Mail, Heart } from 'lucide-react';
import { FaLinkedin, FaGithub } from 'react-icons/fa';

export const Footer = ({ show, onNavigate }) => {
  if (!show) return null;

  const links = [
    { label: 'Home', view: 'home' },
    { label: 'Menu', view: 'menu' },
    { label: 'Polls', view: 'polls' },
    { label: 'Results', view: 'results' },
    { label: 'About', view: 'about' },
  ];

  return (
    <footer
      className="w-full mt-auto border-t lg:pl-64"
      style={{ backgroundColor: '#0D1526', borderColor: '#1E3A5F' }}
    >
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#3B82F6' }}>
                <UtensilsCrossed size={16} color="white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">Smart Mess</p>
                <p className="text-xs" style={{ color: '#64748B' }}>Student Initiative</p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: '#64748B' }}>
              A student-led platform to improve hostel dining through transparent feedback and real-time ratings.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Quick Links</p>
            <ul className="space-y-2">
              {links.map(({ label, view }) => (
                <li key={label}>
                  <button
                    onClick={() => onNavigate?.(view)}
                    className="text-sm transition-colors hover:text-white text-left cursor-pointer"
                    style={{ color: '#94A3B8' }}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Developer */}
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest mb-4" style={{ color: '#64748B' }}>Developer</p>
            <div className="space-y-3">
              <a href="https://www.linkedin.com/in/adityayadav25/" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#94A3B8' }}>
                <FaLinkedin size={15} /> Aditya Yadav
              </a>
              <a href="mailto:mess@hostel.edu"
                className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#94A3B8' }}>
                <Mail size={15} /> adityaayadav@gmail.com
              </a>
              <a href="https://github.com" target="_blank" rel="noreferrer"
                className="flex items-center gap-2 text-sm transition-colors hover:text-white" style={{ color: '#94A3B8' }}>
                <FaGithub size={15} /> View on GitHub
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t px-6 py-4" style={{ borderColor: '#1E3A5F' }}>
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs" style={{ color: '#475569' }}>© 2026 Smart Mess System. All rights reserved.</p>
          <p className="text-xs flex items-center gap-1" style={{ color: '#475569' }}>
            Made with <Heart size={11} color="#EF4444" fill="#EF4444" /> by Aditya Yadav
          </p>
        </div>
      </div>
    </footer>
  );
};