-- =============================================================================
-- HRMS Production Schema (PostgreSQL / Supabase)
-- Derived from codebase analysis of HRMS-sandbox (Prisma + APIs + UI modules)
-- Do NOT invent modules: only entities evidenced in code / planned for migration
-- of in-memory/localStorage stores that already exist in the product UI.
-- Compatible with Supabase Auth (auth.users) and future Entra ID via auth_user_id.
-- =============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- ENUMs (from lib/auth.ts, leave UI, appraisal types, exit types, etc.)
-- -----------------------------------------------------------------------------

CREATE TYPE app_role AS ENUM (
  'EMPLOYEE_PR',
  'EMPLOYEE_CONT',
  'MANAGER',
  'HR',
  'FINANCE',
  'ADMIN',
  'CEO'
);

CREATE TYPE membership_status AS ENUM ('active', 'invited', 'disabled', 'left');
CREATE TYPE employment_status AS ENUM ('Active', 'Inactive', 'On Notice', 'Exited');
CREATE TYPE employment_type AS ENUM ('Full Time', 'Part Time', 'Contract', 'Intern');
CREATE TYPE payment_method AS ENUM ('cheque', 'bank');

CREATE TYPE leave_request_status AS ENUM ('Pending', 'Approved', 'Rejected', 'Cancelled');
CREATE TYPE attendance_day_status AS ENUM ('Present', 'Late', 'Absent', 'Half Day', 'On Leave', 'Holiday');

CREATE TYPE document_verification_status AS ENUM (
  'Uploaded', 'Pending Verification', 'Verified', 'Rejected', 'Expired'
);

CREATE TYPE payslip_status AS ENUM ('Processing', 'Published', 'Failed');

CREATE TYPE appraisal_cycle_status AS ENUM ('draft', 'open', 'closed', 'archived');
CREATE TYPE appraisal_status AS ENUM (
  'draft',
  'returned',
  'under_manager_review',
  'under_admin_review',
  'under_leadership_review',
  'completed'
);
CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'overdue');
CREATE TYPE review_status AS ENUM ('draft', 'submitted');

CREATE TYPE exit_status AS ENUM (
  'Draft',
  'Submitted',
  'Pending Approval',
  'Approved',
  'Rejected',
  'Exit Interview Pending',
  'Exit Interview Completed',
  'Full & Final Pending',
  'Completed',
  'Revoked',
  'Cancelled'
);

CREATE TYPE approval_decision AS ENUM ('Pending', 'Approved', 'Rejected');
CREATE TYPE ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed', 'Cancelled');
CREATE TYPE ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');

CREATE TYPE subscription_status AS ENUM (
  'TRIALING', 'ACTIVE', 'PAST_DUE', 'CANCELED', 'UNPAID', 'INCOMPLETE'
);

CREATE TYPE newsletter_category AS ENUM (
  'Company News',
  'Important Announcement',
  'Policy & HR Updates',
  'Learning & Training'
);

-- -----------------------------------------------------------------------------
-- 1. TENANT / AUTH BRIDGE (existing Prisma: Company, Membership)
-- -----------------------------------------------------------------------------

CREATE TABLE companies (
  id              TEXT PRIMARY KEY DEFAULT concat('cmp_', replace(gen_random_uuid()::text, '-', '')),
  name            TEXT NOT NULL,
  slug            TEXT NOT NULL UNIQUE,
  join_token      TEXT NOT NULL UNIQUE,
  join_enabled    BOOLEAN NOT NULL DEFAULT TRUE,
  employee_seq    INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bridges Supabase auth.users (or Entra-mapped id) → company membership
CREATE TABLE memberships (
  id              TEXT PRIMARY KEY DEFAULT concat('mem_', replace(gen_random_uuid()::text, '-', '')),
  auth_user_id    TEXT NOT NULL UNIQUE, -- auth.users.id or future Entra object id
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  email           TEXT NOT NULL,
  name            TEXT NOT NULL,
  role            app_role NOT NULL DEFAULT 'EMPLOYEE_PR',
  employee_id     TEXT NOT NULL, -- business EMP code, allocated via companies.employee_seq
  status          membership_status NOT NULL DEFAULT 'active',
  identity_provider TEXT NOT NULL DEFAULT 'supabase', -- 'supabase' | 'entra' | 'mock'
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_membership_company_employee UNIQUE (company_id, employee_id),
  CONSTRAINT uq_membership_company_email UNIQUE (company_id, email)
);

CREATE INDEX idx_memberships_company ON memberships(company_id);
CREATE INDEX idx_memberships_role ON memberships(company_id, role);

-- -----------------------------------------------------------------------------
-- 2. ORG STRUCTURE (UI: settings departments-designations; profile text fields)
-- -----------------------------------------------------------------------------

CREATE TABLE departments (
  id              TEXT PRIMARY KEY DEFAULT concat('dep_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  code            TEXT,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_department_company_name UNIQUE (company_id, name)
);

CREATE TABLE designations (
  id              TEXT PRIMARY KEY DEFAULT concat('des_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  department_id   TEXT REFERENCES departments(id) ON DELETE SET NULL,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_designation_company_name UNIQUE (company_id, name)
);

-- -----------------------------------------------------------------------------
-- 3. EMPLOYEE PROFILE (Prisma EmployeeProfile + profile-form.tsx fields)
-- -----------------------------------------------------------------------------

CREATE TABLE employees (
  id                  TEXT PRIMARY KEY DEFAULT concat('emp_', replace(gen_random_uuid()::text, '-', '')),
  company_id          TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_code       TEXT NOT NULL, -- EMP001 etc (Membership.employeeId)
  membership_id       TEXT UNIQUE REFERENCES memberships(id) ON DELETE SET NULL,
  first_name          TEXT NOT NULL,
  middle_name         TEXT,
  last_name           TEXT NOT NULL,
  full_name           TEXT NOT NULL,
  gender              TEXT,
  date_of_birth       DATE,
  blood_group         TEXT,
  marital_status      TEXT,
  nationality         TEXT,
  department_id       TEXT REFERENCES departments(id) ON DELETE SET NULL,
  designation_id      TEXT REFERENCES designations(id) ON DELETE SET NULL,
  manager_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL, -- self-ref hierarchy
  location            TEXT NOT NULL DEFAULT '',
  employment_type     employment_type NOT NULL DEFAULT 'Full Time',
  joining_date        DATE NOT NULL DEFAULT CURRENT_DATE,
  status              employment_status NOT NULL DEFAULT 'Active',
  personal_email      TEXT,
  official_email      TEXT,
  personal_mobile_country_code TEXT DEFAULT '+91',
  personal_mobile     TEXT,
  mobile              TEXT,
  emergency_contact_legacy TEXT, -- legacy single string from Prisma
  current_address     TEXT,
  permanent_address   TEXT,
  current_address_line1 TEXT,
  current_address_line2 TEXT,
  current_city        TEXT,
  current_state       TEXT,
  current_country     TEXT,
  current_pincode     TEXT,
  permanent_address_line1 TEXT,
  permanent_address_line2 TEXT,
  permanent_city      TEXT,
  permanent_state     TEXT,
  permanent_country   TEXT,
  permanent_pincode   TEXT,
  same_as_current_address BOOLEAN NOT NULL DEFAULT FALSE,
  profile_picture_path TEXT, -- Supabase Storage path (not data URL in prod)
  aadhaar             TEXT,
  pan                 TEXT,
  passport            TEXT,
  driving_license     TEXT,
  uan                 TEXT,
  pf_number           TEXT,
  esic_number         TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at          TIMESTAMPTZ,
  CONSTRAINT uq_employee_company_code UNIQUE (company_id, employee_code)
);

CREATE INDEX idx_employees_company ON employees(company_id);
CREATE INDEX idx_employees_manager ON employees(company_id, manager_employee_id);
CREATE INDEX idx_employees_department ON employees(company_id, department_id);
CREATE INDEX idx_employees_status ON employees(company_id, status);

CREATE TABLE employee_emergency_contacts (
  id              TEXT PRIMARY KEY DEFAULT concat('eec_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  contact_name    TEXT NOT NULL,
  relationship    TEXT NOT NULL DEFAULT '',
  mobile          TEXT NOT NULL,
  alternate_number TEXT,
  email           TEXT,
  address         TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_emergency_contacts_employee ON employee_emergency_contacts(employee_id);

CREATE TABLE employee_bank_details (
  id                    TEXT PRIMARY KEY DEFAULT concat('ebk_', replace(gen_random_uuid()::text, '-', '')),
  company_id            TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id           TEXT NOT NULL UNIQUE REFERENCES employees(id) ON DELETE CASCADE,
  payment_method        payment_method NOT NULL DEFAULT 'bank',
  account_holder_name   TEXT,
  bank_name             TEXT,
  branch                TEXT,
  account_number_enc    TEXT, -- store encrypted / vault ref; never plain confirm field
  ifsc_code             TEXT,
  upi_id                TEXT,
  cancelled_cheque_path TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE employee_social_profiles (
  employee_id         TEXT PRIMARY KEY REFERENCES employees(id) ON DELETE CASCADE,
  company_id          TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  linkedin            TEXT,
  github              TEXT,
  portfolio_website   TEXT,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 4. DOCUMENTS (Prisma DocumentRecord + Supabase Storage bucket `documents`)
-- -----------------------------------------------------------------------------

CREATE TABLE documents (
  id                   TEXT PRIMARY KEY DEFAULT concat('doc_', replace(gen_random_uuid()::text, '-', '')),
  company_id           TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id          TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  name                 TEXT NOT NULL,
  category             TEXT NOT NULL, -- from lib/document-constants.ts
  upload_date          TIMESTAMPTZ NOT NULL DEFAULT now(),
  expiry_date          DATE,
  uploaded_by          TEXT NOT NULL,
  verification_status  document_verification_status NOT NULL DEFAULT 'Uploaded',
  file_type            TEXT NOT NULL,
  storage_path         TEXT NOT NULL,
  mime_type            TEXT,
  size_in_bytes        INTEGER,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at           TIMESTAMPTZ
);

CREATE INDEX idx_documents_employee ON documents(company_id, employee_id);

-- -----------------------------------------------------------------------------
-- 5. LEAVE (Prisma LeaveRequest + UI balances/holidays/types)
-- -----------------------------------------------------------------------------

CREATE TABLE leave_types (
  id              TEXT PRIMARY KEY DEFAULT concat('lt_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  code            TEXT NOT NULL, -- annual, casual, sick, compOff, lop
  name            TEXT NOT NULL,
  is_paid         BOOLEAN NOT NULL DEFAULT TRUE,
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  default_annual_quota NUMERIC(6,2) NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_leave_type_code UNIQUE (company_id, code)
);

CREATE TABLE leave_balances (
  id              TEXT PRIMARY KEY DEFAULT concat('lb_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id   TEXT NOT NULL REFERENCES leave_types(id) ON DELETE CASCADE,
  year            INTEGER NOT NULL,
  opening_balance NUMERIC(6,2) NOT NULL DEFAULT 0,
  accrued         NUMERIC(6,2) NOT NULL DEFAULT 0,
  used            NUMERIC(6,2) NOT NULL DEFAULT 0,
  adjusted        NUMERIC(6,2) NOT NULL DEFAULT 0,
  CONSTRAINT uq_leave_balance UNIQUE (employee_id, leave_type_id, year),
  CONSTRAINT chk_leave_balance_nonneg CHECK (opening_balance + accrued + adjusted - used >= -999)
);

CREATE TABLE leave_requests (
  id              TEXT PRIMARY KEY DEFAULT concat('lr_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  leave_type_id   TEXT NOT NULL REFERENCES leave_types(id),
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  reason          TEXT,
  contact         TEXT, -- UI form field currently not persisted
  reporting_email TEXT, -- UI form field currently not persisted
  status          leave_request_status NOT NULL DEFAULT 'Pending',
  manager_comment TEXT,
  reviewed_by     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_leave_dates CHECK (end_date >= start_date)
);

CREATE INDEX idx_leave_requests_employee ON leave_requests(company_id, employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(company_id, status);

CREATE TABLE company_holidays (
  id              TEXT PRIMARY KEY DEFAULT concat('hol_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  holiday_date    DATE NOT NULL,
  name            TEXT NOT NULL,
  is_optional     BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_holiday UNIQUE (company_id, holiday_date, name)
);

-- -----------------------------------------------------------------------------
-- 6. ATTENDANCE (UI: employee-attendance page — currently hardcoded)
-- -----------------------------------------------------------------------------

CREATE TABLE attendance_records (
  id              TEXT PRIMARY KEY DEFAULT concat('att_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  work_date       DATE NOT NULL,
  check_in        TIME,
  check_out       TIME,
  status          attendance_day_status NOT NULL DEFAULT 'Present',
  source          TEXT NOT NULL DEFAULT 'manual', -- manual | device | import
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_attendance_day UNIQUE (employee_id, work_date)
);

CREATE INDEX idx_attendance_company_date ON attendance_records(company_id, work_date);

-- -----------------------------------------------------------------------------
-- 7. PAYROLL — payslips (Prisma Payslip exists; API currently in-memory)
--    Tax/benefits/loans UI is "Coming soon" → Phase-2 stubs only if needed later
-- -----------------------------------------------------------------------------

CREATE TABLE payslips (
  id              TEXT PRIMARY KEY DEFAULT concat('ps_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  period          TEXT NOT NULL, -- YYYY-MM
  file_name       TEXT NOT NULL,
  storage_path    TEXT NOT NULL, -- Supabase Storage (replace base64 fileData)
  net_pay         NUMERIC(12,2) NOT NULL DEFAULT 0,
  status          payslip_status NOT NULL DEFAULT 'Published',
  uploaded_by     TEXT NOT NULL,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_payslip_period UNIQUE (company_id, employee_id, period)
);

CREATE INDEX idx_payslips_employee ON payslips(company_id, employee_id);

-- -----------------------------------------------------------------------------
-- 8. PERFORMANCE / APPRAISAL (lib/appraisal/* — currently localStorage)
-- -----------------------------------------------------------------------------

CREATE TABLE appraisal_cycles (
  id              TEXT PRIMARY KEY DEFAULT concat('ac_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  start_date      DATE NOT NULL,
  end_date        DATE NOT NULL,
  status          appraisal_cycle_status NOT NULL DEFAULT 'draft',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE competencies (
  id                  TEXT PRIMARY KEY DEFAULT concat('cmpy_', replace(gen_random_uuid()::text, '-', '')),
  company_id          TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  name                TEXT NOT NULL,
  description         TEXT NOT NULL DEFAULT '',
  is_leadership_only  BOOLEAN NOT NULL DEFAULT FALSE,
  is_active           BOOLEAN NOT NULL DEFAULT TRUE,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE goals (
  id              TEXT PRIMARY KEY DEFAULT concat('goal_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cycle_id        TEXT NOT NULL REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  manager_id      TEXT REFERENCES employees(id) ON DELETE SET NULL,
  name            TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  kpi             TEXT NOT NULL DEFAULT '',
  weightage       NUMERIC(5,2) NOT NULL DEFAULT 0,
  target          TEXT NOT NULL DEFAULT '',
  progress        NUMERIC(5,2) NOT NULL DEFAULT 0,
  status          goal_status NOT NULL DEFAULT 'not_started',
  due_date        DATE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE appraisals (
  id              TEXT PRIMARY KEY DEFAULT concat('apr_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  cycle_id        TEXT NOT NULL REFERENCES appraisal_cycles(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  manager_id      TEXT REFERENCES employees(id) ON DELETE SET NULL,
  achievements    TEXT NOT NULL DEFAULT '',
  challenges      TEXT NOT NULL DEFAULT '',
  self_feedback   TEXT NOT NULL DEFAULT '',
  self_rating     NUMERIC(3,1),
  status          appraisal_status NOT NULL DEFAULT 'draft',
  submitted_at    TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_appraisal_cycle_employee UNIQUE (cycle_id, employee_id)
);

CREATE TABLE appraisal_ratings (
  id              TEXT PRIMARY KEY DEFAULT concat('ar_', replace(gen_random_uuid()::text, '-', '')),
  appraisal_id    TEXT NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  rated_by_role   TEXT NOT NULL CHECK (rated_by_role IN ('employee', 'manager', 'admin', 'leadership')),
  rating_type     TEXT NOT NULL CHECK (rating_type IN ('competency', 'goal')),
  reference_id    TEXT NOT NULL, -- competency_id or goal_id
  score           NUMERIC(3,1) NOT NULL,
  comments        TEXT,
  CONSTRAINT chk_score_range CHECK (score >= 0 AND score <= 5)
);

CREATE INDEX idx_appraisal_ratings ON appraisal_ratings(appraisal_id, rated_by_role, rating_type);

CREATE TABLE appraisal_stage_reviews (
  id                    TEXT PRIMARY KEY DEFAULT concat('asr_', replace(gen_random_uuid()::text, '-', '')),
  appraisal_id          TEXT NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  stage                 TEXT NOT NULL CHECK (stage IN ('manager', 'admin', 'leadership')),
  reviewer_employee_id  TEXT REFERENCES employees(id) ON DELETE SET NULL,
  comments              TEXT NOT NULL DEFAULT '',
  development_plan      TEXT NOT NULL DEFAULT '',
  strengths             TEXT NOT NULL DEFAULT '',
  improvements          TEXT NOT NULL DEFAULT '',
  recommend_promotion   BOOLEAN NOT NULL DEFAULT FALSE,
  recommend_increment   BOOLEAN NOT NULL DEFAULT FALSE,
  salary_revision       TEXT NOT NULL DEFAULT '',
  role_change           TEXT NOT NULL DEFAULT '',
  training              TEXT NOT NULL DEFAULT '',
  high_potential        BOOLEAN NOT NULL DEFAULT FALSE,
  overall_rating        NUMERIC(3,1),
  goal_score            NUMERIC(3,1),
  competency_score      NUMERIC(3,1),
  final_rating          NUMERIC(3,1),
  status                review_status NOT NULL DEFAULT 'draft',
  submitted_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_stage_review UNIQUE (appraisal_id, stage)
);

CREATE TABLE appraisal_documents (
  id              TEXT PRIMARY KEY DEFAULT concat('ad_', replace(gen_random_uuid()::text, '-', '')),
  appraisal_id    TEXT NOT NULL REFERENCES appraisals(id) ON DELETE CASCADE,
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  original_name   TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  mime_type       TEXT,
  size_bytes      INTEGER,
  uploaded_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 9. EXIT MANAGEMENT (lib/exit/* — currently in-memory)
-- -----------------------------------------------------------------------------

CREATE TABLE exit_cases (
  id                  TEXT PRIMARY KEY DEFAULT concat('ex_', replace(gen_random_uuid()::text, '-', '')),
  company_id          TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id         TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  status              exit_status NOT NULL DEFAULT 'Draft',
  resignation_date    DATE,
  last_working_day    DATE,
  reason_category     TEXT NOT NULL DEFAULT '',
  reason_details      TEXT NOT NULL DEFAULT '',
  letter_file_name    TEXT,
  letter_storage_path TEXT,
  manager_approval_status approval_decision NOT NULL DEFAULT 'Pending',
  manager_acted_by    TEXT,
  manager_comment     TEXT,
  manager_acted_at    TIMESTAMPTZ,
  hr_approval_status  approval_decision NOT NULL DEFAULT 'Pending',
  hr_acted_by         TEXT,
  hr_comment          TEXT,
  hr_acted_at         TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_exit_cases_employee ON exit_cases(company_id, employee_id);
CREATE INDEX idx_exit_cases_status ON exit_cases(company_id, status);

CREATE TABLE exit_interviews (
  exit_case_id        TEXT PRIMARY KEY REFERENCES exit_cases(id) ON DELETE CASCADE,
  completed           BOOLEAN NOT NULL DEFAULT FALSE,
  primary_reason      TEXT NOT NULL DEFAULT '',
  experience_rating   INTEGER CHECK (experience_rating IS NULL OR (experience_rating BETWEEN 1 AND 5)),
  manager_rating      INTEGER CHECK (manager_rating IS NULL OR (manager_rating BETWEEN 1 AND 5)),
  would_recommend     TEXT CHECK (would_recommend IN ('Yes', 'No', 'Maybe', '')),
  liked_most          TEXT NOT NULL DEFAULT '',
  improvements        TEXT NOT NULL DEFAULT '',
  additional_comments TEXT NOT NULL DEFAULT '',
  completed_at        TIMESTAMPTZ
);

CREATE TABLE exit_full_and_final (
  exit_case_id        TEXT PRIMARY KEY REFERENCES exit_cases(id) ON DELETE CASCADE,
  status              TEXT NOT NULL DEFAULT 'Pending',
  assets_returned     BOOLEAN NOT NULL DEFAULT FALSE,
  access_revoked      BOOLEAN NOT NULL DEFAULT FALSE,
  leave_encashment    NUMERIC(12,2) NOT NULL DEFAULT 0,
  gratuity_amount     NUMERIC(12,2) NOT NULL DEFAULT 0,
  other_dues          NUMERIC(12,2) NOT NULL DEFAULT 0,
  deductions          NUMERIC(12,2) NOT NULL DEFAULT 0,
  net_payable         NUMERIC(12,2) NOT NULL DEFAULT 0,
  payment_mode        TEXT NOT NULL DEFAULT '',
  remarks             TEXT NOT NULL DEFAULT '',
  processed_by        TEXT,
  completed_at        TIMESTAMPTZ,
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE exit_withdrawal_requests (
  id              TEXT PRIMARY KEY DEFAULT concat('ewr_', replace(gen_random_uuid()::text, '-', '')),
  exit_case_id    TEXT NOT NULL REFERENCES exit_cases(id) ON DELETE CASCADE,
  reason          TEXT NOT NULL,
  status          approval_decision NOT NULL DEFAULT 'Pending',
  requested_by    TEXT NOT NULL,
  requested_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  reviewed_by     TEXT,
  reviewed_at     TIMESTAMPTZ,
  review_comment  TEXT
);

-- -----------------------------------------------------------------------------
-- 10. HELP DESK (lib/help-desk — currently localStorage)
-- -----------------------------------------------------------------------------

CREATE TABLE helpdesk_tickets (
  id                TEXT PRIMARY KEY DEFAULT concat('tk_', replace(gen_random_uuid()::text, '-', '')),
  company_id        TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  ticket_number     TEXT NOT NULL,
  title             TEXT NOT NULL,
  category          TEXT NOT NULL,
  priority          ticket_priority NOT NULL DEFAULT 'Medium',
  description       TEXT NOT NULL DEFAULT '',
  steps             TEXT NOT NULL DEFAULT '',
  status            ticket_status NOT NULL DEFAULT 'Open',
  created_by_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  assigned_to_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  resolution        TEXT NOT NULL DEFAULT '',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_ticket_number UNIQUE (company_id, ticket_number)
);

CREATE TABLE helpdesk_comments (
  id              TEXT PRIMARY KEY DEFAULT concat('tc_', replace(gen_random_uuid()::text, '-', '')),
  ticket_id       TEXT NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
  author_employee_id TEXT REFERENCES employees(id) ON DELETE SET NULL,
  author_name     TEXT NOT NULL,
  body            TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE helpdesk_activities (
  id              TEXT PRIMARY KEY DEFAULT concat('ta_', replace(gen_random_uuid()::text, '-', '')),
  ticket_id       TEXT NOT NULL REFERENCES helpdesk_tickets(id) ON DELETE CASCADE,
  message         TEXT NOT NULL,
  user_name       TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- 11. NEWSLETTERS (in-memory + localStorage today)
--     Birthdays/anniversaries: derive from employees.date_of_birth / joining_date
--     Recognitions static marketing data → optional table if productized later
-- -----------------------------------------------------------------------------

CREATE TABLE newsletter_posts (
  id              TEXT PRIMARY KEY DEFAULT concat('np_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  category        newsletter_category NOT NULL,
  body            TEXT NOT NULL,
  author_name     TEXT NOT NULL,
  author_image_path TEXT,
  published_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  attachment_name TEXT,
  attachment_path TEXT,
  attachment_mime TEXT,
  attachment_size INTEGER,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ
);

CREATE INDEX idx_newsletter_company ON newsletter_posts(company_id, published_at DESC);

-- -----------------------------------------------------------------------------
-- 12. LEARNING (catalog hardcoded; enrollments in localStorage)
-- -----------------------------------------------------------------------------

CREATE TABLE learning_courses (
  id              TEXT PRIMARY KEY DEFAULT concat('lc_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT REFERENCES companies(id) ON DELETE CASCADE, -- NULL = global catalog
  external_key    TEXT, -- preserve numeric ids from lib/learning/data.ts during migration
  title           TEXT NOT NULL,
  description     TEXT NOT NULL DEFAULT '',
  is_active       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE learning_enrollments (
  id              TEXT PRIMARY KEY DEFAULT concat('le_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id     TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  course_id       TEXT NOT NULL REFERENCES learning_courses(id) ON DELETE CASCADE,
  progress_pct    NUMERIC(5,2) NOT NULL DEFAULT 0,
  status          TEXT NOT NULL DEFAULT 'enrolled',
  enrolled_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  CONSTRAINT uq_enrollment UNIQUE (employee_id, course_id)
);

-- -----------------------------------------------------------------------------
-- 13. NOTIFICATIONS (appraisal + exit patterns → unified)
-- -----------------------------------------------------------------------------

CREATE TABLE notifications (
  id              TEXT PRIMARY KEY DEFAULT concat('ntf_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  recipient_employee_id TEXT NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  title           TEXT NOT NULL,
  message         TEXT NOT NULL,
  link            TEXT,
  module          TEXT, -- appraisal | exit | leave | helpdesk | system
  is_read         BOOLEAN NOT NULL DEFAULT FALSE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_recipient ON notifications(recipient_employee_id, is_read, created_at DESC);

-- -----------------------------------------------------------------------------
-- 14. SETTINGS + AUDIT (settings currently localStorage)
-- -----------------------------------------------------------------------------

CREATE TABLE company_settings (
  company_id      TEXT PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  settings_json   JSONB NOT NULL DEFAULT '{}'::jsonb, -- modules from settings-fields.ts
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by      TEXT
);

CREATE TABLE audit_logs (
  id              TEXT PRIMARY KEY DEFAULT concat('aud_', replace(gen_random_uuid()::text, '-', '')),
  company_id      TEXT NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  actor_employee_id TEXT,
  actor_name      TEXT,
  actor_role      TEXT,
  action          TEXT NOT NULL,
  entity_type     TEXT NOT NULL,
  entity_id       TEXT,
  details         TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_company ON audit_logs(company_id, created_at DESC);

-- -----------------------------------------------------------------------------
-- 15. SUBSCRIPTIONS (existing Prisma models — preserved)
-- -----------------------------------------------------------------------------

CREATE TABLE subscription_plans (
  id                TEXT PRIMARY KEY DEFAULT concat('sp_', replace(gen_random_uuid()::text, '-', '')),
  name              TEXT NOT NULL UNIQUE,
  description       TEXT,
  stripe_price_id   TEXT NOT NULL UNIQUE,
  stripe_product_id TEXT NOT NULL,
  amount            INTEGER NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'INR',
  billing_period    TEXT NOT NULL DEFAULT 'monthly',
  is_active         BOOLEAN NOT NULL DEFAULT TRUE,
  features          TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE company_subscriptions (
  id                      TEXT PRIMARY KEY DEFAULT concat('cs_', replace(gen_random_uuid()::text, '-', '')),
  company_id              TEXT NOT NULL UNIQUE REFERENCES companies(id) ON DELETE CASCADE,
  plan_id                 TEXT REFERENCES subscription_plans(id) ON DELETE SET NULL,
  stripe_customer_id      TEXT UNIQUE,
  stripe_subscription_id  TEXT UNIQUE,
  stripe_price_id         TEXT,
  status                  subscription_status NOT NULL DEFAULT 'TRIALING',
  trial_start_date        TIMESTAMPTZ NOT NULL DEFAULT now(),
  trial_end_date          TIMESTAMPTZ NOT NULL,
  current_period_start    TIMESTAMPTZ,
  current_period_end      TIMESTAMPTZ,
  cancel_at_period_end    BOOLEAN NOT NULL DEFAULT FALSE,
  canceled_at             TIMESTAMPTZ,
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE subscription_invoices (
  id                  TEXT PRIMARY KEY DEFAULT concat('si_', replace(gen_random_uuid()::text, '-', '')),
  subscription_id     TEXT NOT NULL REFERENCES company_subscriptions(id) ON DELETE CASCADE,
  stripe_invoice_id   TEXT UNIQUE,
  amount              INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'INR',
  status              TEXT NOT NULL DEFAULT 'draft',
  period_start_date   TIMESTAMPTZ,
  period_end_date     TIMESTAMPTZ,
  due_date            TIMESTAMPTZ,
  paid_date           TIMESTAMPTZ,
  pdf_url             TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- -----------------------------------------------------------------------------
-- HELPERS: updated_at trigger
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to key mutable tables (sample; repeat as needed)
DO $$
DECLARE t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'companies','memberships','departments','designations','employees',
    'employee_emergency_contacts','employee_bank_details','documents',
    'leave_types','leave_requests','attendance_records','payslips',
    'appraisal_cycles','goals','appraisals','appraisal_stage_reviews',
    'exit_cases','exit_full_and_final','helpdesk_tickets','newsletter_posts',
    'company_subscriptions','subscription_invoices','subscription_plans'
  ]
  LOOP
    EXECUTE format(
      'DROP TRIGGER IF EXISTS trg_%s_updated ON %I; CREATE TRIGGER trg_%s_updated BEFORE UPDATE ON %I FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
      t, t, t, t
    );
  END LOOP;
END $$;

-- -----------------------------------------------------------------------------
-- Allocate next EMP code (mirrors Company.employeeSeq)
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION allocate_employee_code(p_company_id TEXT)
RETURNS TEXT AS $$
DECLARE seq INTEGER;
BEGIN
  UPDATE companies SET employee_seq = employee_seq + 1
  WHERE id = p_company_id
  RETURNING employee_seq INTO seq;
  RETURN 'EMP' || lpad(seq::text, 3, '0');
END;
$$ LANGUAGE plpgsql;

-- -----------------------------------------------------------------------------
-- RLS (enable + tenant isolation). Policies use JWT claim company_id/role
-- or a SECURITY DEFINER helper reading memberships by auth.uid().
-- -----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION current_membership()
RETURNS memberships AS $$
  SELECT m.* FROM memberships m
  WHERE m.auth_user_id = auth.uid()::text
    AND m.status = 'active'
  LIMIT 1;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION current_company_id()
RETURNS TEXT AS $$
  SELECT (current_membership()).company_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_app_role()
RETURNS app_role AS $$
  SELECT (current_membership()).role;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION current_employee_code()
RETURNS TEXT AS $$
  SELECT (current_membership()).employee_id;
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_hr_or_admin()
RETURNS BOOLEAN AS $$
  SELECT current_app_role() IN ('HR', 'ADMIN', 'CEO');
$$ LANGUAGE sql STABLE;

CREATE OR REPLACE FUNCTION is_manager_or_above()
RETURNS BOOLEAN AS $$
  SELECT current_app_role() IN ('MANAGER', 'HR', 'FINANCE', 'ADMIN', 'CEO');
$$ LANGUAGE sql STABLE;

-- Enable RLS on tenant tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE designations ENABLE ROW LEVEL SECURITY;
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_bank_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_social_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisal_cycles ENABLE ROW LEVEL SECURITY;
ALTER TABLE competencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisals ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisal_ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisal_stage_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE appraisal_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_interviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_full_and_final ENABLE ROW LEVEL SECURITY;
ALTER TABLE exit_withdrawal_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE helpdesk_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_invoices ENABLE ROW LEVEL SECURITY;

-- Example policies (pattern repeated per table)

CREATE POLICY companies_select_own ON companies
  FOR SELECT USING (id = current_company_id());

CREATE POLICY memberships_select_company ON memberships
  FOR SELECT USING (company_id = current_company_id());

CREATE POLICY memberships_update_hr ON memberships
  FOR UPDATE USING (company_id = current_company_id() AND is_hr_or_admin());

CREATE POLICY employees_select_self_or_hr_or_manager ON employees
  FOR SELECT USING (
    company_id = current_company_id()
    AND (
      employee_code = current_employee_code()
      OR is_hr_or_admin()
      OR (
        current_app_role() = 'MANAGER'
        AND manager_employee_id IN (
          SELECT e.id FROM employees e
          WHERE e.company_id = current_company_id()
            AND e.employee_code = current_employee_code()
        )
      )
      OR current_app_role() IN ('FINANCE', 'CEO')
    )
  );

CREATE POLICY employees_update_self_or_hr ON employees
  FOR UPDATE USING (
    company_id = current_company_id()
    AND (employee_code = current_employee_code() OR is_hr_or_admin())
  );

CREATE POLICY bank_details_self_or_hr_finance ON employee_bank_details
  FOR ALL USING (
    company_id = current_company_id()
    AND (
      employee_id IN (SELECT id FROM employees WHERE employee_code = current_employee_code())
      OR is_hr_or_admin()
      OR current_app_role() = 'FINANCE'
    )
  );

CREATE POLICY documents_self_or_hr ON documents
  FOR SELECT USING (
    company_id = current_company_id()
    AND (
      employee_id IN (SELECT id FROM employees WHERE employee_code = current_employee_code())
      OR is_hr_or_admin()
    )
  );

CREATE POLICY leave_requests_self_manager_hr ON leave_requests
  FOR SELECT USING (
    company_id = current_company_id()
    AND (
      employee_id IN (SELECT id FROM employees WHERE employee_code = current_employee_code())
      OR is_manager_or_above()
    )
  );

CREATE POLICY payslips_self_or_finance_hr ON payslips
  FOR SELECT USING (
    company_id = current_company_id()
    AND (
      employee_id IN (SELECT id FROM employees WHERE employee_code = current_employee_code())
      OR current_app_role() IN ('FINANCE', 'HR', 'ADMIN', 'CEO')
    )
  );

CREATE POLICY notifications_recipient_only ON notifications
  FOR SELECT USING (
    company_id = current_company_id()
    AND recipient_employee_id IN (
      SELECT id FROM employees WHERE employee_code = current_employee_code()
    )
  );

CREATE POLICY subscription_admin_only ON company_subscriptions
  FOR ALL USING (company_id = current_company_id() AND current_app_role() = 'ADMIN');

-- NOTE: Repeat similar FOR ALL / INSERT policies for remaining tables using
-- company_id = current_company_id() plus role checks matching lib/*permissions.ts
-- and lib/rbac.ts. Service role (storage uploads, Stripe webhooks) bypasses RLS.

-- -----------------------------------------------------------------------------
-- USEFUL VIEWS
-- -----------------------------------------------------------------------------

CREATE OR REPLACE VIEW v_employee_directory AS
SELECT
  e.id,
  e.company_id,
  e.employee_code,
  e.full_name,
  e.official_email,
  e.status,
  d.name AS department,
  des.name AS designation,
  m.full_name AS manager_name,
  e.joining_date,
  e.location
FROM employees e
LEFT JOIN departments d ON d.id = e.department_id
LEFT JOIN designations des ON des.id = e.designation_id
LEFT JOIN employees m ON m.id = e.manager_employee_id
WHERE e.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_upcoming_birthdays AS
SELECT
  e.company_id,
  e.employee_code,
  e.full_name,
  e.date_of_birth,
  make_date(
    EXTRACT(YEAR FROM CURRENT_DATE)::int,
    EXTRACT(MONTH FROM e.date_of_birth)::int,
    EXTRACT(DAY FROM e.date_of_birth)::int
  ) AS next_occurrence
FROM employees e
WHERE e.date_of_birth IS NOT NULL
  AND e.status = 'Active'
  AND e.deleted_at IS NULL;

CREATE OR REPLACE VIEW v_work_anniversaries AS
SELECT
  e.company_id,
  e.employee_code,
  e.full_name,
  e.joining_date,
  EXTRACT(YEAR FROM age(CURRENT_DATE, e.joining_date))::int AS years_completed
FROM employees e
WHERE e.status = 'Active' AND e.deleted_at IS NULL;

-- =============================================================================
-- EXPLICITLY OUT OF SCOPE (not evidenced as durable product logic yet)
-- =============================================================================
-- * Rovo / recognition points system (static marketing array only)
-- * Full payroll tax/benefits/loans ledgers (UI "Coming soon")
-- * Recruitment ATS (settings module labels only)
-- * Device biometric attendance integration details
-- =============================================================================
