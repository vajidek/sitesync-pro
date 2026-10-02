import { UserProfile, UserRole, Project, WorkOrder, InventoryItem, MachineryEquipment, DailyLog, SchemaTable } from '../types';
import { BRANDING_CONFIG, CREATOR_INFO } from '../config/branding.config';

export { BRANDING_CONFIG, CREATOR_INFO };

export const ROLE_CONFIG: Record<UserRole, { label: string; badgeColor: string; description: string }> = {
  ADMIN: {
    label: 'System Admin',
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950 dark:text-rose-300 dark:border-rose-800',
    description: 'Full system authorization, user provisioning, ERP schema control & global audit.',
  },
  MANAGER: {
    label: 'Project Manager',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800',
    description: 'Project budgets, milestone planning, resource tracking & executive oversight.',
  },
  INCHARGE: {
    label: 'Site Incharge',
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950 dark:text-indigo-300 dark:border-indigo-800',
    description: 'Site engineering approvals, quality checks, technical sign-offs & safety compliance.',
  },
  SUPERVISOR: {
    label: 'Site Supervisor',
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
    description: 'Field crew allocation, daily work orders, progress logs & material requests.',
  },
  STORE_KEEPER: {
    label: 'Store Keeper',
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950 dark:text-teal-300 dark:border-teal-800',
    description: 'Material stock control, gate passes, store inventory & requisition dispatches.',
  },
  DRIVER: {
    label: 'Logistics Driver',
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-950 dark:text-cyan-300 dark:border-cyan-800',
    description: 'Heavy equipment haulage, site deliveries, vehicle checklists & trip logging.',
  },
  OPERATOR: {
    label: 'Plant Operator',
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950 dark:text-emerald-300 dark:border-emerald-800',
    description: 'Crane & heavy machinery operation, hour meter logging & maintenance reporting.',
  },
  WORKER: {
    label: 'Site Worker',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    description: 'Assigned task execution, digital timecard punch, safety briefing verification.',
  },
};

export const DEMO_USERS: Record<UserRole, UserProfile> = {
  ADMIN: {
    id: 'usr_admin_01',
    name: 'Abdul Vajid EK',
    email: 'admin@sitesyncpro.com',
    role: 'ADMIN',
    department: 'Executive System Administration',
    phone: '+91 98950 00101',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: true,
      canManageProjects: true,
      canApproveRequisitions: true,
      canManageInventory: true,
      canOperateMachinery: true,
      canLogWork: true,
      canViewSchema: true,
    },
  },
  MANAGER: {
    id: 'usr_mgr_02',
    name: 'Robert Vance',
    email: 'manager@sitesyncpro.com',
    role: 'MANAGER',
    department: 'Project Management Office',
    phone: '+91 98950 00102',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: false,
      canManageProjects: true,
      canApproveRequisitions: true,
      canManageInventory: true,
      canOperateMachinery: false,
      canLogWork: true,
      canViewSchema: true,
    },
  },
  INCHARGE: {
    id: 'usr_inc_03',
    name: 'Siddharth Nair',
    email: 'incharge@sitesyncpro.com',
    role: 'INCHARGE',
    department: 'Mechanical Engineering Site A',
    phone: '+91 98950 00103',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canApproveRequisitions: true,
      canManageInventory: false,
      canOperateMachinery: false,
      canLogWork: true,
      canViewSchema: true,
    },
  },
  SUPERVISOR: {
    id: 'usr_sup_04',
    name: 'Marcus Brody',
    email: 'supervisor@sitesyncpro.com',
    role: 'SUPERVISOR',
    department: 'Field Structural Assembly Crew',
    phone: '+91 98950 00104',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canApproveRequisitions: false,
      canManageInventory: false,
      canOperateMachinery: false,
      canLogWork: true,
      canViewSchema: true,
    },
  },
  STORE_KEEPER: {
    id: 'usr_str_05',
    name: 'Firoz Rahman',
    email: 'storekeeper@sitesyncpro.com',
    role: 'STORE_KEEPER',
    department: 'Central Mechanical Warehouse',
    phone: '+91 98950 00105',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canApproveRequisitions: false,
      canManageInventory: true,
      canOperateMachinery: false,
      canLogWork: true,
      canViewSchema: true,
    },
  },
  DRIVER: {
    id: 'usr_drv_06',
    name: 'Vikram Singh',
    email: 'driver@sitesyncpro.com',
    role: 'DRIVER',
    department: 'Heavy Logistics Fleet',
    phone: '+91 98950 00106',
    assignedProjectId: 'prj_02',
    assignedProjectName: 'Water Transmission Main & Intake',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canApproveRequisitions: false,
      canManageInventory: false,
      canOperateMachinery: false,
      canLogWork: true,
      canViewSchema: false,
    },
  },
  OPERATOR: {
    id: 'usr_opr_07',
    name: 'Alexei Ivanov',
    email: 'operator@sitesyncpro.com',
    role: 'OPERATOR',
    department: 'Heavy Crane & Plant Division',
    phone: '+91 98950 00107',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canApproveRequisitions: false,
      canManageInventory: false,
      canOperateMachinery: true,
      canLogWork: true,
      canViewSchema: false,
    },
  },
  WORKER: {
    id: 'usr_wrk_08',
    name: 'Kiran Kumar',
    email: 'worker@sitesyncpro.com',
    role: 'WORKER',
    department: 'Piping & Fabrication Craft',
    phone: '+91 98950 00108',
    assignedProjectId: 'prj_01',
    assignedProjectName: 'Peruvannamuzhi WTP Pipe Network',
    permissions: {
      canManageUsers: false,
      canManageProjects: false,
      canApproveRequisitions: false,
      canManageInventory: false,
      canOperateMachinery: false,
      canLogWork: true,
      canViewSchema: false,
    },
  },
};

export const DEMO_PROJECTS: Project[] = [
  {
    id: 'prj_01',
    code: 'SSP-PRJ-2026-01',
    name: 'Peruvannamuzhi WTP Pipe Network',
    client: 'Midland Water Resources Dept',
    category: 'Piping',
    location: 'Peruvannamuzhi Sector 1',
    status: 'In Progress',
    progress: 68,
    budgetUSD: 4500000,
    spentUSD: 2980000,
    startDate: '2026-01-15',
    targetCompletionDate: '2026-11-30',
    managerName: 'Robert Vance',
    inchargeName: 'Siddharth Nair',
    activeWorkersCount: 42,
    heavyMachineryCount: 7,
  },
  {
    id: 'prj_02',
    code: 'SSP-PRJ-2026-02',
    name: 'Water Transmission Main & Intake Pump House',
    client: 'Midland Infrastructure Authority',
    category: 'Piping',
    location: 'WTP Intake Zone & Pipe Yard',
    status: 'In Progress',
    progress: 44,
    budgetUSD: 7200000,
    spentUSD: 3100000,
    startDate: '2026-03-01',
    targetCompletionDate: '2027-02-28',
    managerName: 'Robert Vance',
    inchargeName: 'Siddharth Nair',
    activeWorkersCount: 58,
    heavyMachineryCount: 12,
  },
  {
    id: 'prj_03',
    code: 'SSP-PRJ-2026-03',
    name: 'Central Junction Booster Substation',
    client: 'Midland Water Supply Board',
    category: 'Mechanical',
    location: 'Central Junction Substation',
    status: 'Planning',
    progress: 15,
    budgetUSD: 2800000,
    spentUSD: 350000,
    startDate: '2026-06-10',
    targetCompletionDate: '2026-12-20',
    managerName: 'Robert Vance',
    inchargeName: 'Siddharth Nair',
    activeWorkersCount: 18,
    heavyMachineryCount: 4,
  },
];

export const DEMO_WORK_ORDERS: WorkOrder[] = [
  {
    id: 'wo_101',
    code: 'WO-MECH-8821',
    title: 'Align Main Support Pipe Girders #A4 to #A9',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    category: 'Piping & Fabrication',
    assignedToRole: 'OPERATOR',
    assignedToName: 'Alexei Ivanov (Crane 100T)',
    priority: 'Critical',
    status: 'In Progress',
    location: 'WTP Intake Section A4',
    dueDate: '2026-08-03',
    completedPercent: 75,
  },
  {
    id: 'wo_102',
    code: 'WO-PIPE-4409',
    title: 'Hydrostatic Pressure Testing on Main Line 2',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    category: 'Piping & Fabrication',
    assignedToRole: 'INCHARGE',
    assignedToName: 'Siddharth Nair',
    priority: 'High',
    status: 'Under Inspection',
    location: 'Pump House Block C',
    dueDate: '2026-08-04',
    completedPercent: 90,
  },
  {
    id: 'wo_103',
    code: 'WO-HVAC-1192',
    title: 'Install Air Handling Unit 04 Dampers & Filters',
    projectId: 'prj_02',
    projectName: 'Water Transmission Main & Intake Pump House',
    category: 'HVAC Ducting',
    assignedToRole: 'WORKER',
    assignedToName: 'Kiran Kumar',
    priority: 'Medium',
    status: 'In Progress',
    location: 'AHU Room #2',
    dueDate: '2026-08-05',
    completedPercent: 40,
  },
  {
    id: 'wo_104',
    code: 'WO-ELEC-3301',
    title: 'Pre-Commissioning Cable Insulation Checks',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    category: 'Electrical Panel',
    assignedToRole: 'SUPERVISOR',
    assignedToName: 'Marcus Brody',
    priority: 'Low',
    status: 'Pending',
    location: 'Substation Control Panel B',
    dueDate: '2026-08-07',
    completedPercent: 0,
  },
];

export const DEMO_INVENTORY: InventoryItem[] = [
  {
    id: 'inv_01',
    itemCode: 'MAT-STEEL-A36',
    name: 'High Tensile Steel Bolts (M24 x 100mm Grade 8.8)',
    category: 'Mechanical Fasteners',
    unit: 'Pcs',
    quantityInStock: 1450,
    minThreshold: 300,
    unitPriceUSD: 8.50,
    storeLocation: 'Rack B-14 Structural Bay',
    lastRestocked: '2026-07-28',
    status: 'In Stock',
  },
  {
    id: 'inv_02',
    itemCode: 'MAT-PIPE-SS316',
    name: 'Seamless Stainless Pipe 6" SCH 40',
    category: 'Pipes & Fittings',
    unit: 'Meters',
    quantityInStock: 45,
    minThreshold: 100,
    unitPriceUSD: 140.00,
    storeLocation: 'Yard Outdoor Pipe Storage 2',
    lastRestocked: '2026-07-15',
    status: 'Low Stock',
  },
  {
    id: 'inv_03',
    itemCode: 'MAT-WELD-E7018',
    name: 'E7018 Welding Electrodes (4.0mm)',
    category: 'Consumables & Safety',
    unit: 'Boxes',
    quantityInStock: 12,
    minThreshold: 25,
    unitPriceUSD: 38.00,
    storeLocation: 'Store Room Dry Cabinet A',
    lastRestocked: '2026-07-10',
    status: 'Low Stock',
  },
  {
    id: 'inv_04',
    itemCode: 'MAT-HYD-SEAL-99',
    name: 'Excavator Hydraulic Cylinder O-Ring Seal Kit',
    category: 'Hydraulic Spares',
    unit: 'Boxes',
    quantityInStock: 5,
    minThreshold: 2,
    unitPriceUSD: 210.00,
    storeLocation: 'Spares Locker C-03',
    lastRestocked: '2026-07-22',
    status: 'In Stock',
  },
];

export const DEMO_MACHINERY: MachineryEquipment[] = [
  {
    id: 'mac_01',
    assetTag: 'EQ-CRANE-100T',
    name: 'Liebherr LTM 1100 All-Terrain Mobile Crane',
    model: 'LTM 1100-4.2',
    type: 'Mobile Crane',
    operatorName: 'Alexei Ivanov',
    assignedSite: 'Peruvannamuzhi WTP Section A',
    status: 'Operational',
    fuelLevelPercent: 82,
    workingHours: 1420,
    nextServiceDue: '2026-08-20',
  },
  {
    id: 'mac_02',
    assetTag: 'EQ-EXCAV-CAT330',
    name: 'Caterpillar 330 Next Gen Hydraulic Excavator',
    model: 'CAT 330 GC',
    type: 'Excavator',
    operatorName: 'Ramesh Patel',
    assignedSite: 'WTP Intake Trenching Zone',
    status: 'Operational',
    fuelLevelPercent: 65,
    workingHours: 2150,
    nextServiceDue: '2026-08-12',
  },
  {
    id: 'mac_03',
    assetTag: 'EQ-GEN-350KVA',
    name: 'Cummins Silent Diesel Generator 350 KVA',
    model: 'C350D5',
    type: 'Diesel Generator',
    operatorName: 'On-site Supervisor Duty',
    assignedSite: 'Peruvannamuzhi WTP Substation',
    status: 'Under Maintenance',
    fuelLevelPercent: 40,
    workingHours: 3890,
    nextServiceDue: '2026-08-02',
  },
];

export const DEMO_DAILY_LOGS: DailyLog[] = [
  {
    id: 'log_901',
    date: '2026-08-01',
    projectId: 'prj_01',
    projectName: 'Peruvannamuzhi WTP Pipe Network',
    supervisorName: 'Marcus Brody',
    workersCount: 42,
    weather: 'Sunny / 31°C / Wind 12kmh',
    safetyIncidents: 0,
    notes: 'Lifted and temporarily tacked Girders #A4 and #A5 into position. Full welding scheduled for morning shift.',
    progressHighlights: [
      'Completed 4 Girder hoists with 100T Crane',
      'Torqued M24 bolts on Pier 3 flange',
      'Zero safety incidents recorded during heavy lift',
    ],
  },
];

export const ERP_SCHEMA_TABLES: SchemaTable[] = [
  {
    name: 'users',
    description: 'System user identities, security roles, authentication credentials, and department assignments.',
    module: 'Core Identity',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Unique surrogate primary key' },
      { name: 'email', type: 'VARCHAR(255)', description: 'Unique user email address used for login' },
      { name: 'password_hash', type: 'VARCHAR(255)', description: 'Bcrypt hashed password' },
      { name: 'full_name', type: 'VARCHAR(150)', description: 'Employee or contractor full name' },
      { name: 'role', type: 'ENUM(UserRole)', description: 'System authorization role (ADMIN, MANAGER, etc.)' },
      { name: 'phone', type: 'VARCHAR(30)', description: 'Mobile contact number' },
      { name: 'department', type: 'VARCHAR(100)', description: 'Operating department or craft division' },
      { name: 'created_at', type: 'TIMESTAMPTZ', description: 'Account creation timestamp' },
    ],
    prismaModel: `model User {
  id           String     @id @default(uuid())
  email        String     @unique
  passwordHash String
  fullName     String
  role         UserRole   @default(WORKER)
  phone        String?
  department   String?
  createdAt    DateTime   @default(now())
  updatedAt    DateTime   @updatedAt

  workOrdersAssigned WorkOrder[] @relation("AssignedWorkOrders")
  siteLogsSupervised  DailySiteLog[]
  machineryLogs      MachineryLog[]

  @@map("users")
}`,
    sqlDdl: `CREATE TYPE user_role AS ENUM (
  'ADMIN', 'MANAGER', 'INCHARGE', 'SUPERVISOR', 
  'STORE_KEEPER', 'DRIVER', 'OPERATOR', 'WORKER'
);

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(150) NOT NULL,
  role user_role NOT NULL DEFAULT 'WORKER',
  phone VARCHAR(30),
  department VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
  },
  {
    name: 'projects',
    description: 'Master record of civil & mechanical projects, budget allocations, schedules, and leadership.',
    module: 'Project Management',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Project ID' },
      { name: 'code', type: 'VARCHAR(50)', description: 'Unique external project reference code' },
      { name: 'name', type: 'VARCHAR(200)', description: 'Project title' },
      { name: 'client', type: 'VARCHAR(150)', description: 'Client organization or government authority' },
      { name: 'category', type: 'VARCHAR(50)', description: 'Civil, Mechanical, Piping, HVAC, etc.' },
      { name: 'budget_usd', type: 'DECIMAL(14,2)', description: 'Approved project budget in USD' },
      { name: 'status', type: 'VARCHAR(30)', description: 'Planning, In Progress, On Hold, Completed' },
      { name: 'manager_id', type: 'UUID', isForeign: true, description: 'FK to users table (Project Manager)' },
    ],
    prismaModel: `model Project {
  id             String    @id @default(uuid())
  code           String    @unique
  name           String
  client         String
  category       String
  budgetUSD      Decimal   @db.Decimal(14, 2)
  spentUSD       Decimal   @default(0) @db.Decimal(14, 2)
  status         String    @default("Planning")
  startDate      DateTime
  targetDate     DateTime
  managerId      String
  
  workOrders     WorkOrder[]
  siteLogs       DailySiteLog[]
  machinery      Machinery[]
  
  @@map("projects")
}`,
    sqlDdl: `CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  client VARCHAR(150) NOT NULL,
  category VARCHAR(50) NOT NULL,
  budget_usd DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  spent_usd DECIMAL(14,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'Planning',
  start_date DATE NOT NULL,
  target_date DATE NOT NULL,
  manager_id UUID REFERENCES users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
  },
  {
    name: 'machinery',
    description: 'Heavy construction machinery, cranes, excavators, and mechanical plant assets tracking.',
    module: 'Equipment & Plant',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Machinery record ID' },
      { name: 'asset_tag', type: 'VARCHAR(50)', description: 'Unique plant asset tag number' },
      { name: 'name', type: 'VARCHAR(150)', description: 'Equipment name & specification' },
      { name: 'type', type: 'VARCHAR(50)', description: 'Mobile Crane, Excavator, Generator, etc.' },
      { name: 'operator_id', type: 'UUID', isForeign: true, description: 'Assigned certified operator user ID' },
      { name: 'working_hours', type: 'INT', description: 'Cumulative engine hour meter' },
      { name: 'fuel_level_pct', type: 'INT', description: 'Current fuel percentage' },
      { name: 'status', type: 'VARCHAR(30)', description: 'Operational, Under Maintenance, Breakdown' },
    ],
    prismaModel: `model Machinery {
  id             String   @id @default(uuid())
  assetTag       String   @unique
  name           String
  type           String
  operatorId     String?
  projectId      String?
  workingHours   Int      @default(0)
  fuelLevelPct   Int      @default(100)
  status         String   @default("Operational")
  nextServiceDue DateTime
  
  project        Project? @relation(fields: [projectId], references: [id])
  logs           MachineryLog[]

  @@map("machinery")
}`,
    sqlDdl: `CREATE TABLE machinery (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_tag VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  operator_id UUID REFERENCES users(id),
  project_id UUID REFERENCES projects(id),
  working_hours INT NOT NULL DEFAULT 0,
  fuel_level_pct INT NOT NULL DEFAULT 100,
  status VARCHAR(30) NOT NULL DEFAULT 'Operational',
  next_service_due DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
  },
  {
    name: 'inventory_items',
    description: 'Central mechanical store inventory, raw structural materials, fasteners, and spare parts.',
    module: 'Inventory & Store',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Inventory SKU ID' },
      { name: 'item_code', type: 'VARCHAR(50)', description: 'Barcoded material item SKU code' },
      { name: 'name', type: 'VARCHAR(200)', description: 'Material description' },
      { name: 'category', type: 'VARCHAR(50)', description: 'Fasteners, Steel, Pipes, Spares, etc.' },
      { name: 'quantity_in_stock', type: 'INT', description: 'Available warehouse stock' },
      { name: 'min_threshold', type: 'INT', description: 'Reorder alert threshold' },
      { name: 'unit_price_usd', type: 'DECIMAL(10,2)', description: 'Standard unit purchasing cost' },
    ],
    prismaModel: `model InventoryItem {
  id              String   @id @default(uuid())
  itemCode        String   @unique
  name            String
  category        String
  unit            String
  quantityInStock Int      @default(0)
  minThreshold    Int      @default(10)
  unitPriceUSD    Decimal  @db.Decimal(10, 2)
  storeLocation   String
  updatedAt       DateTime @updatedAt

  requisitions    RequisitionItem[]

  @@map("inventory_items")
}`,
    sqlDdl: `CREATE TABLE inventory_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  category VARCHAR(50) NOT NULL,
  unit VARCHAR(20) NOT NULL DEFAULT 'Pcs',
  quantity_in_stock INT NOT NULL DEFAULT 0,
  min_threshold INT NOT NULL DEFAULT 10,
  unit_price_usd DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  store_location VARCHAR(100),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
  },
  {
    name: 'work_orders',
    description: 'Field tasks, fabrication work orders, assembly steps, and role-assigned execution items.',
    module: 'Field Operations',
    fields: [
      { name: 'id', type: 'UUID', isPrimary: true, description: 'Work Order ID' },
      { name: 'code', type: 'VARCHAR(50)', description: 'WO reference code' },
      { name: 'title', type: 'VARCHAR(250)', description: 'Work order title' },
      { name: 'project_id', type: 'UUID', isForeign: true, description: 'FK to projects' },
      { name: 'assigned_role', type: 'ENUM(UserRole)', description: 'Role responsible for work order execution' },
      { name: 'priority', type: 'VARCHAR(20)', description: 'Low, Medium, High, Critical' },
      { name: 'status', type: 'VARCHAR(30)', description: 'Pending, In Progress, Under Inspection, Completed' },
    ],
    prismaModel: `model WorkOrder {
  id             String    @id @default(uuid())
  code           String    @unique
  title          String
  projectId      String
  assignedRole   UserRole
  assignedUserId String?
  priority       String    @default("Medium")
  status         String    @default("Pending")
  dueDate        DateTime
  progress       Int       @default(0)

  project        Project   @relation(fields: [projectId], references: [id])
  assignedUser   User?     @relation("AssignedWorkOrders", fields: [assignedUserId], references: [id])

  @@map("work_orders")
}`,
    sqlDdl: `CREATE TABLE work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(250) NOT NULL,
  project_id UUID NOT NULL REFERENCES projects(id),
  assigned_role user_role NOT NULL,
  assigned_user_id UUID REFERENCES users(id),
  priority VARCHAR(20) NOT NULL DEFAULT 'Medium',
  status VARCHAR(30) NOT NULL DEFAULT 'Pending',
  due_date DATE NOT NULL,
  progress INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`
  }
];
