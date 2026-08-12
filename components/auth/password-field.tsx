'use client';

import { useId, useState } from 'react';
import { Check, Eye, EyeOff, ShieldCheck, X } from 'lucide-react';
import { PASSWORD_RULES } from '@/lib/auth/password';

type PasswordFieldProps = {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  placeholder?: string;
  /** Hides the checklist until the user starts typing. */
  showChecklist?: boolean;
};

export function PasswordField({
  value,
  onChange,
  label = 'Create a password',
  placeholder = 'At least 8 characters',
  showChecklist = true,
}: PasswordFieldProps) {
  const inputId = useId();
  const [visible, setVisible] = useState(false);
  const [touched, setTouched] = useState(false);

  const checklistVisible = showChecklist && (touched || value.length > 0);

  return (
    <div className="text-sm">
      <label htmlFor={inputId} className="mb-2 block font-semibold text-slate-700">
        {label}
      </label>
      <div className="relative">
        <ShieldCheck className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3.5 pl-12 pr-12 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onFocus={() => setTouched(true)}
          placeholder={placeholder}
          autoComplete="new-password"
          required
        />
        <button
          type="button"
          onClick={() => setVisible((current) => !current)}
          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      {checklistVisible ? (
        <ul className="mt-3 grid gap-1.5 rounded-2xl bg-slate-50 p-3.5 sm:grid-cols-2">
          {PASSWORD_RULES.map((rule) => {
            const passed = rule.test(value);
            return (
              <li
                key={rule.id}
                className={`flex items-center gap-2 text-xs ${passed ? 'text-emerald-700' : 'text-slate-500'}`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
                    passed ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-400'
                  }`}
                >
                  {passed ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                </span>
                {rule.label}
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
