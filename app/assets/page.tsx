'use client';

import { useCallback, useEffect, useMemo, useState, type ComponentType, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  CreditCard,
  Headphones,
  Keyboard,
  KeyRound,
  Laptop,
  Monitor,
  Mouse,
  Package,
  Plus,
  RefreshCw,
  Search,
  Smartphone,
  Tablet,
  Wrench,
} from 'lucide-react';
import { useAuth } from '@/components/providers/auth-provider';
import { canManageAssets } from '@/lib/assets/permissions';
import type {
  Asset,
  AssetCategory,
  AssetCondition,
  AssetDetail,
  AssetSummary,
} from '@/lib/assets/types';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/lib/assets/types';
import { cn } from '@/lib/utils';

type EmployeeOption = { employeeId: string; name: string; email: string; department: string };

const iconByName: Record<string, ComponentType<{ className?: string }>> = {
  Laptop,
  Monitor,
  Smartphone,
  Tablet,
  Keyboard,
  Mouse,
  Headphones,
  CreditCard,
  KeyRound,
  Package,
};

const iconBubbleByName: Record<string, string> = {
  Laptop: 'bg-sky-500 text-white shadow-sky-200',
  Monitor: 'bg-indigo-500 text-white shadow-indigo-200',
  Smartphone: 'bg-emerald-500 text-white shadow-emerald-200',
  Tablet: 'bg-violet-500 text-white shadow-violet-200',
  Keyboard: 'bg-amber-500 text-white shadow-amber-200',
  Mouse: 'bg-orange-500 text-white shadow-orange-200',
  Headphones: 'bg-pink-500 text-white shadow-pink-200',
  CreditCard: 'bg-teal-500 text-white shadow-teal-200',
  KeyRound: 'bg-rose-500 text-white shadow-rose-200',
  Package: 'bg-slate-500 text-white shadow-slate-200',
};

function AssetTypeIcon({
  iconName,
  size = 'md',
}: {
  iconName?: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  const key = iconName && iconByName[iconName] ? iconName : 'Package';
  const Icon = iconByName[key];
  const bubble = iconBubbleByName[key] || iconBubbleByName.Package;
  const box =
    size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-9 w-9' : 'h-12 w-12';
  const glyph = size === 'lg' ? 'h-8 w-8' : size === 'sm' ? 'h-4 w-4' : 'h-6 w-6';

  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-2xl shadow-md',
        box,
        bubble,
      )}
    >
      <Icon className={glyph} />
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const tone =
    status === 'Available'
      ? 'bg-emerald-50 text-emerald-700'
      : status === 'In Use' || status === 'Assigned'
        ? 'bg-sky-50 text-sky-700'
        : status === 'Under Maintenance'
          ? 'bg-amber-50 text-amber-700'
          : status === 'Damaged' || status === 'Lost'
            ? 'bg-rose-50 text-rose-700'
            : status === 'Retired'
              ? 'bg-slate-200 text-slate-600'
              : 'bg-violet-50 text-violet-700';
  return <span className={cn('rounded-full px-2.5 py-1 text-xs font-semibold', tone)}>{status}</span>;
}

function SummaryCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className={cn('rounded-2xl p-3', color)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

export default function AssetsPage() {
  const { user } = useAuth();
  const manage = canManageAssets(user?.role);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [summary, setSummary] = useState<AssetSummary>({
    total: 0,
    assigned: 0,
    inUse: 0,
    underMaintenance: 0,
    dueForReturn: 0,
    available: 0,
  });
  const [assets, setAssets] = useState<Asset[]>([]);
  const [categories, setCategories] = useState<AssetCategory[]>([]);
  const [employees, setEmployees] = useState<EmployeeOption[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [showInventory, setShowInventory] = useState(false);
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detail, setDetail] = useState<AssetDetail | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Asset | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Asset | null>(null);
  const [assignTarget, setAssignTarget] = useState<Asset | null>(null);
  const [maintenanceTarget, setMaintenanceTarget] = useState<Asset | null>(null);

  const showToast = (msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: manage ? '10' : '24',
        q,
        status,
        categoryId,
        sort: 'updatedAt',
        dir: 'desc',
      });
      const [listRes, catRes] = await Promise.all([
        fetch(`/api/assets?${params}`, { credentials: 'include' }),
        fetch('/api/assets?view=categories', { credentials: 'include' }),
      ]);
      if (!listRes.ok) throw new Error((await listRes.json()).error || 'Failed to load');
      const listData = await listRes.json();
      const catData = await catRes.json();
      setSummary(listData.summary);
      setAssets(listData.assets || []);
      setTotalPages(listData.pagination?.totalPages || 1);
      setCategories(catData.categories || []);
      if (listData.categoryCounts) setCategoryCounts(listData.categoryCounts);

      if (manage) {
        const empRes = await fetch('/api/assets?view=employees', { credentials: 'include' });
        if (empRes.ok) {
          const empData = await empRes.json();
          setEmployees(empData.employees || []);
        }
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load assets');
    } finally {
      setLoading(false);
    }
  }, [page, q, status, categoryId, manage]);

  useEffect(() => {
    void load();
  }, [load]);

  const openDetail = async (assetId: string) => {
    const res = await fetch(`/api/assets?view=detail&id=${assetId}`, { credentials: 'include' });
    if (!res.ok) {
      showToast((await res.json()).error || 'Unable to open asset');
      return;
    }
    const data = await res.json();
    setDetail(data.asset);
  };

  const postAction = async (body: Record<string, unknown>) => {
    const res = await fetch('/api/assets', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Action failed');
    return data;
  };

  return (
    <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto flex max-w-7xl flex-col gap-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm"
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-600">Asset Management</p>
              <h1 className="mt-2 text-3xl font-semibold text-slate-900">
                {manage ? 'Organization inventory' : 'My assigned assets'}
              </h1>
              <p className="mt-2 text-sm text-slate-500">
                {manage
                  ? 'Create, assign, reassign, maintain, and retire company assets.'
                  : 'View devices and licenses currently assigned to you.'}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void load()}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700"
              >
                <RefreshCw className="h-4 w-4" /> Refresh
              </button>
              {manage ? (
                <button
                  type="button"
                  onClick={() => {
                    setEditing(null);
                    setShowForm(true);
                  }}
                  className="inline-flex items-center gap-2 rounded-2xl bg-brand-600 px-4 py-2.5 text-sm font-medium text-white"
                >
                  <Plus className="h-4 w-4" /> Add asset
                </button>
              ) : null}
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Total Assets" value={summary.total} icon={Package} color="bg-sky-50 text-sky-600" />
            <SummaryCard label="Assigned" value={summary.assigned} icon={CheckCircle2} color="bg-violet-50 text-violet-600" />
            <SummaryCard label="In Use" value={summary.inUse} icon={Laptop} color="bg-emerald-50 text-emerald-600" />
            <SummaryCard label="Under Maintenance" value={summary.underMaintenance} icon={Wrench} color="bg-amber-50 text-amber-600" />
            <SummaryCard label="Due for Return" value={summary.dueForReturn} icon={AlertTriangle} color="bg-rose-50 text-rose-600" />
          </div>
        </motion.section>

        <section className="rounded-[32px] border border-slate-200 bg-white p-6 shadow-sm">
          {!showInventory ? (
            <>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Asset types</h2>
                  <p className="mt-1 text-sm text-slate-500">Select a category and click View to open the inventory.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setCategoryId('');
                    setPage(1);
                    setShowInventory(true);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  View all
                </button>
              </div>
              {loading ? (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="h-40 animate-pulse rounded-[24px] bg-slate-100" />
                  ))}
                </div>
              ) : error ? (
                <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
                  {categories.map((category) => (
                    <div
                      key={category.id}
                      className="flex flex-col items-center rounded-[24px] border border-slate-200 bg-slate-50 px-4 py-6 text-center"
                    >
                      <AssetTypeIcon iconName={category.icon} size="lg" />
                      <p className="mt-4 font-semibold text-slate-900">{category.name}</p>
                      <p className="mt-1 text-xs text-slate-500">{categoryCounts[category.id] || 0} assets</p>
                      <button
                        type="button"
                        onClick={() => {
                          setCategoryId(category.id);
                          setPage(1);
                          setShowInventory(true);
                        }}
                        className="mt-4 rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white"
                      >
                        View
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">
                    {categories.find((c) => c.id === categoryId)?.name || 'All assets'}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">Search, filter, and manage assets in this section.</p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setShowInventory(false);
                    setCategoryId('');
                    setQ('');
                    setStatus('');
                    setPage(1);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700"
                >
                  Back to types
                </button>
              </div>
          <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <label className="flex flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">
              <Search className="h-4 w-4" />
              <input
                value={q}
                onChange={(e) => {
                  setPage(1);
                  setQ(e.target.value);
                }}
                className="w-full bg-transparent outline-none"
                placeholder="Search name, tag, serial, brand…"
              />
            </label>
            <select
              value={status}
              onChange={(e) => {
                setPage(1);
                setStatus(e.target.value);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
            >
              <option value="">All statuses</option>
              {ASSET_STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              value={categoryId}
              onChange={(e) => {
                setPage(1);
                setCategoryId(e.target.value);
              }}
              className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-36 animate-pulse rounded-[24px] bg-slate-100" />
              ))}
            </div>
          ) : error ? (
            <div className="mt-6 rounded-[24px] border border-rose-200 bg-rose-50 p-6 text-sm text-rose-700">{error}</div>
          ) : assets.length === 0 ? (
            <div className="mt-6 rounded-[24px] border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <Package className="mx-auto h-10 w-10 text-slate-400" />
              <p className="mt-3 font-semibold text-slate-800">No assets found</p>
              <p className="mt-1 text-sm text-slate-500">
                {manage ? 'Add an asset to start the inventory.' : 'No assets are assigned to you yet.'}
              </p>
            </div>
          ) : manage ? (
            <div className="mt-6 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-3">Asset</th>
                    <th className="px-3 py-3">Tag</th>
                    <th className="px-3 py-3">Category</th>
                    <th className="px-3 py-3">Assignee</th>
                    <th className="px-3 py-3">Status</th>
                    <th className="px-3 py-3">Condition</th>
                    <th className="px-3 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {assets.map((asset) => {
                    return (
                      <tr key={asset.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-3 py-3">
                          <button type="button" className="flex items-center gap-3 text-left" onClick={() => void openDetail(asset.id)}>
                            <AssetTypeIcon iconName={asset.categoryIcon} size="sm" />
                            <span>
                              <span className="block font-semibold text-slate-900">{asset.name}</span>
                              <span className="block text-xs text-slate-500">
                                {[asset.brand, asset.model].filter(Boolean).join(' · ') || '—'}
                              </span>
                            </span>
                          </button>
                        </td>
                        <td className="px-3 py-3 font-medium text-slate-700">{asset.assetTag}</td>
                        <td className="px-3 py-3 text-slate-600">{asset.categoryName}</td>
                        <td className="px-3 py-3 text-slate-600">
                          {asset.assignedEmployeeName || '—'}
                          {asset.assignedEmployeeId ? (
                            <span className="block text-xs text-slate-400">{asset.assignedEmployeeId}</span>
                          ) : null}
                        </td>
                        <td className="px-3 py-3">
                          <StatusBadge status={asset.status} />
                        </td>
                        <td className="px-3 py-3 text-slate-600">{asset.condition}</td>
                        <td className="px-3 py-3">
                          <div className="flex flex-wrap gap-1">
                            <ActionBtn onClick={() => void openDetail(asset.id)}>View</ActionBtn>
                            <ActionBtn
                              onClick={() => {
                                setEditing(asset);
                                setShowForm(true);
                              }}
                            >
                              Edit
                            </ActionBtn>
                            {!asset.assignedEmployeeId && asset.status === 'Available' ? (
                              <ActionBtn onClick={() => setAssignTarget(asset)}>Assign</ActionBtn>
                            ) : null}
                            {asset.assignedEmployeeId ? (
                              <>
                                <ActionBtn onClick={() => setAssignTarget(asset)}>Reassign</ActionBtn>
                                <ActionBtn
                                  onClick={async () => {
                                    try {
                                      await postAction({ action: 'return', assetId: asset.id });
                                      showToast('Asset returned');
                                      await load();
                                    } catch (e) {
                                      showToast(e instanceof Error ? e.message : 'Failed');
                                    }
                                  }}
                                >
                                  Return
                                </ActionBtn>
                              </>
                            ) : null}
                            <ActionBtn onClick={() => setMaintenanceTarget(asset)}>Maintain</ActionBtn>
                            <ActionBtn
                              onClick={async () => {
                                try {
                                  await postAction({ action: 'status', assetId: asset.id, status: 'Retired' });
                                  showToast('Asset retired');
                                  await load();
                                } catch (e) {
                                  showToast(e instanceof Error ? e.message : 'Failed');
                                }
                              }}
                            >
                              Retire
                            </ActionBtn>
                            <ActionBtn onClick={() => setConfirmDelete(asset)}>Delete</ActionBtn>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {assets.map((asset) => {
                return (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => void openDetail(asset.id)}
                    className="rounded-[24px] border border-slate-200 bg-slate-50 p-5 text-left transition hover:border-brand-200 hover:bg-white hover:shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <AssetTypeIcon iconName={asset.categoryIcon} size="md" />
                      <StatusBadge status={asset.status} />
                    </div>
                    <p className="mt-4 font-semibold text-slate-900">{asset.name}</p>
                    <p className="mt-1 text-sm text-slate-500">{asset.assetTag}</p>
                    <div className="mt-4 space-y-1 text-xs text-slate-500">
                      <p>Category: {asset.categoryName || '—'}</p>
                      <p>Serial: {asset.serialNumber || '—'}</p>
                      <p>Assigned: {asset.assignedDate || '—'}</p>
                      <p>Return: {asset.expectedReturnDate || '—'}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {totalPages > 1 ? (
            <div className="mt-6 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>
              <span className="text-sm text-slate-500">
                Page {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-xl border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          ) : null}
            </>
          )}
        </section>
      </div>

      {toast ? (
        <div className="fixed inset-x-4 top-6 z-50 rounded-[28px] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800 shadow-lg sm:left-auto sm:right-6 sm:max-w-sm">
          {toast}
        </div>
      ) : null}

      {detail ? (
        <DetailDrawer
          detail={detail}
          onClose={() => setDetail(null)}
          manage={manage}
          onRefresh={async () => {
            await openDetail(detail.id);
            await load();
          }}
        />
      ) : null}

      {showForm && manage ? (
        <AssetFormModal
          categories={categories}
          initial={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={async () => {
            setShowForm(false);
            setEditing(null);
            showToast(editing ? 'Asset updated' : 'Asset created');
            await load();
          }}
        />
      ) : null}

      {assignTarget && manage ? (
        <AssignModal
          asset={assignTarget}
          employees={employees}
          mode={assignTarget.assignedEmployeeId ? 'reassign' : 'assign'}
          onClose={() => setAssignTarget(null)}
          onDone={async () => {
            setAssignTarget(null);
            showToast('Assignment updated');
            await load();
          }}
        />
      ) : null}

      {maintenanceTarget && manage ? (
        <MaintenanceModal
          asset={maintenanceTarget}
          onClose={() => setMaintenanceTarget(null)}
          onDone={async () => {
            setMaintenanceTarget(null);
            showToast('Maintenance recorded');
            await load();
          }}
        />
      ) : null}

      {confirmDelete && manage ? (
        <ConfirmDialog
          title="Delete asset?"
          message={`Permanently delete ${confirmDelete.assetTag} (${confirmDelete.name})?`}
          confirmLabel="Delete"
          onCancel={() => setConfirmDelete(null)}
          onConfirm={async () => {
            const res = await fetch(`/api/assets?id=${confirmDelete.id}`, {
              method: 'DELETE',
              credentials: 'include',
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) {
              showToast(data.error || 'Delete failed');
              return;
            }
            setConfirmDelete(null);
            showToast('Asset deleted');
            await load();
          }}
        />
      ) : null}
    </main>
  );
}

function ActionBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
    >
      {children}
    </button>
  );
}

function DetailDrawer({
  detail,
  onClose,
  manage,
  onRefresh,
}: {
  detail: AssetDetail;
  onClose: () => void;
  manage: boolean;
  onRefresh: () => Promise<void>;
}) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 p-3 sm:p-6" onClick={onClose}>
      <div
        className="h-full w-full max-w-xl overflow-y-auto rounded-[28px] bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AssetTypeIcon iconName={detail.categoryIcon} size="md" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-brand-600">{detail.assetTag}</p>
              <h2 className="mt-1 text-2xl font-semibold text-slate-900">{detail.name}</h2>
              <div className="mt-2">
                <StatusBadge status={detail.status} />
              </div>
            </div>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-1.5 text-sm">
            Close
          </button>
        </div>

        <dl className="mt-6 grid grid-cols-2 gap-3 text-sm">
          {[
            ['Category', detail.categoryName],
            ['Serial Number', detail.serialNumber || '—'],
            ['Brand / Model', [detail.brand, detail.model].filter(Boolean).join(' ') || '—'],
            ['Condition', detail.condition],
            ['Assigned To', detail.assignedEmployeeName || '—'],
            ['Employee ID', detail.assignedEmployeeId || '—'],
            ['Assigned Date', detail.assignedDate || '—'],
            ['Return Date', detail.expectedReturnDate || '—'],
            ['Warranty Expiry', detail.warrantyExpiry || '—'],
            ['Purchase Date', detail.purchaseDate || '—'],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 p-3">
              <dt className="text-xs text-slate-500">{label}</dt>
              <dd className="mt-1 font-medium text-slate-900">{value}</dd>
            </div>
          ))}
        </dl>

        {detail.notes ? <p className="mt-4 text-sm text-slate-600">{detail.notes}</p> : null}

        {manage && detail.maintenance.some((m) => m.status !== 'Completed') ? (
          <div className="mt-4">
            <button
              type="button"
              className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white"
              onClick={async () => {
                const open = detail.maintenance.find((m) => m.status !== 'Completed');
                if (!open) return;
                await fetch('/api/assets', {
                  method: 'POST',
                  credentials: 'include',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    action: 'completeMaintenance',
                    assetId: detail.id,
                    maintenanceId: open.id,
                  }),
                });
                await onRefresh();
              }}
            >
              Complete open maintenance
            </button>
          </div>
        ) : null}

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">History</h3>
        <ul className="mt-3 space-y-2">
          {detail.history.length === 0 ? (
            <li className="text-sm text-slate-500">No history yet.</li>
          ) : (
            detail.history.map((h) => (
              <li key={h.id} className="rounded-2xl border border-slate-200 p-3 text-sm">
                <p className="font-medium text-slate-900">{h.action}</p>
                <p className="text-slate-600">{h.details}</p>
                <p className="mt-1 text-xs text-slate-400">
                  {h.actorName} · {new Date(h.createdAt).toLocaleString()}
                </p>
              </li>
            ))
          )}
        </ul>

        <h3 className="mt-8 text-sm font-semibold uppercase tracking-wide text-slate-500">Maintenance</h3>
        <ul className="mt-3 space-y-2">
          {detail.maintenance.length === 0 ? (
            <li className="text-sm text-slate-500">No maintenance records.</li>
          ) : (
            detail.maintenance.map((m) => (
              <li key={m.id} className="rounded-2xl border border-slate-200 p-3 text-sm">
                <p className="font-medium text-slate-900">
                  {m.title} · {m.status}
                </p>
                <p className="text-slate-600">{m.description || '—'}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
}

function AssetFormModal({
  categories,
  initial,
  onClose,
  onSaved,
}: {
  categories: AssetCategory[];
  initial: Asset | null;
  onClose: () => void;
  onSaved: () => Promise<void>;
}) {
  const [form, setForm] = useState({
    name: initial?.name || '',
    assetTag: initial?.assetTag || '',
    categoryId: initial?.categoryId || categories[0]?.id || '',
    serialNumber: initial?.serialNumber || '',
    brand: initial?.brand || '',
    model: initial?.model || '',
    condition: (initial?.condition || 'Good') as AssetCondition,
    purchaseDate: initial?.purchaseDate || '',
    warrantyExpiry: initial?.warrantyExpiry || '',
    notes: initial?.notes || '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/assets', {
        method: initial ? 'PATCH' : 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...(initial ? { assetId: initial.id } : { action: 'create' }),
          ...form,
          purchaseDate: form.purchaseDate || null,
          warrantyExpiry: form.warrantyExpiry || null,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Save failed');
      await onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell title={initial ? 'Edit asset' : 'Add asset'} onClose={onClose}>
      <form className="space-y-3" onSubmit={submit}>
        <Field label="Asset name">
          <input required className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Asset tag / ID">
          <input
            required
            className={inputCls}
            value={form.assetTag}
            onChange={(e) => setForm({ ...form, assetTag: e.target.value })}
            disabled={Boolean(initial)}
          />
        </Field>
        <Field label="Category">
          <select className={inputCls} value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Serial number">
            <input className={inputCls} value={form.serialNumber} onChange={(e) => setForm({ ...form, serialNumber: e.target.value })} />
          </Field>
          <Field label="Condition">
            <select className={inputCls} value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value as AssetCondition })}>
              {ASSET_CONDITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Brand">
            <input className={inputCls} value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} />
          </Field>
          <Field label="Model">
            <input className={inputCls} value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Purchase date">
            <input type="date" className={inputCls} value={form.purchaseDate || ''} onChange={(e) => setForm({ ...form, purchaseDate: e.target.value })} />
          </Field>
          <Field label="Warranty expiry">
            <input type="date" className={inputCls} value={form.warrantyExpiry || ''} onChange={(e) => setForm({ ...form, warrantyExpiry: e.target.value })} />
          </Field>
        </div>
        <Field label="Notes">
          <textarea className={inputCls} rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </Field>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2 pt-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function AssignModal({
  asset,
  employees,
  mode,
  onClose,
  onDone,
}: {
  asset: Asset;
  employees: EmployeeOption[];
  mode: 'assign' | 'reassign';
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [employeeId, setEmployeeId] = useState(employees[0]?.employeeId || '');
  const [expectedReturnDate, setExpectedReturnDate] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const selected = useMemo(() => employees.find((e) => e.employeeId === employeeId), [employees, employeeId]);

  return (
    <ModalShell title={mode === 'assign' ? 'Assign asset' : 'Reassign asset'} onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          setError(null);
          if (!selected) {
            setError('Select an employee');
            return;
          }
          const res = await fetch('/api/assets', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: mode,
              assetId: asset.id,
              employeeId: selected.employeeId,
              employeeName: selected.name,
              expectedReturnDate: expectedReturnDate || null,
              notes,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error || 'Failed');
            return;
          }
          await onDone();
        }}
      >
        <p className="text-sm text-slate-600">
          {asset.name} ({asset.assetTag})
        </p>
        <Field label="Employee">
          <select className={inputCls} value={employeeId} onChange={(e) => setEmployeeId(e.target.value)}>
            {employees.map((e) => (
              <option key={e.employeeId} value={e.employeeId}>
                {e.name} · {e.employeeId}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Expected return date">
          <input type="date" className={inputCls} value={expectedReturnDate} onChange={(e) => setExpectedReturnDate(e.target.value)} />
        </Field>
        <Field label="Notes">
          <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white">
            Confirm
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function MaintenanceModal({
  asset,
  onClose,
  onDone,
}: {
  asset: Asset;
  onClose: () => void;
  onDone: () => Promise<void>;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [vendor, setVendor] = useState('');
  const [error, setError] = useState<string | null>(null);

  return (
    <ModalShell title="Add maintenance" onClose={onClose}>
      <form
        className="space-y-3"
        onSubmit={async (e) => {
          e.preventDefault();
          const res = await fetch('/api/assets', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              action: 'maintenance',
              assetId: asset.id,
              title,
              description,
              vendor,
            }),
          });
          const data = await res.json().catch(() => ({}));
          if (!res.ok) {
            setError(data.error || 'Failed');
            return;
          }
          await onDone();
        }}
      >
        <Field label="Title">
          <input required className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label="Description">
          <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <Field label="Vendor">
          <input className={inputCls} value={vendor} onChange={(e) => setVendor(e.target.value)} />
        </Field>
        {error ? <p className="text-sm text-rose-600">{error}</p> : null}
        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm">
            Cancel
          </button>
          <button type="submit" className="rounded-2xl bg-brand-600 px-4 py-2 text-sm font-medium text-white">
            Save
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

function ConfirmDialog({
  title,
  message,
  confirmLabel,
  onCancel,
  onConfirm,
}: {
  title: string;
  message: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}) {
  return (
    <ModalShell title={title} onClose={onCancel}>
      <p className="text-sm text-slate-600">{message}</p>
      <div className="mt-5 flex justify-end gap-2">
        <button type="button" onClick={onCancel} className="rounded-2xl border border-slate-200 px-4 py-2 text-sm">
          Cancel
        </button>
        <button type="button" onClick={() => void onConfirm()} className="rounded-2xl bg-rose-600 px-4 py-2 text-sm font-medium text-white">
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}

function ModalShell({ title, onClose, children }: { title: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4" onClick={onClose}>
      <div className="w-full max-w-lg rounded-[28px] bg-white p-6 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="text-sm text-slate-500">
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

const inputCls =
  'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100';
