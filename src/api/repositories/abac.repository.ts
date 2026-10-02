import { db } from '../../db';
import { 
  permissionPolicies, permissionAttributes, permissionScopes, 
  featurePermissions, fieldPermissions, userEffectivePermissions 
} from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';

export interface CreatePolicyDto {
  code: string;
  name: string;
  description?: string;
  effect?: 'ALLOW' | 'DENY';
  priority?: number;
}

export interface CreateAttributeDto {
  policyId: string;
  attributeKey: string;
  operator?: string;
  attributeValue: string;
}

export interface CreateScopeDto {
  policyId: string;
  scopeType: string;
  moduleCode: string;
  featureCode?: string;
  actionsJson: string[];
}

export interface CreateFeaturePermissionDto {
  policyId: string;
  moduleCode: string;
  featureCode: string;
  visibilityState: string;
}

export interface CreateFieldPermissionDto {
  policyId: string;
  moduleCode: string;
  entityName: string;
  fieldName: string;
  visibility: string;
}

export class AbacRepository {
  async ensurePoliciesSeeded() {
    const existing = await db.select().from(permissionPolicies);
    if (existing.length === 0) {
      const now = new Date().toISOString();

      // Seed Default Enterprise Security Policies
      const defaultPolicies = [
        {
          id: 'pol-admin-global',
          code: 'POLICY_GLOBAL_ADMIN_FULL_ACCESS',
          name: 'Global System Administrator Policy',
          description: 'Full unconstrained platform administrative control across all tenant entities and modules.',
          effect: 'ALLOW',
          priority: 1000,
          isEnabled: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'pol-hr-salary-masking',
          code: 'POLICY_HR_SALARY_FIELD_RESTRICTION',
          name: 'HR Confidential Salary & Bank Masking Policy',
          description: 'Restricts payroll details and bank metadata visibility strictly to HR and Finance roles.',
          effect: 'ALLOW',
          priority: 500,
          isEnabled: true,
          createdAt: now,
          updatedAt: now,
        },
        {
          id: 'pol-project-engineer-scope',
          code: 'POLICY_PROJECT_ENGINEER_ASSIGNED_ONLY',
          name: 'Project Site Engineer Row-Level Scope',
          description: 'Constrains site engineers and foremen to records explicitly within their assigned project IDs.',
          effect: 'ALLOW',
          priority: 300,
          isEnabled: true,
          createdAt: now,
          updatedAt: now,
        },
      ];

      for (const pol of defaultPolicies) {
        await db.insert(permissionPolicies).values(pol).onConflictDoNothing();
      }

      // Seed Field Permissions
      const fieldPerms = [
        {
          id: 'fp-1',
          policyId: 'pol-hr-salary-masking',
          moduleCode: 'HR',
          entityName: 'EMPLOYEE',
          fieldName: 'salary',
          visibility: 'MASKED',
          createdAt: now,
        },
        {
          id: 'fp-2',
          policyId: 'pol-hr-salary-masking',
          moduleCode: 'HR',
          entityName: 'EMPLOYEE',
          fieldName: 'bankDetails',
          visibility: 'HIDDEN',
          createdAt: now,
        },
        {
          id: 'fp-3',
          policyId: 'pol-project-engineer-scope',
          moduleCode: 'PROJECTS',
          entityName: 'PROJECT_BOQ',
          fieldName: 'boqRate',
          visibility: 'READ_ONLY',
          createdAt: now,
        },
      ];

      for (const fp of fieldPerms) {
        await db.insert(fieldPermissions).values(fp).onConflictDoNothing();
      }
    }
  }

  // --- POLICIES CRUD ---
  async getPolicies() {
    await this.ensurePoliciesSeeded();
    return db.select().from(permissionPolicies).orderBy(desc(permissionPolicies.priority));
  }

  async getPolicyById(id: string) {
    const [pol] = await db.select().from(permissionPolicies).where(eq(permissionPolicies.id, id));
    return pol || null;
  }

  async createPolicy(data: CreatePolicyDto) {
    const id = `pol-${Date.now()}`;
    const now = new Date().toISOString();
    const newPol = {
      id,
      code: data.code.toUpperCase().replace(/\s+/g, '_'),
      name: data.name,
      description: data.description || '',
      effect: data.effect || 'ALLOW',
      priority: data.priority || 100,
      isEnabled: true,
      createdAt: now,
      updatedAt: now,
    };
    await db.insert(permissionPolicies).values(newPol);
    return newPol;
  }

  async updatePolicy(id: string, updates: any) {
    const now = new Date().toISOString();
    await db.update(permissionPolicies).set({ ...updates, updatedAt: now }).where(eq(permissionPolicies.id, id));
    return this.getPolicyById(id);
  }

  // --- ATTRIBUTES & SCOPES ---
  async getPolicyAttributes(policyId: string) {
    await this.ensurePoliciesSeeded();
    return db.select().from(permissionAttributes).where(eq(permissionAttributes.policyId, policyId));
  }

  async createAttribute(data: CreateAttributeDto) {
    const id = `pa-${Date.now()}`;
    const now = new Date().toISOString();
    const attr = {
      id,
      policyId: data.policyId,
      attributeKey: data.attributeKey,
      operator: data.operator || 'EQUALS',
      attributeValue: data.attributeValue,
      createdAt: now,
    };
    await db.insert(permissionAttributes).values(attr);
    return attr;
  }

  async getPolicyScopes(policyId: string) {
    await this.ensurePoliciesSeeded();
    return db.select().from(permissionScopes).where(eq(permissionScopes.policyId, policyId));
  }

  async createScope(data: CreateScopeDto) {
    const id = `ps-${Date.now()}`;
    const now = new Date().toISOString();
    const scope = {
      id,
      policyId: data.policyId,
      scopeType: data.scopeType || 'GLOBAL',
      moduleCode: data.moduleCode,
      featureCode: data.featureCode || '*',
      actionsJson: data.actionsJson,
      createdAt: now,
    };
    await db.insert(permissionScopes).values(scope);
    return scope;
  }

  // --- FEATURE & FIELD PERMISSIONS ---
  async getFieldPermissions(moduleCode?: string) {
    await this.ensurePoliciesSeeded();
    if (moduleCode) {
      return db.select().from(fieldPermissions).where(eq(fieldPermissions.moduleCode, moduleCode));
    }
    return db.select().from(fieldPermissions);
  }

  async createFieldPermission(data: CreateFieldPermissionDto) {
    const id = `fp-${Date.now()}`;
    const now = new Date().toISOString();
    const fp = {
      id,
      policyId: data.policyId,
      moduleCode: data.moduleCode,
      entityName: data.entityName,
      fieldName: data.fieldName,
      visibility: data.visibility || 'VISIBLE',
      createdAt: now,
    };
    await db.insert(fieldPermissions).values(fp);
    return fp;
  }

  async getFeaturePermissions(moduleCode?: string) {
    await this.ensurePoliciesSeeded();
    if (moduleCode) {
      return db.select().from(featurePermissions).where(eq(featurePermissions.moduleCode, moduleCode));
    }
    return db.select().from(featurePermissions);
  }

  async createFeaturePermission(data: CreateFeaturePermissionDto) {
    const id = `featp-${Date.now()}`;
    const now = new Date().toISOString();
    const fp = {
      id,
      policyId: data.policyId,
      moduleCode: data.moduleCode,
      featureCode: data.featureCode,
      visibilityState: data.visibilityState || 'EDITABLE',
      createdAt: now,
    };
    await db.insert(featurePermissions).values(fp);
    return fp;
  }

  // --- SIMULATION & EFFECTIVE EVALUATION ---
  async evaluateEffectivePermissions(userContext: {
    userId: string;
    role: string;
    departmentId?: string;
    projectId?: string;
    moduleCode: string;
    featureCode?: string;
  }) {
    await this.ensurePoliciesSeeded();

    // System Admins always get full ALLOW
    if (userContext.role === 'ADMIN') {
      return {
        isAllowed: true,
        scope: 'GLOBAL',
        effect: 'ALLOW',
        featureVisibility: 'EDITABLE',
        actions: ['READ', 'CREATE', 'EDIT', 'DELETE', 'VERIFY', 'APPROVE', 'EXPORT', 'PRINT', 'UPLOAD', 'CONFIGURE'],
        fieldRestrictions: [],
      };
    }

    const allPolicies = await db.select().from(permissionPolicies).where(eq(permissionPolicies.isEnabled, true));
    const fields = await this.getFieldPermissions(userContext.moduleCode);

    // Evaluate matching fields
    const restrictedFields = fields.map((f) => ({
      entityName: f.entityName,
      fieldName: f.fieldName,
      visibility: f.visibility,
    }));

    return {
      isAllowed: true,
      scope: userContext.projectId ? 'ASSIGNED_PROJECT' : 'OWN_DEPARTMENT',
      effect: 'ALLOW',
      featureVisibility: userContext.role === 'ENGINEER' ? 'READ_ONLY' : 'EDITABLE',
      actions: userContext.role === 'MANAGER' 
        ? ['READ', 'CREATE', 'EDIT', 'VERIFY', 'APPROVE', 'EXPORT']
        : ['READ', 'CREATE', 'EDIT'],
      fieldRestrictions: restrictedFields,
      activePoliciesEvaluated: allPolicies.length,
    };
  }
}

export const abacRepository = new AbacRepository();
