export * from './types/hr';
export * from './types/procurement';
export * from './types/waterInfrastructureEngine';

export type UserRole = 
  | 'ADMIN' 
  | 'MANAGER' 
  | 'INCHARGE' 
  | 'SUPERVISOR' 
  | 'STORE_KEEPER' 
  | 'DRIVER' 
  | 'OPERATOR' 
  | 'WORKER';

export interface UserPermissions {
  canManageUsers?: boolean;
  canManageProjects?: boolean;
  canApproveRequisitions?: boolean;
  canManageInventory?: boolean;
  canOperateMachinery?: boolean;
  canLogWork?: boolean;
  canViewSchema?: boolean;
  canViewFinancials?: boolean;
  canApprovePO?: boolean;
  canApprovePR?: boolean;
  canEditProjectBudget?: boolean;
  canExportReports?: boolean;
  canCreateWorkOrders?: boolean;
  canManageFleet?: boolean;
  canSignOffQAQC?: boolean;
  canManageHSE?: boolean;
}

export interface AuthorizedWorkspace {
  role: UserRole;
  label: string;
  description: string;
  badge?: string;
}

export interface UserProfile {
  id: string;
  username?: string;
  employeeId?: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  department: string;
  phone: string;
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'LOCKED' | 'SUSPENDED' | 'DELETED';
  forcePasswordChange?: boolean;
  passwordLastChangedAt?: string;
  lastLoginAt?: string;
  lastLogoutAt?: string;
  assignedProjectId?: string;
  assignedProjectName?: string;
  permissions: UserPermissions;
  authorizedWorkspaces?: AuthorizedWorkspace[];
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client: string;
  category: 'Civil' | 'Mechanical' | 'Piping' | 'HVAC' | 'Structural' | 'Electrical';
  location: string;
  status: 'Planning' | 'In Progress' | 'On Hold' | 'Completed';
  progress: number; // 0 - 100
  budgetUSD: number;
  spentUSD: number;
  startDate: string;
  targetCompletionDate: string;
  managerName: string;
  inchargeName: string;
  activeWorkersCount: number;
  heavyMachineryCount: number;
}

export interface WorkOrder {
  id: string;
  code: string;
  title: string;
  projectId: string;
  projectName: string;
  category: 'Mechanical Assembly' | 'Structural Steel' | 'Piping & Fabrication' | 'Excavation & Concrete' | 'HVAC Ducting' | 'Electrical Panel';
  assignedToRole: UserRole;
  assignedToName: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  status: 'Pending' | 'In Progress' | 'Under Inspection' | 'Approved' | 'Completed';
  location: string;
  dueDate: string;
  completedPercent: number;
}

export interface InventoryItem {
  id: string;
  itemCode: string;
  name: string;
  category: 'Mechanical Fasteners' | 'Structural Steel' | 'Pipes & Fittings' | 'Consumables & Safety' | 'Hydraulic Spares' | 'Electrical Wire';
  unit: 'Pcs' | 'Kg' | 'Meters' | 'Boxes' | 'Liters';
  quantityInStock: number;
  minThreshold: number;
  unitPriceUSD: number;
  storeLocation: string;
  lastRestocked: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface MachineryEquipment {
  id: string;
  assetTag: string;
  name: string;
  model: string;
  type: 'Mobile Crane' | 'Tower Crane' | 'Excavator' | 'Welding Machine' | 'Diesel Generator' | 'Transit Mixer' | 'Flatbed Truck';
  operatorName: string;
  assignedSite: string;
  status: 'Operational' | 'Under Maintenance' | 'In Transit' | 'Breakdown';
  fuelLevelPercent: number;
  workingHours: number;
  nextServiceDue: string;
}

export interface DailyLog {
  id: string;
  date: string;
  projectId: string;
  projectName: string;
  supervisorName: string;
  workersCount: number;
  weather: string;
  safetyIncidents: number;
  notes: string;
  progressHighlights: string[];
}

export interface SchemaField {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
  isNullable?: boolean;
  description: string;
}

export interface SchemaTable {
  name: string;
  description: string;
  module: 'Core Identity' | 'Project Management' | 'Equipment & Plant' | 'Inventory & Store' | 'Field Operations';
  fields: SchemaField[];
  prismaModel: string;
  sqlDdl: string;
}
