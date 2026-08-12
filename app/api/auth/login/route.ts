import { NextRequest, NextResponse } from 'next/server';
import { createJwtToken, type AppRole } from '@/lib/auth';

const MOCK_USERS = [
  {
    id: 'emp-001',
    email: 'employee@company.com',
    password: 'Employee@123',
    name: 'Rajesh Kumar',
    role: 'EMPLOYEE' as AppRole,
    employeeId: 'EMP001',
    department: 'Quality Assurance',
  },
  {
    id: 'emp-002',
    email: 'employee2@company.com',
    password: 'Employee2@123',
    name: 'Sneha Reddy',
    role: 'EMPLOYEE' as AppRole,
    employeeId: 'EMP002',
    department: 'Engineering',
  },
  {
    id: 'emp-003',
    email: 'employee3@company.com',
    password: 'Employee3@123',
    name: 'Karthik Iyer',
    role: 'EMPLOYEE' as AppRole,
    employeeId: 'EMP003',
    department: 'Engineering',
  },
  {
    id: 'mgr-001',
    email: 'manager@company.com',
    password: 'Manager@123',
    name: 'Anita Desai',
    role: 'MANAGER' as AppRole,
    employeeId: 'MGR001',
    department: 'Engineering',
  },
  {
    id: 'hr-001',
    email: 'hr@company.com',
    password: 'HR@123',
    name: 'HR Admin',
    role: 'HR' as AppRole,
    employeeId: 'HR001',
    department: 'Human Resources',
  },
  {
    id: 'fin-001',
    email: 'finance@company.com',
    password: 'Finance@123',
    name: 'Vikram Shah',
    role: 'FINANCE' as AppRole,
    employeeId: 'FIN001',
    department: 'Finance',
  },
  {
    id: 'adm-001',
    email: 'admin@company.com',
    password: 'Admin@123',
    name: 'System Admin',
    role: 'ADMIN' as AppRole,
    employeeId: 'ADM001',
    department: 'Administration',
  },
  {
    id: 'ceo-001',
    email: 'ceo@company.com',
    password: 'Ceo@123',
    name: 'Arjun Mehta',
    role: 'CEO' as AppRole,
    employeeId: 'CEO001',
    department: 'Executive Office',
  },
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = MOCK_USERS.find((entry) => entry.email.toLowerCase() === normalizedEmail && entry.password === password);

    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
    }

    const token = createJwtToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json(
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          employeeId: user.employeeId,
          name: user.name,
          department: user.department,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
