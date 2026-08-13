import type { SettingsStatus } from '@/components/settings/settings-data';

export type SettingsFieldType = 'text' | 'number' | 'select' | 'toggle' | 'textarea';

export type SettingsField = {
  key: string;
  label: string;
  description?: string;
  type: SettingsFieldType;
  options?: { label: string; value: string }[];
  placeholder?: string;
  min?: number;
  max?: number;
};

export type SettingsModuleConfig = {
  slug: string;
  sections: {
    title: string;
    description?: string;
    fields: SettingsField[];
  }[];
  defaults: Record<string, string | number | boolean>;
  initialStatus: SettingsStatus;
};

export const SETTINGS_MODULE_CONFIGS: Record<string, SettingsModuleConfig> = {
  organization: {
    slug: 'organization',
    initialStatus: 'Configured',
    defaults: {
      companyName: 'DesIDEA Technologies',
      legalEntity: 'DesIDEA Pvt Ltd',
      headquarters: 'Hyderabad, India',
      fiscalYearStart: 'April',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
    },
    sections: [
      {
        title: 'Company profile',
        description: 'Core identity used across payroll, letters, and portals.',
        fields: [
          { key: 'companyName', label: 'Company name', type: 'text', placeholder: 'Organization name' },
          { key: 'legalEntity', label: 'Legal entity', type: 'text' },
          { key: 'headquarters', label: 'Headquarters', type: 'text' },
        ],
      },
      {
        title: 'Fiscal & locale',
        fields: [
          {
            key: 'fiscalYearStart',
            label: 'Fiscal year starts',
            type: 'select',
            options: [
              { label: 'January', value: 'January' },
              { label: 'April', value: 'April' },
              { label: 'July', value: 'July' },
              { label: 'October', value: 'October' },
            ],
          },
          {
            key: 'timezone',
            label: 'Primary timezone',
            type: 'select',
            options: [
              { label: 'Asia/Kolkata', value: 'Asia/Kolkata' },
              { label: 'America/New_York', value: 'America/New_York' },
              { label: 'UTC', value: 'UTC' },
            ],
          },
          {
            key: 'currency',
            label: 'Base currency',
            type: 'select',
            options: [
              { label: 'INR', value: 'INR' },
              { label: 'USD', value: 'USD' },
              { label: 'EUR', value: 'EUR' },
            ],
          },
        ],
      },
    ],
  },
  'user-roles': {
    slug: 'user-roles',
    initialStatus: 'Configured',
    defaults: {
      defaultRole: 'EMPLOYEE_PR',
      allowSelfSignup: false,
      requireManagerAssignment: true,
      sessionIdleMinutes: 30,
      permissionAudit: true,
      settingsAccessRoles: 'HR,ADMIN',
    },
    sections: [
      {
        title: 'Access defaults',
        description: 'Roles are extracted from the live HRMS auth catalog (EMPLOYEE_PR, EMPLOYEE_CONT, MANAGER, HR, FINANCE, ADMIN, CEO).',
        fields: [
          {
            key: 'defaultRole',
            label: 'Default role for new users',
            type: 'select',
            options: [
              { label: 'Employee-PR', value: 'EMPLOYEE_PR' },
              { label: 'Employee-CONT', value: 'EMPLOYEE_CONT' },
              { label: 'Manager', value: 'MANAGER' },
              { label: 'HR', value: 'HR' },
              { label: 'Finance', value: 'FINANCE' },
              { label: 'Admin', value: 'ADMIN' },
              { label: 'CEO', value: 'CEO' },
            ],
          },
          { key: 'allowSelfSignup', label: 'Allow self sign-up', type: 'toggle', description: 'If off, only admins can create accounts.' },
          { key: 'requireManagerAssignment', label: 'Require manager assignment', type: 'toggle' },
          { key: 'sessionIdleMinutes', label: 'Session idle timeout (minutes)', type: 'number', min: 5, max: 480 },
          { key: 'permissionAudit', label: 'Log permission changes', type: 'toggle' },
          {
            key: 'settingsAccessRoles',
            label: 'Roles that can open Settings',
            type: 'text',
            placeholder: 'HR,ADMIN',
            description: 'Comma-separated AppRole values extracted from lib/auth.',
          },
        ],
      },
    ],
  },
  'departments-designations': {
    slug: 'departments-designations',
    initialStatus: 'Pending',
    defaults: {
      primaryStructure: 'functional',
      costCenterRequired: true,
      allowMatrixReporting: false,
      designationLevels: 5,
      notes: 'Align WEB, QA, SAP, ONSITE, and ITSD units with location mapping.',
    },
    sections: [
      {
        title: 'Org structure',
        fields: [
          {
            key: 'primaryStructure',
            label: 'Primary structure',
            type: 'select',
            options: [
              { label: 'Functional', value: 'functional' },
              { label: 'Divisional', value: 'divisional' },
              { label: 'Matrix', value: 'matrix' },
            ],
          },
          { key: 'costCenterRequired', label: 'Require cost center on departments', type: 'toggle' },
          { key: 'allowMatrixReporting', label: 'Allow matrix reporting lines', type: 'toggle' },
          { key: 'designationLevels', label: 'Designation levels', type: 'number', min: 2, max: 12 },
          { key: 'notes', label: 'Structure notes', type: 'textarea', placeholder: 'Describe org unit conventions…' },
        ],
      },
    ],
  },
  'employee-configuration': {
    slug: 'employee-configuration',
    initialStatus: 'Configured',
    defaults: {
      employeeCodePrefix: 'EMP',
      mandatoryFields: 'email,department,designation,manager',
      probationDays: 90,
      profilePhotoRequired: false,
      allowEmployeeSelfEdit: true,
    },
    sections: [
      {
        title: 'Profile policies',
        fields: [
          { key: 'employeeCodePrefix', label: 'Employee code prefix', type: 'text' },
          { key: 'mandatoryFields', label: 'Mandatory fields (comma-separated)', type: 'text' },
          { key: 'probationDays', label: 'Default probation (days)', type: 'number', min: 0, max: 365 },
          { key: 'profilePhotoRequired', label: 'Require profile photo', type: 'toggle' },
          { key: 'allowEmployeeSelfEdit', label: 'Employees can edit personal fields', type: 'toggle' },
        ],
      },
    ],
  },
  attendance: {
    slug: 'attendance',
    initialStatus: 'Pending',
    defaults: {
      shiftStart: '09:30',
      graceMinutes: 15,
      halfDayThresholdHours: 4,
      overtimeEnabled: true,
      geoFencing: false,
    },
    sections: [
      {
        title: 'Punch & shift rules',
        fields: [
          { key: 'shiftStart', label: 'Default shift start', type: 'text', placeholder: 'HH:MM' },
          { key: 'graceMinutes', label: 'Late grace (minutes)', type: 'number', min: 0, max: 120 },
          { key: 'halfDayThresholdHours', label: 'Half-day threshold (hours)', type: 'number', min: 1, max: 8 },
          { key: 'overtimeEnabled', label: 'Enable overtime capture', type: 'toggle' },
          { key: 'geoFencing', label: 'Require geo-fencing', type: 'toggle' },
        ],
      },
    ],
  },
  leave: {
    slug: 'leave',
    initialStatus: 'Configured',
    defaults: {
      annualLeaveDays: 18,
      casualLeaveDays: 12,
      sickLeaveDays: 8,
      sandwichRule: true,
      carryForwardMax: 5,
      approvalLevels: 'manager',
    },
    sections: [
      {
        title: 'Leave policies',
        fields: [
          { key: 'annualLeaveDays', label: 'Annual leave days', type: 'number', min: 0, max: 60 },
          { key: 'casualLeaveDays', label: 'Casual leave days', type: 'number', min: 0, max: 30 },
          { key: 'sickLeaveDays', label: 'Sick leave days', type: 'number', min: 0, max: 30 },
          { key: 'sandwichRule', label: 'Apply sandwich rule', type: 'toggle' },
          { key: 'carryForwardMax', label: 'Max carry-forward days', type: 'number', min: 0, max: 30 },
          {
            key: 'approvalLevels',
            label: 'Default approval path',
            type: 'select',
            options: [
              { label: 'Manager only', value: 'manager' },
              { label: 'Manager → HR', value: 'manager_hr' },
              { label: 'Manager → HR → Admin', value: 'manager_hr_admin' },
            ],
          },
        ],
      },
    ],
  },
  payroll: {
    slug: 'payroll',
    initialStatus: 'Pending',
    defaults: {
      payCycle: 'monthly',
      payDay: 28,
      pfEnabled: true,
      esiEnabled: true,
      bankExportFormat: 'neft',
    },
    sections: [
      {
        title: 'Pay cycle & statutory',
        fields: [
          {
            key: 'payCycle',
            label: 'Pay cycle',
            type: 'select',
            options: [
              { label: 'Monthly', value: 'monthly' },
              { label: 'Bi-weekly', value: 'biweekly' },
            ],
          },
          { key: 'payDay', label: 'Payroll cut-off day', type: 'number', min: 1, max: 31 },
          { key: 'pfEnabled', label: 'Enable PF calculations', type: 'toggle' },
          { key: 'esiEnabled', label: 'Enable ESI calculations', type: 'toggle' },
          {
            key: 'bankExportFormat',
            label: 'Bank export format',
            type: 'select',
            options: [
              { label: 'NEFT', value: 'neft' },
              { label: 'RTGS', value: 'rtgs' },
              { label: 'ACH', value: 'ach' },
            ],
          },
        ],
      },
    ],
  },
  recruitment: {
    slug: 'recruitment',
    initialStatus: 'Disabled',
    defaults: {
      moduleEnabled: false,
      defaultStages: 'Screening,Technical,HR,Offer',
      offerApproval: 'hr_admin',
      careerPagePublic: false,
    },
    sections: [
      {
        title: 'Hiring pipeline',
        fields: [
          { key: 'moduleEnabled', label: 'Enable recruitment module', type: 'toggle' },
          { key: 'defaultStages', label: 'Default interview stages', type: 'text' },
          {
            key: 'offerApproval',
            label: 'Offer approval path',
            type: 'select',
            options: [
              { label: 'HR only', value: 'hr' },
              { label: 'HR → Admin', value: 'hr_admin' },
              { label: 'HR → Admin → CEO', value: 'hr_admin_ceo' },
            ],
          },
          { key: 'careerPagePublic', label: 'Public career page', type: 'toggle' },
        ],
      },
    ],
  },
  performance: {
    slug: 'performance',
    initialStatus: 'Pending',
    defaults: {
      cycleFrequency: 'semi_annual',
      ratingScale: '5_star',
      goalWeight: 60,
      competencyWeight: 40,
      workflow: 'self_manager_admin_leadership',
      calibrationRequired: false,
      openPerformanceHub: true,
    },
    sections: [
      {
        title: 'Appraisal framework',
        description: 'Controls used by the Performance / Appraisal module.',
        fields: [
          {
            key: 'cycleFrequency',
            label: 'Default cycle frequency',
            type: 'select',
            options: [
              { label: 'Quarterly', value: 'quarterly' },
              { label: 'Semi-annual', value: 'semi_annual' },
              { label: 'Annual', value: 'annual' },
            ],
          },
          {
            key: 'ratingScale',
            label: 'Rating scale',
            type: 'select',
            options: [
              { label: '5-star', value: '5_star' },
              { label: '1–5 numeric', value: 'numeric_5' },
            ],
          },
          { key: 'goalWeight', label: 'Goal weight (%)', type: 'number', min: 0, max: 100 },
          { key: 'competencyWeight', label: 'Competency weight (%)', type: 'number', min: 0, max: 100 },
          {
            key: 'workflow',
            label: 'Review workflow',
            type: 'select',
            options: [
              { label: 'Self → Manager → Admin → Leadership', value: 'self_manager_admin_leadership' },
              { label: 'Self → Manager → HR', value: 'self_manager_hr' },
            ],
          },
          { key: 'calibrationRequired', label: 'Require calibration before publish', type: 'toggle' },
          { key: 'openPerformanceHub', label: 'Show Performance hub in portal', type: 'toggle' },
        ],
      },
    ],
  },
  notifications: {
    slug: 'notifications',
    initialStatus: 'Configured',
    defaults: {
      emailEnabled: true,
      smsEnabled: false,
      digestFrequency: 'daily',
      fromName: 'HRMS Portal',
      replyTo: 'hr@company.com',
    },
    sections: [
      {
        title: 'Channels & templates',
        fields: [
          { key: 'emailEnabled', label: 'Email notifications', type: 'toggle' },
          { key: 'smsEnabled', label: 'SMS notifications', type: 'toggle' },
          {
            key: 'digestFrequency',
            label: 'Digest frequency',
            type: 'select',
            options: [
              { label: 'Realtime', value: 'realtime' },
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
            ],
          },
          { key: 'fromName', label: 'From name', type: 'text' },
          { key: 'replyTo', label: 'Reply-to email', type: 'text' },
        ],
      },
    ],
  },
  workflow: {
    slug: 'workflow',
    initialStatus: 'Configured',
    defaults: {
      escalationHours: 48,
      allowDelegation: true,
      parallelApprovals: false,
      defaultApproverFallback: 'hr',
    },
    sections: [
      {
        title: 'Approval routing',
        fields: [
          { key: 'escalationHours', label: 'Escalate after (hours)', type: 'number', min: 1, max: 168 },
          { key: 'allowDelegation', label: 'Allow approval delegation', type: 'toggle' },
          { key: 'parallelApprovals', label: 'Allow parallel approvals', type: 'toggle' },
          {
            key: 'defaultApproverFallback',
            label: 'Fallback approver',
            type: 'select',
            options: [
              { label: 'HR', value: 'hr' },
              { label: 'Admin', value: 'admin' },
              { label: 'Reporting manager', value: 'manager' },
            ],
          },
        ],
      },
    ],
  },
  security: {
    slug: 'security',
    initialStatus: 'Configured',
    defaults: {
      mfaRequired: true,
      passwordMinLength: 10,
      passwordExpiryDays: 90,
      ssoEnabled: false,
      ipAllowlist: '',
    },
    sections: [
      {
        title: 'Authentication policy',
        fields: [
          { key: 'mfaRequired', label: 'Require MFA for privileged roles', type: 'toggle' },
          { key: 'passwordMinLength', label: 'Minimum password length', type: 'number', min: 8, max: 32 },
          { key: 'passwordExpiryDays', label: 'Password expiry (days)', type: 'number', min: 30, max: 365 },
          { key: 'ssoEnabled', label: 'Enable SSO', type: 'toggle' },
          { key: 'ipAllowlist', label: 'IP allowlist (comma-separated)', type: 'textarea', placeholder: 'Optional' },
        ],
      },
    ],
  },
  'audit-logs': {
    slug: 'audit-logs',
    initialStatus: 'Configured',
    defaults: {
      retentionDays: 365,
      captureLogins: true,
      captureExports: true,
      captureSettingsChanges: true,
      exportFormat: 'json',
    },
    sections: [
      {
        title: 'Audit retention',
        fields: [
          { key: 'retentionDays', label: 'Retention period (days)', type: 'number', min: 30, max: 2555 },
          { key: 'captureLogins', label: 'Capture login events', type: 'toggle' },
          { key: 'captureExports', label: 'Capture data exports', type: 'toggle' },
          { key: 'captureSettingsChanges', label: 'Capture settings changes', type: 'toggle' },
          {
            key: 'exportFormat',
            label: 'Audit export format',
            type: 'select',
            options: [
              { label: 'JSON', value: 'json' },
              { label: 'CSV', value: 'csv' },
            ],
          },
        ],
      },
    ],
  },
  integrations: {
    slug: 'integrations',
    initialStatus: 'Pending',
    defaults: {
      webhooksEnabled: false,
      apiRateLimit: 1000,
      slackConnected: false,
      calendarSync: false,
      notes: '',
    },
    sections: [
      {
        title: 'Connectors',
        fields: [
          { key: 'webhooksEnabled', label: 'Enable outbound webhooks', type: 'toggle' },
          { key: 'apiRateLimit', label: 'API rate limit (req/hour)', type: 'number', min: 100, max: 100000 },
          { key: 'slackConnected', label: 'Slack connector', type: 'toggle' },
          { key: 'calendarSync', label: 'Calendar sync', type: 'toggle' },
          { key: 'notes', label: 'Integration notes', type: 'textarea' },
        ],
      },
    ],
  },
  documents: {
    slug: 'documents',
    initialStatus: 'Configured',
    defaults: {
      retentionYears: 7,
      esignEnabled: true,
      maxUploadMb: 25,
      allowedTypes: 'pdf,docx,png,jpg',
    },
    sections: [
      {
        title: 'Storage & e-sign',
        fields: [
          { key: 'retentionYears', label: 'Retention (years)', type: 'number', min: 1, max: 20 },
          { key: 'esignEnabled', label: 'Enable e-sign workflows', type: 'toggle' },
          { key: 'maxUploadMb', label: 'Max upload size (MB)', type: 'number', min: 1, max: 100 },
          { key: 'allowedTypes', label: 'Allowed file types', type: 'text' },
        ],
      },
    ],
  },
  'system-preferences': {
    slug: 'system-preferences',
    initialStatus: 'Configured',
    defaults: {
      dateFormat: 'DD MMM YYYY',
      numberFormat: 'en-IN',
      weekStartsOn: 'monday',
      maintenanceMode: false,
      darkModeDefault: false,
    },
    sections: [
      {
        title: 'Locale & modules',
        fields: [
          {
            key: 'dateFormat',
            label: 'Date format',
            type: 'select',
            options: [
              { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
              { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
              { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
            ],
          },
          {
            key: 'numberFormat',
            label: 'Number locale',
            type: 'select',
            options: [
              { label: 'en-IN', value: 'en-IN' },
              { label: 'en-US', value: 'en-US' },
            ],
          },
          {
            key: 'weekStartsOn',
            label: 'Week starts on',
            type: 'select',
            options: [
              { label: 'Monday', value: 'monday' },
              { label: 'Sunday', value: 'sunday' },
            ],
          },
          { key: 'maintenanceMode', label: 'Maintenance mode', type: 'toggle' },
          { key: 'darkModeDefault', label: 'Default dark mode for new users', type: 'toggle' },
        ],
      },
    ],
  },
  'backup-restore': {
    slug: 'backup-restore',
    initialStatus: 'Pending',
    defaults: {
      schedule: 'daily',
      retentionCopies: 14,
      includeAttachments: true,
      lastBackupNote: 'No automated backup recorded in this demo environment.',
    },
    sections: [
      {
        title: 'Backup schedule',
        fields: [
          {
            key: 'schedule',
            label: 'Backup schedule',
            type: 'select',
            options: [
              { label: 'Daily', value: 'daily' },
              { label: 'Weekly', value: 'weekly' },
              { label: 'Manual only', value: 'manual' },
            ],
          },
          { key: 'retentionCopies', label: 'Copies to retain', type: 'number', min: 1, max: 90 },
          { key: 'includeAttachments', label: 'Include document attachments', type: 'toggle' },
          { key: 'lastBackupNote', label: 'Backup notes', type: 'textarea' },
        ],
      },
    ],
  },
  'ai-configuration': {
    slug: 'ai-configuration',
    initialStatus: 'Disabled',
    defaults: {
      assistantsEnabled: false,
      modelAccess: 'restricted',
      retainPromptsDays: 30,
      safetyFilters: true,
    },
    sections: [
      {
        title: 'AI controls',
        fields: [
          { key: 'assistantsEnabled', label: 'Enable AI assistants', type: 'toggle' },
          {
            key: 'modelAccess',
            label: 'Model access',
            type: 'select',
            options: [
              { label: 'Restricted (HR/Admin)', value: 'restricted' },
              { label: 'Managers+', value: 'managers' },
              { label: 'All employees', value: 'all' },
            ],
          },
          { key: 'retainPromptsDays', label: 'Prompt retention (days)', type: 'number', min: 0, max: 365 },
          { key: 'safetyFilters', label: 'Enforce safety filters', type: 'toggle' },
        ],
      },
    ],
  },
  'branding-theme': {
    slug: 'branding-theme',
    initialStatus: 'Configured',
    defaults: {
      portalName: 'HRMS Portal',
      primaryColor: '#1565C0',
      loginTagline: 'People operations, unified.',
      showLogoOnEmails: true,
    },
    sections: [
      {
        title: 'Brand identity',
        fields: [
          { key: 'portalName', label: 'Portal display name', type: 'text' },
          { key: 'primaryColor', label: 'Primary brand color', type: 'text', placeholder: '#1565C0' },
          { key: 'loginTagline', label: 'Login tagline', type: 'text' },
          { key: 'showLogoOnEmails', label: 'Show logo on emails', type: 'toggle' },
        ],
      },
    ],
  },
  about: {
    slug: 'about',
    initialStatus: 'Configured',
    defaults: {
      productName: 'HRMS Portal',
      version: 'v1.0.0',
      buildChannel: 'production',
      license: 'Enterprise evaluation',
      releaseNotes: 'Includes Performance appraisal integration, Settings hub, and role-based portals.',
    },
    sections: [
      {
        title: 'Version information',
        fields: [
          { key: 'productName', label: 'Product name', type: 'text' },
          { key: 'version', label: 'Version', type: 'text' },
          {
            key: 'buildChannel',
            label: 'Build channel',
            type: 'select',
            options: [
              { label: 'Production', value: 'production' },
              { label: 'Staging', value: 'staging' },
              { label: 'Demo', value: 'demo' },
            ],
          },
          { key: 'license', label: 'License', type: 'text' },
          { key: 'releaseNotes', label: 'Release notes', type: 'textarea' },
        ],
      },
    ],
  },
};

export function getModuleConfig(slug: string) {
  return SETTINGS_MODULE_CONFIGS[slug] ?? null;
}
