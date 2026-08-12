import { NextRequest, NextResponse } from 'next/server';
import { AUTH_COOKIE_NAME, decodeJwtToken, normalizeAppRole, type AppRole } from '@/lib/auth';
import type { ExitActor } from '@/lib/exit/types';
import {
  completeExitInterview,
  createOrUpdateDraft,
  decideApproval,
  findActiveExitForEmployee,
  findExitById,
  listExitsForActor,
  listNotificationsForActor,
  processFullAndFinal,
  reopenResignation,
  requestWithdrawal,
  reviewWithdrawal,
} from '@/lib/exit/store';

function getActor(request: NextRequest): ExitActor | null {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value ?? request.headers.get('x-auth-token');
  const decoded = decodeJwtToken(token);
  if (!decoded) return null;

  const role = normalizeAppRole(decoded.role);
  const employeeIdFromHeader = request.headers.get('x-employee-id');
  const nameFromHeader = request.headers.get('x-user-name');

  return {
    id: decoded.id,
    email: decoded.email,
    name: nameFromHeader || decoded.name || decoded.email,
    role,
    employeeId:
      employeeIdFromHeader ||
      (role === 'HR'
        ? 'HR001'
        : role === 'MANAGER'
          ? 'MGR001'
          : role === 'FINANCE'
            ? 'FIN001'
            : role === 'ADMIN'
              ? 'ADM001'
              : 'EMP001'),
  };
}

function actorFromBodyFallback(body: Record<string, unknown>, cookieActor: ExitActor | null): ExitActor | null {
  if (cookieActor) return cookieActor;
  const role = normalizeAppRole(String(body.actorRole ?? 'EMPLOYEE'));
  const email = String(body.actorEmail ?? '');
  const id = String(body.actorId ?? '');
  const employeeId = String(body.actorEmployeeId ?? '');
  const name = String(body.actorName ?? email);
  if (!email || !id || !employeeId) return null;
  return { id, email, name, role: role as AppRole, employeeId };
}

export async function GET(request: NextRequest) {
  try {
    const actor = getActor(request);
    const employeeId = request.nextUrl.searchParams.get('employeeId');
    const id = request.nextUrl.searchParams.get('id');
    const scope = request.nextUrl.searchParams.get('scope');

    if (scope === 'notifications') {
      if (!actor) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      return NextResponse.json({ notifications: listNotificationsForActor(actor) });
    }

    if (id) {
      const item = findExitById(id);
      if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      return NextResponse.json({ exitCase: item });
    }

    if (employeeId) {
      return NextResponse.json({ exitCase: findActiveExitForEmployee(employeeId) });
    }

    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    return NextResponse.json({
      exitCase: findActiveExitForEmployee(actor.employeeId),
      cases: listExitsForActor(actor),
      notifications: listNotificationsForActor(actor),
    });
  } catch (error) {
    console.error('Exit GET error:', error);
    return NextResponse.json({ error: 'Failed to load exit data' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const actor = actorFromBodyFallback(body, getActor(request));
    if (!actor) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const action = String(body.action ?? 'save');

    if (action === 'save' || action === 'submit') {
      const exitCase = createOrUpdateDraft(
        actor,
        {
          resignationDate: body.resignationDate,
          lastWorkingDay: body.lastWorkingDay,
          noticePeriodDays: Number(body.noticePeriodDays ?? 30),
          reasonCategory: body.reasonCategory,
          reasonDetails: body.reasonDetails,
          letterFileName: body.letterFileName,
          letterFileSize: body.letterFileSize,
          letterMimeType: body.letterMimeType,
          letterDataUrl: body.letterDataUrl,
          designation: body.designation,
          department: body.department,
          reportingManagerEmail: body.reportingManagerEmail ?? 'manager@company.com',
          reportingManagerId: body.reportingManagerId ?? 'usr-mgr-001',
        },
        action === 'submit',
      );
      return NextResponse.json({ exitCase, message: action === 'submit' ? 'Resignation submitted.' : 'Draft saved.' });
    }

    if (action === 'approve' || action === 'reject') {
      const asRole = body.asRole === 'MANAGER' ? 'MANAGER' : 'HR';
      if (asRole === 'MANAGER' && actor.role !== 'MANAGER' && actor.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      if (asRole === 'HR' && actor.role !== 'HR' && actor.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const exitCase = decideApproval(
        actor,
        body.exitId,
        asRole,
        action === 'approve' ? 'Approved' : 'Rejected',
        body.comment,
      );
      return NextResponse.json({ exitCase, message: `Resignation ${action}d.` });
    }

    if (action === 'request-withdrawal') {
      const exitCase = requestWithdrawal(actor, body.exitId, body.reason);
      return NextResponse.json({ exitCase, message: 'Withdrawal request submitted.' });
    }

    if (action === 'review-withdrawal') {
      if (actor.role !== 'HR' && actor.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const exitCase = reviewWithdrawal(actor, body.exitId, body.decision, body.comment);
      return NextResponse.json({ exitCase, message: `Withdrawal ${String(body.decision).toLowerCase()}.` });
    }

    if (action === 'reopen') {
      if (actor.role !== 'HR' && actor.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const exitCase = reopenResignation(actor, body.exitId, body.reason);
      return NextResponse.json({ exitCase, message: 'Resignation reopened for resubmission.' });
    }

    if (action === 'complete-interview') {
      const exitCase = completeExitInterview(actor, body.exitId, {
        primaryReason: body.primaryReason,
        experienceRating: Number(body.experienceRating),
        managerRating: Number(body.managerRating),
        wouldRecommend: body.wouldRecommend,
        likedMost: body.likedMost,
        improvements: body.improvements,
        additionalComments: body.additionalComments,
      });
      return NextResponse.json({ exitCase, message: 'Exit interview completed. Full & Final enabled.' });
    }

    if (action === 'save-fnf' || action === 'complete-fnf') {
      if (actor.role !== 'FINANCE' && actor.role !== 'HR' && actor.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
      }
      const exitCase = processFullAndFinal(actor, body.exitId, {
        assetsReturned: Boolean(body.assetsReturned),
        accessRevoked: Boolean(body.accessRevoked),
        leaveEncashment: Number(body.leaveEncashment ?? 0),
        gratuityAmount: Number(body.gratuityAmount ?? 0),
        otherDues: Number(body.otherDues ?? 0),
        deductions: Number(body.deductions ?? 0),
        paymentMode: body.paymentMode,
        remarks: body.remarks,
        complete: action === 'complete-fnf',
      });
      return NextResponse.json({
        exitCase,
        message: action === 'complete-fnf' ? 'Full & Final completed.' : 'Full & Final saved.',
      });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to process exit action';
    console.error('Exit POST error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
