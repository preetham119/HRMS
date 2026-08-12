'use client';

import { useEffect, useState } from 'react';
import { AppraisalStatusBadge } from '@/components/performance/appraisal-status-badge';
import { StarRating } from '@/components/performance/star-rating';
import { ratingLabel } from '@/lib/appraisal/ratings';
import { getAppraisalBundle, getAppraisalState, listManagerCompleted, listManagerPending, saveManagerReview } from '@/lib/appraisal/store';
import type { AppraisalActor, ScoreEntry } from '@/lib/appraisal/types';

type ReviewForm = { goalRatings: ScoreEntry[]; competencyRatings: ScoreEntry[]; comments: string; developmentPlan: string; trainingRecommendation: string; recommendPromotion: boolean; recommendIncrement: boolean };
const emptyForm = (): ReviewForm => ({ goalRatings: [], competencyRatings: [], comments: '', developmentPlan: '', trainingRecommendation: '', recommendPromotion: false, recommendIncrement: false });

export function ManagerPerformance({ actor }: { actor: AppraisalActor }) {
  const [active, setActive] = useState<'pending' | 'completed'>('pending');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [form, setForm] = useState<ReviewForm>(emptyForm);
  const [version, setVersion] = useState(0);
  const [message, setMessage] = useState('');
  const state = getAppraisalState();
  const queue = active === 'pending' ? listManagerPending(actor.employeeId, state) : listManagerCompleted(actor.employeeId, state);
  const bundle = selectedId ? getAppraisalBundle(selectedId, state) : null;
  const pick = (id: string) => {
    const existing = getAppraisalState().managerReviews.find((item) => item.appraisalId === id);
    setSelectedId(id);
    setForm(existing ? { ...existing } : emptyForm());
  };
  useEffect(() => {
    if (queue.length && !queue.some((item) => item.id === selectedId)) pick(queue[0].id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, version]);
  const rate = (key: 'goalRatings' | 'competencyRatings', referenceId: string, score: number) => setForm((current) => ({ ...current, [key]: [...current[key].filter((item) => item.referenceId !== referenceId), { referenceId, score }] }));
  const save = (submit: boolean) => {
    if (!bundle) return;
    try { saveManagerReview(actor, bundle.appraisal.id, { ...form, status: 'draft', submit }); setMessage(submit ? 'Manager review sent to admin.' : 'Manager review draft saved.'); setVersion((v) => v + 1); }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save review.'); }
  };
  return <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
    <aside className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><div className="flex gap-2 border-b border-slate-200 pb-3"><button onClick={() => setActive('pending')} className={`text-sm font-semibold ${active === 'pending' ? 'text-slate-900' : 'text-slate-400'}`}>Pending ({listManagerPending(actor.employeeId, state).length})</button><button onClick={() => setActive('completed')} className={`text-sm font-semibold ${active === 'completed' ? 'text-slate-900' : 'text-slate-400'}`}>Completed</button></div><div className="mt-4 space-y-2">{queue.map((item) => <button key={item.id} onClick={() => pick(item.id)} className={`w-full rounded-xl border p-3 text-left ${selectedId === item.id ? 'border-slate-900 bg-slate-50' : 'border-slate-200'}`}><p className="text-sm font-semibold text-slate-800">{item.employeeName}</p><p className="mt-1 text-xs text-slate-500">{item.designation}</p><div className="mt-2"><AppraisalStatusBadge status={item.status} /></div></button>)}{!queue.length && <p className="py-6 text-sm text-slate-500">No appraisals in this list.</p>}</div></aside>
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">{!bundle ? <p className="text-sm text-slate-500">Select an appraisal to review.</p> : <><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-xl font-semibold text-slate-900">{bundle.appraisal.employeeName}</h2><p className="text-sm text-slate-500">{bundle.appraisal.department} · {bundle.appraisal.designation}</p></div><AppraisalStatusBadge status={bundle.appraisal.status} /></div><div className="mt-5 grid gap-3 md:grid-cols-3">{[['Achievements', bundle.appraisal.achievements], ['Challenges', bundle.appraisal.challenges], ['Self feedback', bundle.appraisal.selfFeedback]].map(([label, value]) => <div key={label} className="rounded-xl bg-slate-50 p-3"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p><p className="mt-2 text-sm text-slate-700">{value || 'Not provided'}</p></div>)}</div>
      <div className="mt-6 grid gap-4"><h3 className="font-semibold text-slate-900">Review ratings</h3>{bundle.goals.map((goal) => <RatingRow key={goal.id} label={`${goal.name} (${goal.weightage}%)`} value={form.goalRatings.find((r) => r.referenceId === goal.id)?.score ?? null} onChange={(score) => rate('goalRatings', goal.id, score)} />)}{bundle.competencies.filter((item) => !item.isLeadershipOnly).map((competency) => <RatingRow key={competency.id} label={competency.name} value={form.competencyRatings.find((r) => r.referenceId === competency.id)?.score ?? null} onChange={(score) => rate('competencyRatings', competency.id, score)} />)}</div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">{(['comments', 'developmentPlan', 'trainingRecommendation'] as const).map((field) => <label key={field} className="grid gap-1.5 text-sm font-medium capitalize text-slate-700">{field.replace(/([A-Z])/g, ' $1')}<textarea value={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.value })} className="min-h-24 rounded-xl border border-slate-200 p-3 font-normal outline-none focus:border-slate-500" /></label>)}</div><div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-700">{(['recommendPromotion', 'recommendIncrement'] as const).map((field) => <label key={field} className="flex items-center gap-2"><input type="checkbox" checked={form[field]} onChange={(e) => setForm({ ...form, [field]: e.target.checked })} />{field === 'recommendPromotion' ? 'Recommend promotion' : 'Recommend increment'}</label>)}</div>{message && <p className="mt-4 text-sm text-slate-600">{message}</p>}<div className="mt-5 flex gap-3"><button onClick={() => save(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold">Save draft</button><button onClick={() => save(true)} disabled={bundle.appraisal.status !== 'under_manager_review'} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40">Submit review</button></div></>}</section>
  </div>;
}
function RatingRow({ label, value, onChange }: { label: string; value: number | null; onChange: (score: number) => void }) { return <div className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 p-3"><span className="text-sm font-medium text-slate-700">{label}</span><div className="text-right"><StarRating value={value} onChange={onChange} size="sm" /><p className="text-xs text-slate-500">{ratingLabel(value)}</p></div></div>; }
