/**
 * End-to-end exit flow smoke test against a running Next.js server.
 * Usage: node scripts/test-exit-flow.mjs [baseUrl]
 * Default baseUrl: http://localhost:3000
 */

const baseUrl = process.argv[2] || 'http://localhost:3000';

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function createToken(actor) {
  const payload = {
    id: actor.id,
    email: actor.email,
    name: actor.name,
    role: actor.role,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60 * 60,
  };
  return Buffer.from(JSON.stringify(payload)).toString('base64');
}

function actorPayload(actor) {
  return {
    actorId: actor.id,
    actorEmail: actor.email,
    actorName: actor.name,
    actorRole: actor.role,
    actorEmployeeId: actor.employeeId,
    department: actor.department,
  };
}

function headers(actor) {
  return {
    'Content-Type': 'application/json',
    'x-auth-token': createToken(actor),
    'x-employee-id': actor.employeeId,
    'x-user-name': actor.name,
  };
}

async function post(actor, body) {
  const response = await fetch(`${baseUrl}/api/exit`, {
    method: 'POST',
    headers: headers(actor),
    body: JSON.stringify({ ...actorPayload(actor), ...body }),
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`${body.action || 'action'} failed: ${data.error || response.status}`);
  }
  return data;
}

async function get(actor) {
  const response = await fetch(`${baseUrl}/api/exit`, {
    headers: headers(actor),
    cache: 'no-store',
  });
  const data = await response.json();
  if (!response.ok) {
    throw new Error(`GET failed: ${data.error || response.status}`);
  }
  return data;
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  console.log(`Testing exit flow against ${baseUrl}`);

  const runId = Date.now().toString(36);
  const employee = {
    id: `usr-emp-test-${runId}`,
    email: `employee+${runId}@company.com`,
    name: `Test Employee ${runId}`,
    role: 'EMPLOYEE',
    employeeId: `EMP-TEST-${runId}`,
    department: 'Quality Assurance',
  };

  const manager = {
    id: 'usr-mgr-001',
    email: 'manager@company.com',
    name: 'Anita Desai',
    role: 'MANAGER',
    employeeId: 'EMP004',
    department: 'Engineering',
  };

  const hr = {
    id: 'usr-hr-001',
    email: 'hr@company.com',
    name: 'HR Admin',
    role: 'HR',
    employeeId: 'EMP005',
    department: 'Human Resources',
  };

  const submit = await post(employee, {
    action: 'submit',
    resignationDate: todayPlus(0),
    lastWorkingDay: todayPlus(30),
    noticePeriodDays: 30,
    reasonCategory: 'Better Opportunity',
    reasonDetails: 'Moving to a role with stronger growth and ownership opportunities.',
    letterFileName: 'resignation-letter.pdf',
    letterFileSize: 1024,
    letterMimeType: 'application/pdf',
    letterDataUrl: 'data:application/pdf;base64,JVBERi0xLjQK',
    designation: 'Software Engineer',
    reportingManagerEmail: 'manager@company.com',
    reportingManagerId: 'usr-mgr-001',
  });

  assert(submit.exitCase?.status === 'Pending Approval', `Expected Pending Approval, got ${submit.exitCase?.status}`);
  const exitId = submit.exitCase.id;
  console.log('✓ Employee submitted resignation → Pending Approval');

  const managerView = await get(manager);
  const managerNotes = (managerView.notifications || []).filter((n) => n.relatedExitId === exitId);
  assert(managerNotes.length > 0, 'Manager should receive submission notification');
  console.log('✓ Manager notification created');

  const hrView = await get(hr);
  const hrNotes = (hrView.notifications || []).filter((n) => n.relatedExitId === exitId);
  assert(hrNotes.length > 0, 'HR should receive submission notification');
  console.log('✓ HR notification created');

  const mgrApprove = await post(manager, {
    action: 'approve',
    asRole: 'MANAGER',
    exitId,
    comment: 'Approved by manager for testing',
  });
  assert(mgrApprove.exitCase.managerApproval.status === 'Approved', 'Manager approval missing');
  assert(mgrApprove.exitCase.status === 'Pending Approval', 'Should stay Pending Approval until HR approves');
  console.log('✓ Manager approved');

  const hrAfterMgr = await get(hr);
  const hrFollowUp = (hrAfterMgr.notifications || []).some(
    (n) => n.relatedExitId === exitId && /HR action needed/i.test(n.title),
  );
  assert(hrFollowUp, 'HR should get follow-up notification after manager approval');
  console.log('✓ HR follow-up notification after manager approval');

  const hrApprove = await post(hr, {
    action: 'approve',
    asRole: 'HR',
    exitId,
    comment: 'Approved by HR for testing',
  });
  assert(hrApprove.exitCase.hrApproval.status === 'Approved', 'HR approval missing');
  assert(hrApprove.exitCase.status === 'Exit Interview Pending', `Expected Exit Interview Pending, got ${hrApprove.exitCase.status}`);
  console.log('✓ HR approved → Exit Interview Pending');

  const employeeAfter = await get(employee);
  assert(employeeAfter.exitCase?.status === 'Exit Interview Pending', 'Employee should see Exit Interview Pending');
  const unlockNote = (employeeAfter.notifications || []).some(
    (n) => n.relatedExitId === exitId && /Exit Interview unlocked/i.test(n.title),
  );
  assert(unlockNote, 'Employee should get Exit Interview unlocked notification');
  console.log('✓ Exit Interview unlocked for employee');

  const interview = await post(employee, {
    action: 'complete-interview',
    exitId,
    primaryReason: 'Career Growth',
    experienceRating: 4,
    managerRating: 4,
    wouldRecommend: 'Yes',
    likedMost: 'Supportive team and good learning culture throughout tenure.',
    improvements: 'Faster decision making and clearer growth paths would help.',
    additionalComments: 'Appreciate the opportunity.',
  });
  assert(
    interview.exitCase.status === 'Full & Final Pending' || interview.exitCase.status === 'Exit Interview Completed',
    `Expected F&F pending after interview, got ${interview.exitCase.status}`,
  );
  console.log(`✓ Exit interview completed → ${interview.exitCase.status}`);

  console.log('\nAll exit flow checks passed.');
}

main().catch((err) => {
  console.error('\nExit flow test failed:', err.message);
  process.exit(1);
});
