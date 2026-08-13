import type { AppRole } from '@/lib/auth';

export type MockUser = {
  id: string;
  email: string;
  password: string;
  name: string;
  role: AppRole;
  employeeId: string;
  department: string;
};

/** All employee IDs use EMP prefix only (role is separate). */
export const MOCK_USERS: MockUser[] = [
  {
    id: 'emp-001',
    email: 'employee@company.com',
    password: 'Employee@123',
    name: 'Rajesh Kumar',
    role: 'EMPLOYEE_PR',
    employeeId: 'EMP001',
    department: 'Quality Assurance',
  },
  {
    id: 'emp-002',
    email: 'employee2@company.com',
    password: 'Employee2@123',
    name: 'Sneha Reddy',
    role: 'EMPLOYEE_CONT',
    employeeId: 'EMP002',
    department: 'Engineering',
  },
  {
    id: 'emp-003',
    email: 'employee3@company.com',
    password: 'Employee3@123',
    name: 'Karthik Iyer',
    role: 'EMPLOYEE_PR',
    employeeId: 'EMP003',
    department: 'Engineering',
  },
  {
    id: 'emp-004',
    email: 'manager@company.com',
    password: 'Manager@123',
    name: 'Anita Desai',
    role: 'MANAGER',
    employeeId: 'EMP004',
    department: 'Engineering',
  },
  {
    id: 'emp-005',
    email: 'hr@company.com',
    password: 'HR@123',
    name: 'HR Admin',
    role: 'HR',
    employeeId: 'EMP005',
    department: 'Human Resources',
  },
  {
    id: 'emp-006',
    email: 'finance@company.com',
    password: 'Finance@123',
    name: 'Vikram Shah',
    role: 'FINANCE',
    employeeId: 'EMP006',
    department: 'Finance',
  },
  {
    id: 'emp-007',
    email: 'admin@company.com',
    password: 'Admin@123',
    name: 'System Admin',
    role: 'ADMIN',
    employeeId: 'EMP007',
    department: 'Administration',
  },
  {
    id: 'emp-008',
    email: 'ceo@company.com',
    password: 'Ceo@123',
    name: 'Arjun Mehta',
    role: 'CEO',
    employeeId: 'EMP008',
    department: 'Executive Office',
  },
];

export const MOCK_COMPANY = {
  id: 'demo-company',
  name: 'DesIDEA Technologies',
};

export function findMockUser(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_USERS.find(
    (entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password,
  );
}

export function findMockUserById(id: string) {
  return MOCK_USERS.find((entry) => entry.id === id) ?? null;
}

export function findMockUserByEmail(email: string) {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_USERS.find((entry) => entry.email.toLowerCase() === normalizedEmail) ?? null;
}
