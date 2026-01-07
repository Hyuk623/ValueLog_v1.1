
import React, { useState } from 'react';
import { ExperienceEntry, Language } from '../types';
import { Calendar, ChevronDown, ChevronUp, Star, Copy, Check, Image as ImageIcon } from 'lucide-react';
import { translations } from '../i18n';

interface ExperienceCardProps {
  entry: ExperienceEntry;
  lang: Language;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ entry, lang }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[lang];

  const handleCopy = () => {
    const text = `
Experience: ${entry.title}
Date: ${entry.date}
Satisfaction: ${entry.satisfaction}/5

Situation: ${entry.starr.situation}
Task: ${entry.starr.task}
Action: ${entry.starr.action}
Result: ${entry.starr.result}
Reflection: ${entry.starr.reflection}

Tags: ${[...entry.activityTags, ...entry.competencyTags].join(', ')}
    `.trim();
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getTagLabel = (key: string) => (t.tags as any)[key] || key;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden mb-4 transition-all">
      {/* Visual Header Image if available */}
      {entry.image && !isExpanded && (
        <div className="w-full h-32 overflow-hidden border-b border-slate-50">
          <img src={entry.image} alt={entry.title} className="w-full h-full object-cover opacity-90" />
        </div>
      )}

      <div className="p-4" onClick={() => setIsExpanded(!isExpanded)}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-800 text-lg flex-1 mr-2">{entry.title}</h3>
          <div className="flex text-amber-400 flex-shrink-0">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={14}
                fill={i < entry.satisfaction ? 'currentColor' : 'none'}
              />
            ))}
          </div>
        </div>
        
        <div className="flex items-center text-slate-500 text-sm mb-3">
          <Calendar size={14} className="mr-1" />
          <span className="mr-3">{entry.date}</span>
          {entry.image && <ImageIcon size={14} className="text-blue-400" />}
        </div>

        <div className="flex flex-wrap gap-1.5 mb-2">
          {entry.activityTags.map(tag => (
            <span key={tag} className="bg-blue-50 text-blue-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {getTagLabel(tag)}
            </span>
          ))}
          {entry.competencyTags.map(tag => (
            <span key={tag} className="bg-indigo-50 text-indigo-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
              {getTagLabel(tag)}
            </span>
          ))}
        </div>

        <div className="flex justify-center text-slate-400 mt-2">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-2 border-t border-slate-50 bg-slate-50/50">
          {entry.image && (
            <div className="mb-4 rounded-lg overflow-hidden border border-slate-200 shadow-inner">
               <img src={entry.image} alt={entry.title} className="w-full max-h-64 object-contain bg-white" />
            </div>
          )}

          <div className="space-y-4 text-sm text-slate-700">
            <div>
              <p className="font-bold text-xs text-blue-600 uppercase mb-1">Situation</p>
              <p>{entry.starr.situation}</p>
            </div>
            <div>
              <p className="font-bold text-xs text-blue-600 uppercase mb-1">Task</p>
              <p>{entry.starr.task}</p>
            </div>
            <div>
              <p className="font-bold text-xs text-blue-600 uppercase mb-1">Action</p>
              <p>{entry.starr.action}</p>
            </div>
            <div>
              <p className="font-bold text-xs text-blue-600 uppercase mb-1">Result</p>
              <p>{entry.starr.result}</p>
            </div>
            <div>
              <p className="font-bold text-xs text-blue-600 uppercase mb-1">Reflection</p>
              <p>{entry.starr.reflection}</p>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              handleCopy();
            }}
            className="mt-6 w-full flex items-center justify-center space-x-2 py-2 bg-white border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors text-sm font-medium"
          >
            {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
            <span>{copied ? t.copied : t.copy_portfolio}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default ExperienceCard;
