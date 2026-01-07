
import React, { useState } from 'react';
import { Child, Language, User } from '../types';
import { Sparkles, Globe, LogOut } from 'lucide-react';
import { translations } from '../i18n';

interface HeaderProps {
  children: Child[];
  selectedChild: Child | null;
  onSelectChild: (child: Child) => void;
  currentLang: Language;
  onLangChange: (lang: Language) => void;
  user: User | null;
  onLogout: () => void;
}

const Header: React.FC<HeaderProps> = ({ children, selectedChild, onSelectChild, currentLang, onLangChange, user, onLogout }) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const t = translations[currentLang];

  const languages: { code: Language; label: string }[] = [
    { code: 'en', label: 'English' },
    { code: 'ko', label: '한국어' },
    { code: 'ja', label: '日本語' },
    { code: 'es', label: 'Español' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="bg-blue-600 p-1.5 rounded-lg shadow-blue-200 shadow-lg">
            <Sparkles size={20} className="text-white" />
          </div>
          <h1 className="hidden sm:block text-xl font-bold text-slate-900 tracking-tight">ValueLog</h1>
        </div>

        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={onLogout}
            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all"
            title={t.logout}
          >
            <LogOut size={18} />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors"
            >
              <Globe size={18} />
            </button>
            
            {showLangMenu && (
              <div className="absolute right-0 mt-2 w-32 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      onLangChange(lang.code);
                      setShowLangMenu(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-slate-50 ${
                      currentLang === lang.code ? 'text-blue-600 font-bold bg-blue-50/50' : 'text-slate-600'
                    }`}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 no-scrollbar max-w-[100px] sm:max-w-none">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => onSelectChild(child)}
                className={`flex-shrink-0 relative group transition-all duration-300 ${
                  selectedChild?.id === child.id ? 'scale-110' : 'opacity-60 grayscale'
                }`}
              >
                <img
                  src={child.avatar}
                  alt={child.name}
                  className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-colors ${
                    selectedChild?.id === child.id ? 'border-blue-600' : 'border-transparent'
                  }`}
                />
                {selectedChild?.id === child.id && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
