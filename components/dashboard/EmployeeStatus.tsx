'use client';

import { FC } from 'react';
import { UserCheck } from 'lucide-react';

interface EmployeeStatusProps {
  employeeId?: string;
  status?: 'Active' | 'Inactive' | 'On Leave' | string;
}

const colorForStatus = (s?: string) => (s === 'Active' ? 'bg-emerald-400' : s === 'On Leave' ? 'bg-yellow-400' : 'bg-slate-400');

const EmployeeStatus: FC<EmployeeStatusProps> = ({ employeeId = 'EMP000', status = 'Active' }) => {
  return (
    <div className="relative">
      <div className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-md px-4 py-3 w-52">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-xs text-white/90">Employee ID</div>
            <div className="mt-1 font-semibold text-white">{employeeId}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className={`inline-block h-3 w-3 rounded-full ${colorForStatus(status)}`} />
            <div className="text-sm text-white/90">{status}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStatus;