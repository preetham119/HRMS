'use client';

import { useCallback, useEffect, useState } from 'react';
import { APP_ROLES, ROLE_LABELS, type AppRole } from '@/lib/auth';
import { useAuth } from '@/components/providers/auth-provider';

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  employeeId: string;
  status: string;
};

type JoinLink = {
  joinUrl: string;
  joinEnabled: boolean;
};

export default function TeamSettingsPage() {
  const { user, refreshUser } = useAuth();
  const [members, setMembers] = useState<Member[]>([]);
  const [joinLink, setJoinLink] = useState<JoinLink | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const canManage = user?.role === 'ADMIN' || user?.role === 'HR' || user?.role === 'CEO';

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [membersRes, linkRes] = await Promise.all([
        fetch('/api/company/members', { credentials: 'include' }),
        fetch('/api/company/join-link', { credentials: 'include' }),
      ]);
      const membersData = await membersRes.json();
      const linkData = await linkRes.json();
      if (!membersRes.ok) throw new Error(membersData.error || 'Failed to load members');
      if (!linkRes.ok) throw new Error(linkData.error || 'Failed to load join link');
      setMembers(membersData);
      setJoinLink({ joinUrl: linkData.joinUrl, joinEnabled: linkData.joinEnabled });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (canManage) {
      void load();
    } else {
      setLoading(false);
    }
  }, [canManage, load]);

  const copyLink = async () => {
    if (!joinLink?.joinUrl) return;
    await navigator.clipboard.writeText(joinLink.joinUrl);
    setMessage('Join link copied');
  };

  const regenerate = async () => {
    setMessage(null);
    const res = await fetch('/api/company/join-link', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ action: 'regenerate' }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to regenerate');
      return;
    }
    setJoinLink({ joinUrl: data.joinUrl, joinEnabled: data.joinEnabled });
    setMessage('New join link generated. Old link no longer works.');
  };

  const toggleJoin = async () => {
    if (!joinLink) return;
    const res = await fetch('/api/company/join-link', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ joinEnabled: !joinLink.joinEnabled }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to update');
      return;
    }
    setJoinLink({ joinUrl: data.joinUrl, joinEnabled: data.joinEnabled });
  };

  const changeRole = async (membershipId: string, role: AppRole) => {
    setMessage(null);
    const res = await fetch('/api/company/members', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ membershipId, role }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error || 'Failed to update role');
      return;
    }
    setMembers((prev) => prev.map((m) => (m.id === membershipId ? { ...m, role: data.role } : m)));
    if (membershipId === user?.id) {
      await refreshUser();
    }
    setMessage('Role updated');
  };

  return (
    <div className="mx-auto max-w-5xl space-y-8 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Team</h1>
        <p className="mt-1 text-sm text-slate-600">
          Share a join link and manage member roles for {user?.companyName ?? 'your company'}.
        </p>
      </div>

      {!canManage ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Only Admin or HR can manage the team.
        </p>
      ) : loading ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : (
        <>
          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Join link</h2>
            <p className="mt-1 text-sm text-slate-600">
              Share this in Slack or WhatsApp. Anyone with the link can join as an Employee.
            </p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
              <code className="flex-1 truncate rounded-lg bg-slate-100 px-3 py-2 text-xs text-slate-800">
                {joinLink?.joinUrl}
              </code>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={copyLink}
                  className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
                >
                  Copy
                </button>
                <button
                  type="button"
                  onClick={regenerate}
                  className="rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium"
                >
                  Regenerate
                </button>
                <button
                  type="button"
                  onClick={toggleJoin}
                  className={
                    joinLink?.joinEnabled
                      ? 'rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium'
                      : 'rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white'
                  }
                >
                  {joinLink?.joinEnabled ? 'Disable' : 'Enable'}
                </button>
              </div>
            </div>
            <p
              className={
                joinLink?.joinEnabled
                  ? 'mt-2 text-xs font-medium text-emerald-700'
                  : 'mt-2 text-xs font-medium text-amber-700'
              }
            >
              Status: {joinLink?.joinEnabled ? 'Enabled — people can join with this link' : 'Disabled — click Enable to activate'}
            </p>
          </section>

          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-lg font-semibold text-slate-900">Members</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-600">
                  <tr>
                    <th className="px-4 py-3 font-medium">Name</th>
                    <th className="px-4 py-3 font-medium">Email</th>
                    <th className="px-4 py-3 font-medium">Employee ID</th>
                    <th className="px-4 py-3 font-medium">Role</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map((member) => (
                    <tr key={member.id} className="border-t border-slate-100">
                      <td className="px-4 py-3">{member.name}</td>
                      <td className="px-4 py-3">{member.email}</td>
                      <td className="px-4 py-3">{member.employeeId}</td>
                      <td className="px-4 py-3">
                        <select
                          className="rounded-md border border-slate-200 px-2 py-1"
                          value={member.role}
                          onChange={(e) => changeRole(member.id, e.target.value as AppRole)}
                        >
                          {APP_ROLES.map((role) => (
                            <option key={role} value={role}>
                              {ROLE_LABELS[role]}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}
