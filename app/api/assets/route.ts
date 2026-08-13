import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { AuthError, requireMembership } from '@/lib/auth/session';
import { canManageAssets, canViewOrgAssets } from '@/lib/assets/permissions';
import {
  addMaintenance,
  assignAsset,
  completeMaintenance,
  createAsset,
  deleteAsset,
  getAssetDetail,
  listAssets,
  listCategories,
  reassignAsset,
  returnAsset,
  setAssetStatus,
  summarizeAssets,
  updateAsset,
} from '@/lib/assets/store';
import { ASSET_CONDITIONS, ASSET_STATUSES } from '@/lib/assets/types';
import { getMockProfile } from '@/lib/auth/mock-profile-store';
import { listMockMembers } from '@/lib/auth/mock-company-store';
import { isMockAuthEnabled } from '@/lib/auth/mock-mode';

function actor(membership: Awaited<ReturnType<typeof requireMembership>>) {
  return { employeeId: membership.employeeId, name: membership.name };
}

function scopedAssets(
  membership: Awaited<ReturnType<typeof requireMembership>>,
  all: ReturnType<typeof listAssets>,
) {
  if (canViewOrgAssets(membership.role) || canManageAssets(membership.role)) {
    return all;
  }

  if (membership.role === 'MANAGER') {
    const reports = new Set<string>([membership.employeeId]);
    if (isMockAuthEnabled()) {
      for (const member of listMockMembers()) {
        const profile = getMockProfile(member.employeeId);
        if (profile?.manager && profile.manager === membership.name) {
          reports.add(member.employeeId);
        }
      }
    }
    return all.filter(
      (a) => a.assignedEmployeeId && reports.has(a.assignedEmployeeId),
    );
  }

  return all.filter((a) => a.assignedEmployeeId === membership.employeeId);
}

export async function GET(request: NextRequest) {
  try {
    const membership = await requireMembership();
    const { searchParams } = new URL(request.url);
    const view = searchParams.get('view') || 'list';
    const assetId = searchParams.get('id');
    const q = (searchParams.get('q') || '').trim().toLowerCase();
    const status = searchParams.get('status') || '';
    const categoryId = searchParams.get('categoryId') || '';
    const employeeId = searchParams.get('employeeId') || '';
    const page = Math.max(1, Number(searchParams.get('page') || 1));
    const pageSize = Math.min(50, Math.max(5, Number(searchParams.get('pageSize') || 10)));
    const sort = searchParams.get('sort') || 'updatedAt';
    const dir = searchParams.get('dir') === 'asc' ? 'asc' : 'desc';

    if (view === 'categories') {
      return NextResponse.json({ categories: listCategories(membership.companyId) });
    }

    if (view === 'employees' && canManageAssets(membership.role)) {
      const members = isMockAuthEnabled()
        ? listMockMembers().map((m) => ({
            employeeId: m.employeeId,
            name: m.name,
            email: m.email,
            role: m.role,
            department: getMockProfile(m.employeeId)?.department || '',
          }))
        : [];
      return NextResponse.json({ employees: members });
    }

    if (view === 'detail' && assetId) {
      const detail = getAssetDetail(membership.companyId, assetId);
      if (!detail) {
        return NextResponse.json({ error: 'Asset not found' }, { status: 404 });
      }
      const allowed = scopedAssets(membership, [detail]);
      if (!allowed.length && !canManageAssets(membership.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      return NextResponse.json({ asset: detail });
    }

    const scoped = scopedAssets(membership, listAssets(membership.companyId));
    const categoryCounts: Record<string, number> = {};
    for (const asset of scoped) {
      categoryCounts[asset.categoryId] = (categoryCounts[asset.categoryId] || 0) + 1;
    }

    let assets = scoped;

    if (q) {
      assets = assets.filter((a) =>
        [a.name, a.assetTag, a.serialNumber, a.brand, a.model, a.assignedEmployeeName, a.categoryName]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    if (status) assets = assets.filter((a) => a.status === status);
    if (categoryId) assets = assets.filter((a) => a.categoryId === categoryId);
    if (employeeId) {
      if (!canManageAssets(membership.role) && !canViewOrgAssets(membership.role) && membership.role !== 'MANAGER') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      assets = assets.filter((a) => a.assignedEmployeeId === employeeId);
    }

    assets = [...assets].sort((a, b) => {
      const av = String((a as Record<string, unknown>)[sort] ?? '');
      const bv = String((b as Record<string, unknown>)[sort] ?? '');
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    const summary = summarizeAssets(
      canManageAssets(membership.role) || canViewOrgAssets(membership.role)
        ? listAssets(membership.companyId).filter((a) =>
            membership.role === 'MANAGER'
              ? scopedAssets(membership, [a]).length > 0
              : true,
          )
        : assets,
    );

    // Employee/manager summary from scoped list
    const scopedSummary = summarizeAssets(
      membership.role === 'MANAGER' || !canViewOrgAssets(membership.role)
        ? scopedAssets(membership, listAssets(membership.companyId))
        : listAssets(membership.companyId),
    );

    const total = assets.length;
    const start = (page - 1) * pageSize;
    const pageItems = assets.slice(start, start + pageSize);

    return NextResponse.json({
      summary: canManageAssets(membership.role) || canViewOrgAssets(membership.role) ? summary : scopedSummary,
      assets: pageItems,
      categoryCounts,
      pagination: { page, pageSize, total, totalPages: Math.max(1, Math.ceil(total / pageSize)) },
      canManage: canManageAssets(membership.role),
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error('Assets GET error:', error);
    return NextResponse.json({ error: 'Failed to load assets' }, { status: 500 });
  }
}

const createSchema = z.object({
  name: z.string().min(1),
  assetTag: z.string().min(1),
  categoryId: z.string().min(1),
  serialNumber: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  condition: z.enum(ASSET_CONDITIONS).optional(),
  purchaseDate: z.string().nullable().optional(),
  warrantyExpiry: z.string().nullable().optional(),
  notes: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const membership = await requireMembership();
    if (!canManageAssets(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const action = body.action || 'create';

    if (action === 'create') {
      const parsed = createSchema.safeParse(body);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Invalid asset payload' }, { status: 400 });
      }
      const asset = createAsset(membership.companyId, actor(membership), parsed.data);
      return NextResponse.json({ asset }, { status: 201 });
    }

    if (action === 'assign') {
      const schema = z.object({
        assetId: z.string().min(1),
        employeeId: z.string().min(1),
        employeeName: z.string().min(1),
        expectedReturnDate: z.string().nullable().optional(),
        notes: z.string().optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid assign payload' }, { status: 400 });
      const asset = assignAsset(
        membership.companyId,
        parsed.data.assetId,
        actor(membership),
        { employeeId: parsed.data.employeeId, employeeName: parsed.data.employeeName },
        parsed.data.expectedReturnDate,
        parsed.data.notes,
      );
      return NextResponse.json({ asset });
    }

    if (action === 'reassign') {
      const schema = z.object({
        assetId: z.string().min(1),
        employeeId: z.string().min(1),
        employeeName: z.string().min(1),
        expectedReturnDate: z.string().nullable().optional(),
        notes: z.string().optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid reassign payload' }, { status: 400 });
      const asset = reassignAsset(
        membership.companyId,
        parsed.data.assetId,
        actor(membership),
        { employeeId: parsed.data.employeeId, employeeName: parsed.data.employeeName },
        parsed.data.expectedReturnDate,
        parsed.data.notes,
      );
      return NextResponse.json({ asset });
    }

    if (action === 'return') {
      const schema = z.object({
        assetId: z.string().min(1),
        notes: z.string().optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid return payload' }, { status: 400 });
      const asset = returnAsset(
        membership.companyId,
        parsed.data.assetId,
        actor(membership),
        parsed.data.notes,
      );
      return NextResponse.json({ asset });
    }

    if (action === 'status') {
      const schema = z.object({
        assetId: z.string().min(1),
        status: z.enum(ASSET_STATUSES),
        details: z.string().optional(),
        condition: z.enum(ASSET_CONDITIONS).optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid status payload' }, { status: 400 });
      let asset = setAssetStatus(
        membership.companyId,
        parsed.data.assetId,
        actor(membership),
        parsed.data.status,
        parsed.data.details,
      );
      if (parsed.data.condition) {
        asset = updateAsset(membership.companyId, parsed.data.assetId, actor(membership), {
          condition: parsed.data.condition,
        });
      }
      return NextResponse.json({ asset });
    }

    if (action === 'maintenance') {
      const schema = z.object({
        assetId: z.string().min(1),
        title: z.string().min(1),
        description: z.string().optional(),
        vendor: z.string().optional(),
        cost: z.number().optional(),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid maintenance payload' }, { status: 400 });
      const record = addMaintenance(
        membership.companyId,
        parsed.data.assetId,
        actor(membership),
        parsed.data,
      );
      return NextResponse.json({ maintenance: record, asset: getAssetDetail(membership.companyId, parsed.data.assetId) });
    }

    if (action === 'completeMaintenance') {
      const schema = z.object({
        assetId: z.string().min(1),
        maintenanceId: z.string().min(1),
      });
      const parsed = schema.safeParse(body);
      if (!parsed.success) return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
      const asset = completeMaintenance(
        membership.companyId,
        parsed.data.assetId,
        parsed.data.maintenanceId,
        actor(membership),
      );
      return NextResponse.json({ asset });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to save asset';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const membership = await requireMembership();
    if (!canManageAssets(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const body = await request.json();
    const assetId = String(body.assetId || '');
    if (!assetId) return NextResponse.json({ error: 'assetId required' }, { status: 400 });

    const parsed = createSchema.partial().safeParse(body);
    if (!parsed.success) return NextResponse.json({ error: 'Invalid update payload' }, { status: 400 });

    const asset = updateAsset(membership.companyId, assetId, actor(membership), parsed.data as any);
    return NextResponse.json({ asset });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to update asset';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const membership = await requireMembership();
    if (!canManageAssets(membership.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const assetId = searchParams.get('id');
    if (!assetId) return NextResponse.json({ error: 'id required' }, { status: 400 });
    deleteAsset(membership.companyId, assetId);
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    const message = error instanceof Error ? error.message : 'Failed to delete asset';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
