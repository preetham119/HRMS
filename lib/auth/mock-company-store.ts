import { createJoinToken, joinUrlForToken } from '@/lib/company';
import type { AppRole } from '@/lib/auth';
import { MOCK_COMPANY, MOCK_USERS } from '@/lib/auth/mock-users';

type MockMember = {
  id: string;
  name: string;
  email: string;
  role: AppRole;
  employeeId: string;
  status: string;
};

type MockCompanyState = {
  id: string;
  name: string;
  joinEnabled: boolean;
  joinToken: string;
  members: MockMember[];
};

const STORE_VERSION = 3;

declare global {
  // eslint-disable-next-line no-var
  var __hrmsMockCompanyStore: MockCompanyState | undefined;
  // eslint-disable-next-line no-var
  var __hrmsMockCompanyStoreVersion: number | undefined;
}

function createInitialState(): MockCompanyState {
  return {
    id: MOCK_COMPANY.id,
    name: MOCK_COMPANY.name,
    joinEnabled: true,
    joinToken: createJoinToken(),
    members: MOCK_USERS.map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      employeeId: user.employeeId,
      status: 'active',
    })),
  };
}

function getStore(): MockCompanyState {
  if (!globalThis.__hrmsMockCompanyStore || globalThis.__hrmsMockCompanyStoreVersion !== STORE_VERSION) {
    globalThis.__hrmsMockCompanyStore = createInitialState();
    globalThis.__hrmsMockCompanyStoreVersion = STORE_VERSION;
  }
  return globalThis.__hrmsMockCompanyStore;
}

export function getMockJoinLink() {
  const store = getStore();
  return {
    joinEnabled: store.joinEnabled,
    joinToken: store.joinToken,
    joinUrl: joinUrlForToken(store.joinToken),
  };
}

export function getMockCompanyByJoinToken(token: string) {
  const store = getStore();
  if (!token || store.joinToken !== token) return null;
  return {
    id: store.id,
    name: store.name,
    joinEnabled: store.joinEnabled,
    joinToken: store.joinToken,
  };
}

export function setMockJoinEnabled(joinEnabled: boolean) {
  const store = getStore();
  store.joinEnabled = joinEnabled;
  return getMockJoinLink();
}

export function regenerateMockJoinToken() {
  const store = getStore();
  store.joinToken = createJoinToken();
  store.joinEnabled = true;
  return getMockJoinLink();
}

export function listMockMembers() {
  return getStore().members.map((member) => ({ ...member }));
}

export function updateMockMemberRole(membershipId: string, role: AppRole) {
  const store = getStore();
  const target = store.members.find((member) => member.id === membershipId);
  if (!target) return null;

  if (target.role === 'ADMIN' && role !== 'ADMIN') {
    const adminCount = store.members.filter((member) => member.role === 'ADMIN' && member.status === 'active').length;
    if (adminCount <= 1) {
      throw new Error('Cannot demote the last Admin.');
    }
  }

  target.role = role;
  return { ...target };
}

export function syncMockMemberProfile(
  employeeId: string,
  updates: { name?: string; department?: string },
) {
  const store = getStore();
  const target = store.members.find((member) => member.employeeId === employeeId);
  if (!target) return null;
  if (updates.name) target.name = updates.name;
  return { ...target };
}
