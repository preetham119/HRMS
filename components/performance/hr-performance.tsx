'use client';

import { useState } from 'react';
import { AppraisalStatusBadge } from '@/components/performance/appraisal-status-badge';
import { getAppraisalState, upsertCycle } from '@/lib/appraisal/store';
import type { AppraisalActor, AppraisalCycle, CycleStatus } from '@/lib/appraisal/types';

export function HrPerformance({ actor: _actor }: { actor: AppraisalActor }) {
  const [version, setVersion] = useState(0);
  const state = getAppraisalState();
  const counts = state.appraisals.reduce<Record<string, number>>((result, appraisal) => ({ ...result, [appraisal.status]: (result[appraisal.status] ?? 0) + 1 }), {});
  const updateCycle = (cycle: AppraisalCycle, status: CycleStatus) => { upsertCycle({ ...cycle, status }); setVersion((v) => v + 1); };
  void version;
  return <div className="space-y-6">
    <section className="grid gap-4 sm:grid-cols-3">{[['Open cycles', state.cycles.filter((cycle) => cycle.status === 'open').length], ['Total appraisals', state.appraisals.length], ['Completed', counts.completed ?? 0]].map(([label, value]) => <div key={String(label)} className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"><p className="text-sm text-slate-500">{label}</p><p className="mt-2 text-3xl font-semibold text-slate-900">{value}</p></div>)}</section>
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><h2 className="text-lg font-semibold text-slate-900">Appraisal cycles</h2><div className="mt-4 space-y-3">{state.cycles.map((cycle) => <div key={cycle.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 p-4"><div><p className="font-semibold text-slate-800">{cycle.name}</p><p className="mt-1 text-sm text-slate-500">{cycle.startDate} — {cycle.endDate} · {cycle.status}</p></div><div className="flex gap-2"><button onClick={() => updateCycle(cycle, 'open')} className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-semibold">Open</button><button onClick={() => updateCycle(cycle, 'closed')} className="rounded-xl bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Close</button></div></div>)}</div></section>
    <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-slate-900">Organisation overview</h2><div className="flex flex-wrap gap-2">{Object.entries(counts).map(([status, count]) => <span key={status} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{status.replaceAll('_', ' ')}: {count}</span>)}</div></div><div className="mt-5 overflow-x-auto"><table className="w-full min-w-[640px] text-left text-sm"><thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500"><tr><th className="pb-3">Employee</th><th className="pb-3">Department</th><th className="pb-3">Cycle</th><th className="pb-3">Status</th></tr></thead><tbody>{state.appraisals.map((appraisal) => <tr key={appraisal.id} className="border-b border-slate-100"><td className="py-3 font-medium text-slate-800">{appraisal.employeeName}</td><td className="py-3 text-slate-600">{appraisal.department}</td><td className="py-3 text-slate-600">{state.cycles.find((cycle) => cycle.id === appraisal.cycleId)?.name}</td><td className="py-3"><AppraisalStatusBadge status={appraisal.status} /></td></tr>)}</tbody></table></div></section>
  </div>;
}
