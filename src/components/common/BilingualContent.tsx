import React from 'react';
import { CheckCircle2 } from 'lucide-react';

interface BilingualTextProps {
  en: string;
  hi?: string;
  isHindi: boolean;
  className?: string;
  primaryClassName?: string;
  secondaryClassName?: string;
  as?: 'p' | 'span' | 'div';
}

export const BilingualText: React.FC<BilingualTextProps> = ({
  en,
  hi,
  isHindi,
  className = '',
  primaryClassName = 'text-slate-900 font-medium',
  secondaryClassName = 'text-slate-500 font-normal mt-0.5',
  as: Component = 'div',
}) => {
  if (!hi || hi.trim() === en.trim()) {
    return <Component className={`${primaryClassName} ${className}`}>{en}</Component>;
  }

  const primary = isHindi ? hi : en;
  const secondary = isHindi ? en : hi;

  return (
    <Component className={`flex flex-col ${className}`}>
      <span className={primaryClassName}>{primary}</span>
      <span className={secondaryClassName}>{secondary}</span>
    </Component>
  );
};

interface BilingualHeadingProps {
  en: string;
  hi: string;
  isHindi: boolean;
  className?: string;
}

export const BilingualHeading: React.FC<BilingualHeadingProps> = ({
  en,
  hi,
  isHindi,
  className = '',
}) => {
  const primary = isHindi ? hi : en;
  const secondary = isHindi ? en : hi;

  return (
    <div className={`space-y-0.5 ${className}`}>
      <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] sm:text-xs text-blue-900 leading-tight">
        {primary}
      </h4>
      <div className="text-[10px] sm:text-[11px] font-semibold text-blue-700/80 normal-case leading-tight">
        {secondary}
      </div>
    </div>
  );
};

interface BilingualListProps {
  enItems: string[];
  hiItems?: string[];
  isHindi: boolean;
  icon?: 'dot' | 'check';
  className?: string;
}

export const BilingualList: React.FC<BilingualListProps> = ({
  enItems,
  hiItems = [],
  isHindi,
  icon = 'dot',
  className = '',
}) => {
  return (
    <ul className={`space-y-2 text-xs ${className}`}>
      {enItems.map((enText, i) => {
        const hiText = hiItems[i] || '';
        const primary = isHindi && hiText ? hiText : enText;
        const secondary = isHindi ? enText : hiText;

        return (
          <li key={i} className="flex items-start gap-2">
            {icon === 'check' ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <span className="text-blue-600 font-bold shrink-0 mt-0.5">·</span>
            )}
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 font-medium leading-relaxed">{primary}</div>
              {secondary && secondary !== primary && (
                <div className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{secondary}</div>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
};

interface BilingualStepsProps {
  enSteps: string[];
  hiSteps?: string[];
  isHindi: boolean;
  className?: string;
}

export const BilingualSteps: React.FC<BilingualStepsProps> = ({
  enSteps,
  hiSteps = [],
  isHindi,
  className = '',
}) => {
  return (
    <ol className={`space-y-3 text-xs ${className}`}>
      {enSteps.map((enStep, i) => {
        const hiStep = hiSteps[i] || '';
        const primary = isHindi && hiStep ? hiStep : enStep;
        const secondary = isHindi ? enStep : hiStep;

        return (
          <li key={i} className="flex items-start gap-2.5">
            <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-800 font-bold flex items-center justify-center shrink-0 text-[10px] mt-0.5">
              {i + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="text-slate-800 font-medium leading-relaxed">{primary}</div>
              {secondary && secondary !== primary && (
                <div className="text-slate-500 text-[11px] leading-relaxed mt-0.5">{secondary}</div>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
};
