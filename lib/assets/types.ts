export const ASSET_STATUSES = [
  'Available',
  'Assigned',
  'In Use',
  'Under Maintenance',
  'Damaged',
  'Lost',
  'Returned',
  'Retired',
] as const;

export type AssetStatus = (typeof ASSET_STATUSES)[number];

export const ASSET_CONDITIONS = ['New', 'Good', 'Fair', 'Poor', 'Damaged'] as const;
export type AssetCondition = (typeof ASSET_CONDITIONS)[number];

export const DEFAULT_ASSET_CATEGORIES = [
  { code: 'laptop', name: 'Laptop', icon: 'Laptop' },
  { code: 'desktop', name: 'Desktop', icon: 'Monitor' },
  { code: 'monitor', name: 'Monitor', icon: 'Monitor' },
  { code: 'mobile', name: 'Mobile', icon: 'Smartphone' },
  { code: 'tablet', name: 'Tablet', icon: 'Tablet' },
  { code: 'keyboard', name: 'Keyboard', icon: 'Keyboard' },
  { code: 'mouse', name: 'Mouse', icon: 'Mouse' },
  { code: 'headset', name: 'Headset', icon: 'Headphones' },
  { code: 'access_card', name: 'Access Card', icon: 'CreditCard' },
  { code: 'software_license', name: 'Software License', icon: 'KeyRound' },
  { code: 'other', name: 'Other', icon: 'Package' },
] as const;

export type AssetCategory = {
  id: string;
  companyId: string;
  code: string;
  name: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Asset = {
  id: string;
  companyId: string;
  categoryId: string;
  categoryCode?: string;
  categoryName?: string;
  categoryIcon?: string;
  name: string;
  assetTag: string;
  serialNumber: string;
  brand: string;
  model: string;
  status: AssetStatus;
  condition: AssetCondition;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  notes: string;
  assignedEmployeeId?: string | null;
  assignedEmployeeName?: string | null;
  assignedDate?: string | null;
  expectedReturnDate?: string | null;
  createdBy: string;
  updatedBy?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type AssetAssignment = {
  id: string;
  companyId: string;
  assetId: string;
  employeeId: string;
  employeeName: string;
  assignedAt: string;
  expectedReturn?: string | null;
  returnedAt?: string | null;
  assignedBy: string;
  returnedBy?: string | null;
  notes: string;
  isActive: boolean;
};

export type AssetHistory = {
  id: string;
  companyId: string;
  assetId: string;
  action: string;
  fromStatus?: string | null;
  toStatus?: string | null;
  employeeId?: string | null;
  actorId: string;
  actorName: string;
  details: string;
  createdAt: string;
};

export type AssetMaintenance = {
  id: string;
  companyId: string;
  assetId: string;
  title: string;
  description: string;
  status: 'Open' | 'In Progress' | 'Completed' | 'Cancelled';
  startedAt: string;
  completedAt?: string | null;
  cost?: number | null;
  vendor: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
};

export type AssetDocument = {
  id: string;
  companyId: string;
  assetId: string;
  name: string;
  storagePath: string;
  mimeType?: string | null;
  sizeInBytes?: number | null;
  uploadedBy: string;
  createdAt: string;
};

export type AssetSummary = {
  total: number;
  assigned: number;
  inUse: number;
  underMaintenance: number;
  dueForReturn: number;
  available: number;
};

export type AssetDetail = Asset & {
  history: AssetHistory[];
  maintenance: AssetMaintenance[];
  assignments: AssetAssignment[];
  documents: AssetDocument[];
};

export type CreateAssetInput = {
  name: string;
  assetTag: string;
  categoryId: string;
  serialNumber?: string;
  brand?: string;
  model?: string;
  condition?: AssetCondition;
  purchaseDate?: string | null;
  warrantyExpiry?: string | null;
  notes?: string;
};

export type UpdateAssetInput = Partial<CreateAssetInput> & {
  status?: AssetStatus;
  condition?: AssetCondition;
};
