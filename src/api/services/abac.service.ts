import { 
  abacRepository, 
  CreatePolicyDto, 
  CreateAttributeDto, 
  CreateScopeDto, 
  CreateFeaturePermissionDto, 
  CreateFieldPermissionDto 
} from '../repositories/abac.repository';

export class AbacService {
  async getPolicies() {
    return abacRepository.getPolicies();
  }

  async getPolicyById(id: string) {
    return abacRepository.getPolicyById(id);
  }

  async createPolicy(data: CreatePolicyDto) {
    return abacRepository.createPolicy(data);
  }

  async updatePolicy(id: string, updates: any) {
    return abacRepository.updatePolicy(id, updates);
  }

  async getPolicyAttributes(policyId: string) {
    return abacRepository.getPolicyAttributes(policyId);
  }

  async createAttribute(data: CreateAttributeDto) {
    return abacRepository.createAttribute(data);
  }

  async getPolicyScopes(policyId: string) {
    return abacRepository.getPolicyScopes(policyId);
  }

  async createScope(data: CreateScopeDto) {
    return abacRepository.createScope(data);
  }

  async getFieldPermissions(moduleCode?: string) {
    return abacRepository.getFieldPermissions(moduleCode);
  }

  async createFieldPermission(data: CreateFieldPermissionDto) {
    return abacRepository.createFieldPermission(data);
  }

  async getFeaturePermissions(moduleCode?: string) {
    return abacRepository.getFeaturePermissions(moduleCode);
  }

  async createFeaturePermission(data: CreateFeaturePermissionDto) {
    return abacRepository.createFeaturePermission(data);
  }

  async evaluateEffectivePermissions(userContext: any) {
    return abacRepository.evaluateEffectivePermissions(userContext);
  }

  async simulatePermissions(simulationParams: {
    userId: string;
    role: string;
    departmentId?: string;
    projectId?: string;
    moduleCode: string;
    featureCode?: string;
  }) {
    const evaluation = await abacRepository.evaluateEffectivePermissions(simulationParams);
    return {
      simulationInputs: simulationParams,
      evaluationResult: evaluation,
      timestamp: new Date().toISOString(),
    };
  }
}

export const abacService = new AbacService();
