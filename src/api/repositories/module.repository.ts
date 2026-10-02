import { db } from '../../db';
import { modules, subModules, features, moduleVisibilityRules, dashboardWidgetRegistry } from '../../db/schema';
import { eq, and, asc } from 'drizzle-orm';

export interface CreateModuleDto {
  moduleCode: string;
  name: string;
  category?: string;
  icon?: string;
  color?: string;
  displayOrder?: number;
  parentId?: string;
  description?: string;
  routePath?: string;
}

export interface CreateSubModuleDto {
  moduleId: string;
  subModuleCode: string;
  name: string;
  icon?: string;
  displayOrder?: number;
  routePath?: string;
}

export interface CreateFeatureDto {
  subModuleId: string;
  featureCode: string;
  name: string;
  description?: string;
  requiredPermission?: string;
  displayOrder?: number;
}

export class ModuleRepository {
  async ensureModulesSeeded() {
    const existing = await db.select().from(modules);
    if (existing.length === 0) {
      const now = new Date().toISOString();
      const defaultModules = [
        { id: 'mod-dash', moduleCode: 'DASHBOARD', name: 'Dashboard', category: 'CORE', icon: 'LayoutDashboard', color: '#3b82f6', displayOrder: 1, routePath: '/dashboard', description: 'Executive summary & real-time analytics' },
        { id: 'mod-proj', moduleCode: 'PROJECTS', name: 'Projects', category: 'CORE', icon: 'FolderKanban', color: '#10b981', displayOrder: 2, routePath: '/projects', description: 'Enterprise project portfolio & site operations' },
        { id: 'mod-mech', moduleCode: 'MECHANICAL', name: 'Mechanical & Piping', category: 'ENGINEERING', icon: 'Pipette', color: '#06b6d4', displayOrder: 3, routePath: '/mechanical', description: 'Pipeline networks, pump stations, hydro testing' },
        { id: 'mod-civil', moduleCode: 'CIVIL', name: 'Civil & Structures', category: 'ENGINEERING', icon: 'Building2', color: '#f59e0b', displayOrder: 4, routePath: '/civil', description: 'Earthwork, concrete, roads, reservoirs' },
        { id: 'mod-elec', moduleCode: 'ELECTRICAL', name: 'Electrical & SCADA', category: 'ENGINEERING', icon: 'Zap', color: '#8b5cf6', displayOrder: 5, routePath: '/electrical', description: 'Substations, transformers, instrumentation' },
        { id: 'mod-inv', moduleCode: 'INVENTORY', name: 'Inventory & Store', category: 'OPERATIONS', icon: 'Package', color: '#ec4899', displayOrder: 6, routePath: '/inventory', description: 'Warehouse stock, materials, MIV/MRN registers' },
        { id: 'mod-proc', moduleCode: 'PROCUREMENT', name: 'Procurement & PO', category: 'OPERATIONS', icon: 'ShoppingCart', color: '#6366f1', displayOrder: 7, routePath: '/procurement', description: 'Requisitions, purchase orders, vendor evaluation' },
        { id: 'mod-fleet', moduleCode: 'FLEET', name: 'Fleet & Equipment', category: 'OPERATIONS', icon: 'Truck', color: '#14b8a6', displayOrder: 8, routePath: '/fleet', description: 'Machinery allocation, fuel logs, maintenance' },
        { id: 'mod-hr', moduleCode: 'HR', name: 'HR & Workforces', category: 'ADMIN', icon: 'Users', color: '#f43f5e', displayOrder: 9, routePath: '/hr', description: 'Manpower, timesheets, site attendance, payroll' },
        { id: 'mod-qaqc', moduleCode: 'QAQC', name: 'QA / QC Quality', category: 'ENGINEERING', icon: 'ShieldCheck', color: '#10b981', displayOrder: 10, routePath: '/qaqc', description: 'Inspection requests (RFI), NDT test logs' },
        { id: 'mod-hse', moduleCode: 'SAFETY', name: 'HSE & Safety', category: 'OPERATIONS', icon: 'HardHat', color: '#ef4444', displayOrder: 11, routePath: '/safety', description: 'Incidents, toolbox talks, safety permits' },
        { id: 'mod-doc', moduleCode: 'DOCUMENTS', name: 'Documents & Drawings', category: 'CORE', icon: 'FileText', color: '#64748b', displayOrder: 12, routePath: '/documents', description: 'Technical drawings, transmittals, CAD models' },
        { id: 'mod-reports', moduleCode: 'REPORTS', name: 'Reports & Analytics', category: 'ADMIN', icon: 'BarChart3', color: '#8b5cf6', displayOrder: 13, routePath: '/reports', description: 'Custom ERP reporting & EXCEL export engine' },
        { id: 'mod-org', moduleCode: 'ORGANIZATION', name: 'Org & Settings', category: 'ADMIN', icon: 'Settings', color: '#475569', displayOrder: 14, routePath: '/organization', description: 'Company setup, branches, departments, RBAC' },
      ];

      for (const m of defaultModules) {
        await db.insert(modules).values({
          ...m,
          isEnabled: true,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing();
      }

      // Seed default Sub-Modules
      const defaultSubModules = [
        // Mechanical
        { id: 'sub-pipe', moduleId: 'mod-mech', subModuleCode: 'PIPELINE', name: 'Pipeline Network', icon: 'Pipette', displayOrder: 1 },
        { id: 'sub-pump', moduleId: 'mod-mech', subModuleCode: 'PUMP_STATION', name: 'Pump Station & Intake', icon: 'Gauge', displayOrder: 2 },
        { id: 'sub-res', moduleId: 'mod-mech', subModuleCode: 'RESERVOIR', name: 'Reservoir & Tanks', icon: 'Database', displayOrder: 3 },
        { id: 'sub-hydro', moduleId: 'mod-mech', subModuleCode: 'HYDRO_TESTING', name: 'Hydro Testing', icon: 'CheckCircle2', displayOrder: 4 },
        // Civil
        { id: 'sub-earth', moduleId: 'mod-civil', subModuleCode: 'EARTHWORK', name: 'Earthwork & Excavation', icon: 'HardHat', displayOrder: 1 },
        { id: 'sub-conc', moduleId: 'mod-civil', subModuleCode: 'CONCRETE', name: 'Concrete & RCC Works', icon: 'Building', displayOrder: 2 },
        { id: 'sub-road', moduleId: 'mod-civil', subModuleCode: 'ROAD_DRAINAGE', name: 'Roads & Drainage', icon: 'Navigation', displayOrder: 3 },
        // HR
        { id: 'sub-emp', moduleId: 'mod-hr', subModuleCode: 'EMPLOYEES', name: 'Employee Directory', icon: 'Users', displayOrder: 1 },
        { id: 'sub-att', moduleId: 'mod-hr', subModuleCode: 'ATTENDANCE', name: 'Site Attendance', icon: 'Clock', displayOrder: 2 },
      ];

      for (const sm of defaultSubModules) {
        await db.insert(subModules).values({
          ...sm,
          isEnabled: true,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing();
      }

      // Seed default Features
      const defaultFeatures = [
        { id: 'feat-joint', subModuleId: 'sub-pipe', featureCode: 'JOINT_REGISTER', name: 'Joint Welding Register', description: 'Track pipe joint fit-up & welding', displayOrder: 1 },
        { id: 'feat-ndt', subModuleId: 'sub-pipe', featureCode: 'NDT_REGISTER', name: 'NDT Radiography Log', description: 'Non-destructive testing reports', displayOrder: 2 },
        { id: 'feat-hydro-test', subModuleId: 'sub-hydro', featureCode: 'PRESSURE_TEST', name: 'Pressure Test Pack', description: 'Hydrostatic pressure log & chart', displayOrder: 1 },
      ];

      for (const f of defaultFeatures) {
        await db.insert(features).values({
          ...f,
          isEnabled: true,
          isArchived: false,
          createdAt: now,
          updatedAt: now,
        }).onConflictDoNothing();
      }
    }
  }

  // --- MODULE CRUD ---
  async getModules() {
    await this.ensureModulesSeeded();
    const rows = await db.select().from(modules).orderBy(asc(modules.displayOrder));
    return rows.filter((m) => !m.isArchived);
  }

  async getModuleById(id: string) {
    const [mod] = await db.select().from(modules).where(eq(modules.id, id));
    return mod || null;
  }

  async createModule(data: CreateModuleDto) {
    const id = `mod-${Date.now()}`;
    const now = new Date().toISOString();
    const newMod = {
      id,
      moduleCode: data.moduleCode.toUpperCase().replace(/\s+/g, '_'),
      name: data.name,
      category: data.category || 'CORE',
      icon: data.icon || 'Package',
      color: data.color || '#3b82f6',
      displayOrder: data.displayOrder || 99,
      parentId: data.parentId || null,
      description: data.description || '',
      routePath: data.routePath || `/${data.moduleCode.toLowerCase()}`,
      isEnabled: true,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(modules).values(newMod);
    return newMod;
  }

  async updateModule(id: string, updates: Partial<CreateModuleDto> & { isEnabled?: boolean }) {
    const now = new Date().toISOString();
    await db.update(modules).set({ ...updates, updatedAt: now }).where(eq(modules.id, id));
    return this.getModuleById(id);
  }

  async archiveModule(id: string) {
    const now = new Date().toISOString();
    await db.update(modules).set({ isArchived: true, updatedAt: now }).where(eq(modules.id, id));
    return true;
  }

  // --- SUB MODULE CRUD ---
  async getSubModules(moduleId?: string) {
    await this.ensureModulesSeeded();
    let rows = await db.select().from(subModules).orderBy(asc(subModules.displayOrder));
    rows = rows.filter((sm) => !sm.isArchived);
    if (moduleId) {
      rows = rows.filter((sm) => sm.moduleId === moduleId);
    }
    return rows;
  }

  async createSubModule(data: CreateSubModuleDto) {
    const id = `sub-${Date.now()}`;
    const now = new Date().toISOString();
    const newSub = {
      id,
      moduleId: data.moduleId,
      subModuleCode: data.subModuleCode.toUpperCase().replace(/\s+/g, '_'),
      name: data.name,
      icon: data.icon || 'Layers',
      displayOrder: data.displayOrder || 99,
      routePath: data.routePath || null,
      isEnabled: true,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(subModules).values(newSub);
    return newSub;
  }

  async updateSubModule(id: string, updates: any) {
    const now = new Date().toISOString();
    await db.update(subModules).set({ ...updates, updatedAt: now }).where(eq(subModules.id, id));
    const [updated] = await db.select().from(subModules).where(eq(subModules.id, id));
    return updated;
  }

  async archiveSubModule(id: string) {
    const now = new Date().toISOString();
    await db.update(subModules).set({ isArchived: true, updatedAt: now }).where(eq(subModules.id, id));
    return true;
  }

  // --- FEATURE REGISTRY CRUD ---
  async getFeatures(subModuleId?: string) {
    await this.ensureModulesSeeded();
    let rows = await db.select().from(features).orderBy(asc(features.displayOrder));
    rows = rows.filter((f) => !f.isArchived);
    if (subModuleId) {
      rows = rows.filter((f) => f.subModuleId === subModuleId);
    }
    return rows;
  }

  async createFeature(data: CreateFeatureDto) {
    const id = `feat-${Date.now()}`;
    const now = new Date().toISOString();
    const newFeat = {
      id,
      subModuleId: data.subModuleId,
      featureCode: data.featureCode.toUpperCase().replace(/\s+/g, '_'),
      name: data.name,
      description: data.description || '',
      requiredPermission: data.requiredPermission || null,
      displayOrder: data.displayOrder || 99,
      isEnabled: true,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(features).values(newFeat);
    return newFeat;
  }

  async updateFeature(id: string, updates: any) {
    const now = new Date().toISOString();
    await db.update(features).set({ ...updates, updatedAt: now }).where(eq(features.id, id));
    const [updated] = await db.select().from(features).where(eq(features.id, id));
    return updated;
  }

  async archiveFeature(id: string) {
    const now = new Date().toISOString();
    await db.update(features).set({ isArchived: true, updatedAt: now }).where(eq(features.id, id));
    return true;
  }

  // --- DYNAMIC SIDEBAR TREE BUILDING ---
  async getSidebarTree(userRole: string, departmentId?: string, projectId?: string, userId?: string) {
    const allModules = await this.getModules();
    const allSubModules = await this.getSubModules();
    const allFeatures = await this.getFeatures();
    const visibilityRules = await db.select().from(moduleVisibilityRules);

    const precedence = [
      { targetType: 'USER', targetId: userId, priority: 4 },
      { targetType: 'PROJECT', targetId: projectId, priority: 3 },
      { targetType: 'DEPARTMENT', targetId: departmentId, priority: 2 },
      { targetType: 'ROLE', targetId: userRole, priority: 1 },
    ];

    const matchingRule = (entityType: string, entityId: string): boolean | undefined => {
      const matches = visibilityRules
        .filter((rule) => rule.entityType === entityType && rule.entityId === entityId)
        .map((rule) => {
          const scope = precedence.find((p) => p.targetType === rule.targetType && p.targetId && p.targetId === rule.targetId);
          return scope ? { rule, priority: scope.priority } : null;
        })
        .filter((item): item is { rule: typeof visibilityRules[number]; priority: number } => Boolean(item))
        .sort((a, b) => b.priority - a.priority);

      if (!matches.length) return undefined;
      const highestPriority = matches[0].priority;
      const highestScope = matches.filter((item) => item.priority === highestPriority).map((item) => item.rule);
      if (highestScope.some((rule) => !rule.isEnabled)) return false;
      return true;
    };

    const enabledModules = allModules.filter((module) => module.isEnabled && !module.isArchived && matchingRule('MODULE', module.id) !== false);
    const enabledSubModules = allSubModules.filter((subModule) => subModule.isEnabled && !subModule.isArchived && matchingRule('SUB_MODULE', subModule.id) !== false);
    const enabledFeatures = allFeatures.filter((feature) => feature.isEnabled && !feature.isArchived && matchingRule('FEATURE', feature.id) !== false);

    return enabledModules
      .map((module) => {
        const subModulesForModule = enabledSubModules
          .filter((subModule) => subModule.moduleId === module.id)
          .map((subModule) => ({
            ...subModule,
            features: enabledFeatures.filter((feature) => feature.subModuleId === subModule.id),
          }));
        return { ...module, subModules: subModulesForModule };
      })
      .filter((module) => module.subModules.length > 0);
  }

  // --- DASHBOARD WIDGET REGISTRY ---
  async getDashboardWidgets(moduleCode?: string) {
    let rows = await db.select().from(dashboardWidgetRegistry).orderBy(asc(dashboardWidgetRegistry.displayOrder));
    if (moduleCode) {
      rows = rows.filter((w) => w.moduleCode === moduleCode);
    }
    return rows.filter((w) => w.isEnabled);
  }

  async registerDashboardWidget(data: { moduleCode: string; title: string; widgetType: string; configJson?: any; displayOrder?: number }) {
    const id = `wid-${Date.now()}`;
    const now = new Date().toISOString();
    const widget = {
      id,
      moduleCode: data.moduleCode,
      title: data.title,
      widgetType: data.widgetType,
      configJson: data.configJson || {},
      displayOrder: data.displayOrder || 1,
      isEnabled: true,
      createdAt: now,
    };
    await db.insert(dashboardWidgetRegistry).values(widget as any);
    return widget;
  }
}

export const moduleRepository = new ModuleRepository();
