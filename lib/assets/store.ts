import { DEFAULT_ASSET_CATEGORIES } from '@/lib/assets/types';
import type {
  Asset,
  AssetAssignment,
  AssetCategory,
  AssetDocument,
  AssetHistory,
  AssetMaintenance,
} from '@/lib/assets/types';

type AssetStoreState = {
  categories: AssetCategory[];
  assets: Asset[];
  assignments: AssetAssignment[];
  history: AssetHistory[];
  maintenance: AssetMaintenance[];
  documents: AssetDocument[];
};

const globalKey = '__hrmsAssetStore';

function emptyState(): AssetStoreState {
  return {
    categories: [],
    assets: [],
    assignments: [],
    history: [],
    maintenance: [],
    documents: [],
  };
}

function getState(): AssetStoreState {
  const g = globalThis as typeof globalThis & { [globalKey]?: AssetStoreState };
  if (!g[globalKey]) g[globalKey] = emptyState();
  return g[globalKey]!;
}

function setState(next: AssetStoreState) {
  const g = globalThis as typeof globalThis & { [globalKey]?: AssetStoreState };
  g[globalKey] = next;
}

function nowIso() {
  return new Date().toISOString();
}

function id(prefix: string) {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36)}`;
}

/** Ensure taxonomy categories exist for a company (not inventory assets). */
export function ensureAssetCategories(companyId: string): AssetCategory[] {
  const state = getState();
  const existing = state.categories.filter((c) => c.companyId === companyId);
  if (existing.length) return existing;

  const stamp = nowIso();
  const created = DEFAULT_ASSET_CATEGORIES.map((c) => ({
    id: id('acat'),
    companyId,
    code: c.code,
    name: c.name,
    icon: c.icon,
    isActive: true,
    createdAt: stamp,
    updatedAt: stamp,
  }));
  setState({ ...state, categories: [...state.categories, ...created] });
  return created;
}

export function listCategories(companyId: string) {
  return ensureAssetCategories(companyId).filter((c) => c.isActive);
}

export function listAssets(companyId: string) {
  ensureAssetCategories(companyId);
  const state = getState();
  const cats = new Map(state.categories.map((c) => [c.id, c]));
  return state.assets
    .filter((a) => a.companyId === companyId)
    .map((a) => {
      const cat = cats.get(a.categoryId);
      return {
        ...a,
        categoryCode: cat?.code,
        categoryName: cat?.name,
        categoryIcon: cat?.icon,
      };
    })
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getAsset(companyId: string, assetId: string) {
  return listAssets(companyId).find((a) => a.id === assetId) ?? null;
}

export function createAsset(
  companyId: string,
  actor: { employeeId: string; name: string },
  input: {
    name: string;
    assetTag: string;
    categoryId: string;
    serialNumber?: string;
    brand?: string;
    model?: string;
    condition?: Asset['condition'];
    purchaseDate?: string | null;
    warrantyExpiry?: string | null;
    notes?: string;
  },
): Asset {
  const state = getState();
  ensureAssetCategories(companyId);
  const tag = input.assetTag.trim().toUpperCase();
  if (state.assets.some((a) => a.companyId === companyId && a.assetTag === tag)) {
    throw new Error('Asset tag already exists.');
  }
  const category = state.categories.find((c) => c.id === input.categoryId && c.companyId === companyId);
  if (!category) throw new Error('Invalid category.');

  const stamp = nowIso();
  const asset: Asset = {
    id: id('ast'),
    companyId,
    categoryId: category.id,
    categoryCode: category.code,
    categoryName: category.name,
    categoryIcon: category.icon,
    name: input.name.trim(),
    assetTag: tag,
    serialNumber: input.serialNumber?.trim() || '',
    brand: input.brand?.trim() || '',
    model: input.model?.trim() || '',
    status: 'Available',
    condition: input.condition || 'Good',
    purchaseDate: input.purchaseDate || null,
    warrantyExpiry: input.warrantyExpiry || null,
    notes: input.notes?.trim() || '',
    assignedEmployeeId: null,
    assignedEmployeeName: null,
    assignedDate: null,
    expectedReturnDate: null,
    createdBy: actor.employeeId,
    updatedBy: actor.employeeId,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId: asset.id,
    action: 'CREATED',
    fromStatus: null,
    toStatus: 'Available',
    employeeId: null,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: `Asset ${asset.assetTag} created`,
    createdAt: stamp,
  };

  setState({
    ...state,
    assets: [...state.assets, asset],
    history: [...state.history, history],
  });
  return asset;
}

export function updateAsset(
  companyId: string,
  assetId: string,
  actor: { employeeId: string; name: string },
  patch: Partial<Asset>,
): Asset {
  const state = getState();
  const idx = state.assets.findIndex((a) => a.id === assetId && a.companyId === companyId);
  if (idx < 0) throw new Error('Asset not found.');
  const prev = state.assets[idx];
  if (patch.assetTag) {
    const tag = patch.assetTag.trim().toUpperCase();
    if (state.assets.some((a) => a.companyId === companyId && a.assetTag === tag && a.id !== assetId)) {
      throw new Error('Asset tag already exists.');
    }
    patch.assetTag = tag;
  }
  const stamp = nowIso();
  const next: Asset = {
    ...prev,
    ...patch,
    updatedBy: actor.employeeId,
    updatedAt: stamp,
  };
  const assets = [...state.assets];
  assets[idx] = next;
  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId,
    action: 'UPDATED',
    fromStatus: prev.status,
    toStatus: next.status,
    employeeId: next.assignedEmployeeId,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: 'Asset details updated',
    createdAt: stamp,
  };
  setState({ ...state, assets, history: [...state.history, history] });
  return getAsset(companyId, assetId)!;
}

export function deleteAsset(companyId: string, assetId: string) {
  const state = getState();
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');
  if (asset.assignedEmployeeId && ['Assigned', 'In Use'].includes(asset.status)) {
    throw new Error('Return the asset before deleting.');
  }
  setState({
    ...state,
    assets: state.assets.filter((a) => a.id !== assetId),
    assignments: state.assignments.filter((a) => a.assetId !== assetId),
    history: state.history.filter((h) => h.assetId !== assetId),
    maintenance: state.maintenance.filter((m) => m.assetId !== assetId),
    documents: state.documents.filter((d) => d.assetId !== assetId),
  });
}

export function assignAsset(
  companyId: string,
  assetId: string,
  actor: { employeeId: string; name: string },
  target: { employeeId: string; employeeName: string },
  expectedReturnDate?: string | null,
  notes?: string,
  markInUse = true,
): Asset {
  const state = getState();
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');
  if (asset.status === 'Retired') throw new Error('Retired assets cannot be assigned.');
  if (asset.assignedEmployeeId && asset.assignedEmployeeId !== target.employeeId) {
    throw new Error('Asset is already assigned. Reassign or return it first.');
  }
  if (['Under Maintenance', 'Lost'].includes(asset.status)) {
    throw new Error(`Cannot assign asset while status is ${asset.status}.`);
  }

  const stamp = nowIso();
  const fromStatus = asset.status;
  const toStatus = markInUse ? 'In Use' : 'Assigned';

  // close any active assignment (safety)
  const assignments = state.assignments.map((a) =>
    a.assetId === assetId && a.isActive
      ? { ...a, isActive: false, returnedAt: stamp, returnedBy: actor.employeeId }
      : a,
  );

  const assignment: AssetAssignment = {
    id: id('aas'),
    companyId,
    assetId,
    employeeId: target.employeeId,
    employeeName: target.employeeName,
    assignedAt: stamp,
    expectedReturn: expectedReturnDate || null,
    returnedAt: null,
    assignedBy: actor.employeeId,
    returnedBy: null,
    notes: notes || '',
    isActive: true,
  };

  const assets = state.assets.map((a) =>
    a.id === assetId
      ? {
          ...a,
          status: toStatus as Asset['status'],
          assignedEmployeeId: target.employeeId,
          assignedEmployeeName: target.employeeName,
          assignedDate: stamp.slice(0, 10),
          expectedReturnDate: expectedReturnDate || null,
          updatedBy: actor.employeeId,
          updatedAt: stamp,
        }
      : a,
  );

  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId,
    action: 'ASSIGNED',
    fromStatus,
    toStatus,
    employeeId: target.employeeId,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: `Assigned to ${target.employeeName} (${target.employeeId})`,
    createdAt: stamp,
  };

  setState({
    ...state,
    assets,
    assignments: [...assignments, assignment],
    history: [...state.history, history],
  });
  return getAsset(companyId, assetId)!;
}

export function reassignAsset(
  companyId: string,
  assetId: string,
  actor: { employeeId: string; name: string },
  target: { employeeId: string; employeeName: string },
  expectedReturnDate?: string | null,
  notes?: string,
): Asset {
  const state = getState();
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');
  if (!asset.assignedEmployeeId) throw new Error('Asset is not currently assigned.');
  if (asset.assignedEmployeeId === target.employeeId) throw new Error('Already assigned to this employee.');

  // return then assign
  returnAsset(companyId, assetId, actor, 'Reassigned');
  return assignAsset(companyId, assetId, actor, target, expectedReturnDate, notes, true);
}

export function returnAsset(
  companyId: string,
  assetId: string,
  actor: { employeeId: string; name: string },
  notes?: string,
  nextStatus: 'Available' | 'Returned' = 'Available',
): Asset {
  const state = getState();
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');
  if (!asset.assignedEmployeeId) throw new Error('Asset is not assigned.');

  const stamp = nowIso();
  const fromStatus = asset.status;
  const assignments = state.assignments.map((a) =>
    a.assetId === assetId && a.isActive
      ? {
          ...a,
          isActive: false,
          returnedAt: stamp,
          returnedBy: actor.employeeId,
          notes: notes || a.notes,
        }
      : a,
  );

  const assets = state.assets.map((a) =>
    a.id === assetId
      ? {
          ...a,
          status: nextStatus as Asset['status'],
          assignedEmployeeId: null,
          assignedEmployeeName: null,
          assignedDate: null,
          expectedReturnDate: null,
          updatedBy: actor.employeeId,
          updatedAt: stamp,
        }
      : a,
  );

  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId,
    action: 'RETURNED',
    fromStatus,
    toStatus: nextStatus,
    employeeId: asset.assignedEmployeeId,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: notes || `Returned by ${actor.name}`,
    createdAt: stamp,
  };

  setState({
    ...state,
    assets,
    assignments,
    history: [...state.history, history],
  });
  return getAsset(companyId, assetId)!;
}

export function setAssetStatus(
  companyId: string,
  assetId: string,
  actor: { employeeId: string; name: string },
  status: Asset['status'],
  details?: string,
): Asset {
  const state = getState();
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');

  if (status === 'Available' && asset.assignedEmployeeId) {
    return returnAsset(companyId, assetId, actor, details, 'Available');
  }
  if (status === 'Retired' && asset.assignedEmployeeId) {
    throw new Error('Return the asset before retiring.');
  }

  const stamp = nowIso();
  const fromStatus = asset.status;
  const assets = state.assets.map((a) =>
    a.id === assetId
      ? { ...a, status, updatedBy: actor.employeeId, updatedAt: stamp }
      : a,
  );
  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId,
    action: 'STATUS_CHANGED',
    fromStatus,
    toStatus: status,
    employeeId: asset.assignedEmployeeId,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: details || `Status changed to ${status}`,
    createdAt: stamp,
  };
  setState({ ...state, assets, history: [...state.history, history] });
  return getAsset(companyId, assetId)!;
}

export function addMaintenance(
  companyId: string,
  assetId: string,
  actor: { employeeId: string; name: string },
  input: { title: string; description?: string; vendor?: string; cost?: number },
): AssetMaintenance {
  const state = getState();
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');

  const stamp = nowIso();
  const record: AssetMaintenance = {
    id: id('amt'),
    companyId,
    assetId,
    title: input.title.trim(),
    description: input.description?.trim() || '',
    status: 'Open',
    startedAt: stamp,
    completedAt: null,
    cost: input.cost ?? 0,
    vendor: input.vendor?.trim() || '',
    createdBy: actor.employeeId,
    createdAt: stamp,
    updatedAt: stamp,
  };

  const assets = state.assets.map((a) =>
    a.id === assetId
      ? { ...a, status: 'Under Maintenance' as const, updatedBy: actor.employeeId, updatedAt: stamp }
      : a,
  );

  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId,
    action: 'MAINTENANCE',
    fromStatus: asset.status,
    toStatus: 'Under Maintenance',
    employeeId: asset.assignedEmployeeId,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: `Maintenance: ${record.title}`,
    createdAt: stamp,
  };

  setState({
    ...state,
    assets,
    maintenance: [...state.maintenance, record],
    history: [...state.history, history],
  });
  return record;
}

export function completeMaintenance(
  companyId: string,
  assetId: string,
  maintenanceId: string,
  actor: { employeeId: string; name: string },
): Asset {
  const state = getState();
  const stamp = nowIso();
  const maintenance = state.maintenance.map((m) =>
    m.id === maintenanceId && m.assetId === assetId
      ? { ...m, status: 'Completed' as const, completedAt: stamp, updatedAt: stamp }
      : m,
  );
  const asset = state.assets.find((a) => a.id === assetId && a.companyId === companyId);
  if (!asset) throw new Error('Asset not found.');

  const nextStatus = asset.assignedEmployeeId ? 'In Use' : 'Available';
  const assets = state.assets.map((a) =>
    a.id === assetId
      ? { ...a, status: nextStatus as Asset['status'], updatedBy: actor.employeeId, updatedAt: stamp }
      : a,
  );
  const history: AssetHistory = {
    id: id('ah'),
    companyId,
    assetId,
    action: 'MAINTENANCE_COMPLETED',
    fromStatus: 'Under Maintenance',
    toStatus: nextStatus,
    employeeId: asset.assignedEmployeeId,
    actorId: actor.employeeId,
    actorName: actor.name,
    details: 'Maintenance completed',
    createdAt: stamp,
  };
  setState({ ...state, assets, maintenance, history: [...state.history, history] });
  return getAsset(companyId, assetId)!;
}

export function getAssetDetail(companyId: string, assetId: string) {
  const asset = getAsset(companyId, assetId);
  if (!asset) return null;
  const state = getState();
  return {
    ...asset,
    history: state.history
      .filter((h) => h.assetId === assetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    maintenance: state.maintenance
      .filter((m) => m.assetId === assetId)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    assignments: state.assignments
      .filter((a) => a.assetId === assetId)
      .sort((a, b) => b.assignedAt.localeCompare(a.assignedAt)),
    documents: state.documents.filter((d) => d.assetId === assetId),
  };
}

export function summarizeAssets(assets: Asset[]) {
  const today = new Date().toISOString().slice(0, 10);
  return {
    total: assets.length,
    assigned: assets.filter((a) => Boolean(a.assignedEmployeeId)).length,
    inUse: assets.filter((a) => a.status === 'In Use').length,
    underMaintenance: assets.filter((a) => a.status === 'Under Maintenance').length,
    dueForReturn: assets.filter(
      (a) =>
        a.expectedReturnDate &&
        a.expectedReturnDate <= today &&
        Boolean(a.assignedEmployeeId),
    ).length,
    available: assets.filter((a) => a.status === 'Available').length,
  };
}
