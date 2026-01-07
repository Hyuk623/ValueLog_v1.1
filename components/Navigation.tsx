
import React from 'react';
import { LayoutDashboard, History, PlusCircle, Users } from 'lucide-react';
import { AppTab, Language } from '../types';
import { translations } from '../i18n';

interface NavigationProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  lang: Language;
}

const Navigation: React.FC<NavigationProps> = ({ activeTab, onTabChange, lang }) => {
  const t = translations[lang];
  const tabs = [
    { id: AppTab.DASHBOARD, label: t.tab_stats, icon: LayoutDashboard },
    { id: AppTab.TIMELINE, label: t.tab_timeline, icon: History },
    { id: AppTab.CREATE, label: t.tab_record, icon: PlusCircle },
    { id: AppTab.PROFILES, label: t.tab_profiles, icon: Users },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center py-3 px-2 z-50">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              isActive ? 'text-blue-600' : 'text-slate-400'
            }`}
          >
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

export default Navigation;
