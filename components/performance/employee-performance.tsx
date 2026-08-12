'use client';

import { useEffect, useState } from 'react';
import { AppraisalStatusBadge } from '@/components/performance/appraisal-status-badge';
import { StarRating } from '@/components/performance/star-rating';
import { WorkflowBar } from '@/components/performance/workflow-bar';
import { ratingLabel } from '@/lib/appraisal/ratings';
import { getAppraisalState, getOpenCycle, getOrCreateSelfAppraisal, listGoalsForEmployee, saveSelfAppraisal } from '@/lib/appraisal/store';
import type { AppraisalActor, SelfAppraisal } from '@/lib/appraisal/types';

export function EmployeePerformance({ actor }: { actor: AppraisalActor }) {
  const [appraisal, setAppraisal] = useState<SelfAppraisal | null>(null);
  const [state, setState] = useState(() => getAppraisalState());
  const [message, setMessage] = useState('');
  const refresh = () => {
    const next = getAppraisalState();
    setState(next);
    setAppraisal(getOrCreateSelfAppraisal(actor, next).appraisal);
  };
  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actor.employeeId]);

  const goals = listGoalsForEmployee(actor.employeeId, state);
  const cycle = getOpenCycle(state);
  const editable = appraisal?.status === 'draft' || appraisal?.status === 'returned';
  const setRating = (key: 'competencyRatings' | 'goalRatings', referenceId: string, score: number) => {
    setAppraisal((current) => current ? { ...current, [key]: [...current[key].filter((entry) => entry.referenceId !== referenceId), { referenceId, score }] } : current);
  };
  const save = (submit: boolean) => {
    if (!appraisal) return;
    try {
      saveSelfAppraisal(actor, { achievements: appraisal.achievements, challenges: appraisal.challenges, selfFeedback: appraisal.selfFeedback, selfRating: appraisal.selfRating, competencyRatings: appraisal.competencyRatings, goalRatings: appraisal.goalRatings, submit });
      setMessage(submit ? 'Self appraisal submitted for manager review.' : 'Draft saved.');
      refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to save appraisal.'); }
  };

  if (!appraisal) return <section className="rounded-[28px] border border-slate-200 bg-white p-6 text-sm text-slate-500">No appraisal cycle is available.</section>;
  return <div className="space-y-6">
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-semibold text-slate-900">{cycle?.name ?? 'Current cycle'}</h2><p className="mt-1 text-sm text-slate-500">{cycle?.description}</p></div><AppraisalStatusBadge status={appraisal.status} /></div>
      <div className="mt-5"><WorkflowBar status={appraisal.status} /></div>
    </section>
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Goals</h2>
      <div className="mt-4 grid gap-3">{goals.map((goal) => <div key={goal.id} className="rounded-2xl border border-slate-200 p-4"><div className="flex flex-wrap items-center justify-between gap-2"><div><p className="font-semibold text-slate-800">{goal.name}</p><p className="mt-1 text-xs text-slate-500">{goal.kpi} · {goal.weightage}% weight · {goal.progress}% progress</p></div><StarRating value={appraisal.goalRatings.find((r) => r.referenceId === goal.id)?.score ?? null} onChange={(score) => setRating('goalRatings', goal.id, score)} readOnly={!editable} size="sm" /></div></div>)}</div>
    </section>
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">Self appraisal</h2><span className="text-xs font-medium text-slate-500">{ratingLabel(appraisal.selfRating)}</span></div>
      {!editable && <p className="mt-3 rounded-xl bg-slate-100 px-3 py-2 text-sm text-slate-600">This appraisal is locked while it moves through review.</p>}
      <div className="mt-5 grid gap-4">
        {(['achievements', 'challenges', 'selfFeedback'] as const).map((field) => <label key={field} className="grid gap-1.5 text-sm font-medium capitalize text-slate-700">{field === 'selfFeedback' ? 'Self feedback' : field}<textarea disabled={!editable} value={appraisal[field]} onChange={(e) => setAppraisal({ ...appraisal, [field]: e.target.value })} className="min-h-24 rounded-xl border border-slate-200 px-3 py-2 text-sm font-normal outline-none focus:border-slate-500 disabled:bg-slate-50" /></label>)}
        <div><p className="mb-2 text-sm font-medium text-slate-700">Overall self rating</p><StarRating value={appraisal.selfRating} onChange={(selfRating) => setAppraisal({ ...appraisal, selfRating })} readOnly={!editable} /></div>
        <div className="grid gap-3 md:grid-cols-2">{state.competencies.filter((competency) => !competency.isLeadershipOnly).map((competency) => <div key={competency.id} className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 p-3"><div><p className="text-sm font-semibold text-slate-800">{competency.name}</p><p className="text-xs text-slate-500">{competency.description}</p></div><StarRating value={appraisal.competencyRatings.find((r) => r.referenceId === competency.id)?.score ?? null} onChange={(score) => setRating('competencyRatings', competency.id, score)} readOnly={!editable} size="sm" /></div>)}</div>
      </div>
      {message && <p className="mt-4 text-sm text-slate-600">{message}</p>}
      {editable && <div className="mt-5 flex flex-wrap gap-3"><button type="button" onClick={() => save(false)} className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Save draft</button><button type="button" onClick={() => save(true)} className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white">Submit appraisal</button></div>}
    </section>
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Appraisal history</h2><div className="mt-4 space-y-2">{state.appraisals.filter((item) => item.employeeId === actor.employeeId).map((item) => <div key={item.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3 text-sm"><span>{state.cycles.find((cycle) => cycle.id === item.cycleId)?.name ?? item.cycleId}</span><AppraisalStatusBadge status={item.status} /></div>)}</div></section>
  </div>;
}
