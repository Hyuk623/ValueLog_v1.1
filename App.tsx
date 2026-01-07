
import React, { useState, useEffect, useMemo } from 'react';
import { AppTab, Child, ExperienceEntry, STARR, Language } from './types';
import { storage } from './services/storage';
import { ACTIVITY_TAGS, COMPETENCY_TAGS } from './constants';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Plus, Wand2, Star, Save, Loader2, UserPlus, Trash2, CheckCircle2 } from 'lucide-react';
import Header from './components/Header';
import Navigation from './components/Navigation';
import ExperienceCard from './components/ExperienceCard';
import { refineToSTARR, suggestTags } from './services/gemini';
import { translations } from './i18n';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>(AppTab.TIMELINE);
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChild, setSelectedChild] = useState<Child | null>(null);
  const [entries, setEntries] = useState<ExperienceEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lang, setLang] = useState<Language>('en');

  // Custom Tags State
  const [customActivityTags, setCustomActivityTags] = useState<string[]>([]);
  const [customCompetencyTags, setCustomCompetencyTags] = useState<string[]>([]);
  const [newActivityInput, setNewActivityInput] = useState('');
  const [newCompInput, setNewCompInput] = useState('');

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formRawNotes, setFormRawNotes] = useState('');
  const [formSTARR, setFormSTARR] = useState<STARR>({
    situation: '', task: '', action: '', result: '', reflection: ''
  });
  const [formActivityTags, setFormActivityTags] = useState<string[]>([]);
  const [formCompetencyTags, setFormCompetencyTags] = useState<string[]>([]);
  const [formSatisfaction, setFormSatisfaction] = useState(5);

  const t = translations[lang];

  useEffect(() => {
    const loadedChildren = storage.getChildren();
    const loadedEntries = storage.getEntries();
    const savedLang = storage.getLanguage();
    const loadedCustomAct = storage.getCustomActivityTags();
    const loadedCustomComp = storage.getCustomCompetencyTags();

    setChildren(loadedChildren);
    setEntries(loadedEntries);
    setLang(savedLang);
    setCustomActivityTags(loadedCustomAct);
    setCustomCompetencyTags(loadedCustomComp);

    const lastChildId = storage.getSelectedChildId();
    if (lastChildId) {
      const found = loadedChildren.find(c => c.id === lastChildId);
      if (found) setSelectedChild(found);
      else if (loadedChildren.length > 0) setSelectedChild(loadedChildren[0]);
    } else if (loadedChildren.length > 0) {
      setSelectedChild(loadedChildren[0]);
    }
  }, []);

  const handleSelectChild = (child: Child) => {
    setSelectedChild(child);
    storage.setSelectedChildId(child.id);
  };

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    storage.setLanguage(newLang);
  };

  const filteredEntries = useMemo(() => {
    return entries
      .filter(e => e.childId === selectedChild?.id)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [entries, selectedChild]);

  const allActivityTags = useMemo(() => [...ACTIVITY_TAGS, ...customActivityTags], [customActivityTags]);
  const allCompetencyTags = useMemo(() => [...COMPETENCY_TAGS, ...customCompetencyTags], [customCompetencyTags]);

  const dashboardData = useMemo(() => {
    const activityMap: Record<string, number> = {};
    const competencyMap: Record<string, number> = {};
    let totalSatis = 0;

    filteredEntries.forEach(e => {
      e.activityTags.forEach(tagKey => {
        const label = (t.tags as any)[tagKey] || tagKey;
        activityMap[label] = (activityMap[label] || 0) + 1;
      });
      e.competencyTags.forEach(tagKey => {
        const label = (t.tags as any)[tagKey] || tagKey;
        competencyMap[label] = (competencyMap[label] || 0) + 1;
      });
      totalSatis += e.satisfaction;
    });

    return {
      activities: Object.entries(activityMap).map(([name, value]) => ({ name, value })),
      competencies: Object.entries(competencyMap).map(([name, value]) => ({ name, value })),
      avgSatisfaction: filteredEntries.length ? (totalSatis / filteredEntries.length).toFixed(1) : 0,
      totalEntries: filteredEntries.length
    };
  }, [filteredEntries, t]);

  const handleAISuggest = async () => {
    if (!formRawNotes.trim()) return;
    setIsLoading(true);
    try {
      const refined = await refineToSTARR(formRawNotes, lang);
      setFormSTARR(refined);
      const suggestions = await suggestTags(refined);
      setFormActivityTags(suggestions.activityTags);
      setFormCompetencyTags(suggestions.competencyTags);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveEntry = () => {
    if (!selectedChild || !formTitle) return;

    const newEntry: ExperienceEntry = {
      id: crypto.randomUUID(),
      childId: selectedChild.id,
      title: formTitle,
      date: formDate,
      starr: formSTARR,
      activityTags: formActivityTags,
      competencyTags: formCompetencyTags,
      satisfaction: formSatisfaction
    };

    const updated = [...entries, newEntry];
    setEntries(updated);
    storage.saveEntries(updated);
    
    // Reset Form
    setFormTitle('');
    setFormRawNotes('');
    setFormSTARR({ situation: '', task: '', action: '', result: '', reflection: '' });
    setFormActivityTags([]);
    setFormCompetencyTags([]);
    setActiveTab(AppTab.TIMELINE);
  };

  const handleAddChild = () => {
    const name = prompt(t.child_name_prompt);
    if (!name) return;
    const newChild: Child = {
      id: crypto.randomUUID(),
      name,
      avatar: `https://picsum.photos/seed/${name}/200`
    };
    const updated = [...children, newChild];
    setChildren(updated);
    storage.saveChildren(updated);
    setSelectedChild(newChild);
    storage.setSelectedChildId(newChild.id);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm(t.delete_confirm)) {
      const updated = entries.filter(e => e.id !== id);
      setEntries(updated);
      storage.saveEntries(updated);
    }
  };

  const addCustomActivityTag = () => {
    const trimmed = newActivityInput.trim();
    if (trimmed && !allActivityTags.includes(trimmed)) {
      const updated = [...customActivityTags, trimmed];
      setCustomActivityTags(updated);
      storage.saveCustomActivityTags(updated);
      setFormActivityTags(prev => [...prev, trimmed]);
      setNewActivityInput('');
    }
  };

  const addCustomCompTag = () => {
    const trimmed = newCompInput.trim();
    if (trimmed && !allCompetencyTags.includes(trimmed)) {
      const updated = [...customCompetencyTags, trimmed];
      setCustomCompetencyTags(updated);
      storage.saveCustomCompetencyTags(updated);
      setFormCompetencyTags(prev => [...prev, trimmed]);
      setNewCompInput('');
    }
  };

  const getTagLabel = (key: string) => (t.tags as any)[key] || key;

  return (
    <div className="min-h-screen pb-24 bg-slate-50">
      <Header
        children={children}
        selectedChild={selectedChild}
        onSelectChild={handleSelectChild}
        currentLang={lang}
        onLangChange={handleLangChange}
      />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {activeTab === AppTab.DASHBOARD && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
                <span className="text-2xl font-black text-blue-600">{dashboardData.totalEntries}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">{t.total_logs}</span>
              </div>
              <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-center items-center">
                <span className="text-2xl font-black text-amber-500">{dashboardData.avgSatisfaction}</span>
                <span className="text-xs font-bold text-slate-400 uppercase">{t.avg_rating}</span>
              </div>
            </div>

            {dashboardData.totalEntries > 0 ? (
              <>
                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">{t.activity_dist}</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.activities} layout="vertical" margin={{ left: -10, right: 20 }}>
                        <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                        <XAxis type="number" hide />
                        <YAxis dataKey="name" type="category" width={100} style={{ fontSize: '12px', fontWeight: 600 }} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                          {dashboardData.activities.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={['#3b82f6', '#6366f1', '#8b5cf6', '#ec4899'][index % 4]} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase tracking-wider">{t.core_comp}</h3>
                  <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={dashboardData.competencies}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="name" style={{ fontSize: '10px' }} interval={0} angle={-45} textAnchor="end" height={60} />
                        <YAxis style={{ fontSize: '12px' }} />
                        <Tooltip />
                        <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white p-12 rounded-2xl shadow-sm border border-slate-100 text-center">
                <p className="text-slate-400">{t.no_logs}</p>
                <button 
                  onClick={() => setActiveTab(AppTab.CREATE)}
                  className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                >
                  {t.get_started}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === AppTab.TIMELINE && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold text-slate-800">{t.exp_timeline}</h2>
              <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-full font-bold">
                {filteredEntries.length} {t.records}
              </span>
            </div>
            {filteredEntries.map(entry => (
              <div key={entry.id} className="relative group">
                <ExperienceCard entry={entry} lang={lang} />
                <button
                  onClick={() => handleDeleteEntry(entry.id)}
                  className="absolute -top-2 -right-2 p-1 bg-white border border-slate-200 rounded-full text-red-500 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            {filteredEntries.length === 0 && (
              <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
                <p className="text-slate-400 px-4">{t.empty_timeline}</p>
              </div>
            )}
          </div>
        )}

        {activeTab === AppTab.CREATE && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h2 className="text-xl font-bold text-slate-800 mb-6">{t.new_log}</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.activity_title}</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={e => setFormTitle(e.target.value)}
                    placeholder={t.placeholder_title}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.date}</label>
                    <input
                      type="date"
                      value={formDate}
                      onChange={e => setFormDate(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">{t.satisfaction}</label>
                    <div className="flex space-x-1 py-3 justify-center bg-slate-50 border border-slate-200 rounded-xl">
                      {[1, 2, 3, 4, 5].map(star => (
                        <button key={star} onClick={() => setFormSatisfaction(star)}>
                          <Star
                            size={20}
                            className={star <= formSatisfaction ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex justify-between">
                    {t.raw_notes}
                    <span className="text-[10px] lowercase font-normal italic">{t.raw_notes_sub}</span>
                  </label>
                  <textarea
                    value={formRawNotes}
                    onChange={e => setFormRawNotes(e.target.value)}
                    rows={3}
                    placeholder={t.placeholder_notes}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                  <button
                    onClick={handleAISuggest}
                    disabled={isLoading || !formRawNotes}
                    className="mt-2 flex items-center justify-center space-x-2 w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm shadow-md shadow-blue-100 disabled:opacity-50"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                    <span>{isLoading ? t.ai_processing : t.ai_refine}</span>
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-4">
                  <h3 className="font-bold text-slate-800 flex items-center space-x-2">
                    <span className="bg-blue-100 text-blue-700 w-6 h-6 rounded-full inline-flex items-center justify-center text-xs">STARR</span>
                    <span>{t.starr_framework}</span>
                  </h3>
                  
                  {Object.keys(formSTARR).map((key) => (
                    <div key={key}>
                      <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{key}</label>
                      <textarea
                        value={(formSTARR as any)[key]}
                        onChange={e => setFormSTARR({ ...formSTARR, [key]: e.target.value })}
                        rows={2}
                        placeholder={(t.starr_placeholders as any)[key]}
                        className="w-full px-4 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400 outline-none text-sm placeholder:text-slate-300"
                      />
                    </div>
                  ))}
                </div>

                <div className="pt-4 space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t.activity_tags}</label>
                    <div className="flex flex-wrap gap-2">
                      {allActivityTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFormActivityTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            formActivityTags.includes(tag) 
                              ? 'bg-blue-600 text-white shadow-sm' 
                              : 'bg-white border border-slate-200 text-slate-500'
                          }`}
                        >
                          {getTagLabel(tag)}
                        </button>
                      ))}
                      {/* Add Custom Activity Tag Input */}
                      <div className="flex items-center bg-slate-50 border border-dashed border-slate-300 rounded-full px-2 py-0.5">
                        <input
                          type="text"
                          value={newActivityInput}
                          onChange={e => setNewActivityInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCustomActivityTag()}
                          placeholder={t.tag_placeholder}
                          className="bg-transparent border-none outline-none text-[10px] w-16 px-1"
                        />
                        <button onClick={addCustomActivityTag} className="text-blue-500 p-0.5 hover:bg-blue-50 rounded-full transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-2">{t.comp_tags}</label>
                    <div className="flex flex-wrap gap-2">
                      {allCompetencyTags.map(tag => (
                        <button
                          key={tag}
                          onClick={() => setFormCompetencyTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                            formCompetencyTags.includes(tag) 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-white border border-slate-200 text-slate-500'
                          }`}
                        >
                          {getTagLabel(tag)}
                        </button>
                      ))}
                      {/* Add Custom Competency Tag Input */}
                      <div className="flex items-center bg-slate-50 border border-dashed border-slate-300 rounded-full px-2 py-0.5">
                        <input
                          type="text"
                          value={newCompInput}
                          onChange={e => setNewCompInput(e.target.value)}
                          onKeyDown={e => e.key === 'Enter' && addCustomCompTag()}
                          placeholder={t.tag_placeholder}
                          className="bg-transparent border-none outline-none text-[10px] w-16 px-1"
                        />
                        <button onClick={addCustomCompTag} className="text-indigo-500 p-0.5 hover:bg-indigo-50 rounded-full transition-colors">
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSaveEntry}
                  disabled={!formTitle || !selectedChild}
                  className="mt-6 flex items-center justify-center space-x-2 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-black transition-all disabled:bg-slate-300"
                >
                  <Save size={20} />
                  <span>{t.save_record}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === AppTab.PROFILES && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-slate-800">{t.family_members}</h2>
              <button 
                onClick={handleAddChild}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm"
              >
                <UserPlus size={16} />
                <span>{t.add_child}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {children.map(child => (
                <div 
                  key={child.id}
                  className={`bg-white p-5 rounded-2xl shadow-sm border flex items-center space-x-4 transition-all ${
                    selectedChild?.id === child.id ? 'border-blue-600 ring-1 ring-blue-600' : 'border-slate-100'
                  }`}
                  onClick={() => handleSelectChild(child)}
                >
                  <img src={child.avatar} alt={child.name} className="w-16 h-16 rounded-full object-cover border-2 border-slate-50" />
                  <div className="flex-1">
                    <h3 className="font-bold text-slate-800">{child.name}</h3>
                    <p className="text-xs text-slate-400">
                      {entries.filter(e => e.childId === child.id).length} {t.records}
                    </p>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-slate-200 flex items-center justify-center">
                    {selectedChild?.id === child.id && <div className="w-2 h-2 bg-blue-600 rounded-full" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-indigo-50 p-6 rounded-2xl border border-indigo-100">
              <h4 className="font-bold text-indigo-900 mb-2">{t.pro_tip}</h4>
              <p className="text-sm text-indigo-700 leading-relaxed">
                {t.pro_tip_desc}
              </p>
            </div>
          </div>
        )}
      </main>

      <Navigation activeTab={activeTab} onTabChange={setActiveTab} lang={lang} />
    </div>
  );
};

export default App;
