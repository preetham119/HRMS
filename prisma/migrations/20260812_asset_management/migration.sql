-- Asset Management tables (aligned with prisma/schema.prisma)
-- Safe to apply when using PostgreSQL/Supabase

CREATE TABLE IF NOT EXISTS "AssetCategory" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "icon" TEXT NOT NULL DEFAULT 'Package',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AssetCategory_companyId_code_key" UNIQUE ("companyId", "code")
);
CREATE INDEX IF NOT EXISTS "AssetCategory_companyId_idx" ON "AssetCategory"("companyId");

CREATE TABLE IF NOT EXISTS "Asset" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL REFERENCES "AssetCategory"("id"),
  "name" TEXT NOT NULL,
  "assetTag" TEXT NOT NULL,
  "serialNumber" TEXT NOT NULL DEFAULT '',
  "brand" TEXT NOT NULL DEFAULT '',
  "model" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Available',
  "condition" TEXT NOT NULL DEFAULT 'Good',
  "purchaseDate" TIMESTAMP(3),
  "warrantyExpiry" TIMESTAMP(3),
  "notes" TEXT NOT NULL DEFAULT '',
  "assignedEmployeeId" TEXT,
  "assignedEmployeeName" TEXT,
  "assignedDate" TIMESTAMP(3),
  "expectedReturnDate" TIMESTAMP(3),
  "createdBy" TEXT NOT NULL,
  "updatedBy" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Asset_companyId_assetTag_key" UNIQUE ("companyId", "assetTag")
);
CREATE INDEX IF NOT EXISTS "Asset_companyId_status_idx" ON "Asset"("companyId", "status");
CREATE INDEX IF NOT EXISTS "Asset_companyId_assignedEmployeeId_idx" ON "Asset"("companyId", "assignedEmployeeId");
CREATE INDEX IF NOT EXISTS "Asset_categoryId_idx" ON "Asset"("categoryId");

CREATE TABLE IF NOT EXISTS "AssetAssignment" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "employeeId" TEXT NOT NULL,
  "employeeName" TEXT NOT NULL DEFAULT '',
  "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expectedReturn" TIMESTAMP(3),
  "returnedAt" TIMESTAMP(3),
  "assignedBy" TEXT NOT NULL,
  "returnedBy" TEXT,
  "notes" TEXT NOT NULL DEFAULT '',
  "isActive" BOOLEAN NOT NULL DEFAULT TRUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AssetAssignment_companyId_employeeId_idx" ON "AssetAssignment"("companyId", "employeeId");
CREATE INDEX IF NOT EXISTS "AssetAssignment_assetId_isActive_idx" ON "AssetAssignment"("assetId", "isActive");

CREATE TABLE IF NOT EXISTS "AssetHistory" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "action" TEXT NOT NULL,
  "fromStatus" TEXT,
  "toStatus" TEXT,
  "employeeId" TEXT,
  "actorId" TEXT NOT NULL,
  "actorName" TEXT NOT NULL,
  "details" TEXT NOT NULL DEFAULT '',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AssetHistory_assetId_createdAt_idx" ON "AssetHistory"("assetId", "createdAt");
CREATE INDEX IF NOT EXISTS "AssetHistory_companyId_idx" ON "AssetHistory"("companyId");

CREATE TABLE IF NOT EXISTS "AssetMaintenance" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "title" TEXT NOT NULL,
  "description" TEXT NOT NULL DEFAULT '',
  "status" TEXT NOT NULL DEFAULT 'Open',
  "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completedAt" TIMESTAMP(3),
  "cost" DECIMAL(65,30) DEFAULT 0,
  "vendor" TEXT NOT NULL DEFAULT '',
  "createdBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AssetMaintenance_assetId_idx" ON "AssetMaintenance"("assetId");
CREATE INDEX IF NOT EXISTS "AssetMaintenance_companyId_idx" ON "AssetMaintenance"("companyId");

CREATE TABLE IF NOT EXISTS "AssetDocument" (
  "id" TEXT PRIMARY KEY,
  "companyId" TEXT NOT NULL,
  "assetId" TEXT NOT NULL REFERENCES "Asset"("id") ON DELETE CASCADE,
  "name" TEXT NOT NULL,
  "storagePath" TEXT NOT NULL,
  "mimeType" TEXT,
  "sizeInBytes" INTEGER,
  "uploadedBy" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS "AssetDocument_assetId_idx" ON "AssetDocument"("assetId");
