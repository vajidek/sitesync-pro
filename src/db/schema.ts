import { pgTable, text, boolean, integer, doublePrecision, real, timestamp, jsonb, uniqueIndex } from 'drizzle-orm/pg-core';

// 1. Roles
export const roles = pgTable('roles', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 2. Permissions
export const permissions = pgTable('permissions', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  module: text('module').notNull(),
  description: text('description').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 3. Role Permissions
export const rolePermissions = pgTable('role_permissions', {
  id: text('id').primaryKey(),
  roleId: text('role_id').notNull(),
  permissionId: text('permission_id').notNull(),
  createdAt: text('created_at').notNull(),
});

// 4. Users
export const users = pgTable('users', {
  id: text('id').primaryKey(),
  uid: text('uid'), // Firebase Auth UID
  email: text('email').notNull(),
  passwordHash: text('password_hash').notNull(),
  name: text('name').notNull(),
  phone: text('phone').notNull(),
  department: text('department').notNull(),
  avatarUrl: text('avatar_url'),
  roleId: text('role_id').notNull(),
  employeeId: text('employee_id'),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  isActive: boolean('is_active').default(true).notNull(),
  isEmailVerified: boolean('is_email_verified').default(false).notNull(),
  lastLoginAt: text('last_login_at'),
  failedLoginAttempts: integer('failed_login_attempts').default(0).notNull(),
  lockedUntil: text('locked_until'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 4b. Login History
export const loginHistory = pgTable('login_history', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  username: text('username').notNull(),
  userEmail: text('user_email'),
  loginDate: text('login_date').notNull(),
  loginTime: text('login_time').notNull(),
  logoutTime: text('logout_time'),
  sessionDuration: integer('session_duration'), // seconds
  browser: text('browser'),
  device: text('device'),
  ipAddress: text('ip_address'),
  status: text('status').notNull(), // 'SUCCESS' | 'FAILED' | 'LOCKED'
  failureReason: text('failure_reason'),
  createdAt: text('created_at').notNull(),
});

// 5. Companies
export const companies = pgTable('companies', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  taxId: text('tax_id'),
  email: text('email'),
  phone: text('phone'),
  website: text('website'),
  address: text('address'),
  logoUrl: text('logo_url'),
  currency: text('currency').default('USD').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 6. Branches
export const branches = pgTable('branches', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  companyId: text('company_id').notNull(),
  address: text('address'),
  phone: text('phone'),
  email: text('email'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 7. Departments
export const departments = pgTable('departments', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  branchId: text('branch_id'),
  parentId: text('parent_id'),
  type: text('type').default('DEPARTMENT').notNull(), // 'DIVISION' | 'DEPARTMENT' | 'SUB_DEPARTMENT' | 'TEAM'
  headEmployeeId: text('head_employee_id'),
  headEmployeeName: text('head_employee_name'),
  color: text('color'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 8. Designations
export const designations = pgTable('designations', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  departmentId: text('department_id'),
  gradeLevel: text('grade_level'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 9. Employees
export const employees = pgTable('employees', {
  id: text('id').primaryKey(),
  employeeCode: text('employee_code').notNull(),
  name: text('name').notNull(),
  photoUrl: text('photo_url'),
  phone: text('phone').notNull(),
  email: text('email').notNull(),
  address: text('address'),
  emergencyContact: text('emergency_contact'),
  dateOfJoining: text('date_of_joining').notNull(),
  departmentId: text('department_id'),
  designationId: text('designation_id'),
  reportingManagerId: text('reporting_manager_id'),
  status: text('status').notNull(),
  baseSalary: doublePrecision('base_salary').notNull(),
  hourlyRate: doublePrecision('hourly_rate').notNull(),
  passportNumber: text('passport_number'),
  nationalId: text('national_id'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 10. Projects
export const projects = pgTable('projects', {
  id: text('id').primaryKey(),
  projectCode: text('project_code').notNull(),
  projectName: text('project_name').notNull(),
  shortName: text('short_name'),
  projectCategoryId: text('project_category_id'),
  projectCategory: text('project_category'),
  projectTypeId: text('project_type_id'),
  projectType: text('project_type'),
  clientId: text('client_id'),
  clientName: text('client_name'),
  consultantId: text('consultant_id'),
  consultantName: text('consultant_name'),
  fundingAgencyId: text('funding_agency_id'),
  fundingAgencyName: text('funding_agency_name'),
  contractNumber: text('contract_number'),
  workOrderNumber: text('work_order_number'),
  tenderNumber: text('tender_number'),
  agreementNumber: text('agreement_number'),
  companyId: text('company_id'),
  businessUnitId: text('business_unit_id'),
  regionId: text('region_id'),
  branchId: text('branch_id'),
  divisionId: text('division_id'),
  parentProjectId: text('parent_project_id'),
  customerId: text('customer_id'),
  customerName: text('customer_name'),
  location: text('location').notNull(),
  state: text('state'),
  district: text('district'),
  taluk: text('taluk'),
  village: text('village'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  startDate: text('start_date').notNull(),
  scheduledCompletionDate: text('scheduled_completion_date'),
  targetCompletionDate: text('target_completion_date').notNull(),
  actualCompletionDate: text('actual_completion_date'),
  contractValue: doublePrecision('contract_value').default(0),
  revisedContractValue: doublePrecision('revised_contract_value').default(0),
  budget: doublePrecision('budget').notNull(),
  actualSpent: doublePrecision('actual_spent'),
  progressPercentage: doublePrecision('progress_percentage'),
  currency: text('currency').default('AED'),
  status: text('status').notNull(),
  priority: text('priority').notNull(),
  projectManagerId: text('project_manager_id'),
  projectInchargeId: text('project_incharge_id'),
  projectSupervisorId: text('project_supervisor_id'),
  description: text('description'),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 11. Sites
export const sites = pgTable('sites', {
  id: text('id').primaryKey(),
  siteCode: text('site_code').notNull(),
  siteName: text('site_name').notNull(),
  projectId: text('project_id').notNull(),
  address: text('address').notNull(),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  googleMapUrl: text('google_map_url'),
  siteEngineerId: text('site_engineer_id'),
  supervisorId: text('supervisor_id'),
  inchargeId: text('incharge_id'),
  status: text('status').notNull(),
  progressPercentage: doublePrecision('progress_percentage'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 12. Project Members
export const projectMembers = pgTable('project_members', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  role: text('role').notNull(),
  departmentId: text('department_id'),
  departmentName: text('department_name'),
  designation: text('designation'),
  joiningDate: text('joining_date').notNull(),
  leavingDate: text('leaving_date'),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
});

// 13. Daily Progress
export const dailyProgress = pgTable('daily_progress', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  siteId: text('site_id').notNull(),
  date: text('date').notNull(),
  workCategory: text('work_category').notNull(),
  description: text('description').notNull(),
  completionPercentage: doublePrecision('completion_percentage').notNull(),
  remarks: text('remarks'),
  photos: jsonb('photos'),
  documents: jsonb('documents'),
  createdById: text('created_by_id').notNull(),
  createdByName: text('created_by_name'),
  verifiedById: text('verified_by_id'),
  verifiedByName: text('verified_by_name'),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
});

// 14. Tasks
export const tasks = pgTable('tasks', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  siteId: text('site_id'),
  workPackageId: text('work_package_id'),
  activityId: text('activity_id'),
  departmentId: text('department_id'),
  title: text('title').notNull(),
  description: text('description'),
  assignedToId: text('assigned_to_id'),
  assignedToName: text('assigned_to_name'),
  priority: text('priority').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull(),
  milestoneId: text('milestone_id'),
  attachments: jsonb('attachments'),
  checklist: jsonb('checklist'),
  progressPercentage: doublePrecision('progress_percentage').default(0),
  verifiedById: text('verified_by_id'),
  verifiedByName: text('verified_by_name'),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  createdById: text('created_by_id').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 15. Task Comments
export const taskComments = pgTable('task_comments', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  comment: text('comment').notNull(),
  attachmentUrl: text('attachment_url'),
  createdAt: text('created_at').notNull(),
});

// 16. Project Documents
export const projectDocuments = pgTable('project_documents', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  siteId: text('site_id'),
  documentCategory: text('document_category').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: doublePrecision('file_size').notNull(),
  version: text('version').notNull(),
  notes: text('notes'),
  uploadedById: text('uploaded_by_id'),
  uploadedByName: text('uploaded_by_name'),
  createdAt: text('created_at').notNull(),
});

// 17. Project Milestones
export const projectMilestones = pgTable('project_milestones', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  title: text('title').notNull(),
  targetDate: text('target_date').notNull(),
  actualDate: text('actual_date'),
  status: text('status').notNull(),
  delayDays: integer('delay_days').default(0).notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
});

// 18. Contractors
export const contractors = pgTable('contractors', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  tradeLicense: text('trade_license'),
  category: text('category'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 19. Vendors
export const vendors = pgTable('vendors', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  rating: doublePrecision('rating').default(0).notNull(),
  paymentTerms: text('payment_terms'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 20. Customers
export const customers = pgTable('customers', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  taxId: text('tax_id'),
  creditLimit: doublePrecision('credit_limit').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 21. Equipments
export const equipments = pgTable('equipments', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  serialNumber: text('serial_number'),
  modelNumber: text('model_number'),
  status: text('status').notNull(),
  hourlyCost: doublePrecision('hourly_cost').notNull(),
  currentProjectId: text('current_project_id'),
  siteId: text('site_id'),
  operatorId: text('operator_id'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 22. Vehicles
export const vehicles = pgTable('vehicles', {
  id: text('id').primaryKey(),
  vehicleNumber: text('vehicle_number').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  fuelType: text('fuel_type').notNull(),
  currentOdometer: doublePrecision('current_odometer').notNull(),
  insurancePolicy: text('insurance_policy'),
  insuranceExpiry: text('insurance_expiry'),
  rcNumber: text('rc_number'),
  fitnessExpiry: text('fitness_expiry'),
  assignedDriverId: text('assigned_driver_id'),
  status: text('status').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 23. Material Categories
export const materialCategories = pgTable('material_categories', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 24. Material Units
export const materialUnits = pgTable('material_units', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 25. Materials
export const materials = pgTable('materials', {
  id: text('id').primaryKey(),
  itemCode: text('item_code').notNull(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull(),
  subCategory: text('sub_category'),
  specification: text('specification'),
  brand: text('brand'),
  model: text('model'),
  manufacturer: text('manufacturer'),
  unitId: text('unit_id').notNull(),
  hsnCode: text('hsn_code'),
  gstPercentage: doublePrecision('gst_percentage'),
  barcode: text('barcode'),
  qrCode: text('qr_code'),
  imageUrl: text('image_url'),
  description: text('description'),
  minStock: doublePrecision('min_stock').notNull(),
  maxStock: doublePrecision('max_stock').notNull(),
  reorderLevel: doublePrecision('reorder_level').notNull(),
  openingStock: doublePrecision('opening_stock').notNull(),
  currentStock: doublePrecision('current_stock').notNull(),
  reservedStock: doublePrecision('reserved_stock').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  status: text('status').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 26. Warehouses
export const warehouses = pgTable('warehouses', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(),
  location: text('location').notNull(),
  siteId: text('site_id'),
  managerId: text('manager_id'),
  managerName: text('manager_name'),
  capacity: doublePrecision('capacity'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 27. Stocks
export const stocks = pgTable('stocks', {
  id: text('id').primaryKey(),
  warehouseId: text('warehouse_id').notNull(),
  materialId: text('material_id').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  reservedQuantity: doublePrecision('reserved_quantity').default(0).notNull(),
  batchNumber: text('batch_number'),
  rackLocation: text('rack_location'),
  updatedAt: text('updated_at').notNull(),
});

// 28. Stock Transactions
export const stockTransactions = pgTable('stock_transactions', {
  id: text('id').primaryKey(),
  transactionCode: text('transaction_code').notNull(),
  transactionType: text('transaction_type').notNull(),
  materialId: text('material_id').notNull(),
  materialName: text('material_name').notNull(),
  materialCode: text('material_code').notNull(),
  warehouseId: text('warehouse_id').notNull(),
  warehouseName: text('warehouse_name').notNull(),
  targetWarehouseId: text('target_warehouse_id'),
  targetWarehouseName: text('target_warehouse_name'),
  quantity: doublePrecision('quantity').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  totalValue: doublePrecision('total_value').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  siteId: text('site_id'),
  siteName: text('site_name'),
  workCategory: text('work_category'),
  issuedById: text('issued_by_id'),
  issuedByName: text('issued_by_name'),
  receivedById: text('received_by_id'),
  receivedByName: text('received_by_name'),
  supervisorId: text('supervisor_id'),
  supervisorName: text('supervisor_name'),
  referenceDoc: text('reference_doc'),
  notes: text('notes'),
  status: text('status').notNull(),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  transactionDate: text('transaction_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// 29. Purchase Requests
export const purchaseRequests = pgTable('purchase_requests', {
  id: text('id').primaryKey(),
  requisitionCode: text('requisition_code').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  siteId: text('site_id'),
  siteName: text('site_name'),
  materialId: text('material_id').notNull(),
  materialName: text('material_name').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unit: text('unit').notNull(),
  priority: text('priority').notNull(),
  requiredDate: text('required_date').notNull(),
  requestedById: text('requested_by_id').notNull(),
  requestedByName: text('requested_by_name').notNull(),
  verifiedById: text('verified_by_id'),
  verifiedByName: text('verified_by_name'),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  status: text('status').notNull(),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 30. Legacy Purchase Orders
export const legacyPurchaseOrders = pgTable('legacy_purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  requisitionId: text('requisition_id'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  poDate: text('po_date').notNull(),
  expectedDeliveryDate: text('expected_delivery_date').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  paymentTerms: text('payment_terms'),
  quotationRef: text('quotation_ref'),
  status: text('status').notNull(),
  paymentStatus: text('payment_status').notNull(),
  deliveryStatus: text('delivery_status').notNull(),
  notes: text('notes'),
  createdById: text('created_by_id').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 31. Stock Verifications
export const stockVerifications = pgTable('stock_verifications', {
  id: text('id').primaryKey(),
  verificationCode: text('verification_code').notNull(),
  warehouseId: text('warehouse_id').notNull(),
  warehouseName: text('warehouse_name').notNull(),
  materialId: text('material_id').notNull(),
  materialName: text('material_name').notNull(),
  systemStock: doublePrecision('system_stock').notNull(),
  physicalStock: doublePrecision('physical_stock').notNull(),
  discrepancy: doublePrecision('discrepancy').notNull(),
  reason: text('reason'),
  verifiedById: text('verified_by_id').notNull(),
  verifiedByName: text('verified_by_name').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
});

// 32. Documents
export const documents = pgTable('documents', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileType: text('file_type').notNull(),
  fileSize: doublePrecision('file_size').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  uploadedById: text('uploaded_by_id'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
});

// 33. Refresh Tokens
export const refreshTokens = pgTable('refresh_tokens', {
  id: text('id').primaryKey(),
  token: text('token').notNull(),
  userId: text('user_id').notNull(),
  device: text('device'),
  ipAddress: text('ip_address'),
  isRevoked: boolean('is_revoked').default(false).notNull(),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 34. Audit Logs
export const auditLogs = pgTable('audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  userName: text('user_name'),
  ackTime: text('ack_time'),
  comments: text('comments'),
  expectedAction: text('expected_action'),
  userEmail: text('user_email'),
  userRole: text('user_role'),
  action: text('action').notNull(),
  module: text('module').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  createdAt: text('created_at').notNull(),
});

// 35. Organization Units (Company -> Branch -> Division -> Department -> Sub-Department -> Team)
export const orgUnits = pgTable('org_units', {
  id: text('id').primaryKey(),
  unitCode: text('unit_code').notNull(),
  name: text('name').notNull(),
  unitType: text('unit_type').notNull(), // 'COMPANY' | 'BRANCH' | 'DIVISION' | 'DEPARTMENT' | 'SUB_DEPARTMENT' | 'TEAM'
  parentId: text('parent_id'),
  companyId: text('company_id'),
  branchId: text('branch_id'),
  headEmployeeId: text('head_employee_id'),
  headEmployeeName: text('head_employee_name'),
  color: text('color'),
  icon: text('icon'),
  displayOrder: integer('display_order').default(0).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 36. Project Departments Junction (Projects containing multiple Departments)
export const projectDepartments = pgTable('project_departments', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  departmentId: text('department_id').notNull(),
  departmentName: text('department_name'),
  role: text('role').default('LEAD').notNull(), // 'LEAD' | 'SUPPORT' | 'SUBCONTRACT'
  allocatedBudget: doublePrecision('allocated_budget').default(0).notNull(),
  discipline: text('discipline'),
  status: text('status').default('ACTIVE').notNull(),
  createdAt: text('created_at').notNull(),
});

// 37. Project Work Packages (Configurable Multi-Discipline Packages)
export const projectWorkPackages = pgTable('project_work_packages', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  packageCode: text('package_code').notNull(),
  title: text('title').notNull(),
  departmentId: text('department_id'),
  workPackageTypeId: text('work_package_type_id'),
  workPackageTypeName: text('work_package_type_name'),
  discipline: text('discipline'),
  assignedTeamId: text('assigned_team_id'),
  leadEmployeeId: text('lead_employee_id'),
  leadEmployeeName: text('lead_employee_name'),
  budget: doublePrecision('budget').default(0).notNull(),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  actualCompletionDate: text('actual_completion_date'),
  progressPercentage: doublePrecision('progress_percentage').default(0),
  displayOrder: integer('display_order').default(0),
  status: text('status').default('PLANNED').notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// 38. Dynamic Module Assignments
export const moduleAssignments = pgTable('module_assignments', {
  id: text('id').primaryKey(),
  moduleCode: text('module_code').notNull(),
  targetType: text('target_type').notNull(), // 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'PROJECT' | 'ROLE' | 'USER'
  targetId: text('target_id').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  configJson: jsonb('config_json'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 39. Configurable Work Package Types
export const workPackageTypes = pgTable('work_package_types', {
  id: text('id').primaryKey(),
  typeCode: text('type_code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
});

// 40. Project Activities (Contained inside Work Packages)
export const projectActivities = pgTable('project_activities', {
  id: text('id').primaryKey(),
  workPackageId: text('work_package_id').notNull(),
  projectId: text('project_id').notNull(),
  departmentId: text('department_id'),
  activityCode: text('activity_code').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  sequenceOrder: integer('sequence_order').default(0).notNull(),
  assignedToId: text('assigned_to_id'),
  assignedToName: text('assigned_to_name'),
  startDate: text('start_date'),
  targetDate: text('target_date'),
  actualCompletionDate: text('actual_completion_date'),
  progressPercentage: doublePrecision('progress_percentage').default(0).notNull(),
  status: text('status').default('PLANNED').notNull(), // 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'ON_HOLD'
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 41. Configurable Project Settings
export const projectSettings = pgTable('project_settings', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().unique(),
  enabledDepartments: jsonb('enabled_departments'),
  enabledModules: jsonb('enabled_modules'),
  enabledWorkPackageTypes: jsonb('enabled_work_package_types'),
  approvalWorkflow: jsonb('approval_workflow'),
  projectCalendar: jsonb('project_calendar'),
  projectStatuses: jsonb('project_statuses'),
  projectNumberFormat: text('project_number_format'),
  documentNumberFormat: text('document_number_format'),
  updatedAt: text('updated_at').notNull(),
});

// ==========================================
// PHASE 14: ENTERPRISE MODULE ENGINE & FEATURE REGISTRY
// ==========================================

// 42. Configurable Modules Engine
export const modules = pgTable('modules', {
  id: text('id').primaryKey(),
  moduleCode: text('module_code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').default('CORE'), // 'CORE' | 'ENGINEERING' | 'OPERATIONS' | 'ADMIN'
  icon: text('icon').default('Package'),
  color: text('color').default('#3b82f6'),
  displayOrder: integer('display_order').default(0).notNull(),
  parentId: text('parent_id'),
  description: text('description'),
  routePath: text('route_path'),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 43. Configurable Sub-Modules Engine
export const subModules = pgTable('sub_modules', {
  id: text('id').primaryKey(),
  moduleId: text('module_id').notNull(),
  subModuleCode: text('sub_module_code').notNull(),
  name: text('name').notNull(),
  icon: text('icon').default('Layers'),
  displayOrder: integer('display_order').default(0).notNull(),
  routePath: text('route_path'),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 44. Feature Registry Engine
export const features = pgTable('features', {
  id: text('id').primaryKey(),
  subModuleId: text('sub_module_id').notNull(),
  featureCode: text('feature_code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  requiredPermission: text('required_permission'),
  displayOrder: integer('display_order').default(0).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 45. Multi-Level Module Visibility Engine
export const moduleVisibilityRules = pgTable('module_visibility_rules', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // 'MODULE' | 'SUB_MODULE' | 'FEATURE'
  entityId: text('entity_id').notNull(),
  targetType: text('target_type').notNull(), // 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'PROJECT' | 'ROLE' | 'USER'
  targetId: text('target_id').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 46. Dashboard & Widget Registry
export const dashboardWidgetRegistry = pgTable('dashboard_widget_registry', {
  id: text('id').primaryKey(),
  moduleCode: text('module_code').notNull(),
  title: text('title').notNull(),
  widgetType: text('widget_type').notNull(), // 'CARD' | 'CHART' | 'KPI' | 'LIST'
  configJson: jsonb('config_json'),
  displayOrder: integer('display_order').default(0).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: text('created_at').notNull(),
});

// ==========================================
// PHASE 15: ENTERPRISE WORKFLOW ENGINE
// ==========================================

// 47. Workflows Master
export const workflows = pgTable('workflows', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  category: text('category').default('GENERAL'), // 'APPROVAL' | 'REVIEW' | 'INSPECTION' | 'FINANCE'
  moduleCode: text('module_code').notNull(),
  companyId: text('company_id'),
  branchId: text('branch_id'),
  departmentId: text('department_id'),
  projectId: text('project_id'),
  activeVersion: integer('active_version').default(1).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 48. Workflow Versions
export const workflowVersions = pgTable('workflow_versions', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  versionNumber: integer('version_number').notNull(),
  description: text('description'),
  isPublished: boolean('is_published').default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

// 49. Workflow States
export const workflowStates = pgTable('workflow_states', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  versionNumber: integer('version_number').default(1).notNull(),
  stateCode: text('state_code').notNull(),
  name: text('name').notNull(),
  type: text('type').default('INTERMEDIATE'), // 'INITIAL' | 'INTERMEDIATE' | 'APPROVED' | 'REJECTED' | 'FINAL'
  color: text('color').default('#3b82f6'),
  displayOrder: integer('display_order').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

// 50. Workflow Transitions
export const workflowTransitions = pgTable('workflow_transitions', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  versionNumber: integer('version_number').default(1).notNull(),
  fromStateCode: text('from_state_code').notNull(),
  toStateCode: text('to_state_code').notNull(),
  actionLabel: text('action_label').notNull(), // 'Submit', 'Approve', 'Reject', 'Request Rework'
  requiredRole: text('required_role'),
  requiresComments: boolean('requires_comments').default(false).notNull(),
  requiresSignature: boolean('requires_signature').default(false).notNull(),
  createdAt: text('created_at').notNull(),
});

// 51. Workflow Conditions
export const workflowConditions = pgTable('workflow_conditions', {
  id: text('id').primaryKey(),
  transitionId: text('transition_id').notNull(),
  field: text('field').notNull(), // 'amount', 'priority', 'department', 'cost'
  operator: text('operator').notNull(), // 'EQUALS' | 'GREATER_THAN' | 'LESS_THAN' | 'IN'
  value: text('value').notNull(),
  createdAt: text('created_at').notNull(),
});

// 52. Workflow Approvers & Approval Levels
export const workflowApprovers = pgTable('workflow_approvers', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  stateCode: text('state_code').notNull(),
  approvalOrder: integer('approval_order').default(1).notNull(),
  approverType: text('approver_type').notNull(), // 'ROLE' | 'USER' | 'DEPARTMENT' | 'TEAM'
  approverTarget: text('approver_target').notNull(), // Role name, User ID, or Dept ID
  isParallel: boolean('is_parallel').default(false).notNull(),
  minApprovalCount: integer('min_approval_count').default(1).notNull(),
  escalationHours: integer('escalation_hours').default(48),
  createdAt: text('created_at').notNull(),
});

// 53. Workflow Execution History & Audit Log
export const workflowHistory = pgTable('workflow_history', {
  id: text('id').primaryKey(),
  workflowCode: text('workflow_code').notNull(),
  entityType: text('entity_type').notNull(), // 'PURCHASE_ORDER' | 'PROGRESS_RECORD' | 'MATERIAL_REQUISITION' | 'LEAVE_REQUEST'
  entityId: text('entity_id').notNull(),
  fromState: text('from_state').notNull(),
  toState: text('to_state').notNull(),
  actionTaken: text('action_taken').notNull(),
  performedByUserId: text('performed_by_user_id').notNull(),
  performedByUserName: text('performed_by_user_name').notNull(),
  performedByUserRole: text('performed_by_user_role').notNull(),
  department: text('department'),
  comments: text('comments'),
  approvalRemarks: text('approval_remarks'),
  attachmentsJson: jsonb('attachments_json'),
  digitalSignature: text('digital_signature'),
  timestamp: text('timestamp').notNull(),
});

// 54. Workflow Notifications Setup
export const workflowNotifications = pgTable('workflow_notifications', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  transitionId: text('transition_id').notNull(),
  channel: text('channel').notNull(), // 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK'
  templateText: text('template_text').notNull(),
  createdAt: text('created_at').notNull(),
});

// ==========================================
// PHASE 17: ENTERPRISE ABAC PERMISSION ENGINE
// ==========================================

// 55. Permission Policies
export const permissionPolicies = pgTable('permission_policies', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  effect: text('effect').default('ALLOW').notNull(), // 'ALLOW' | 'DENY'
  priority: integer('priority').default(100).notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 56. Permission Attributes (ABAC criteria)
export const permissionAttributes = pgTable('permission_attributes', {
  id: text('id').primaryKey(),
  policyId: text('policy_id').notNull(),
  attributeKey: text('attribute_key').notNull(), // 'companyId' | 'branchId' | 'departmentId' | 'projectId' | 'workPackageId' | 'role' | 'userStatus' | 'ownership' | 'workflowState'
  operator: text('operator').default('EQUALS').notNull(), // 'EQUALS' | 'IN' | 'NOT_EQUALS' | 'CONTAINS'
  attributeValue: text('attribute_value').notNull(),
  createdAt: text('created_at').notNull(),
});

// 57. Permission Scopes
export const permissionScopes = pgTable('permission_scopes', {
  id: text('id').primaryKey(),
  policyId: text('policy_id').notNull(),
  scopeType: text('scope_type').default('GLOBAL').notNull(), // 'OWN_RECORDS' | 'OWN_DEPARTMENT' | 'ASSIGNED_PROJECT' | 'ASSIGNED_BRANCH' | 'GLOBAL' | 'CUSTOM'
  moduleCode: text('module_code').notNull(),
  featureCode: text('feature_code').default('*').notNull(),
  actionsJson: jsonb('actions_json').notNull(), // ['READ', 'CREATE', 'EDIT', 'DELETE', 'VERIFY', 'APPROVE', 'EXPORT', 'PRINT']
  createdAt: text('created_at').notNull(),
});

// 58. Feature Permissions (Visibility & Editability)
export const featurePermissions = pgTable('feature_permissions', {
  id: text('id').primaryKey(),
  policyId: text('policy_id').notNull(),
  moduleCode: text('module_code').notNull(),
  featureCode: text('feature_code').notNull(),
  visibilityState: text('visibility_state').default('EDITABLE').notNull(), // 'EDITABLE' | 'READ_ONLY' | 'APPROVAL_REQUIRED' | 'HIDDEN' | 'DISABLED'
  createdAt: text('created_at').notNull(),
});

// 59. Field Permissions
export const fieldPermissions = pgTable('field_permissions', {
  id: text('id').primaryKey(),
  policyId: text('policy_id').notNull(),
  moduleCode: text('module_code').notNull(),
  entityName: text('entity_name').notNull(), // e.g. 'EMPLOYEE', 'PURCHASE_ORDER', 'PROJECT_BOQ'
  fieldName: text('field_name').notNull(), // e.g. 'salary', 'bankDetails', 'boqRate', 'vendorGst'
  visibility: text('visibility').default('VISIBLE').notNull(), // 'VISIBLE' | 'READ_ONLY' | 'HIDDEN' | 'MASKED'
  createdAt: text('created_at').notNull(),
});

// 60. User Effective Assigned Policies
export const userEffectivePermissions = pgTable('user_effective_permissions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  policyId: text('policy_id').notNull(),
  isGranted: boolean('is_granted').default(true).notNull(),
  grantedBy: text('granted_by').default('SYSTEM').notNull(),
  createdAt: text('created_at').notNull(),
});

// ==========================================
// PHASE 19: ENTERPRISE REPORT ENGINE
// ==========================================

// 66. Reports Master Definitions
export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  dataSource: text('data_source').default('PROJECTS').notNull(), // 'PROJECTS' | 'ORGANIZATION' | 'EMPLOYEES' | 'PROCUREMENT' | 'INVENTORY' | 'FLEET' | 'WORKFLOW' | 'FORMS' | 'AUDIT' | 'KPI'
  reportType: text('report_type').default('TABULAR').notNull(), // 'TABULAR' | 'GROUPED' | 'SUMMARY' | 'PIVOT' | 'CHARTS' | 'GANTT' | 'FINANCIAL'
  columnsJson: jsonb('columns_json').notNull(),
  filtersJson: jsonb('filters_json'),
  chartConfigJson: jsonb('chart_config_json'),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  isScheduled: boolean('is_scheduled').default(false).notNull(),
  scheduleFrequency: text('schedule_frequency'), // 'DAILY' | 'WEEKLY' | 'MONTHLY'
  createdBy: text('created_by').default('SYSTEM').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 67. Report Schedules
export const reportSchedules = pgTable('report_schedules', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull(),
  cronExpression: text('cron_expression').default('0 8 * * *').notNull(),
  recipientEmailsJson: jsonb('recipient_emails_json').notNull(),
  exportFormat: text('export_format').default('PDF').notNull(), // 'PDF' | 'EXCEL' | 'CSV'
  lastRunAt: text('last_run_at'),
  nextRunAt: text('next_run_at'),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'PAUSED'
  createdAt: text('created_at').notNull(),
});

// 68. Report Execution & Export Logs
export const reportExecutionLogs = pgTable('report_execution_logs', {
  id: text('id').primaryKey(),
  reportId: text('report_id').notNull(),
  executedByUserId: text('executed_by_user_id').notNull(),
  executedByUserName: text('executed_by_user_name').notNull(),
  executionTimeMs: integer('execution_time_ms').default(120).notNull(),
  rowCount: integer('row_count').default(0).notNull(),
  exportedFormat: text('exported_format'),
  timestamp: text('timestamp').notNull(),
});

// ==========================================

// 61. Forms Master Definition
export const forms = pgTable('forms', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  moduleCode: text('module_code').default('PROJECTS').notNull(), // 'PROJECTS' | 'INVENTORY' | 'PROCUREMENT' | 'HR' | 'FLEET' | 'QAQC' | 'SAFETY' | 'DOCUMENTS'
  scopeType: text('scope_type').default('GLOBAL').notNull(), // 'GLOBAL' | 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'PROJECT' | 'WORK_PACKAGE' | 'ACTIVITY'
  scopeId: text('scope_id'),
  workflowCode: text('workflow_code'),
  status: text('status').default('DRAFT').notNull(), // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  activeVersion: integer('active_version').default(1).notNull(),
  category: text('category').default('INSPECTION').notNull(),
  isTemplate: boolean('is_template').default(false).notNull(),
  createdBy: text('created_by').default('SYSTEM').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 62. Form Versions
export const formVersions = pgTable('form_versions', {
  id: text('id').primaryKey(),
  formId: text('form_id').notNull(),
  versionNumber: integer('version_number').notNull(),
  status: text('status').default('DRAFT').notNull(), // 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'
  changeLog: text('change_log'),
  fieldsJson: jsonb('fields_json').notNull(),
  publishedAt: text('published_at'),
  createdAt: text('created_at').notNull(),
});

// 63. Form Fields (Normalized for fast search & indexing)
export const formFields = pgTable('form_fields', {
  id: text('id').primaryKey(),
  formVersionId: text('form_version_id').notNull(),
  formId: text('form_id').notNull(),
  fieldKey: text('field_key').notNull(),
  label: text('label').notNull(),
  fieldType: text('field_type').notNull(),
  isRequired: boolean('is_required').default(false).notNull(),
  isReadOnly: boolean('is_read_only').default(false).notNull(),
  isHidden: boolean('is_hidden').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  width: text('width').default('100%').notNull(),
  optionsJson: jsonb('options_json'),
  createdAt: text('created_at').notNull(),
});

// 64. Form Submissions
export const formSubmissions = pgTable('form_submissions', {
  id: text('id').primaryKey(),
  formId: text('form_id').notNull(),
  formVersionId: text('form_version_id').notNull(),
  submissionNumber: text('submission_number').notNull(),
  moduleCode: text('module_code').notNull(),
  projectId: text('project_id'),
  departmentId: text('department_id'),
  workflowCode: text('workflow_code'),
  workflowState: text('workflow_state').default('DRAFT').notNull(),
  dataJson: jsonb('data_json').notNull(),
  attachmentsJson: jsonb('attachments_json'),
  submittedByUserId: text('submitted_by_user_id').notNull(),
  submittedByUserName: text('submitted_by_user_name').notNull(),
  submittedByUserRole: text('submitted_by_user_role').notNull(),
  status: text('status').default('SUBMITTED').notNull(), // 'DRAFT' | 'SUBMITTED' | 'VERIFIED' | 'APPROVED' | 'REJECTED' | 'REWORK'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 65. Form Submission History
export const formSubmissionHistory = pgTable('form_submission_history', {
  id: text('id').primaryKey(),
  submissionId: text('submission_id').notNull(),
  previousState: text('previous_state'),
  newState: text('new_state').notNull(),
  actionTaken: text('action_taken').notNull(),
  performedByUserId: text('performed_by_user_id').notNull(),
  performedByUserName: text('performed_by_user_name').notNull(),
  comments: text('comments'),
  timestamp: text('timestamp').notNull(),
});

// ==========================================
// PHASE 20: ENTERPRISE DASHBOARD ENGINE
// ==========================================

// 69. Dashboards Master Definition
export const dashboards = pgTable('dashboards', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  dashboardType: text('dashboard_type').default('EXECUTIVE').notNull(), // 'COMPANY' | 'BRANCH' | 'DIVISION' | 'DEPARTMENT' | 'PROJECT' | 'WORK_PACKAGE' | 'EXECUTIVE' | 'PERSONAL' | 'CUSTOM'
  scopeType: text('scope_type').default('GLOBAL').notNull(), // 'GLOBAL' | 'COMPANY' | 'BRANCH' | 'DEPARTMENT' | 'PROJECT'
  scopeId: text('scope_id'),
  isDefault: boolean('is_default').default(false).notNull(),
  isSystem: boolean('is_system').default(false).notNull(),
  isFavorite: boolean('is_favorite').default(false).notNull(),
  layoutConfigJson: jsonb('layout_config_json'),
  createdBy: text('created_by').default('SYSTEM').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 70. Dashboard Widgets
export const dashboardWidgets = pgTable('dashboard_widgets', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id').notNull(),
  title: text('title').notNull(),
  widgetType: text('widget_type').notNull(), // 'KPI_CARD' | 'CHART' | 'PROGRESS' | 'TABLE' | 'PIVOT' | 'CALENDAR' | 'TASK_LIST' | 'WORKFLOW_QUEUE' | 'NOTIFICATIONS' | 'RECENT_ACTIVITIES' | 'MAP' | 'PROJECT_TIMELINE' | 'BUDGET_VS_ACTUAL' | 'ATTENDANCE' | 'INVENTORY_STATUS' | 'PROCUREMENT_STATUS' | 'FLEET_STATUS' | 'CUSTOM_HTML'
  reportId: text('report_id'), // Report Engine integration
  dataSource: text('data_source').default('PROJECTS').notNull(),
  chartType: text('chart_type'), // 'LINE' | 'BAR' | 'PIE' | 'DONUT' | 'GAUGE'
  configJson: jsonb('config_json').notNull(),
  positionJson: jsonb('position_json').notNull(), // { x, y, w, h }
  refreshIntervalSec: integer('refresh_interval_sec').default(0).notNull(), // 0 = manual, >0 = auto refresh in seconds
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 71. Dashboard Layout Templates
export const dashboardLayouts = pgTable('dashboard_layouts', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id').notNull(),
  layoutName: text('layout_name').notNull(),
  isDefault: boolean('is_default').default(false).notNull(),
  layoutJson: jsonb('layout_json').notNull(),
  createdAt: text('created_at').notNull(),
});

// 72. Dashboard User Favorites
export const dashboardFavorites = pgTable('dashboard_favorites', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id').notNull(),
  userId: text('user_id').notNull(),
  createdAt: text('created_at').notNull(),
});

// ==========================================
// PHASE 21: ENTERPRISE NOTIFICATION & AUTOMATION ENGINE
// ==========================================

// 73. Notification Templates
export const notificationTemplates = pgTable('notification_templates', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  channel: text('channel').default('IN_APP').notNull(), // 'IN_APP' | 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK' | 'DASHBOARD_ALERT'
  eventSource: text('event_source').default('PROJECTS').notNull(), // 'PROJECTS' | 'WORKFLOW' | 'FORMS' | 'INVENTORY' | 'PROCUREMENT' | 'HR' | 'FLEET' | 'DOCUMENTS' | 'REPORTS' | 'DASHBOARDS' | 'AUTHENTICATION' | 'ORGANIZATION' | 'CUSTOM'
  subjectTemplate: text('subject_template'),
  bodyTemplate: text('body_template').notNull(),
  variablesJson: jsonb('variables_json'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 74. In-App & System Notifications
export const notifications = pgTable('notifications', {
  id: text('id').primaryKey(),
  recipientUserId: text('recipient_user_id').notNull(),
  templateId: text('template_id'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  channel: text('channel').default('IN_APP').notNull(),
  eventSource: text('event_source').default('PROJECTS').notNull(),
  priority: text('priority').default('NORMAL').notNull(), // 'LOW' | 'NORMAL' | 'HIGH' | 'CRITICAL'
  isRead: boolean('is_read').default(false).notNull(),
  readAt: text('read_at'),
  actionUrl: text('action_url'),
  metadataJson: jsonb('metadata_json'),
  createdAt: text('created_at').notNull(),
});

// 75. Automation Rules
export const automationRules = pgTable('automation_rules', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  eventSource: text('event_source').notNull(), // 'PROJECTS' | 'WORKFLOW' | 'FORMS' | 'INVENTORY' | 'PROCUREMENT' | 'HR' | 'FLEET' | 'DOCUMENTS' | 'REPORTS' | 'DASHBOARDS' | 'AUTHENTICATION' | 'ORGANIZATION' | 'CUSTOM'
  triggerType: text('trigger_type').notNull(), // 'RECORD_CREATED' | 'RECORD_UPDATED' | 'RECORD_DELETED' | 'WORKFLOW_TRANSITION' | 'APPROVAL' | 'REJECTION' | 'ASSIGNMENT' | 'DUE_DATE' | 'OVERDUE' | 'THRESHOLD_EXCEEDED' | 'SCHEDULE' | 'CRON' | 'MANUAL' | 'WEBHOOK'
  conditionsJson: jsonb('conditions_json').notNull(), // IF / ELSE / AND / OR / Nested conditions
  priority: text('priority').default('NORMAL').notNull(),
  executionOrder: integer('execution_order').default(1).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  escalationEnabled: boolean('escalation_enabled').default(false).notNull(),
  escalationPolicyJson: jsonb('escalation_policy_json'), // Delay, recipient role ('MANAGER', 'DEPARTMENT_HEAD', etc.)
  createdBy: text('created_by').default('SYSTEM').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 76. Automation Actions
export const automationActions = pgTable('automation_actions', {
  id: text('id').primaryKey(),
  ruleId: text('rule_id').notNull(),
  actionType: text('action_type').notNull(), // 'IN_APP_NOTIFICATION' | 'EMAIL' | 'SMS' | 'PUSH' | 'WEBHOOK' | 'DASHBOARD_ALERT' | 'TASK_CREATION' | 'WORKFLOW_TRIGGER' | 'STATUS_UPDATE' | 'CUSTOM'
  templateId: text('template_id'),
  configJson: jsonb('config_json').notNull(),
  sequenceOrder: integer('sequence_order').default(1).notNull(),
  retryLimit: integer('retry_limit').default(3).notNull(),
  delaySeconds: integer('delay_seconds').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

// 77. Automation Execution Logs
export const automationLogs = pgTable('automation_logs', {
  id: text('id').primaryKey(),
  ruleId: text('rule_id').notNull(),
  actionId: text('action_id'),
  eventSource: text('event_source').notNull(),
  triggerType: text('trigger_type').notNull(),
  status: text('status').notNull(), // 'SUCCESS' | 'FAILED' | 'PENDING' | 'RETRYING' | 'ESCALATED'
  payloadJson: jsonb('payload_json'),
  resultJson: jsonb('result_json'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
  executedAt: text('executed_at').notNull(),
});

// 78. Scheduled Automation Jobs
export const scheduledJobs = pgTable('scheduled_jobs', {
  id: text('id').primaryKey(),
  ruleId: text('rule_id').notNull(),
  jobName: text('job_name').notNull(),
  scheduleType: text('schedule_type').default('CRON').notNull(), // 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON' | 'BUSINESS_DAYS'
  cronExpression: text('cron_expression'),
  nextRunAt: text('next_run_at').notNull(),
  lastRunAt: text('last_run_at'),
  status: text('status').default('ACTIVE').notNull(), // 'ACTIVE' | 'PAUSED' | 'FAILED' | 'COMPLETED'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==========================================
// PHASE 22: ENTERPRISE INTEGRATION HUB
// ==========================================

// 79. Integration Connectors Registry
export const integrationConnectors = pgTable('integration_connectors', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // 'SMTP_EMAIL' | 'MICROSOFT_365' | 'GMAIL' | 'FIREBASE_PUSH' | 'SMS_PROVIDER' | 'WHATSAPP' | 'WEBHOOKS' | 'REST_APIS' | 'GOOGLE_MAPS' | 'GPS_TRACKING' | 'ESSL_BIOMETRIC' | 'IOT_DEVICES' | 'SCADA' | 'CLOUD_STORAGE' | 'EXCEL_IMPORT' | 'EXCEL_EXPORT' | 'CSV_PARSER' | 'PDF_ENGINE' | 'GOVT_APIS'
  name: text('name').notNull(),
  category: text('category').notNull(), // 'AUTH' | 'COMMUNICATION' | 'GEOSPATIAL' | 'HARDWARE_IOT' | 'STORAGE_FILES' | 'COMPLIANCE_GOVT' | 'DATA_SYNC'
  version: text('version').default('1.0.0').notNull(),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  status: text('status').default('HEALTHY').notNull(), // 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'UNCONFIGURED'
  authType: text('auth_type').default('API_KEY').notNull(), // 'OAUTH2' | 'API_KEY' | 'BASIC_AUTH' | 'CERTIFICATE' | 'CONNECTION_STRING'
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 80. Integration Connector Configs
export const integrationConfigs = pgTable('integration_configs', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  configKey: text('config_key').notNull(),
  configValue: text('config_value'),
  isSecret: boolean('is_secret').default(false).notNull(),
  updatedBy: text('updated_by'),
  updatedAt: text('updated_at').notNull(),
});

// 81. Integration Health Monitoring
export const integrationHealth = pgTable('integration_health', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  status: text('status').notNull(), // 'HEALTHY' | 'DEGRADED' | 'OFFLINE'
  latencyMs: integer('latency_ms').default(0).notNull(),
  lastPingAt: text('last_ping_at').notNull(),
  detailsJson: jsonb('details_json'),
});

// 82. Integration Sync & Import/Export Jobs
export const integrationJobs = pgTable('integration_jobs', {
  id: text('id').primaryKey(),
  jobCode: text('job_code').notNull(),
  connectorId: text('connector_id').notNull(),
  jobType: text('job_type').notNull(), // 'SCHEDULED_IMPORT' | 'SCHEDULED_EXPORT' | 'MANUAL_SYNC' | 'INCREMENTAL_SYNC' | 'EVENT_WEBHOOK'
  scheduleCron: text('schedule_cron'),
  status: text('status').default('PENDING').notNull(), // 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'RETRYING'
  conflictResolution: text('conflict_resolution').default('OVERWRITE_TARGET').notNull(), // 'OVERWRITE_TARGET' | 'KEEP_EXISTING' | 'MANUAL_REVIEW'
  recordsProcessed: integer('records_processed').default(0).notNull(),
  recordsFailed: integer('records_failed').default(0).notNull(),
  lastRunAt: text('last_run_at'),
  nextRunAt: text('next_run_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 83. Integration Audit & Retry Queue Logs
export const integrationLogs = pgTable('integration_logs', {
  id: text('id').primaryKey(),
  connectorId: text('connector_id').notNull(),
  jobId: text('job_id'),
  direction: text('direction').default('OUTBOUND').notNull(), // 'INBOUND' | 'OUTBOUND'
  endpoint: text('endpoint'),
  httpStatus: integer('http_status'),
  latencyMs: integer('latency_ms').default(0).notNull(),
  status: text('status').notNull(), // 'SUCCESS' | 'FAILED' | 'RETRY_QUEUED'
  requestPayloadJson: jsonb('request_payload_json'),
  responsePayloadJson: jsonb('response_payload_json'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').default(0).notNull(),
  executedAt: text('executed_at').notNull(),
});

// ==========================================
// PHASE 50: ENTERPRISE ORGANIZATION STRUCTURE & MASTER DATA FOUNDATION
// ==========================================

// 84. Business Units Master
export const businessUnits = pgTable('business_units', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  companyId: text('company_id').notNull(),
  headEmployeeId: text('head_employee_id'),
  headEmployeeName: text('head_employee_name'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 85. Regions Master
export const regions = pgTable('regions', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  businessUnitId: text('business_unit_id').notNull(),
  state: text('state'),
  country: text('country').default('UAE').notNull(),
  headEmployeeId: text('head_employee_id'),
  headEmployeeName: text('head_employee_name'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 86. Divisions Master
export const divisions = pgTable('divisions', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  branchId: text('branch_id'),
  regionId: text('region_id'),
  headEmployeeId: text('head_employee_id'),
  headEmployeeName: text('head_employee_name'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 87. Employee Grades Master
export const employeeGrades = pgTable('employee_grades', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  rank: integer('rank').notNull(),
  salaryRangeMin: doublePrecision('salary_range_min').default(0).notNull(),
  salaryRangeMax: doublePrecision('salary_range_max').default(0).notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 88. Employment Types Master
export const employmentTypes = pgTable('employment_types', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 89. Skills Master
export const skills = pgTable('skills', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').default('TECHNICAL').notNull(), // 'TECHNICAL' | 'MANAGERIAL' | 'SAFETY' | 'EQUIPMENT' | 'QUALITY'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 90. Trades Master
export const trades = pgTable('trades', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  discipline: text('discipline').default('CIVIL').notNull(), // 'CIVIL' | 'MECHANICAL' | 'ELECTRICAL' | 'PLUMBING' | 'INSTRUMENTATION' | 'SCADA'
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 91. Disciplines Master
export const disciplines = pgTable('disciplines', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 92. Project Categories Master
export const projectCategories = pgTable('project_categories', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 93. Project Types Master
export const projectTypes = pgTable('project_types', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  categoryId: text('category_id'),
  categoryName: text('category_name'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 94. Contract Types Master
export const contractTypes = pgTable('contract_types', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 95. Cost Centers Master
export const costCenters = pgTable('cost_centers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  divisionId: text('division_id'),
  departmentId: text('department_id'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 96. Profit Centers Master
export const profitCenters = pgTable('profit_centers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  businessUnitId: text('business_unit_id'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 97. Reporting Levels Master
export const reportingLevels = pgTable('reporting_levels', {
  id: text('id').primaryKey(),
  levelRank: integer('level_rank').notNull().unique(),
  title: text('title').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==========================================
// PHASE 51: ENTERPRISE PROJECT MANAGEMENT CORE ENGINE
// ==========================================

// 98. Funding Agencies Master
export const fundingAgencies = pgTable('funding_agencies', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 99. Consultants Master
export const consultants = pgTable('consultants', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 100. Clients Master
export const clients = pgTable('clients', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  contactPerson: text('contact_person'),
  email: text('email'),
  phone: text('phone'),
  address: text('address'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 101. Currencies Master
export const currencies = pgTable('currencies', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  symbol: text('symbol').notNull(),
  exchangeRate: doublePrecision('exchange_rate').default(1.0).notNull(),
  decimalPrecision: integer('decimal_precision').default(2).notNull(),
  isBaseCurrency: boolean('is_base_currency').default(false).notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 101B. Exchange Rates Master & History
export const exchangeRates = pgTable('exchange_rates', {
  id: text('id').primaryKey(),
  fromCurrency: text('from_currency').notNull(),
  toCurrency: text('to_currency').notNull(),
  rate: doublePrecision('rate').notNull(),
  effectiveDate: text('effective_date').notNull(),
  rateType: text('rate_type').default('CORPORATE').notNull(), // 'SPOT' | 'CENTRAL_BANK' | 'CONTRACTUAL' | 'BUDGETARY' | 'CORPORATE'
  source: text('source'),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 102. Project Priorities Master
export const projectPriorities = pgTable('project_priorities', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 103. Project Statuses Master
export const projectStatuses = pgTable('project_statuses', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 104. Project Structures Hierarchy (Package -> Zone -> Area -> Section -> Location -> Activity)
export const projectStructures = pgTable('project_structures', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  parentId: text('parent_id'),
  code: text('code').notNull(),
  name: text('name').notNull(),
  type: text('type').notNull(), // 'PACKAGE' | 'ZONE' | 'AREA' | 'SECTION' | 'LOCATION' | 'ACTIVITY'
  description: text('description'),
  displayOrder: integer('display_order').default(0).notNull(),
  status: text('status').default('ACTIVE').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

// ==========================================
// PHASE 52: WBS, BOQ & ACTIVITY ENGINE TABLES
// ==========================================

// 105. Project WBS (Unlimited nesting structure)
export const projectWbs = pgTable('project_wbs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  parentId: text('parent_id'),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  level: integer('level').default(1).notNull(),
  nodeType: text('node_type').default('WBS').notNull(), // e.g. PACKAGE, ZONE, AREA, STRUCTURE, SECTION, FLOOR
  displayOrder: integer('display_order').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 106. BOQ Items (Bill of Quantities tied to WBS)
export const boqItems = pgTable('boq_items', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  wbsId: text('wbs_id').notNull(),
  departmentId: text('department_id'),
  departmentName: text('department_name'),
  itemCode: text('item_code').notNull(),
  description: text('description').notNull(),
  unit: text('unit').notNull(),
  quantity: doublePrecision('quantity').default(0).notNull(),
  rate: doublePrecision('rate').default(0).notNull(),
  amount: doublePrecision('amount').default(0).notNull(),
  executedQty: doublePrecision('executed_qty').default(0).notNull(),
  balanceQty: doublePrecision('balance_qty').default(0).notNull(),
  budgetQty: doublePrecision('budget_qty').default(0).notNull(),
  revisedQty: doublePrecision('revised_qty').default(0).notNull(),
  remarks: text('remarks'),
  status: text('status').default('PLANNED').notNull(), // PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD
  priority: text('priority').default('MEDIUM').notNull(),
  isVariation: boolean('is_variation').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 107. WBS Activities (Multiple per BOQ Item or directly under WBS)
export const wbsActivities = pgTable('wbs_activities', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  wbsId: text('wbs_id').notNull(),
  boqItemId: text('boq_item_id'),
  code: text('code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  department: text('department').default('Civil').notNull(), // Civil, Mechanical, Electrical, Instrumentation, Automation, Pipeline, Road, Bridge, Architecture, HVAC, Fire Fighting, Plumbing, Utility
  discipline: text('discipline'),
  responsibleEngineerId: text('responsible_engineer_id'),
  responsibleEngineerName: text('responsible_engineer_name'),
  supervisorId: text('supervisor_id'),
  supervisorName: text('supervisor_name'),
  foremanName: text('foreman_name'),
  contractorName: text('contractor_name'),
  subcontractorName: text('subcontractor_name'),
  vendorName: text('vendor_name'),
  crewName: text('crew_name'),
  status: text('status').default('PLANNED').notNull(), // PLANNED, APPROVED, RELEASED, IN_PROGRESS, HOLD, INSPECTION, COMPLETED, CANCELLED
  plannedQty: doublePrecision('planned_qty').default(0).notNull(),
  todayQty: doublePrecision('today_qty').default(0).notNull(),
  cumulativeQty: doublePrecision('cumulative_qty').default(0).notNull(),
  remainingQty: doublePrecision('remaining_qty').default(0).notNull(),
  progressPercentage: doublePrecision('progress_percentage').default(0).notNull(),
  weightage: doublePrecision('weightage').default(1.0).notNull(),
  spi: doublePrecision('spi').default(1.0).notNull(),
  cpi: doublePrecision('cpi').default(1.0).notNull(),
  startDate: text('start_date'),
  endDate: text('end_date'),
  actualStartDate: text('actual_start_date'),
  actualEndDate: text('actual_end_date'),
  isCritical: boolean('is_critical').default(false).notNull(),
  isMilestone: boolean('is_milestone').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 108. Activity Dependencies (Finish-to-Start, Start-to-Start, Finish-to-Finish, Start-to-Finish)
export const activityDependencies = pgTable('activity_dependencies', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull(),
  predecessorActivityId: text('predecessor_activity_id').notNull(),
  dependencyType: text('dependency_type').default('FS').notNull(), // FS, SS, FF, SF
  lagDays: integer('lag_days').default(0).notNull(),
  leadDays: integer('lead_days').default(0).notNull(),
  createdAt: text('created_at').notNull(),
});

// 109. Activity Documents & Attachments
export const activityDocuments = pgTable('activity_documents', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull(),
  title: text('title').notNull(),
  documentType: text('document_type').default('DRAWING').notNull(), // DRAWING, METHOD_STATEMENT, ITP, CHECKLIST, INSPECTION_REPORT, PHOTO, VIDEO, PDF, CAD, BIM, OTHER
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'),
  uploadedBy: text('uploaded_by'),
  createdAt: text('created_at').notNull(),
});

// 110. Daily Progress Reports (Header)
export const dailyProgressReports = pgTable('daily_progress_reports', {
  id: text('id').primaryKey(),
  dprNumber: text('dpr_number').notNull(),
  projectId: text('project_id').notNull(),
  packageId: text('package_id'),
  zoneId: text('zone_id'),
  areaId: text('area_id'),
  sectionId: text('section_id'),
  location: text('location'),
  date: text('date').notNull(),
  shift: text('shift').default('DAY').notNull(), // DAY, NIGHT, SHIFT_1, SHIFT_2
  departmentId: text('department_id'),
  departmentName: text('department_name'),
  preparedById: text('prepared_by_id'),
  preparedByName: text('prepared_by_name'),
  checkedById: text('checked_by_id'),
  checkedByName: text('checked_by_name'),
  approvedById: text('approved_by_id'),
  approvedByName: text('approved_by_name'),
  status: text('status').default('DRAFT').notNull(), // DRAFT, SUBMITTED, RETURNED, REVIEWED, APPROVED, REJECTED, CLOSED
  remarks: text('remarks'),
  siteConditions: jsonb('site_conditions'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  approvedBy: text('approved_by'),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 111. Daily Progress Entries
export const dailyProgressEntries = pgTable('daily_progress_entries', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  projectId: text('project_id').notNull(),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  activityId: text('activity_id'),
  department: text('department'),
  responsibleEngineerId: text('responsible_engineer_id'),
  responsibleEngineerName: text('responsible_engineer_name'),
  supervisorName: text('supervisor_name'),
  contractorName: text('contractor_name'),
  subcontractorName: text('subcontractor_name'),
  plannedQty: doublePrecision('planned_qty').default(0).notNull(),
  todayQty: doublePrecision('today_qty').default(0).notNull(),
  cumulativeQty: doublePrecision('cumulative_qty').default(0).notNull(),
  remainingQty: doublePrecision('remaining_qty').default(0).notNull(),
  progressPercentage: doublePrecision('progress_percentage').default(0).notNull(),
  unit: text('unit').default('m').notNull(),
  workingHours: doublePrecision('working_hours').default(8).notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  remarks: text('remarks'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  deletedAt: text('deleted_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 112. Daily Progress Photos
export const dailyProgressPhotos = pgTable('daily_progress_photos', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  entryId: text('entry_id'),
  category: text('category').default('DURING').notNull(), // BEFORE, DURING, AFTER
  fileUrl: text('file_url').notNull(),
  gpsLat: doublePrecision('gps_lat'),
  gpsLng: doublePrecision('gps_lng'),
  caption: text('caption'),
  photoCategory: text('photo_category'),
  createdAt: text('created_at').notNull(),
});

// 113. Daily Progress Documents
export const dailyProgressDocuments = pgTable('daily_progress_documents', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  title: text('title').notNull(),
  documentType: text('document_type').default('REPORT').notNull(), // DRAWING, METHOD_STATEMENT, ITP, CHECKLIST, INSPECTION_REPORT, PDF, DOCX, CAD, BIM, EXCEL, OTHER
  fileUrl: text('file_url').notNull(),
  fileSize: text('file_size'),
  uploadedBy: text('uploaded_by'),
  createdAt: text('created_at').notNull(),
});

// 114. Daily Progress Weather
export const dailyProgressWeather = pgTable('daily_progress_weather', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  condition: text('condition').default('SUNNY').notNull(), // SUNNY, CLOUDY, RAIN, HEAVY_RAIN, STORM, FOG, WINDY
  temperature: doublePrecision('temperature'),
  humidity: doublePrecision('humidity'),
  rainfall: doublePrecision('rainfall'),
  windSpeed: doublePrecision('wind_speed'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 115. Daily Progress Delays
export const dailyProgressDelays = pgTable('daily_progress_delays', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  category: text('category').notNull(), // WEATHER, MATERIAL, EQUIPMENT, MANPOWER, CLIENT, DRAWING, PERMIT, SITE, OTHER
  reason: text('reason').notNull(),
  responsibleParty: text('responsible_party'),
  impact: text('impact'), // LOW, MEDIUM, HIGH, CRITICAL
  affectedActivityId: text('affected_activity_id'),
  affectedBoqId: text('affected_boq_id'),
  affectedWbsId: text('affected_wbs_id'),
  estimatedDelayHours: doublePrecision('estimated_delay_hours').default(0).notNull(),
  correctiveAction: text('corrective_action'),
  status: text('status').default('OPEN').notNull(), // OPEN, IN_PROGRESS, RESOLVED, CLOSED
  createdAt: text('created_at').notNull(),
});

// 116. Daily Progress Approvals
export const dailyProgressApprovals = pgTable('daily_progress_approvals', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  approverId: text('approver_id'),
  approverName: text('approver_name').notNull(),
  action: text('action').notNull(), // SUBMIT, RETURN, REVIEW, APPROVE, REJECT
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 117. Daily Progress Comments
export const dailyProgressComments = pgTable('daily_progress_comments', {
  id: text('id').primaryKey(),
  dprId: text('dpr_id').notNull(),
  authorId: text('author_id'),
  authorName: text('author_name').notNull(),
  role: text('role').default('ENGINEER').notNull(), // ENGINEER, SUPERVISOR, MANAGER, CLIENT, CONSULTANT
  comment: text('comment').notNull(),
  createdAt: text('created_at').notNull(),
});

// ==========================================
// PHASE 54: ENTERPRISE RESOURCE PLANNING ENGINE
// ==========================================

// 118. Resource Types
export const resourceTypes = pgTable('resource_types', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(), // EMPLOYEE, CREW, CONTRACTOR, EQUIPMENT, MACHINERY, VEHICLE, MATERIAL, TOOL, TEMPORARY_RESOURCE
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 119. Resource Groups
export const resourceGroups = pgTable('resource_groups', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  typeId: text('type_id'),
  departmentId: text('department_id'),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 120. Resource Skills
export const resourceSkills = pgTable('resource_skills', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').default('GENERAL').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 121. Resource Skill Mapping
export const resourceSkillMapping = pgTable('resource_skill_mapping', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  skillId: text('skill_id').notNull(),
  proficiencyLevel: text('proficiency_level').default('INTERMEDIATE').notNull(), // NOVICE, INTERMEDIATE, ADVANCED, EXPERT
  certifiedDate: text('certified_date'),
  expiryDate: text('expiry_date'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 122. Resource Plans
export const resourcePlans = pgTable('resource_plans', {
  id: text('id').primaryKey(),
  planNumber: text('plan_number').notNull(),
  title: text('title').notNull(),
  projectId: text('project_id'),
  departmentId: text('department_id'),
  planType: text('plan_type').default('PROJECT').notNull(), // PROJECT, DEPARTMENT, RECURRING
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').default('DRAFT').notNull(), // DRAFT, APPROVED, ACTIVE, COMPLETED, CANCELLED
  isRecurring: boolean('is_recurring').default(false).notNull(),
  recurrenceInterval: text('recurrence_interval'), // DAILY, WEEKLY, MONTHLY
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 123. Resource Allocations
export const resourceAllocations = pgTable('resource_allocations', {
  id: text('id').primaryKey(),
  allocationNumber: text('allocation_number').notNull(),
  planId: text('plan_id'),
  resourceId: text('resource_id').notNull(),
  resourceType: text('resource_type').notNull(), // EMPLOYEE, CREW, CONTRACTOR, EQUIPMENT, MACHINERY, VEHICLE, MATERIAL, TOOL, TEMPORARY_RESOURCE
  projectId: text('project_id'),
  departmentId: text('department_id'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  allocatedQty: doublePrecision('allocated_qty').default(1).notNull(),
  workingHoursPerDay: doublePrecision('working_hours_per_day').default(8).notNull(),
  status: text('status').default('ALLOCATED').notNull(), // ALLOCATED, RESERVED, RELEASED, TRANSFERRED
  priority: text('priority').default('MEDIUM').notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 124. Resource Assignment History
export const resourceAssignmentHistory = pgTable('resource_assignment_history', {
  id: text('id').primaryKey(),
  allocationId: text('allocation_id').notNull(),
  resourceId: text('resource_id').notNull(),
  previousProjectId: text('previous_project_id'),
  newProjectId: text('new_project_id'),
  assignedDate: text('assigned_date').notNull(),
  unassignedDate: text('unassigned_date'),
  assignedBy: text('assigned_by'),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 125. Resource Shift Templates
export const resourceShiftTemplates = pgTable('resource_shift_templates', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  startTime: text('start_time').default('08:00').notNull(),
  endTime: text('end_time').default('17:00').notNull(),
  breakDurationMinutes: doublePrecision('break_duration_minutes').default(60).notNull(),
  totalHours: doublePrecision('total_hours').default(8).notNull(),
  isOvertimeAllowed: boolean('is_overtime_allowed').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 126. Resource Working Calendars
export const resourceWorkingCalendars = pgTable('resource_working_calendars', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  weeklyOffDays: text('weekly_off_days').default('SUNDAY').notNull(),
  shiftTemplateId: text('shift_template_id'),
  isDefault: boolean('is_default').default(false).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 127. Resource Holidays
export const resourceHolidays = pgTable('resource_holidays', {
  id: text('id').primaryKey(),
  calendarId: text('calendar_id'),
  holidayDate: text('holiday_date').notNull(),
  holidayName: text('holiday_name').notNull(),
  holidayType: text('holiday_type').default('NATIONAL').notNull(), // NATIONAL, REGIONAL, OPTIONAL, SITE_CLOSED
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 128. Resource Calendars
export const resourceCalendars = pgTable('resource_calendars', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  resourceId: text('resource_id'),
  calendarType: text('calendar_type').default('SHIFT').notNull(), // SHIFT, HOLIDAY, MAINTENANCE
  date: text('date').notNull(),
  shiftName: text('shift_name').default('DAY').notNull(),
  startTime: text('start_time'),
  endTime: text('end_time'),
  isWorkingDay: boolean('is_working_day').default(true).notNull(),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 129. Resource Availability
export const resourceAvailability = pgTable('resource_availability', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  resourceType: text('resource_type').notNull(),
  date: text('date').notNull(),
  totalCapacity: doublePrecision('total_capacity').default(8).notNull(),
  allocatedCapacity: doublePrecision('allocated_capacity').default(0).notNull(),
  reservedCapacity: doublePrecision('reserved_capacity').default(0).notNull(),
  availableCapacity: doublePrecision('available_capacity').default(8).notNull(),
  utilizationPercentage: doublePrecision('utilization_percentage').default(0).notNull(),
  idlePercentage: doublePrecision('idle_percentage').default(100).notNull(),
  status: text('status').default('AVAILABLE').notNull(), // AVAILABLE, ALLOCATED, RESERVED, MAINTENANCE, BREAKDOWN, OUT_OF_SERVICE, ON_LEAVE, IDLE, COMPLETED
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 130. Resource Requests
export const resourceRequests = pgTable('resource_requests', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').notNull(),
  projectId: text('project_id'),
  departmentId: text('department_id'),
  requestedBy: text('requested_by'),
  title: text('title').notNull(),
  priority: text('priority').default('MEDIUM').notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  requiredStartDate: text('required_start_date').notNull(),
  requiredEndDate: text('required_end_date').notNull(),
  status: text('status').default('PENDING').notNull(), // DRAFT, PENDING, APPROVED, REJECTED, PARTIALLY_ISSUED, ISSUED, CANCELLED
  approverId: text('approver_id'),
  approvalRemarks: text('approval_remarks'),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 131. Resource Request Items
export const resourceRequestItems = pgTable('resource_request_items', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  resourceTypeId: text('resource_type_id'),
  resourceId: text('resource_id'),
  requestedQty: doublePrecision('requested_qty').default(1).notNull(),
  approvedQty: doublePrecision('approved_qty').default(0).notNull(),
  rejectedQty: doublePrecision('rejected_qty').default(0).notNull(),
  issuedQty: doublePrecision('issued_qty').default(0).notNull(),
  pendingQty: doublePrecision('pending_qty').default(1).notNull(),
  unit: text('unit').default('NOS').notNull(),
  estimatedCost: doublePrecision('estimated_cost').default(0).notNull(),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 132. Resource Utilization
export const resourceUtilization = pgTable('resource_utilization', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  projectId: text('project_id'),
  departmentId: text('department_id'),
  date: text('date').notNull(),
  plannedHours: doublePrecision('planned_hours').default(8).notNull(),
  actualHours: doublePrecision('actual_hours').default(0).notNull(),
  idleHours: doublePrecision('idle_hours').default(0).notNull(),
  utilizationPercentage: doublePrecision('utilization_percentage').default(0).notNull(),
  efficiencyScore: doublePrecision('efficiency_score').default(100).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 133. Resource Reservations
export const resourceReservations = pgTable('resource_reservations', {
  id: text('id').primaryKey(),
  reservationNumber: text('reservation_number').notNull(),
  resourceId: text('resource_id').notNull(),
  projectId: text('project_id'),
  departmentId: text('department_id'),
  reservedBy: text('reserved_by'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  reservedQty: doublePrecision('reserved_qty').default(1).notNull(),
  status: text('status').default('CONFIRMED').notNull(), // PENDING, CONFIRMED, CANCELLED, EXPIRED
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 134. Resource Conflicts
export const resourceConflicts = pgTable('resource_conflicts', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  conflictType: text('conflict_type').notNull(), // OVER_ALLOCATION, DATE_OVERLAP, MAINTENANCE_COLLISION, LEAVE_COLLISION, CIRCULAR_REFERENCE
  severity: text('severity').default('HIGH').notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  firstAllocationId: text('first_allocation_id'),
  secondAllocationId: text('second_allocation_id'),
  conflictDate: text('conflict_date').notNull(),
  description: text('description').notNull(),
  resolutionStatus: text('resolution_status').default('UNRESOLVED').notNull(), // UNRESOLVED, RESOLVED, IGNORED
  resolvedBy: text('resolved_by'),
  resolutionNotes: text('resolution_notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 135. Resource Logs
export const resourceLogs = pgTable('resource_logs', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id'),
  actionType: text('action_type').notNull(), // CREATE, UPDATE, DELETE, RESTORE, ALLOCATE, RELEASE, TRANSFER, APPROVE, REJECT, MAINTENANCE
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 136. Resource Costs
export const resourceCosts = pgTable('resource_costs', {
  id: text('id').primaryKey(),
  resourceId: text('resource_id').notNull(),
  hourlyCost: doublePrecision('hourly_cost').default(0).notNull(),
  dailyCost: doublePrecision('daily_cost').default(0).notNull(),
  monthlyCost: doublePrecision('monthly_cost').default(0).notNull(),
  idleCostPerHour: doublePrecision('idle_cost_per_hour').default(0).notNull(),
  currency: text('currency').default('AED').notNull(),
  effectiveDate: text('effective_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// ============================================================================
// PHASE 55: ENTERPRISE MATERIAL, INVENTORY & WAREHOUSE MANAGEMENT TABLES
// ============================================================================

// 137. Material Subcategories
export const materialSubcategories = pgTable('material_subcategories', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  categoryId: text('category_id').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 138. Warehouse Locations
export const warehouseLocations = pgTable('warehouse_locations', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  warehouseId: text('warehouse_id').notNull(),
  zone: text('zone'),
  rack: text('rack'),
  shelf: text('shelf'),
  bin: text('bin'),
  capacity: doublePrecision('capacity').default(1000),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 139. Goods Receipts (GRN)
export const goodsReceipts = pgTable('goods_receipts', {
  id: text('id').primaryKey(),
  grnNumber: text('grn_number').notNull(),
  poNumber: text('po_number'),
  vendorId: text('vendor_id'),
  vendorName: text('vendor_name'),
  warehouseId: text('warehouse_id').notNull(),
  warehouseName: text('warehouse_name').notNull(),
  deliveryNoteNo: text('delivery_note_no'),
  receivedDate: text('received_date').notNull(),
  receivedBy: text('received_by').notNull(),
  inspectedBy: text('inspected_by'),
  qcStatus: text('qc_status').default('PASSED').notNull(), // PASSED, PENDING, REJECTED
  totalValue: doublePrecision('total_value').default(0).notNull(),
  status: text('status').default('COMPLETED').notNull(), // DRAFT, COMPLETED, CANCELLED
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 140. Goods Receipt Items
export const goodsReceiptItems = pgTable('goods_receipt_items', {
  id: text('id').primaryKey(),
  grnId: text('grn_id').notNull(),
  materialId: text('material_id').notNull(),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  orderedQty: doublePrecision('ordered_qty').notNull(),
  receivedQty: doublePrecision('received_qty').notNull(),
  acceptedQty: doublePrecision('accepted_qty').notNull(),
  rejectedQty: doublePrecision('rejected_qty').default(0).notNull(),
  unitPrice: doublePrecision('unit_price').default(0).notNull(),
  batchNumber: text('batch_number'),
  expiryDate: text('expiry_date'),
  locationId: text('location_id'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 141. Material Issues
export const materialIssues = pgTable('material_issues', {
  id: text('id').primaryKey(),
  issueNumber: text('issue_number').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  wbsId: text('wbs_id'),
  wbsCode: text('wbs_code'),
  boqItemId: text('boq_item_id'),
  boqRef: text('boq_ref'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  department: text('department'),
  warehouseId: text('warehouse_id').notNull(),
  warehouseName: text('warehouse_name').notNull(),
  issuedTo: text('issued_to').notNull(),
  issuedBy: text('issued_by').notNull(),
  issueDate: text('issue_date').notNull(),
  status: text('status').default('ISSUED').notNull(), // PENDING, ISSUED, CANCELLED
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 142. Material Issue Items
export const materialIssueItems = pgTable('material_issue_items', {
  id: text('id').primaryKey(),
  issueId: text('issue_id').notNull(),
  materialId: text('material_id').notNull(),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  requestedQty: doublePrecision('requested_qty').notNull(),
  issuedQty: doublePrecision('issued_qty').notNull(),
  unitPrice: doublePrecision('unit_price').default(0).notNull(),
  batchNumber: text('batch_number'),
  locationId: text('location_id'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 143. Material Transfers
export const materialTransfers = pgTable('material_transfers', {
  id: text('id').primaryKey(),
  transferNumber: text('transfer_number').notNull(),
  sourceWarehouseId: text('source_warehouse_id').notNull(),
  sourceWarehouseName: text('source_warehouse_name').notNull(),
  targetWarehouseId: text('target_warehouse_id').notNull(),
  targetWarehouseName: text('target_warehouse_name').notNull(),
  requestedBy: text('requested_by'),
  approvedBy: text('approved_by'),
  dispatchedBy: text('dispatched_by'),
  receivedBy: text('received_by'),
  transferDate: text('transfer_date').notNull(),
  status: text('status').default('COMPLETED').notNull(), // IN_TRANSIT, COMPLETED, CANCELLED
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 144. Material Transfer Items
export const materialTransferItems = pgTable('material_transfer_items', {
  id: text('id').primaryKey(),
  transferId: text('transfer_id').notNull(),
  materialId: text('material_id').notNull(),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  transferQty: doublePrecision('transfer_qty').notNull(),
  batchNumber: text('batch_number'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 145. Material Returns
export const materialReturns = pgTable('material_returns', {
  id: text('id').primaryKey(),
  returnNumber: text('return_number').notNull(),
  returnType: text('return_type').default('SITE_TO_STORE').notNull(), // SITE_TO_STORE, STORE_TO_VENDOR
  projectId: text('project_id'),
  projectName: text('project_name'),
  warehouseId: text('warehouse_id').notNull(),
  warehouseName: text('warehouse_name').notNull(),
  returnedBy: text('returned_by').notNull(),
  receivedBy: text('received_by').notNull(),
  returnDate: text('return_date').notNull(),
  status: text('status').default('RECEIVED').notNull(), // PENDING, RECEIVED, CANCELLED
  reason: text('reason'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 146. Material Return Items
export const materialReturnItems = pgTable('material_return_items', {
  id: text('id').primaryKey(),
  returnId: text('return_id').notNull(),
  materialId: text('material_id').notNull(),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  returnedQty: doublePrecision('returned_qty').notNull(),
  unitPrice: doublePrecision('unit_price').default(0).notNull(),
  batchNumber: text('batch_number'),
  condition: text('condition').default('GOOD').notNull(), // GOOD, DAMAGED, DEFECTIVE
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 147. Inventory Adjustments
export const inventoryAdjustments = pgTable('inventory_adjustments', {
  id: text('id').primaryKey(),
  adjustmentNumber: text('adjustment_number').notNull(),
  warehouseId: text('warehouse_id').notNull(),
  warehouseName: text('warehouse_name').notNull(),
  materialId: text('material_id').notNull(),
  materialName: text('material_name').notNull(),
  materialCode: text('material_code').notNull(),
  adjustmentType: text('adjustment_type').notNull(), // SURPLUS, SHORTAGE, DAMAGE, EXPIRY, SCRAP
  quantity: doublePrecision('quantity').notNull(),
  unitPrice: doublePrecision('unit_price').default(0).notNull(),
  reason: text('reason').notNull(),
  adjustedBy: text('adjusted_by').notNull(),
  approvedBy: text('approved_by'),
  status: text('status').default('APPROVED').notNull(), // PENDING, APPROVED, REJECTED
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 148. Inventory Logs
export const inventoryLogs = pgTable('inventory_logs', {
  id: text('id').primaryKey(),
  materialId: text('material_id'),
  warehouseId: text('warehouse_id'),
  actionType: text('action_type').notNull(), // CREATE, UPDATE, DELETE, RESTORE, GRN, ISSUE, TRANSFER, RETURN, ADJUSTMENT, PHYSICAL_COUNT
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// ============================================================================
// PHASE 56: ENTERPRISE PROCUREMENT & PURCHASE MANAGEMENT ENGINE TABLES
// ============================================================================

// 149. Purchase Requisitions
export const purchaseRequisitions = pgTable('purchase_requisitions', {
  id: text('id').primaryKey(),
  prNumber: text('pr_number').notNull().unique(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  wbsCode: text('wbs_code'),
  department: text('department'),
  requestedBy: text('requested_by').notNull(),
  requiredDate: text('required_date'),
  priority: text('priority').default('MEDIUM').notNull(), // LOW, MEDIUM, HIGH, URGENT
  totalAmount: doublePrecision('total_amount').default(0).notNull(),
  currency: text('currency').default('AED').notNull(),
  status: text('status').default('DRAFT').notNull(), // DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, CANCELLED, CLOSED
  approvalStep: text('approval_step'),
  currentApprover: text('current_approver'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 150. Purchase Requisition Items
export const purchaseRequisitionItems = pgTable('purchase_requisition_items', {
  id: text('id').primaryKey(),
  prId: text('pr_id').notNull(),
  materialId: text('material_id'),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unit: text('unit').default('PCS').notNull(),
  estimatedUnitPrice: doublePrecision('estimated_unit_price').default(0).notNull(),
  estimatedTotalPrice: doublePrecision('estimated_total_price').default(0).notNull(),
  specification: text('specification'),
  requiredDate: text('required_date'),
  boqRef: text('boq_ref'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 151. Request For Quotations (RFQ)
export const requestForQuotations = pgTable('request_for_quotations', {
  id: text('id').primaryKey(),
  rfqNumber: text('rfq_number').notNull().unique(),
  prId: text('pr_id'),
  prNumber: text('pr_number'),
  title: text('title').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  issuedDate: text('issued_date').notNull(),
  submissionDeadline: text('submission_deadline').notNull(),
  issuedBy: text('issued_by').notNull(),
  status: text('status').default('ISSUED').notNull(), // DRAFT, ISSUED, QUOTATIONS_RECEIVED, EVALUATING, CLOSED, CANCELLED
  termsAndConditions: text('terms_and_conditions'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 152. RFQ Items
export const rfqItems = pgTable('rfq_items', {
  id: text('id').primaryKey(),
  rfqId: text('rfq_id').notNull(),
  prItemId: text('pr_item_id'),
  materialId: text('material_id'),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unit: text('unit').default('PCS').notNull(),
  specification: text('specification'),
  createdAt: text('created_at').notNull(),
});

// 153. RFQ Vendors
export const rfqVendors = pgTable('rfq_vendors', {
  id: text('id').primaryKey(),
  rfqId: text('rfq_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  vendorEmail: text('vendor_email'),
  status: text('status').default('INVITED').notNull(), // INVITED, QUOTED, DECLINED
  invitedAt: text('invited_at').notNull(),
  respondedAt: text('responded_at'),
});

// 154. Vendor Quotations
export const vendorQuotations = pgTable('vendor_quotations', {
  id: text('id').primaryKey(),
  quotationNumber: text('quotation_number').notNull().unique(),
  rfqId: text('rfq_id').notNull(),
  rfqNumber: text('rfq_number').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  quotationDate: text('quotation_date').notNull(),
  validUntil: text('valid_until'),
  paymentTerms: text('payment_terms'),
  deliveryLeadTimeDays: integer('delivery_lead_time_days').default(0).notNull(),
  subtotal: doublePrecision('subtotal').default(0).notNull(),
  taxAmount: doublePrecision('tax_amount').default(0).notNull(),
  discountAmount: doublePrecision('discount_amount').default(0).notNull(),
  totalAmount: doublePrecision('total_amount').default(0).notNull(),
  currency: text('currency').default('AED').notNull(),
  status: text('status').default('SUBMITTED').notNull(), // SUBMITTED, UNDER_EVALUATION, ACCEPTED, REJECTED
  technicalScore: doublePrecision('technical_score').default(0).notNull(),
  commercialScore: doublePrecision('commercial_score').default(0).notNull(),
  overallScore: doublePrecision('overall_score').default(0).notNull(),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 155. Vendor Quotation Items
export const vendorQuotationItems = pgTable('vendor_quotation_items', {
  id: text('id').primaryKey(),
  quotationId: text('quotation_id').notNull(),
  rfqItemId: text('rfq_item_id'),
  materialId: text('material_id'),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  offeredQuantity: doublePrecision('offered_quantity').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  brandModel: text('brand_model'),
  countryOfOrigin: text('country_of_origin'),
  complianceRemarks: text('compliance_remarks'),
  createdAt: text('created_at').notNull(),
});

// 156. Technical Evaluations
export const technicalEvaluations = pgTable('technical_evaluations', {
  id: text('id').primaryKey(),
  evaluationNumber: text('evaluation_number').notNull().unique(),
  rfqId: text('rfq_id').notNull(),
  quotationId: text('quotation_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  evaluatorId: text('evaluator_id').notNull(),
  evaluatorName: text('evaluator_name').notNull(),
  evaluationDate: text('evaluation_date').notNull(),
  specificationComplianceScore: doublePrecision('specification_compliance_score').default(0).notNull(),
  qualityScore: doublePrecision('quality_score').default(0).notNull(),
  deliveryLeadTimeScore: doublePrecision('delivery_lead_time_score').default(0).notNull(),
  overallTechnicalScore: doublePrecision('overall_technical_score').default(0).notNull(),
  recommendation: text('recommendation').default('QUALIFIED').notNull(), // QUALIFIED, CONDITIONALLY_QUALIFIED, REJECTED
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 157. Commercial Evaluations
export const commercialEvaluations = pgTable('commercial_evaluations', {
  id: text('id').primaryKey(),
  evaluationNumber: text('evaluation_number').notNull().unique(),
  rfqId: text('rfq_id').notNull(),
  quotationId: text('quotation_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  evaluatorId: text('evaluator_id').notNull(),
  evaluatorName: text('evaluator_name').notNull(),
  evaluationDate: text('evaluation_date').notNull(),
  unitPriceScore: doublePrecision('unit_price_score').default(0).notNull(),
  paymentTermsScore: doublePrecision('payment_terms_score').default(0).notNull(),
  totalValueScore: doublePrecision('total_value_score').default(0).notNull(),
  overallCommercialScore: doublePrecision('overall_commercial_score').default(0).notNull(),
  recommendation: text('recommendation').default('QUALIFIED').notNull(), // QUALIFIED, HIGH_PRICE, REJECTED
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 158. Comparative Statements
export const comparativeStatements = pgTable('comparative_statements', {
  id: text('id').primaryKey(),
  statementNumber: text('statement_number').notNull().unique(),
  rfqId: text('rfq_id').notNull(),
  rfqNumber: text('rfq_number').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  preparedBy: text('prepared_by').notNull(),
  preparedDate: text('prepared_date').notNull(),
  recommendedVendorId: text('recommended_vendor_id'),
  recommendedVendorName: text('recommended_vendor_name'),
  recommendedQuotationId: text('recommended_quotation_id'),
  justification: text('justification'),
  status: text('status').default('DRAFT').notNull(), // DRAFT, SUBMITTED, APPROVED, REJECTED
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 159. Purchase Orders
export const purchaseOrders = pgTable('phase56_purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull().unique(),
  prId: text('pr_id'),
  prNumber: text('pr_number'),
  rfqId: text('rfq_id'),
  quotationId: text('quotation_id'),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  warehouseId: text('warehouse_id'),
  warehouseName: text('warehouse_name'),
  poDate: text('po_date').notNull(),
  expectedDeliveryDate: text('expected_delivery_date'),
  paymentTerms: text('payment_terms'),
  incoterms: text('incoterms'),
  currency: text('currency').default('AED').notNull(),
  subtotal: doublePrecision('subtotal').default(0).notNull(),
  taxAmount: doublePrecision('tax_amount').default(0).notNull(),
  discountAmount: doublePrecision('discount_amount').default(0).notNull(),
  totalAmount: doublePrecision('total_amount').default(0).notNull(),
  revisedAmount: doublePrecision('revised_amount').default(0).notNull(),
  revisionCount: integer('revision_count').default(0).notNull(),
  status: text('status').default('DRAFT').notNull(), // DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, ISSUED_TO_VENDOR, ACKNOWLEDGED, PARTIALLY_RECEIVED, COMPLETED, CANCELLED
  issuedBy: text('issued_by'),
  approvedBy: text('approved_by'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 160. Purchase Order Items
export const purchaseOrderItems = pgTable('purchase_order_items', {
  id: text('id').primaryKey(),
  poId: text('po_id').notNull(),
  materialId: text('material_id'),
  materialCode: text('material_code').notNull(),
  materialName: text('material_name').notNull(),
  orderedQty: doublePrecision('ordered_qty').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  receivedQty: doublePrecision('received_qty').default(0).notNull(),
  outstandingQty: doublePrecision('outstanding_qty').notNull(),
  unit: text('unit').default('PCS').notNull(),
  specification: text('specification'),
  boqRef: text('boq_ref'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

// 161. Purchase Order Revisions
export const purchaseOrderRevisions = pgTable('purchase_order_revisions', {
  id: text('id').primaryKey(),
  poId: text('po_id').notNull(),
  revisionNumber: integer('revision_number').notNull(),
  revisedBy: text('revised_by').notNull(),
  revisedDate: text('revised_date').notNull(),
  reasonForRevision: text('reason_for_revision').notNull(),
  previousTotalAmount: doublePrecision('previous_total_amount').notNull(),
  newTotalAmount: doublePrecision('new_total_amount').notNull(),
  changesSummary: text('changes_summary'),
  createdAt: text('created_at').notNull(),
});

// 162. Purchase Order Approvals
export const purchaseOrderApprovals = pgTable('purchase_order_approvals', {
  id: text('id').primaryKey(),
  poId: text('po_id'),
  prId: text('pr_id'),
  entityType: text('entity_type').notNull(), // 'PO' | 'PR' | 'COMPARATIVE'
  entityNumber: text('entity_number').notNull(),
  step: integer('step').notNull(),
  approverRole: text('approver_role').notNull(),
  approverId: text('approver_id'),
  approverName: text('approver_name'),
  status: text('status').default('PENDING').notNull(), // PENDING, APPROVED, REJECTED
  comments: text('comments'),
  actionDate: text('action_date'),
  createdAt: text('created_at').notNull(),
});

// 163. Delivery Schedules
export const deliverySchedules = pgTable('delivery_schedules', {
  id: text('id').primaryKey(),
  poId: text('po_id').notNull(),
  poNumber: text('po_number').notNull(),
  poItemId: text('po_item_id'),
  materialName: text('material_name').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  scheduledQty: doublePrecision('scheduled_qty').notNull(),
  deliveredQty: doublePrecision('delivered_qty').default(0).notNull(),
  balanceQty: doublePrecision('balance_qty').notNull(),
  status: text('status').default('SCHEDULED').notNull(), // SCHEDULED, IN_TRANSIT, PARTIALLY_DELIVERED, DELIVERED, DELAYED
  destinationWarehouseId: text('destination_warehouse_id'),
  destinationWarehouseName: text('destination_warehouse_name'),
  carrierName: text('carrier_name'),
  trackingNumber: text('tracking_number'),
  remarks: text('remarks'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 164. Vendor Performance
export const vendorPerformance = pgTable('vendor_performance', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  poId: text('po_id'),
  poNumber: text('po_number'),
  evaluationPeriod: text('evaluation_period'),
  qualityRating: doublePrecision('quality_rating').default(0).notNull(), // 1 to 5
  deliveryTimelinessRating: doublePrecision('delivery_timeliness_rating').default(0).notNull(),
  commercialCompetitivenessRating: doublePrecision('commercial_competitiveness_rating').default(0).notNull(),
  overallRating: doublePrecision('overall_rating').default(0).notNull(),
  evaluatorName: text('evaluator_name').notNull(),
  comments: text('comments'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 165. Procurement Logs
export const procurementLogs = pgTable('procurement_logs', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // PR, RFQ, QUOTATION, EVALUATION, COMPARATIVE, PO, DELIVERY
  entityId: text('entity_id').notNull(),
  entityNumber: text('entity_number').notNull(),
  actionType: text('action_type').notNull(), // CREATE, UPDATE, APPROVE, REJECT, REVISE, DELETE, STATUS_CHANGE
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 166. Budget Allocations
export const budgetAllocations = pgTable('budget_allocations', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  costCenterCode: text('cost_center_code').notNull(),
  allocatedAmount: doublePrecision('allocated_amount').notNull(),
  committedAmount: doublePrecision('committed_amount').default(0).notNull(),
  actualSpentAmount: doublePrecision('actual_spent_amount').default(0).notNull(),
  availableAmount: doublePrecision('available_amount').notNull(),
  fiscalYear: text('fiscal_year').notNull(),
  status: text('status').default('ACTIVE').notNull(), // ACTIVE, EXHAUSTED, FROZEN
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 167. Procurement Comments
export const procurementComments = pgTable('procurement_comments', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role'),
  commentText: text('comment_text').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 168. Procurement Documents
export const procurementDocuments = pgTable('procurement_documents', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  documentType: text('document_type').notNull(), // TECHNICAL_SPEC, QUOTATION_PDF, COMPARATIVE_EXCEL, PO_SIGNED, DELIVERY_CHALAN
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').default(0).notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// ======================================================
// PHASE 57: ENTERPRISE VENDOR & CONTRACT MANAGEMENT TABLES
// ======================================================

// 169. Enterprise Vendors
export const phase57Vendors = pgTable('phase57_vendors', {
  id: text('id').primaryKey(),
  vendorCode: text('vendor_code').notNull().unique(),
  name: text('name').notNull(),
  category: text('category').notNull().default('General Supplier'),
  classification: text('classification').notNull().default('APPROVED'), // APPROVED, PREFERRED, BLOCKED, BLACKLISTED, UNDER_REVIEW
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, SUSPENDED, PENDING_APPROVAL
  rating: doublePrecision('rating').default(5.0).notNull(),
  scorecardGrade: text('scorecard_grade').default('A').notNull(), // A+, A, B, C, D
  avlStatus: text('avl_status').default('APPROVED').notNull(), // APPROVED, PROVISIONAL, NOT_APPROVED
  tradeLicenseNo: text('trade_license_no'),
  tradeLicenseExpiry: text('trade_license_expiry'),
  gstin: text('gstin'),
  pan: text('pan'),
  msmeRegNo: text('msme_reg_no'),
  isoCertified: boolean('iso_certified').default(false).notNull(),
  paymentTerms: text('payment_terms').default('NET_30'),
  creditPeriodDays: integer('credit_period_days').default(30),
  riskLevel: text('risk_level').default('LOW'), // LOW, MEDIUM, HIGH, CRITICAL
  insuranceExpiry: text('insurance_expiry'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 170. Vendor Categories
export const vendorCategories = pgTable('vendor_categories', {
  id: text('id').primaryKey(),
  categoryCode: text('category_code').notNull().unique(),
  categoryName: text('category_name').notNull(),
  description: text('description'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 171. Vendor Contacts
export const vendorContacts = pgTable('vendor_contacts', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  contactName: text('contact_name').notNull(),
  designation: text('designation'),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  isPrimary: boolean('is_primary').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 172. Vendor Addresses
export const vendorAddresses = pgTable('vendor_addresses', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  addressType: text('address_type').notNull().default('OFFICE'), // OFFICE, WAREHOUSE, BILLING, SHIPPING
  streetAddress: text('street_address').notNull(),
  city: text('city').notNull(),
  state: text('state').notNull(),
  country: text('country').notNull().default('UAE'),
  pincode: text('pincode'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 173. Vendor Bank Accounts
export const vendorBankAccounts = pgTable('vendor_bank_accounts', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  bankName: text('bank_name').notNull(),
  branchName: text('branch_name'),
  accountNumber: text('account_number').notNull(),
  accountHolderName: text('account_holder_name').notNull(),
  ifscCode: text('ifsc_code'),
  swiftCode: text('swift_code'),
  iban: text('iban'),
  isPrimary: boolean('is_primary').default(true).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 174. Vendor Certifications
export const vendorCertifications = pgTable('vendor_certifications', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  certType: text('cert_type').notNull(), // ISO_9001, ISO_14001, OHSAS, MSME, SAFETY
  certNumber: text('cert_number').notNull(),
  issuingAuthority: text('issuing_authority').notNull(),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  documentUrl: text('document_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 175. Vendor Documents
export const vendorDocuments = pgTable('vendor_documents', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  documentType: text('document_type').notNull(), // TRADE_LICENSE, GST_CERT, TAX_PAN, BANK_PROOF, MSME, ISO, INSURANCE, OTHER
  documentNumber: text('document_number'),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  expiryDate: text('expiry_date'),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 176. Vendor Ratings
export const vendorRatings = pgTable('vendor_ratings', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  ratingPeriod: text('rating_period').notNull(),
  qualityRating: doublePrecision('quality_rating').default(5.0).notNull(),
  deliveryRating: doublePrecision('delivery_rating').default(5.0).notNull(),
  priceCompetitiveness: doublePrecision('price_competitiveness').default(5.0).notNull(),
  safetyRating: doublePrecision('safety_rating').default(5.0).notNull(),
  overallScore: doublePrecision('overall_score').default(5.0).notNull(),
  scorecardGrade: text('scorecard_grade').default('A').notNull(),
  evaluatorName: text('evaluator_name').notNull(),
  comments: text('comments'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 177. Vendor Blacklist
export const vendorBlacklist = pgTable('vendor_blacklist', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  blacklistedBy: text('blacklisted_by').notNull(),
  blacklistedDate: text('blacklisted_date').notNull(),
  reason: text('reason').notNull(),
  durationMonths: integer('duration_months').default(12).notNull(),
  status: text('status').default('ACTIVE').notNull(), // ACTIVE, REVOKED
  revokedBy: text('revoked_by'),
  revokedDate: text('revoked_date'),
  revocationReason: text('revocation_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 178. Vendor Audits
export const vendorAudits = pgTable('vendor_audits', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  auditNumber: text('audit_number').notNull().unique(),
  auditDate: text('audit_date').notNull(),
  auditorName: text('auditor_name').notNull(),
  auditType: text('audit_type').notNull().default('ANNUAL_SURVEILLANCE'), // INITIAL_QUALIFICATION, ANNUAL_SURVEILLANCE, RE_EVALUATION
  auditScore: doublePrecision('audit_score').default(100.0).notNull(),
  findings: text('findings'),
  correctiveActionPlan: text('corrective_action_plan'),
  status: text('status').default('PASSED').notNull(), // PASSED, CONDITIONAL, FAILED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 179. Contracts
export const phase57Contracts = pgTable('phase57_contracts', {
  id: text('id').primaryKey(),
  contractNumber: text('contract_number').notNull().unique(),
  title: text('title').notNull(),
  contractType: text('contract_type').notNull().default('SUPPLY'), // SUPPLY, SERVICE, LABOUR, AMC, CONSULTANCY, MECHANICAL, ELECTRICAL, CIVIL, PIPELINE, INSTRUMENTATION, AUTOMATION
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  packageId: text('package_id'),
  wbsCode: text('wbs_code'),
  department: text('department').default('Contracts'),
  contractValue: doublePrecision('contract_value').notNull().default(0),
  revisedValue: doublePrecision('revised_value').notNull().default(0),
  currency: text('currency').notNull().default('AED'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  revisedEndDate: text('revised_end_date'),
  status: text('status').notNull().default('DRAFT'), // DRAFT, SUBMITTED, REVIEWED, APPROVED, ACTIVE, SUSPENDED, COMPLETED, CLOSED, CANCELLED, EXPIRED
  retentionPercent: doublePrecision('retention_percent').default(10.0).notNull(),
  retentionAmount: doublePrecision('retention_amount').default(0).notNull(),
  securityDepositAmount: doublePrecision('security_deposit_amount').default(0).notNull(),
  performanceGuaranteeAmount: doublePrecision('performance_guarantee_amount').default(0).notNull(),
  ldPercentPerWeek: doublePrecision('ld_percent_per_week').default(0.5).notNull(),
  maxLdCapPercent: doublePrecision('max_ld_cap_percent').default(10.0).notNull(),
  totalLdPenalties: doublePrecision('total_ld_penalties').default(0).notNull(),
  termsAndConditions: text('terms_and_conditions'),
  notes: text('notes'),
  isActive: boolean('is_active').default(true).notNull(),
  isDeleted: boolean('is_deleted').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
});

// 180. Contract Items
export const contractItems = pgTable('contract_items', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  materialOrServiceCode: text('material_or_service_code').notNull(),
  description: text('description').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unit: text('unit').notNull().default('PCS'),
  rate: doublePrecision('rate').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  boqRef: text('boq_ref'),
  wbsRef: text('wbs_ref'),
  createdAt: text('created_at').notNull(),
});

// 181. Contract Milestones
export const contractMilestones = pgTable('contract_milestones', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  milestoneNumber: integer('milestone_number').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  targetDate: text('target_date').notNull(),
  actualCompletionDate: text('actual_completion_date'),
  milestoneWeightagePercent: doublePrecision('milestone_weightage_percent').default(0).notNull(),
  amount: doublePrecision('amount').notNull().default(0),
  status: text('status').notNull().default('PENDING'), // PENDING, IN_PROGRESS, COMPLETED, DELAYED
  completionCertificateUrl: text('completion_certificate_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 182. Contract Payments
export const contractPayments = pgTable('contract_payments', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  certificateNumber: text('certificate_number').notNull().unique(),
  billingPeriod: text('billing_period').notNull(),
  grossAmount: doublePrecision('gross_amount').notNull(),
  retentionDeducted: doublePrecision('retention_deducted').notNull().default(0),
  advanceAdjusted: doublePrecision('advance_adjusted').notNull().default(0),
  penaltyDeducted: doublePrecision('penalty_deducted').notNull().default(0),
  netPayableAmount: doublePrecision('net_payable_amount').notNull(),
  status: text('status').notNull().default('DRAFT'), // DRAFT, CERTIFIED, APPROVED, PAID
  paymentDate: text('payment_date'),
  referenceNo: text('reference_no'),
  certifiedBy: text('certified_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 183. Contract Variations
export const contractVariations = pgTable('contract_variations', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  variationNumber: text('variation_number').notNull().unique(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  variationType: text('variation_type').notNull().default('ADDITION'), // ADDITION, OMISSION, SCOPE_CHANGE, PRICE_REVISION
  amount: doublePrecision('amount').notNull(),
  timeExtensionDays: integer('time_extension_days').default(0).notNull(),
  status: text('status').notNull().default('PROPOSED'), // PROPOSED, APPROVED, REJECTED
  createdBy: text('created_by'),
  approvedBy: text('approved_by'),
  approvedDate: text('approved_date'),
  justification: text('justification'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 184. Contract Extensions
export const contractExtensions = pgTable('contract_extensions', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  extensionNumber: integer('extension_number').notNull(),
  extensionDocumentNumber: text('extension_document_number').unique(),
  extensionDays: integer('extension_days').notNull(),
  originalEndDate: text('original_end_date').notNull(),
  newEndDate: text('new_end_date').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull().default('REQUESTED'), // REQUESTED, APPROVED, REJECTED
  requestedBy: text('requested_by'),
  approvedBy: text('approved_by'),
  approvedDate: text('approved_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 185. Contract Retentions
export const contractRetentions = pgTable('contract_retentions', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  retentionNumber: text('retention_number').notNull().unique(),
  accumulatedRetention: doublePrecision('accumulated_retention').notNull(),
  releasedAmount: doublePrecision('released_amount').notNull().default(0),
  balanceRetention: doublePrecision('balance_retention').notNull(),
  releaseStage: text('release_stage').notNull().default('DEFECT_LIABILITY_PERIOD'), // DEFECT_LIABILITY_PERIOD, FINAL_HANDOVER
  releaseDate: text('release_date'),
  status: text('status').notNull().default('HELD'), // HELD, PARTIALLY_RELEASED, FULLY_RELEASED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 186. Contract Penalties
export const contractPenalties = pgTable('contract_penalties', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  penaltyNumber: text('penalty_number').notNull().unique(),
  penaltyType: text('penalty_type').notNull().default('LIQUIDATED_DAMAGES'), // LIQUIDATED_DAMAGES, SAFETY_VIOLATION, QUALITY_DEFECT, DELAY
  amount: doublePrecision('amount').notNull(),
  reason: text('reason').notNull(),
  appliedDate: text('applied_date').notNull(),
  deductedInPaymentId: text('deducted_in_payment_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 187. Contract Documents
export const contractDocuments = pgTable('contract_documents', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  documentType: text('document_type').notNull(), // SIGNED_CONTRACT, METHOD_STATEMENT, CAD_DWG, INSPECTION_REPORT, PERFORMANCE_BOND, INSURANCE_POLICY, VARIATION_ORDER, OTHER
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSize: integer('file_size').default(0).notNull(),
  versionNumber: integer('version_number').default(1).notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 188. Contract Approvals
export const contractApprovals = pgTable('contract_approvals', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  step: integer('step').notNull(),
  approverRole: text('approver_role').notNull(),
  approverId: text('approver_id').notNull(),
  approverName: text('approver_name').notNull(),
  status: text('status').notNull(), // PENDING, APPROVED, REJECTED
  comments: text('comments'),
  actionDate: text('action_date').notNull(),
  createdAt: text('created_at').notNull(),
});

// 189. Contract Logs
export const contractLogs = pgTable('contract_logs', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  contractNumber: text('contract_number').notNull(),
  actionType: text('action_type').notNull(), // CREATE, APPROVE, REVISE, EXTEND, TERMINATE, PAYMENT
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  createdAt: text('created_at').notNull(),
});

// ============================================================================
// PHASE 58: ENTERPRISE ASSET MANAGEMENT & CMMS
// ============================================================================

// 190. Asset Master
export const phase58Assets = pgTable('phase58_assets', {
  id: text('id').primaryKey(),
  assetNumber: text('asset_number').notNull().unique(), // AST-2026-XXXX
  name: text('name').notNull(),
  qrCode: text('qr_code'),
  barcode: text('barcode'),
  rfidTag: text('rfid_tag'),
  category: text('category').notNull().default('HEAVY_EQUIPMENT'), // HEAVY_EQUIPMENT, PLANT_MACHINERY, VEHICLE, GENERATOR, PUMP, INSTRUMENTATION, TOOL, IT_HARDWARE, OTHER
  subcategory: text('subcategory'),
  assetGroup: text('asset_group'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  department: text('department').notNull().default('FLEET_PLANT'),
  warehouseId: text('warehouse_id'),
  currentLocation: text('current_location').notNull(),
  gpsCoordinates: text('gps_coordinates'),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number').notNull(),
  purchaseDate: text('purchase_date').notNull(),
  commissionDate: text('commission_date'),
  warrantyStartDate: text('warranty_start_date'),
  warrantyEndDate: text('warranty_end_date'),
  insurancePolicyNo: text('insurance_policy_no'),
  insuranceExpiryDate: text('insurance_expiry_date'),
  amcContractNo: text('amc_contract_no'),
  amcExpiryDate: text('amc_expiry_date'),
  purchaseValue: doublePrecision('purchase_value').notNull(),
  currentValue: doublePrecision('current_value').notNull(),
  residualValue: doublePrecision('residual_value').default(0).notNull(),
  usefulLifeYears: integer('useful_life_years').default(10).notNull(),
  depreciationMethod: text('depreciation_method').notNull().default('STRAIGHT_LINE'), // STRAIGHT_LINE, WDV, CUSTOM
  responsibleEmployeeId: text('responsible_employee_id'),
  responsibleEmployeeName: text('responsible_employee_name'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, IDLE, UNDER_MAINTENANCE, IN_TRANSIT, SCRAPPED, DISPOSED
  criticality: text('criticality').notNull().default('MEDIUM'), // HIGH, MEDIUM, LOW
  runningHoursMeter: doublePrecision('running_hours_meter').default(0).notNull(),
  odometerKm: doublePrecision('odometer_km').default(0).notNull(),
  fuelEfficiencyKmPerL: doublePrecision('fuel_efficiency_km_per_l').default(0).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
});

// 191. Asset Categories
export const assetCategories = pgTable('asset_categories', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  description: text('description'),
  defaultDepreciationRatePercent: doublePrecision('default_depreciation_rate_percent').default(10).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 192. Asset Groups
export const assetGroups = pgTable('asset_groups', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  categoryCode: text('category_code').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 193. Asset Locations
export const assetLocations = pgTable('asset_locations', {
  id: text('id').primaryKey(),
  locationCode: text('location_code').notNull().unique(),
  name: text('name').notNull(),
  siteName: text('site_name').notNull(),
  zone: text('zone'),
  address: text('address'),
  gpsLatLong: text('gps_lat_long'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 194. Asset Assignments
export const assetAssignments = pgTable('asset_assignments', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name').notNull(),
  assignedDate: text('assigned_date').notNull(),
  expectedReturnDate: text('expected_return_date'),
  actualReturnDate: text('actual_return_date'),
  purpose: text('purpose').notNull(),
  conditionOnAssign: text('condition_on_assign').notNull().default('EXCELLENT'),
  conditionOnReturn: text('condition_on_return'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, RETURNED, OVERDUE
  assignedBy: text('assigned_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 195. Asset Transfers
export const assetTransfers = pgTable('asset_transfers', {
  id: text('id').primaryKey(),
  transferNumber: text('transfer_number').notNull().unique(), // TRN-2026-XXXX
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name').notNull(),
  fromLocation: text('from_location').notNull(),
  toLocation: text('to_location').notNull(),
  fromProjectId: text('from_project_id'),
  toProjectId: text('to_project_id'),
  requestedBy: text('requested_by').notNull(),
  approvedBy: text('approved_by'),
  dispatchDate: text('dispatch_date').notNull(),
  receivedDate: text('received_date'),
  status: text('status').notNull().default('DISPATCHED'), // PENDING, DISPATCHED, IN_TRANSIT, RECEIVED, CANCELLED
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 196. Asset Meter Readings
export const assetMeterReadings = pgTable('asset_meter_readings', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  readingType: text('reading_type').notNull().default('RUNNING_HOURS'), // RUNNING_HOURS, ODOMETER_KM, GENERATOR_HOURS, PUMP_HOURS, ENERGY_KWH, CUSTOM
  readingValue: doublePrecision('reading_value').notNull(),
  unit: text('unit').notNull().default('HRS'),
  readingDate: text('reading_date').notNull(),
  recordedBy: text('recorded_by').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 197. Asset Maintenance Plans
export const assetMaintenancePlans = pgTable('asset_maintenance_plans', {
  id: text('id').primaryKey(),
  planNumber: text('plan_number').notNull().unique(), // PLN-2026-XXXX
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name').notNull(),
  planType: text('plan_type').notNull().default('PREVENTIVE'), // PREVENTIVE, CONDITION_BASED, CALIBRATION
  triggerType: text('trigger_type').notNull().default('TIME_BASED'), // TIME_BASED, METER_BASED, BOTH
  intervalDays: integer('interval_days').default(30),
  intervalMeterValue: doublePrecision('interval_meter_value').default(250), // e.g., every 250 running hours
  lastMaintenanceDate: text('last_maintenance_date'),
  nextDueDate: text('next_due_date').notNull(),
  nextDueMeterValue: doublePrecision('next_due_meter_value'),
  taskDescription: text('task_description').notNull(),
  priority: text('priority').notNull().default('MEDIUM'), // HIGH, MEDIUM, LOW, CRITICAL
  assignedTechnician: text('assigned_technician'),
  estimatedDurationHours: doublePrecision('estimated_duration_hours').default(4).notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, COMPLETED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 198. Maintenance Work Orders
export const assetWorkOrders = pgTable('asset_work_orders', {
  id: text('id').primaryKey(),
  workOrderNumber: text('work_order_number').notNull().unique(), // WO-2026-XXXX
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name').notNull(),
  workOrderType: text('work_order_type').notNull().default('PREVENTIVE'), // PREVENTIVE, CORRECTIVE, EMERGENCY, CALIBRATION, OVERHAUL
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, EMERGENCY
  summary: text('summary').notNull(),
  description: text('description').notNull(),
  maintenancePlanId: text('maintenance_plan_id'),
  failureCode: text('failure_code'),
  assignedTechnician: text('assigned_technician').notNull(),
  scheduledStartDate: text('scheduled_start_date').notNull(),
  scheduledEndDate: text('scheduled_end_date').notNull(),
  actualStartDate: text('actual_start_date'),
  actualEndDate: text('actual_end_date'),
  laborHoursSpent: doublePrecision('labor_hours_spent').default(0).notNull(),
  laborCost: doublePrecision('labor_cost').default(0).notNull(),
  partsCost: doublePrecision('parts_cost').default(0).notNull(),
  totalCost: doublePrecision('total_cost').default(0).notNull(),
  downtimeHours: doublePrecision('downtime_hours').default(0).notNull(),
  rootCauseAnalysis: text('root_cause_analysis'),
  status: text('status').notNull().default('CREATED'), // CREATED, SCHEDULED, IN_PROGRESS, ON_HOLD, COMPLETED, APPROVED, CANCELLED
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 199. Maintenance Checklists
export const assetChecklists = pgTable('asset_checklists', {
  id: text('id').primaryKey(),
  workOrderId: text('work_order_id').notNull(),
  checklistItem: text('checklist_item').notNull(),
  isPassed: boolean('is_passed').default(false).notNull(),
  inspectorNotes: text('inspector_notes'),
  inspectedAt: text('inspected_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 200. Spare Parts Consumption
export const assetSparePartsConsumption = pgTable('asset_spare_parts_consumption', {
  id: text('id').primaryKey(),
  workOrderId: text('work_order_id').notNull(),
  partCode: text('part_code').notNull(),
  partName: text('part_name').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unitOfMeasure: text('unit_of_measure').notNull().default('PCS'),
  unitCost: doublePrecision('unit_cost').notNull(),
  totalCost: doublePrecision('total_cost').notNull(),
  issuedByWarehouseId: text('issued_by_warehouse_id'),
  consumedDate: text('consumed_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 201. Asset Calibrations
export const assetCalibrations = pgTable('asset_calibrations', {
  id: text('id').primaryKey(),
  calibrationNumber: text('calibration_number').notNull().unique(), // CAL-2026-XXXX
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name').notNull(),
  calibrationDate: text('calibration_date').notNull(),
  dueDate: text('due_date').notNull(),
  certifiedVendorName: text('certified_vendor_name').notNull(),
  certificateNo: text('certificate_no').notNull(),
  accuracyRange: text('accuracy_range'),
  resultStatus: text('result_status').notNull().default('PASSED'), // PASSED, FAILED, ADJUSTED
  nextCalibrationDate: text('next_calibration_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 202. Fuel Logs
export const assetFuelLogs = pgTable('asset_fuel_logs', {
  id: text('id').primaryKey(),
  logNumber: text('log_number').notNull().unique(), // FUL-2026-XXXX
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name').notNull(),
  fuelType: text('fuel_type').notNull().default('DIESEL'), // DIESEL, PETROL, ELECTRIC, HYBRID
  quantityLiters: doublePrecision('quantity_liters').notNull(),
  pricePerLiter: doublePrecision('price_per_liter').notNull(),
  totalAmount: doublePrecision('total_amount').notNull(),
  odometerReading: doublePrecision('odometer_reading'),
  runningHourReading: doublePrecision('running_hour_reading'),
  fuelStationVendor: text('fuel_station_vendor').notNull(),
  driverOrOperatorName: text('driver_or_operator_name').notNull(),
  logDate: text('log_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 203. Asset Depreciations
export const assetDepreciations = pgTable('asset_depreciations', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  fiscalYear: text('fiscal_year').notNull(), // e.g., FY2026
  openingBookValue: doublePrecision('opening_book_value').notNull(),
  depreciationAmount: doublePrecision('depreciation_amount').notNull(),
  closingBookValue: doublePrecision('closing_book_value').notNull(),
  depreciationRatePercent: doublePrecision('depreciation_rate_percent').notNull(),
  methodUsed: text('method_used').notNull().default('STRAIGHT_LINE'),
  postedToFinance: boolean('posted_to_finance').default(false).notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// 204. Asset Audits & Physical Verification
export const assetAudits = pgTable('asset_audits', {
  id: text('id').primaryKey(),
  auditNumber: text('audit_number').notNull().unique(), // AUD-2026-XXXX
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name').notNull(),
  auditedBy: text('audited_by').notNull(),
  auditDate: text('audit_date').notNull(),
  physicalCondition: text('physical_condition').notNull().default('GOOD'), // EXCELLENT, GOOD, FAIR, DAMAGED, MISSING
  locationVerified: boolean('location_verified').default(true).notNull(),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ==========================================
// PHASE 59: ENTERPRISE FLEET, VEHICLE & TRANSPORT MANAGEMENT
// ==========================================

// 205. Fleet Vehicles Master
export const phase59FleetVehicles = pgTable('phase59_fleet_vehicles', {
  id: text('id').primaryKey(),
  vehicleNumber: text('vehicle_number').notNull().unique(), // e.g. DXB-FLT-1029
  assetNumber: text('asset_number').notNull(),
  qrCode: text('qr_code'),
  category: text('category').notNull().default('HEAVY_COMMERCIAL'), // HEAVY_COMMERCIAL, LIGHT_COMMERCIAL, PASSENGER, SPECIAL_PURPOSE
  vehicleType: text('vehicle_type').notNull().default('TRUCK'), // TRUCK, BUS, PICKUP, VAN, TRAILER, TANKER, CAR, CRANE
  department: text('department').notNull().default('LOGISTICS'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  currentSite: text('current_site').notNull().default('Main Depot'),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  vin: text('vin').notNull().unique(),
  engineNumber: text('engine_number').notNull(),
  chassisNumber: text('chassis_number').notNull(),
  year: integer('year').notNull().default(2025),
  purchaseDate: text('purchase_date').notNull(),
  purchaseCost: doublePrecision('purchase_cost').notNull().default(0),
  currentValue: doublePrecision('current_value').notNull().default(0),
  fuelType: text('fuel_type').notNull().default('DIESEL'), // DIESEL, PETROL, ELECTRIC, HYBRID
  fuelTankCapacity: doublePrecision('fuel_tank_capacity').notNull().default(200),
  mileageKmPerL: doublePrecision('mileage_km_per_l').notNull().default(5.5),
  engineHours: doublePrecision('engine_hours').notNull().default(0),
  odometerKm: doublePrecision('odometer_km').notNull().default(0),
  status: text('status').notNull().default('AVAILABLE'), // AVAILABLE, ON_TRIP, IN_MAINTENANCE, RESERVED, DECOMMISSIONED
  assignedDriverId: text('assigned_driver_id'),
  assignedDriverName: text('assigned_driver_name'),
  gpsDeviceId: text('gps_device_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
});

// 206. Fleet Drivers
export const phase59FleetDrivers = pgTable('phase59_fleet_drivers', {
  id: text('id').primaryKey(),
  driverCode: text('driver_code').notNull().unique(), // DRV-2026-XXXX
  employeeId: text('employee_id'),
  fullName: text('full_name').notNull(),
  phone: text('phone').notNull(),
  licenseNumber: text('license_number').notNull().unique(),
  licenseCategory: text('license_category').notNull().default('HEAVY_VEHICLE'),
  licenseExpiry: text('license_expiry').notNull(),
  badgeNumber: text('badge_number'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, ON_TRIP, ON_LEAVE, SUSPENDED
  rating: doublePrecision('rating').notNull().default(4.8),
  safetyViolationsCount: integer('safety_violations_count').notNull().default(0),
  assignedVehicleId: text('assigned_vehicle_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 207. Fleet Trips
export const phase59FleetTrips = pgTable('phase59_fleet_trips', {
  id: text('id').primaryKey(),
  tripNumber: text('trip_number').notNull().unique(), // TRIP-2026-XXXX
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number').notNull(),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  purpose: text('purpose').notNull(),
  originLocation: text('origin_location').notNull(),
  destinationLocation: text('destination_location').notNull(),
  plannedDepartureDate: text('planned_departure_date').notNull(),
  plannedArrivalDate: text('planned_arrival_date').notNull(),
  actualDepartureDate: text('actual_departure_date'),
  actualArrivalDate: text('actual_arrival_date'),
  startOdometerKm: doublePrecision('start_odometer_km').notNull().default(0),
  endOdometerKm: doublePrecision('end_odometer_km'),
  distanceKm: doublePrecision('distance_km').notNull().default(0),
  fuelConsumedLiters: doublePrecision('fuel_consumed_liters').notNull().default(0),
  tripCost: doublePrecision('trip_cost').notNull().default(0),
  status: text('status').notNull().default('PLANNED'), // PLANNED, APPROVED, DISPATCHED, IN_TRANSIT, COMPLETED, CANCELLED
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 208. Fleet Fuel Logs
export const phase59FleetFuelLogs = pgTable('phase59_fleet_fuel_logs', {
  id: text('id').primaryKey(),
  fuelLogNumber: text('fuel_log_number').notNull().unique(), // FFL-2026-XXXX
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number').notNull(),
  driverName: text('driver_name').notNull(),
  fuelStation: text('fuel_station').notNull(),
  fuelType: text('fuel_type').notNull().default('DIESEL'),
  quantityLiters: doublePrecision('quantity_liters').notNull(),
  costPerLiter: doublePrecision('cost_per_liter').notNull(),
  totalCost: doublePrecision('total_cost').notNull(),
  odometerKm: doublePrecision('odometer_km').notNull(),
  fillDate: text('fill_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 209. Fleet Maintenance & Repairs
export const phase59FleetMaintenance = pgTable('phase59_fleet_maintenance', {
  id: text('id').primaryKey(),
  maintenanceNumber: text('maintenance_number').notNull().unique(), // FMT-2026-XXXX
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number').notNull(),
  maintenanceType: text('maintenance_type').notNull().default('PREVENTIVE'), // PREVENTIVE, CORRECTIVE, BREAKDOWN, ACCIDENT_REPAIR
  summary: text('summary').notNull(),
  serviceVendor: text('service_vendor').notNull(),
  cost: doublePrecision('cost').notNull().default(0),
  downtimeHours: doublePrecision('downtime_hours').notNull().default(0),
  startDate: text('start_date').notNull(),
  completionDate: text('completion_date'),
  status: text('status').notNull().default('SCHEDULED'), // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 210. Fleet Accidents & Incidents
export const phase59FleetAccidents = pgTable('phase59_fleet_accidents', {
  id: text('id').primaryKey(),
  accidentNumber: text('accident_number').notNull().unique(), // ACC-2026-XXXX
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number').notNull(),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name').notNull(),
  incidentDate: text('incident_date').notNull(),
  location: text('location').notNull(),
  severity: text('severity').notNull().default('MINOR'), // MINOR, MODERATE, SEVERE, TOTAL_LOSS
  description: text('description').notNull(),
  estimatedRepairCost: doublePrecision('estimated_repair_cost').notNull().default(0),
  insuranceClaimed: boolean('insurance_claimed').notNull().default(false),
  claimNumber: text('claim_number'),
  status: text('status').notNull().default('REPORTED'), // REPORTED, UNDER_INVESTIGATION, REPAIR_PENDING, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 211. Fleet Permits & Compliance Documents
export const phase59FleetDocuments = pgTable('phase59_fleet_documents', {
  id: text('id').primaryKey(),
  docNumber: text('doc_number').notNull().unique(), // DOC-2026-XXXX
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number').notNull(),
  docType: text('doc_type').notNull().default('INSURANCE'), // INSURANCE, FITNESS, PERMIT, POLLUTION, REGISTRATION
  policyOrCertNumber: text('policy_or_cert_number').notNull(),
  issuingAuthority: text('issuing_authority').notNull(),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  costAmount: doublePrecision('cost_amount').notNull().default(0),
  status: text('status').notNull().default('VALID'), // VALID, EXPIRING_SOON, EXPIRED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// =======================================================
// PHASE 60: ENTERPRISE FINANCE, ACCOUNTS & COST CONTROL ENGINE
// =======================================================

// 212. Chart of Accounts
export const phase60ChartOfAccounts = pgTable('phase60_chart_of_accounts', {
  id: text('id').primaryKey(),
  accountCode: text('account_code').notNull().unique(), // e.g. 1010, 2010, 4010, 5010
  accountName: text('account_name').notNull(),
  accountGroup: text('account_group').notNull(), // ASSETS, LIABILITIES, EQUITY, REVENUE, EXPENSES
  accountType: text('account_type').notNull(), // CURRENT_ASSET, FIXED_ASSET, CURRENT_LIABILITY, DIRECT_EXPENSE, OPERATING_REVENUE, etc.
  parentAccountId: text('parent_account_id'),
  isHeaderAccount: boolean('is_header_account').notNull().default(false),
  currency: text('currency').notNull().default('USD'),
  currentBalance: doublePrecision('current_balance').notNull().default(0),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, LOCKED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 213. Cost & Profit Centers
export const phase60CostCenters = pgTable('phase60_cost_centers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // CC-101, PC-201
  name: text('name').notNull(),
  centerType: text('center_type').notNull().default('COST_CENTER'), // COST_CENTER, PROFIT_CENTER
  department: text('department').notNull().default('CIVIL_WORKS'),
  managerName: text('manager_name').notNull().default('Financial Controller'),
  annualBudget: doublePrecision('annual_budget').notNull().default(0),
  utilizedAmount: doublePrecision('utilized_amount').notNull().default(0),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 214. Journal Entries
export const phase60JournalEntries = pgTable('phase60_journal_entries', {
  id: text('id').primaryKey(),
  voucherNumber: text('voucher_number').notNull().unique(), // JV-2026-XXXX
  voucherType: text('voucher_type').notNull().default('GENERAL_JOURNAL'), // GENERAL_JOURNAL, PAYMENT_VOUCHER, RECEIPT_VOUCHER, CONTRA_VOUCHER, ADJUSTMENT
  postingDate: text('posting_date').notNull(),
  referenceNumber: text('reference_number'),
  narration: text('narration').notNull(),
  totalDebit: doublePrecision('total_debit').notNull().default(0),
  totalCredit: doublePrecision('total_credit').notNull().default(0),
  status: text('status').notNull().default('POSTED'), // DRAFT, POSTED, REVERSED
  postedBy: text('posted_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
});

// 215. Journal Entry Lines
export const phase60JournalLines = pgTable('phase60_journal_lines', {
  id: text('id').primaryKey(),
  journalId: text('journal_id').notNull(),
  voucherNumber: text('voucher_number').notNull(),
  accountId: text('account_id').notNull(),
  accountCode: text('account_code').notNull(),
  accountName: text('account_name').notNull(),
  costCenterId: text('cost_center_id'),
  debitAmount: doublePrecision('debit_amount').notNull().default(0),
  creditAmount: doublePrecision('credit_amount').notNull().default(0),
  lineDescription: text('line_description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
});

// 216. General Ledger Transactions
export const phase60GeneralLedger = pgTable('phase60_general_ledger', {
  id: text('id').primaryKey(),
  glNumber: text('gl_number').notNull().unique(), // GL-2026-XXXX
  journalId: text('journal_id').notNull(),
  voucherNumber: text('voucher_number').notNull(),
  postingDate: text('posting_date').notNull(),
  accountId: text('account_id').notNull(),
  accountCode: text('account_code').notNull(),
  accountName: text('account_name').notNull(),
  debit: doublePrecision('debit').notNull().default(0),
  credit: doublePrecision('credit').notNull().default(0),
  runningBalance: doublePrecision('running_balance').notNull().default(0),
  narration: text('narration').notNull(),
  costCenterCode: text('cost_center_code'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
});

// 217. Accounts Payable Invoices
export const phase60APInvoices = pgTable('phase60_ap_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(), // AP-INV-2026-XXXX
  vendorId: text('vendor_id'),
  vendorName: text('vendor_name').notNull(),
  invoiceDate: text('invoice_date').notNull(),
  dueDate: text('due_date').notNull(),
  totalAmount: doublePrecision('total_amount').notNull().default(0),
  taxAmount: doublePrecision('tax_amount').notNull().default(0),
  paidAmount: doublePrecision('paid_amount').notNull().default(0),
  outstandingAmount: doublePrecision('outstanding_amount').notNull().default(0),
  status: text('status').notNull().default('UNPAID'), // UNPAID, PARTIALLY_PAID, PAID, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 218. Accounts Receivable Invoices
export const phase60ARInvoices = pgTable('phase60_ar_invoices', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(), // AR-INV-2026-XXXX
  customerId: text('customer_id'),
  customerName: text('customer_name').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  invoiceDate: text('invoice_date').notNull(),
  dueDate: text('due_date').notNull(),
  totalAmount: doublePrecision('total_amount').notNull().default(0),
  taxAmount: doublePrecision('tax_amount').notNull().default(0),
  receivedAmount: doublePrecision('received_amount').notNull().default(0),
  outstandingAmount: doublePrecision('outstanding_amount').notNull().default(0),
  status: text('status').notNull().default('UNPAID'), // UNPAID, PARTIALLY_PAID, PAID, OVERDUE
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 219. Bank Accounts
export const phase60BankAccounts = pgTable('phase60_bank_accounts', {
  id: text('id').primaryKey(),
  accountNumber: text('account_number').notNull().unique(),
  bankName: text('bank_name').notNull(),
  branchName: text('branch_name').notNull(),
  swiftCode: text('swift_code'),
  currency: text('currency').notNull().default('USD'),
  currentBalance: doublePrecision('current_balance').notNull().default(0),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 220. Cash & Bank Book Transactions
export const phase60CashTransactions = pgTable('phase60_cash_transactions', {
  id: text('id').primaryKey(),
  transactionNumber: text('transaction_number').notNull().unique(), // CB-2026-XXXX
  bankAccountId: text('bank_account_id'),
  transactionType: text('transaction_type').notNull(), // DEPOSIT, WITHDRAWAL, PETTY_CASH, BANK_TRANSFER
  amount: doublePrecision('amount').notNull().default(0),
  transactionDate: text('transaction_date').notNull(),
  payeeOrPayer: text('payee_or_payer').notNull(),
  description: text('description').notNull(),
  status: text('status').notNull().default('CLEARED'), // PENDING, CLEARED, RECONCILED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 221. Budget Masters & Control
export const phase60BudgetMasters = pgTable('phase60_budget_masters', {
  id: text('id').primaryKey(),
  budgetName: text('budget_name').notNull(),
  fiscalYear: text('fiscal_year').notNull().default('2026'),
  costCenterCode: text('cost_center_code').notNull(),
  allocatedBudget: doublePrecision('allocated_budget').notNull().default(0),
  consumedBudget: doublePrecision('consumed_budget').notNull().default(0),
  committedBudget: doublePrecision('committed_budget').notNull().default(0),
  remainingBudget: doublePrecision('remaining_budget').notNull().default(0),
  status: text('status').notNull().default('APPROVED'), // DRAFT, APPROVED, LOCKED, EXCEEDED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// 222. Tax & VAT Records
export const phase60TaxRecords = pgTable('phase60_tax_records', {
  id: text('id').primaryKey(),
  taxCode: text('tax_code').notNull().unique(), // VAT-5, TDS-10, GST-18
  taxName: text('tax_name').notNull(),
  taxType: text('tax_type').notNull().default('VAT'), // VAT, GST, TDS, TCS
  ratePercent: doublePrecision('rate_percent').notNull().default(5.0),
  isRecoverable: boolean('is_recoverable').notNull().default(true),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
});

// =======================================================
// PHASE 61: ENTERPRISE DOCUMENT MANAGEMENT SYSTEM (EDMS)
// =======================================================

// 223. Document Categories
export const phase61DocumentCategories = pgTable('phase61_document_categories', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // CAT-ENG, CAT-QA, CAT-HSE, CAT-LEGAL
  name: text('name').notNull(),
  description: text('description'),
  colorCode: text('color_code').default('#3b82f6'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 224. Document Folders (Unlimited Hierarchy)
export const phase61DocumentFolders = pgTable('phase61_document_folders', {
  id: text('id').primaryKey(),
  folderName: text('folder_name').notNull(),
  parentId: text('parent_id'), // null for root folders
  folderPath: text('folder_path').notNull().default('/'), // e.g., /Projects/Site-A/Drawings
  projectId: text('project_id'),
  department: text('department').default('Engineering'),
  isSystemFolder: boolean('is_system_folder').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 225. Document Files
export const phase61DocumentFiles = pgTable('phase61_document_files', {
  id: text('id').primaryKey(),
  documentNumber: text('document_number').notNull().unique(), // DOC-2026-00001
  title: text('title').notNull(),
  description: text('description'),
  folderId: text('folder_id').notNull(),
  categoryId: text('category_id'),
  fileType: text('file_type').notNull().default('PDF'), // DWG, PDF, DOCX, XLSX, PNG, MP4, etc.
  mimeType: text('mime_type').default('application/pdf'),
  fileSizeBytes: doublePrecision('file_size_bytes').notNull().default(0),
  fileUrl: text('file_url'),
  currentVersion: text('current_version').notNull().default('v1.0'),
  revisionNumber: integer('revision_number').notNull().default(1),
  
  // ERP Module Association
  projectId: text('project_id'),
  vendorId: text('vendor_id'),
  contractId: text('contract_id'),
  poId: text('po_id'),
  assetId: text('asset_id'),
  hrEmployeeId: text('hr_employee_id'),
  qaInspectionId: text('qa_inspection_id'),
  
  // Flags & Attributes
  isCheckedOut: boolean('is_checked_out').notNull().default(false),
  checkedOutBy: text('checked_out_by'),
  checkedOutAt: text('checked_out_at'),
  isFavorite: boolean('is_favorite').notNull().default(false),
  isArchived: boolean('is_archived').notNull().default(false),
  isLocked: boolean('is_locked').notNull().default(false),
  ocrTextContent: text('ocr_text_content'),
  
  // Workflow Status
  workflowStatus: text('workflow_status').notNull().default('DRAFT'), // DRAFT, SUBMITTED, UNDER_REVIEW, APPROVED, REJECTED, RETURNED, PUBLISHED, ARCHIVED
  digitalStampApplied: boolean('digital_stamp_applied').notNull().default(false),
  watermarkText: text('watermark_text'),
  qrCodeUrl: text('qr_code_url'),

  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 226. Document Versions
export const phase61DocumentVersions = pgTable('phase61_document_versions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  versionName: text('version_name').notNull(), // v1.0, v1.1, v2.0
  revisionNumber: integer('revision_number').notNull().default(1),
  fileUrl: text('file_url').notNull(),
  fileSizeBytes: doublePrecision('file_size_bytes').notNull().default(0),
  changeSummary: text('change_summary'),
  uploadedBy: text('uploaded_by').notNull().default('System Administrator'),
  isMajorVersion: boolean('is_major_version').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 227. Document Metadata
export const phase61DocumentMetadata = pgTable('phase61_document_metadata', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  metaKey: text('meta_key').notNull(), // DrawingNumber, Scale, Author, SpecCode
  metaValue: text('meta_value').notNull(),
  dataType: text('data_type').notNull().default('STRING'), // STRING, NUMBER, DATE, BOOLEAN
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 228. Document Tags
export const phase61DocumentTags = pgTable('phase61_document_tags', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  tagName: text('tag_name').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 229. Folder Permissions
export const phase61FolderPermissions = pgTable('phase61_folder_permissions', {
  id: text('id').primaryKey(),
  folderId: text('folder_id').notNull(),
  role: text('role').notNull(), // ADMIN, MANAGER, INCHARGE, SUPERVISOR, STORE_KEEPER, OPERATOR, DRIVER, WORKER
  canView: boolean('can_view').notNull().default(true),
  canUpload: boolean('can_upload').notNull().default(false),
  canEdit: boolean('can_edit').notNull().default(false),
  canDelete: boolean('can_delete').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 230. Document Permissions
export const phase61DocumentPermissions = pgTable('phase61_document_permissions', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  role: text('role').notNull(), // ADMIN, MANAGER, INCHARGE, etc.
  canView: boolean('can_view').notNull().default(true),
  canDownload: boolean('can_download').notNull().default(true),
  canEdit: boolean('can_edit').notNull().default(false),
  canApprove: boolean('can_approve').notNull().default(false),
  canDelete: boolean('can_delete').notNull().default(false),
  canShare: boolean('can_share').notNull().default(false),
  canArchive: boolean('can_archive').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 231. Document Checkouts
export const phase61DocumentCheckouts = pgTable('phase61_document_checkouts', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  checkedOutBy: text('checked_out_by').notNull(),
  checkedOutAt: text('checked_out_at').notNull(),
  expectedCheckInDate: text('expected_check_in_date'),
  checkoutNotes: text('checkout_notes'),
  isCheckedIn: boolean('is_checked_in').notNull().default(false),
  checkedInAt: text('checked_in_at'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 232. Document Reviews
export const phase61DocumentReviews = pgTable('phase61_document_reviews', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  reviewerName: text('reviewer_name').notNull(),
  reviewRole: text('review_role').notNull().default('INSPECTING_ENGINEER'),
  comments: text('comments').notNull(),
  reviewOutcome: text('review_outcome').notNull().default('RECOMMENDED'), // RECOMMENDED, CHANGES_REQUESTED, REJECTED
  reviewDate: text('review_date').notNull(),
  status: text('status').notNull().default('COMPLETED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 233. Document Approvals
export const phase61DocumentApprovals = pgTable('phase61_document_approvals', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  approverName: text('approver_name').notNull(),
  approvalRole: text('approval_role').notNull().default('PROJECT_MANAGER'),
  approvalStage: text('approval_stage').notNull().default('FINAL_APPROVAL'),
  decision: text('decision').notNull().default('APPROVED'), // APPROVED, REJECTED, RETURNED
  remarks: text('remarks'),
  approvalDate: text('approval_date').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 234. Document Workflows
export const phase61DocumentWorkflows = pgTable('phase61_document_workflows', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  workflowName: text('workflow_name').notNull(), // Standard Engineering Review Workflow
  currentStage: text('current_stage').notNull().default('UNDER_REVIEW'), // DRAFT, UNDER_REVIEW, APPROVED, PUBLISHED
  assignedToRole: text('assigned_to_role').default('MANAGER'),
  dueDate: text('due_date'),
  status: text('status').notNull().default('IN_PROGRESS'), // IN_PROGRESS, COMPLETED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 235. Document Comments
export const phase61DocumentComments = pgTable('phase61_document_comments', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  authorName: text('author_name').notNull(),
  commentText: text('comment_text').notNull(),
  pageNumber: integer('page_number'),
  annotationCoordinates: text('annotation_coordinates'), // JSON x,y coordinates if applicable
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 236. Document Attachments
export const phase61DocumentAttachments = pgTable('phase61_document_attachments', {
  id: text('id').primaryKey(),
  parentDocumentId: text('parent_document_id').notNull(),
  attachmentTitle: text('attachment_title').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSizeBytes: doublePrecision('file_size_bytes').notNull().default(0),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 237. Document Links (Cross References)
export const phase61DocumentLinks = pgTable('phase61_document_links', {
  id: text('id').primaryKey(),
  sourceDocumentId: text('source_document_id').notNull(),
  targetDocumentId: text('target_document_id').notNull(),
  linkType: text('link_type').notNull().default('REFERENCES'), // REFERENCES, SUPERSEDES, ATTACHED_TO, AMENDS
  notes: text('notes'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 238. Document Download Logs
export const phase61DocumentDownloadLogs = pgTable('phase61_document_download_logs', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  downloadedBy: text('downloaded_by').notNull(),
  ipAddress: text('ip_address'),
  downloadDate: text('download_date').notNull(),
  status: text('status').notNull().default('SUCCESS'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 239. Document Access Logs
export const phase61DocumentAccessLogs = pgTable('phase61_document_access_logs', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  accessedBy: text('accessed_by').notNull(),
  actionType: text('action_type').notNull().default('VIEW'), // VIEW, PREVIEW, SEARCH_HIT
  accessDate: text('access_date').notNull(),
  status: text('status').notNull().default('SUCCESS'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 240. Document Audit Logs
export const phase61DocumentAuditLogs = pgTable('phase61_document_audit_logs', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  actorName: text('actor_name').notNull(),
  actionExecuted: text('action_executed').notNull(), // CREATE, EDIT, VERSION_UPLOAD, APPROVE, CHECKOUT, SHARE, ARCHIVE, DELETE
  detailsJson: text('details_json'),
  timestamp: text('timestamp').notNull(),
  status: text('status').notNull().default('LOGGED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 241. Document Expiry & Retention Monitoring
export const phase61DocumentExpiry = pgTable('phase61_document_expiry', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  expiryDate: text('expiry_date').notNull(),
  reminderDaysBefore: integer('reminder_days_before').notNull().default(30),
  isExpired: boolean('is_expired').notNull().default(false),
  renewedAt: text('renewed_at'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, EXPIRED, RENEWED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 242. Document Archive Management
export const phase61DocumentArchive = pgTable('phase61_document_archive', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  archiveReason: text('archive_reason').notNull().default('PROJECT_COMPLETED'),
  archivedBy: text('archived_by').notNull(),
  archivedAt: text('archived_at').notNull(),
  retentionUntilDate: text('retention_until_date'),
  isRestored: boolean('is_restored').notNull().default(false),
  restoredAt: text('restored_at'),
  status: text('status').notNull().default('ARCHIVED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 243. Document Templates
export const phase61DocumentTemplates = pgTable('phase61_document_templates', {
  id: text('id').primaryKey(),
  templateName: text('template_name').notNull(),
  category: text('category').notNull().default('SAFETY'), // SAFETY, QA, PERMIT, METHOD_STATEMENT
  templateUrl: text('template_url').notNull(),
  description: text('description'),
  version: text('version').notNull().default('v1.0'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 244. Document Shares (External & Internal)
export const phase61DocumentShares = pgTable('phase61_document_shares', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  shareToken: text('share_token').notNull().unique(),
  sharedWithEmail: text('shared_with_email'),
  recipientName: text('recipient_name'),
  permissionLevel: text('permission_level').notNull().default('READ_ONLY'), // READ_ONLY, DOWNLOAD, COMMENT
  expiryDate: text('expiry_date'),
  passwordProtected: boolean('password_protected').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 245. Document Notifications
export const phase61DocumentNotifications = pgTable('phase61_document_notifications', {
  id: text('id').primaryKey(),
  documentId: text('document_id').notNull(),
  recipientUser: text('recipient_user').notNull(),
  notificationType: text('notification_type').notNull().default('APPROVAL_REQUEST'), // APPROVAL_REQUEST, REVISION_UPLOADED, CHECKOUT_ALERT, EXPIRY_WARNING
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  status: text('status').notNull().default('PENDING'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ====================================================
// PHASE 62: ENTERPRISE QA/QC MANAGEMENT SYSTEM (246-263)
// ====================================================

// 246. ITP Masters (Inspection & Test Plans)
export const phase62ItpMasters = pgTable('phase62_itp_masters', {
  id: text('id').primaryKey(),
  itpNumber: text('itp_number').notNull(),
  title: text('title').notNull(),
  discipline: text('discipline').notNull().default('MECHANICAL'), // MECHANICAL, CIVIL, ELECTRICAL, PIPELINE, WATER_TREATMENT, HVAC
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  revisionNumber: text('revision_number').notNull().default('R0'),
  standardReference: text('standard_reference'), // ISO 9001, ASME B31.3, KWA Spec 2026, AWS D1.1
  status: text('status').notNull().default('DRAFT'), // DRAFT, UNDER_REVIEW, APPROVED, SUPERSEDED
  preparedBy: text('prepared_by').notNull(),
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 247. ITP Checklists (Inspection Test Points)
export const phase62ItpChecklists = pgTable('phase62_itp_checklists', {
  id: text('id').primaryKey(),
  itpId: text('itp_id').notNull(),
  itemNumber: integer('item_number').notNull().default(1),
  activityDescription: text('activity_description').notNull(),
  referenceDoc: text('reference_doc'), // Approved Drawing / Specification
  acceptanceCriteria: text('acceptance_criteria').notNull(),
  inspectionType: text('inspection_type').notNull().default('HOLD_POINT'), // HOLD_POINT, WITNESS_POINT, SURVEILLANCE, DOCUMENT_REVIEW
  contractorCheck: boolean('contractor_check').notNull().default(true),
  consultantCheck: boolean('consultant_check').notNull().default(true),
  clientCheck: boolean('client_check').notNull().default(true),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 248. Inspections (Main Request & Report)
export const phase62Inspections = pgTable('phase62_inspections', {
  id: text('id').primaryKey(),
  inspectionNumber: text('inspection_number').notNull(), // INS-2026-XXXX
  itpId: text('itp_id'),
  title: text('title').notNull(),
  discipline: text('discipline').notNull().default('MECHANICAL'),
  inspectionType: text('inspection_type').notNull().default('SITE_INSPECTION'), // SITE_INSPECTION, MATERIAL_RECEIVING, WELDING, PRESSURE_TEST, HYDRO_TEST, PUNCH_LIST
  projectId: text('project_id').notNull(),
  location: text('location').notNull(),
  requestedDate: text('requested_date').notNull(),
  inspectionDate: text('inspection_date'),
  inspectorName: text('inspector_name'),
  clientRepresentative: text('client_representative'),
  result: text('result').notNull().default('PENDING'), // PENDING, PASSED, PASSED_WITH_COMMENTS, REJECTED, RE_INSPECTION_REQUIRED
  status: text('status').notNull().default('SUBMITTED'), // DRAFT, SUBMITTED, IN_PROGRESS, COMPLETED, CLOSED
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 249. Inspection Items
export const phase62InspectionItems = pgTable('phase62_inspection_items', {
  id: text('id').primaryKey(),
  inspectionId: text('inspection_id').notNull(),
  checkPoint: text('check_point').notNull(),
  acceptanceCriteria: text('acceptance_criteria').notNull(),
  observedResult: text('observed_result'),
  status: text('status').notNull().default('PASS'), // PASS, FAIL, NA, REFERRED
  comments: text('comments'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 250. NCR (Non-Conformance Reports)
export const phase62Ncr = pgTable('phase62_ncr', {
  id: text('id').primaryKey(),
  ncrNumber: text('ncr_number').notNull(), // NCR-2026-XXXX
  inspectionId: text('inspection_id'),
  projectId: text('project_id').notNull(),
  title: text('title').notNull(),
  severity: text('severity').notNull().default('MAJOR'), // MINOR, MAJOR, CRITICAL
  description: text('description').notNull(),
  location: text('location').notNull(),
  issuedTo: text('issued_to').notNull(), // Subcontractor / Dept
  issuedBy: text('issued_by').notNull(), // QA/QC Inspector
  issueDate: text('issue_date').notNull(),
  targetCloseDate: text('target_close_date').notNull(),
  actualCloseDate: text('actual_close_date'),
  rootCause: text('root_cause'),
  disposition: text('disposition').default('REWORK'), // REWORK, REPAIR, USE_AS_IS, REJECT_REPLACE
  status: text('status').notNull().default('OPEN'), // OPEN, UNDER_REVIEW, CAPA_PENDING, CLOSED, REJECTED
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 251. Corrective Actions (CAPA - CA)
export const phase62CorrectiveActions = pgTable('phase62_corrective_actions', {
  id: text('id').primaryKey(),
  capaNumber: text('capa_number').notNull(), // CAPA-2026-XXXX
  ncrId: text('ncr_id').notNull(),
  actionPlan: text('action_plan').notNull(),
  assignedTo: text('assigned_to').notNull(),
  dueDate: text('due_date').notNull(),
  completionDate: text('completion_date'),
  verificationStatus: text('verification_status').notNull().default('PENDING'), // PENDING, VERIFIED, REJECTED
  verifiedBy: text('verified_by'),
  status: text('status').notNull().default('IN_PROGRESS'), // OPEN, IN_PROGRESS, COMPLETED, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 252. Preventive Actions (CAPA - PA)
export const phase62PreventiveActions = pgTable('phase62_preventive_actions', {
  id: text('id').primaryKey(),
  preventiveActionNumber: text('preventive_action_number').notNull(),
  ncrId: text('ncr_id'),
  riskCategory: text('risk_category').notNull().default('PROCESS_FAILURE'),
  preventiveMeasure: text('preventive_measure').notNull(),
  responsiblePerson: text('responsible_person').notNull(),
  implementationDate: text('implementation_date').notNull(),
  reviewFrequency: text('review_frequency').notNull().default('MONTHLY'), // WEEKLY, MONTHLY, QUARTERLY
  effectivenessCheck: text('effectiveness_check'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, VERIFIED, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 253. Material Inspections (MIR)
export const phase62MaterialInspections = pgTable('phase62_material_inspections', {
  id: text('id').primaryKey(),
  mirNumber: text('mir_number').notNull(), // MIR-2026-XXXX
  materialName: text('material_name').notNull(),
  supplierName: text('supplier_name').notNull(),
  poNumber: text('po_number'),
  deliveryNoteNumber: text('delivery_note_number'),
  quantityReceived: doublePrecision('quantity_received').notNull().default(0),
  unitOfMeasure: text('unit_of_measure').notNull().default('Pcs'),
  heatNumberCertRef: text('heat_number_cert_ref'), // Mill Test Certificate Ref
  inspectionDate: text('inspection_date').notNull(),
  visualCheck: text('visual_check').notNull().default('PASS'), // PASS, FAIL
  dimensionalCheck: text('dimensional_check').notNull().default('PASS'), // PASS, FAIL
  certVerification: text('cert_verification').notNull().default('VERIFIED'), // VERIFIED, PENDING, REJECTED
  result: text('result').notNull().default('ACCEPTED'), // ACCEPTED, CONDITIONAL_ACCEPTANCE, REJECTED
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 254. Site Tests (Compaction, Concrete Slump/Cube, NDT, Water Quality)
export const phase62SiteTests = pgTable('phase62_site_tests', {
  id: text('id').primaryKey(),
  testNumber: text('test_number').notNull(), // TST-2026-XXXX
  testType: text('test_type').notNull().default('CONCRETE_CUBE'), // CONCRETE_CUBE, COMPACTION, WATER_ANALYSIS, SOIL_BEARING, COATING_THICKNESS
  locationChainage: text('location_chainage').notNull(),
  testedByLab: text('tested_by_lab').notNull().default('Site QA Lab'),
  sampleDate: text('sample_date').notNull(),
  testDate: text('test_date').notNull(),
  requiredValue: text('required_value').notNull(), // e.g. "M30 Grade - 30 N/mm2"
  obtainedValue: text('obtained_value').notNull(), // e.g. "34.2 N/mm2"
  result: text('result').notNull().default('PASS'), // PASS, FAIL, RE_TEST_REQUIRED
  witnessedBy: text('witnessed_by'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 255. Welding Inspections (Visual, Fit-up, NDT, Radiography, Ultrasonic)
export const phase62WeldingInspections = pgTable('phase62_welding_inspections', {
  id: text('id').primaryKey(),
  reportNumber: text('report_number').notNull(), // WLD-2026-XXXX
  jointNumber: text('joint_number').notNull(), // J-101, J-102
  welderId: text('welder_id').notNull(), // W-809
  pipeDiameterInch: doublePrecision('pipe_diameter_inch').default(12),
  pipeMaterial: text('pipe_material').notNull().default('Carbon Steel A106 Gr B'),
  wpsNumber: text('wps_number').notNull().default('WPS-MECH-001'), // Welding Procedure Specification
  fitupStatus: text('fitup_status').notNull().default('ACCEPTED'), // ACCEPTED, REJECTED
  visualStatus: text('visual_status').notNull().default('ACCEPTED'), // ACCEPTED, REJECTED
  ndtMethod: text('ndt_method').notNull().default('RADIOGRAPHY_RT'), // RADIOGRAPHY_RT, ULTRASONIC_UT, MAGNETIC_MT, DYE_PENETRANT_PT
  ndtResult: text('ndt_result').notNull().default('PASS'), // PASS, REPAIR_REQUIRED, REJECT
  repairCount: integer('repair_count').notNull().default(0),
  inspectorSignature: text('inspector_signature'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 256. Hydro Tests (Hydrostatic Pipe / Tank Testing)
export const phase62HydroTests = pgTable('phase62_hydro_tests', {
  id: text('id').primaryKey(),
  testPackageNumber: text('test_package_number').notNull(), // HYD-2026-XXXX
  lineOrTankNumber: text('line_or_tank_number').notNull(), // Line 14-PL-201
  testMedium: text('test_medium').notNull().default('POTABLE_WATER'), // POTABLE_WATER, TREATED_WATER
  designPressureBar: doublePrecision('design_pressure_bar').notNull().default(10),
  testPressureBar: doublePrecision('test_pressure_bar').notNull().default(15),
  testDurationHours: doublePrecision('test_duration_hours').notNull().default(24),
  holdingTimeMinutes: integer('holding_time_minutes').notNull().default(120),
  pressureDropObservedBar: doublePrecision('pressure_drop_observed_bar').notNull().default(0.0),
  allowableDropBar: doublePrecision('allowable_drop_bar').notNull().default(0.2),
  result: text('result').notNull().default('PASS'), // PASS, FAIL
  kwaWitnessName: text('kwa_witness_name'), // Kerala Water Authority Inspector
  consultantWitnessName: text('consultant_witness_name'),
  status: text('status').notNull().default('APPROVED'), // DRAFT, IN_PROGRESS, APPROVED, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 257. Pressure Tests (Pneumatic / Air Testing)
export const phase62PressureTests = pgTable('phase62_pressure_tests', {
  id: text('id').primaryKey(),
  testNumber: text('test_number').notNull(), // PRT-2026-XXXX
  equipmentPipelineRef: text('equipment_pipeline_ref').notNull(),
  testMedium: text('test_medium').notNull().default('COMPRESSED_AIR'), // COMPRESSED_AIR, NITROGEN
  testPressureBar: doublePrecision('test_pressure_bar').notNull().default(3.5),
  gaugeCalibCertRef: text('gauge_calib_cert_ref').notNull().default('CAL-2026-881'),
  startPressureBar: doublePrecision('start_pressure_bar').notNull().default(3.5),
  endPressureBar: doublePrecision('end_pressure_bar').notNull().default(3.5),
  result: text('result').notNull().default('PASS'), // PASS, FAIL
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 258. Punch Lists (Subsystem Pre-Commissioning Defect List)
export const phase62PunchLists = pgTable('phase62_punch_lists', {
  id: text('id').primaryKey(),
  punchNumber: text('punch_number').notNull(), // PCH-2026-XXXX
  subsystemRef: text('subsystem_ref').notNull(), // Clear Water Pump House #1
  category: text('category').notNull().default('CATEGORY_B'), // CATEGORY_A (Must fix before hydro/start), CATEGORY_B (Fix before hand over), CATEGORY_C (Minor)
  description: text('description').notNull(),
  location: text('location').notNull(),
  assignedContractor: text('assigned_contractor').notNull(),
  targetDate: text('target_date').notNull(),
  completionDate: text('completion_date'),
  clearedByInspector: text('cleared_by_inspector'),
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, CLEARED, VERIFIED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 259. Snag Lists (Civil & Architectural Site Snags)
export const phase62SnagLists = pgTable('phase62_snag_lists', {
  id: text('id').primaryKey(),
  snagNumber: text('snag_number').notNull(), // SNG-2026-XXXX
  buildingZone: text('building_zone').notNull(), // Filter House Floor 2
  snagDetail: text('snag_detail').notNull(),
  severity: text('severity').notNull().default('LOW'), // LOW, MEDIUM, HIGH
  trade: text('trade').notNull().default('CIVIL'), // CIVIL, PAINTING, PIPING, ELECTRICAL, TILING
  rectifiedBy: text('rectified_by'),
  rectificationDate: text('rectification_date'),
  status: text('status').notNull().default('PENDING'), // PENDING, RECTIFIED, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 260. Quality Documents (Quality Plan, ITPs, Method Statements)
export const phase62QualityDocuments = pgTable('phase62_quality_documents', {
  id: text('id').primaryKey(),
  documentCode: text('document_code').notNull(), // QDOC-2026-XXXX
  title: text('title').notNull(),
  category: text('category').notNull().default('METHOD_STATEMENT'), // QUALITY_MANUAL, METHOD_STATEMENT, TEST_PROCEDURE, MILL_CERT
  revision: text('revision').notNull().default('R0'),
  fileUrl: text('file_url'),
  approvalStatus: text('approval_status').notNull().default('APPROVED'), // DRAFT, SUBMITTED, APPROVED, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 261. Quality Approvals (Multi-stage sign-off records)
export const phase62QualityApprovals = pgTable('phase62_quality_approvals', {
  id: text('id').primaryKey(),
  referenceType: text('reference_type').notNull(), // INSPECTION, NCR, ITP, HYDRO_TEST, MIR
  referenceId: text('reference_id').notNull(),
  approvalStage: text('approval_stage').notNull().default('INSPECTOR'), // INSPECTOR, QAQC_MANAGER, CONSULTANT, CLIENT
  approverUser: text('approver_user').notNull(),
  decision: text('decision').notNull().default('APPROVED'), // APPROVED, REJECTED, CONDITIONAL
  comments: text('comments'),
  signedAt: text('signed_at').notNull(),
  digitalStampRef: text('digital_stamp_ref'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 262. Quality Logs (Audit Trail)
export const phase62QualityLogs = pgTable('phase62_quality_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(), // INSPECTION_CREATED, NCR_ISSUED, HYDRO_TEST_PASSED, CAPA_VERIFIED
  module: text('module').notNull().default('QAQC'),
  entityId: text('entity_id').notNull(),
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 263. Quality Notifications
export const phase62QualityNotifications = pgTable('phase62_quality_notifications', {
  id: text('id').primaryKey(),
  recipientUser: text('recipient_user').notNull(),
  notificationType: text('notification_type').notNull().default('INSPECTION_REQUEST'), // INSPECTION_REQUEST, NCR_ALERT, CAPA_DUE, PUNCH_LIST_CLEARANCE
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ==========================================
// PHASE 63: ENTERPRISE HSE (HEALTH, SAFETY & ENVIRONMENT) MANAGEMENT SYSTEM
// ==========================================

// 264. Incident Management Register
export const phase63Incidents = pgTable('phase63_incidents', {
  id: text('id').primaryKey(),
  incidentNumber: text('incident_number').notNull(), // INC-2026-XXXX
  title: text('title').notNull(),
  incidentType: text('incident_type').notNull().default('FIRST_AID'), // FIRST_AID, MEDICAL_TREATMENT, LOST_TIME, FATALITY, PROPERTY_DAMAGE, ENVIRONMENTAL
  severity: text('severity').notNull().default('LOW'), // LOW, MEDIUM, HIGH, CRITICAL
  location: text('location').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  incidentDate: text('incident_date').notNull(),
  injuredPersonName: text('injured_person_name'),
  injuredPersonRole: text('injured_person_role'),
  description: text('description').notNull(),
  immediateAction: text('immediate_action'),
  rootCause: text('root_cause'),
  correctiveAction: text('corrective_action'),
  preventiveAction: text('preventive_action'),
  status: text('status').notNull().default('REPORTED'), // REPORTED, UNDER_INVESTIGATION, CAPA_PENDING, CLOSED
  investigatorName: text('investigator_name'),
  reportedBy: text('reported_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 265. Near Miss Reporting
export const phase63NearMiss = pgTable('phase63_near_miss', {
  id: text('id').primaryKey(),
  nearMissNumber: text('near_miss_number').notNull(), // NM-2026-XXXX
  title: text('title').notNull(),
  category: text('category').notNull().default('UNSAFE_ACT'), // UNSAFE_ACT, UNSAFE_CONDITION, EQUIPMENT_FAILURE, WEATHER_HAZARD
  location: text('location').notNull(),
  reportedDate: text('reported_date').notNull(),
  potentialSeverity: text('potential_severity').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, FATAL
  description: text('description').notNull(),
  preventiveAction: text('preventive_action'),
  status: text('status').notNull().default('OPEN'), // OPEN, IN_REVIEW, ACTION_TAKEN, CLOSED
  reportedBy: text('reported_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 266. Hazard Identification & Reporting
export const phase63HazardReports = pgTable('phase63_hazard_reports', {
  id: text('id').primaryKey(),
  hazardNumber: text('hazard_number').notNull(), // HAZ-2026-XXXX
  location: text('location').notNull(),
  hazardType: text('hazard_type').notNull().default('PHYSICAL'), // PHYSICAL, CHEMICAL, ELECTRICAL, ERGONOMIC, BIOLOGICAL, SLIP_TRIP_FALL
  riskLevel: text('risk_level').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, EXTREME
  description: text('description').notNull(),
  recommendedAction: text('recommended_action'),
  assignedTo: text('assigned_to'),
  dueDate: text('due_date'),
  status: text('status').notNull().default('IDENTIFIED'), // IDENTIFIED, MITIGATING, RESOLVED, CLOSED
  reportedBy: text('reported_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 267. Risk Assessment Matrix Engine
export const phase63RiskAssessments = pgTable('phase63_risk_assessments', {
  id: text('id').primaryKey(),
  assessmentNumber: text('assessment_number').notNull(), // RA-2026-XXXX
  activityName: text('activity_name').notNull(),
  departmentOrSite: text('department_or_site').notNull(),
  hazardDescription: text('hazard_description').notNull(),
  severity: integer('severity').notNull().default(3), // 1 (Minor) to 5 (Catastrophic)
  likelihood: integer('likelihood').notNull().default(3), // 1 (Rare) to 5 (Almost Certain)
  riskScore: integer('risk_score').notNull().default(9), // Severity x Likelihood (1-25)
  riskCategory: text('risk_category').notNull().default('MODERATE'), // LOW (1-4), MODERATE (5-9), HIGH (10-15), CRITICAL (16-25)
  existingControls: text('existing_controls'),
  additionalControls: text('additional_controls'),
  residualSeverity: integer('residual_severity').default(2),
  residualLikelihood: integer('residual_likelihood').default(2),
  residualRiskScore: integer('residual_risk_score').default(4),
  assessedBy: text('assessed_by').notNull(),
  reviewDate: text('review_date').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, UNDER_REVIEW, ARCHIVED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 268. Job Safety Analysis (JSA)
export const phase63Jsa = pgTable('phase63_jsa', {
  id: text('id').primaryKey(),
  jsaNumber: text('jsa_number').notNull(), // JSA-2026-XXXX
  jobTitle: text('job_title').notNull(),
  location: text('location').notNull(),
  supervisorName: text('supervisor_name').notNull(),
  jsaDate: text('jsa_date').notNull(),
  jobSteps: text('job_steps').notNull(), // Structured text/JSON of job steps, hazards, controls
  requiredPpe: text('required_ppe').notNull(),
  permitRequired: boolean('permit_required').notNull().default(false),
  status: text('status').notNull().default('DRAFT'), // DRAFT, APPROVED, REJECTED, EXPIRED
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 269. Toolbox Talks (TBT)
export const phase63ToolboxTalks = pgTable('phase63_toolbox_talks', {
  id: text('id').primaryKey(),
  tbtNumber: text('tbt_number').notNull(), // TBT-2026-XXXX
  topic: text('topic').notNull(),
  conductedBy: text('conducted_by').notNull(),
  location: text('location').notNull(),
  talkDate: text('talk_date').notNull(),
  attendeesCount: integer('attendees_count').notNull().default(0),
  keyPoints: text('key_points').notNull(),
  attendeesList: text('attendees_list'),
  status: text('status').notNull().default('COMPLETED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 270. Permit to Work (PTW) System
export const phase63WorkPermits = pgTable('phase63_work_permits', {
  id: text('id').primaryKey(),
  permitNumber: text('permit_number').notNull(), // PTW-2026-XXXX
  permitType: text('permit_type').notNull().default('HOT_WORK'), // HOT_WORK, CONFINED_SPACE, HEIGHT_WORK, ELECTRICAL, EXCAVATION, RADIOGRAPHY
  location: text('location').notNull(),
  description: text('description').notNull(),
  contractorName: text('contractor_name').notNull(),
  supervisorName: text('supervisor_name').notNull(),
  issueDateTime: text('issue_date_time').notNull(),
  expiryDateTime: text('expiry_date_time').notNull(),
  safetyChecklist: text('safety_checklist'), // Checkboxes or JSON
  isolationStatus: text('isolation_status').default('NOT_APPLICABLE'), // LOTO APPLIED, ISOLATED, N/A
  gasTestResult: text('gas_test_result'), // O2: 20.9%, LEL: 0%, H2S: 0ppm
  status: text('status').notNull().default('PENDING_APPROVAL'), // PENDING_APPROVAL, APPROVED, ACTIVE, SUSPENDED, CLOSED, EXPIRED
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 271. Safety Inspections & Audits
export const phase63SafetyInspections = pgTable('phase63_safety_inspections', {
  id: text('id').primaryKey(),
  inspectionNumber: text('inspection_number').notNull(), // SINS-2026-XXXX
  inspectionType: text('inspection_type').notNull().default('WEEKLY_SITE'), // DAILY_WALKTHROUGH, WEEKLY_SITE, SCAFFOLDING, HEAVY_EQUIPMENT, FIRE_SAFETY
  location: text('location').notNull(),
  inspectorName: text('inspector_name').notNull(),
  inspectionDate: text('inspection_date').notNull(),
  totalItemsChecked: integer('total_items_checked').notNull().default(0),
  compliantItems: integer('compliant_items').notNull().default(0),
  nonCompliantItems: integer('non_compliant_items').notNull().default(0),
  scorePercentage: doublePrecision('score_percentage').notNull().default(0),
  findings: text('findings'),
  status: text('status').notNull().default('ACTION_REQUIRED'), // PASSED, PASSED_WITH_OBSERVATIONS, ACTION_REQUIRED, FAILED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 272. Personal Protective Equipment (PPE) Issuance Register
export const phase63PpeIssuance = pgTable('phase63_ppe_issuance', {
  id: text('id').primaryKey(),
  issuanceNumber: text('issuance_number').notNull(), // PPE-2026-XXXX
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name').notNull(),
  department: text('department').notNull(),
  ppeItem: text('ppe_item').notNull(), // Safety Helmet, Safety Shoes, Harness, Goggles, Ear Plugs, High-Vis Vest
  quantity: integer('quantity').notNull().default(1),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date'),
  condition: text('condition').notNull().default('NEW'), // NEW, REPLACEMENT, REPAIRED
  issuedBy: text('issued_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 273. Safety Training Records & Certifications
export const phase63TrainingRecords = pgTable('phase63_training_records', {
  id: text('id').primaryKey(),
  trainingNumber: text('training_number').notNull(), // TRN-2026-XXXX
  courseName: text('course_name').notNull(), // HSE Induction, Working at Height, Confined Space Entry, First Aid, Fire Fighter
  trainerName: text('trainer_name').notNull(),
  trainingDate: text('training_date').notNull(),
  validityMonths: integer('validity_months').notNull().default(12),
  expiryDate: text('expiry_date').notNull(),
  participantsCount: integer('participants_count').notNull().default(1),
  participantsList: text('participants_list'),
  status: text('status').notNull().default('VALID'), // VALID, EXPIRING_SOON, EXPIRED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 274. Emergency Mock Drills Register
export const phase63EmergencyDrills = pgTable('phase63_emergency_drills', {
  id: text('id').primaryKey(),
  drillNumber: text('drill_number').notNull(), // DRL-2026-XXXX
  drillType: text('drill_type').notNull().default('FIRE_EVACUATION'), // FIRE_EVACUATION, CHEMICAL_SPILL, MEDICAL_EMERGENCY, CONFINED_SPACE_RESCUE
  location: text('location').notNull(),
  drillDate: text('drill_date').notNull(),
  evacuationTimeSeconds: integer('evacuation_time_seconds').notNull().default(180),
  participantsCount: integer('participants_count').notNull().default(0),
  observerName: text('observer_name').notNull(),
  performanceRating: text('performance_rating').notNull().default('SATISFACTORY'), // EXCELLENT, SATISFACTORY, NEEDS_IMPROVEMENT, UNACCEPTABLE
  recommendations: text('recommendations'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 275. Fire Fighting Equipment Master & Inspection
export const phase63FireEquipment = pgTable('phase63_fire_equipment', {
  id: text('id').primaryKey(),
  equipmentTag: text('equipment_tag').notNull(), // FE-2026-XXXX or FAB-01
  equipmentType: text('equipment_type').notNull().default('FIRE_EXTINGUISHER_CO2'), // FIRE_EXTINGUISHER_CO2, FIRE_EXTINGUISHER_DCP, FIRE_HOSE_REEL, FIRE_BLANKET, SMOKE_DETECTOR
  location: text('location').notNull(),
  lastInspectionDate: text('last_inspection_date').notNull(),
  nextInspectionDue: text('next_inspection_due').notNull(),
  pressureStatus: text('pressure_status').notNull().default('NORMAL'), // NORMAL, LOW, OVERCHARGED
  physicalCondition: text('physical_condition').notNull().default('GOOD'), // GOOD, DAMAGED, EXPIRED
  inspectorName: text('inspector_name').notNull(),
  status: text('status').notNull().default('OPERATIONAL'), // OPERATIONAL, REFILL_REQUIRED, OUT_OF_SERVICE
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 276. Environmental Monitoring Log
export const phase63EnvironmentMonitoring = pgTable('phase63_environment_monitoring', {
  id: text('id').primaryKey(),
  recordNumber: text('record_number').notNull(), // ENV-2026-XXXX
  location: text('location').notNull(),
  parameter: text('parameter').notNull().default('NOISE_LEVEL'), // NOISE_LEVEL, AIR_QUALITY_PM25, WATER_TURBIDITY, DUST_EMISSION, AMBIENT_TEMP
  measuredValue: doublePrecision('measured_value').notNull(),
  unit: text('unit').notNull().default('dBA'), // dBA, ug/m3, NTU, degC
  permissibleLimit: doublePrecision('permissible_limit').notNull(),
  complianceStatus: text('compliance_status').notNull().default('COMPLIANT'), // COMPLIANT, EXCEEDED, CRITICAL
  monitoringDate: text('monitoring_date').notNull(),
  monitoredBy: text('monitored_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 277. Waste Management & Disposal Log
export const phase63WasteManagement = pgTable('phase63_waste_management', {
  id: text('id').primaryKey(),
  manifestNumber: text('manifest_number').notNull(), // WST-2026-XXXX
  wasteCategory: text('waste_category').notNull().default('HAZARDOUS'), // HAZARDOUS, NON_HAZARDOUS, E_WASTE, CONSTRUCTION_DEBRIS, SEWAGE
  wasteType: text('waste_type').notNull(), // Used Oil, Chemical Drums, Concrete Rubble, Plastic, Scrap Steel
  quantityKg: doublePrecision('quantity_kg').notNull(),
  disposalMethod: text('disposal_method').notNull().default('AUTHORIZED_RECYCLER'), // AUTHORIZED_RECYCLER, LANDFILL, INCINERATION, MUNICIPAL
  approvedContractor: text('approved_contractor').notNull(),
  disposalDate: text('disposal_date').notNull(),
  certificateRef: text('certificate_ref'),
  status: text('status').notNull().default('DISPOSED'), // STORED_ON_SITE, IN_TRANSIT, DISPOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 278. HSE Controlled Documents & Policies
export const phase63HseDocuments = pgTable('phase63_hse_documents', {
  id: text('id').primaryKey(),
  documentCode: text('document_code').notNull(), // HSED-2026-XXXX
  title: text('title').notNull(),
  category: text('category').notNull().default('SAFETY_POLICY'), // SAFETY_POLICY, EMERGENCY_PLAN, ENVIRONMENTAL_POLICY, MSDS, OSHA_COMPLIANCE
  revision: text('revision').notNull().default('R0'),
  fileUrl: text('file_url'),
  approvalStatus: text('approval_status').notNull().default('APPROVED'), // DRAFT, SUBMITTED, APPROVED, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 279. HSE Multi-stage Approvals
export const phase63HseApprovals = pgTable('phase63_hse_approvals', {
  id: text('id').primaryKey(),
  referenceType: text('reference_type').notNull(), // INCIDENT, PERMIT, RISK_ASSESSMENT, JSA
  referenceId: text('reference_id').notNull(),
  approvalStage: text('approval_stage').notNull().default('SAFETY_OFFICER'), // SAFETY_OFFICER, HSE_MANAGER, SITE_INCHARGE, PROJECT_DIRECTOR
  approverUser: text('approver_user').notNull(),
  decision: text('decision').notNull().default('APPROVED'), // APPROVED, REJECTED, CONDITIONAL
  comments: text('comments'),
  signedAt: text('signed_at').notNull(),
  digitalStampRef: text('digital_stamp_ref'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 280. HSE Notifications & Alerts
export const phase63HseNotifications = pgTable('phase63_hse_notifications', {
  id: text('id').primaryKey(),
  recipientUser: text('recipient_user').notNull(),
  notificationType: text('notification_type').notNull().default('INCIDENT_ALERT'), // INCIDENT_ALERT, PERMIT_EXPIRING, RISK_HIGH_WARNING, INSPECTION_DUE
  title: text('title').notNull(),
  message: text('message').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 281. HSE Audit Trail Logs
export const phase63HseLogs = pgTable('phase63_hse_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(), // INCIDENT_REPORTED, PERMIT_APPROVED, RISK_EVALUATED, DRILL_CONDUCTED
  module: text('module').notNull().default('HSE'),
  entityId: text('entity_id').notNull(),
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 64: ENTERPRISE PROJECT PLANNING, SCHEDULING & PROJECT CONTROLS
// ============================================================================

// 282. Projects WBS (Work Breakdown Structure)
export const phase64ProjectsWbs = pgTable('phase64_projects_wbs', {
  id: text('id').primaryKey(),
  wbsNumber: text('wbs_number').notNull(), // WBS-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  code: text('code').notNull(), // 1, 1.1, 1.1.1
  name: text('name').notNull(),
  description: text('description'),
  level: integer('level').notNull().default(1),
  parentId: text('parent_id'),
  budgetAmount: doublePrecision('budget_amount').notNull().default(0),
  plannedStartDate: text('planned_start_date'),
  plannedEndDate: text('planned_end_date'),
  status: text('status').notNull().default('ACTIVE'), // PLANNED, ACTIVE, COMPLETED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 283. Work Packages
export const phase64WorkPackages = pgTable('phase64_work_packages', {
  id: text('id').primaryKey(),
  wpNumber: text('wp_number').notNull(), // WP-2026-XXXX
  wbsId: text('wbs_id').notNull(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  name: text('name').notNull(),
  code: text('code').notNull(),
  deliverable: text('deliverable'),
  responsiblePerson: text('responsible_person').notNull().default('Project Manager'),
  estimatedCost: doublePrecision('estimated_cost').notNull().default(0),
  plannedStartDate: text('planned_start_date'),
  plannedEndDate: text('planned_end_date'),
  status: text('status').notNull().default('PLANNED'), // PLANNED, IN_PROGRESS, COMPLETED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 284. Project Activities
export const phase64ProjectActivities = pgTable('phase64_project_activities', {
  id: text('id').primaryKey(),
  activityNumber: text('activity_number').notNull(), // ACT-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  wbsId: text('wbs_id').notNull(),
  wpId: text('wp_id'),
  activityCode: text('activity_code').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  durationDays: integer('duration_days').notNull().default(1),
  plannedStartDate: text('planned_start_date').notNull(),
  plannedEndDate: text('planned_end_date').notNull(),
  actualStartDate: text('actual_start_date'),
  actualEndDate: text('actual_end_date'),
  earlyStart: text('early_start'),
  earlyFinish: text('early_finish'),
  lateStart: text('late_start'),
  lateFinish: text('late_finish'),
  totalFloat: integer('total_float').notNull().default(0),
  freeFloat: integer('free_float').notNull().default(0),
  isCritical: boolean('is_critical').notNull().default(false),
  percentComplete: doublePrecision('percent_complete').notNull().default(0),
  plannedCost: doublePrecision('planned_cost').notNull().default(0),
  actualCost: doublePrecision('actual_cost').notNull().default(0),
  status: text('status').notNull().default('NOT_STARTED'), // NOT_STARTED, IN_PROGRESS, COMPLETED, DELAYED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 285. Activity Relationships (CPM Precedences)
export const phase64ActivityRelationships = pgTable('phase64_activity_relationships', {
  id: text('id').primaryKey(),
  predecessorActivityId: text('predecessor_activity_id').notNull(),
  successorActivityId: text('successor_activity_id').notNull(),
  relationshipType: text('relationship_type').notNull().default('FS'), // FS, SS, FF, SF
  lagDays: integer('lag_days').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 286. Project Baselines
export const phase64ProjectBaselines = pgTable('phase64_project_baselines', {
  id: text('id').primaryKey(),
  baselineNumber: text('baseline_number').notNull(), // BL-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  baselineName: text('baseline_name').notNull(),
  approvedBy: text('approved_by').notNull().default('Project Director'),
  approvedDate: text('approved_date').notNull(),
  version: text('version').notNull().default('V1.0'),
  isCurrentActive: boolean('is_current_active').notNull().default(true),
  totalDurationDays: integer('total_duration_days').notNull().default(180),
  totalPlannedCost: doublePrecision('total_planned_cost').notNull().default(5000000),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 287. Project Calendars
export const phase64ProjectCalendars = pgTable('phase64_project_calendars', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  calendarName: text('calendar_name').notNull().default('Standard 6-Day Site Calendar'),
  workingDaysPerWeek: integer('working_days_per_week').notNull().default(6),
  workingHoursPerDay: doublePrecision('working_hours_per_day').notNull().default(8),
  holidaysJson: text('holidays_json').notNull().default('[]'),
  isDefault: boolean('is_default').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 288. Resources
export const phase64Resources = pgTable('phase64_resources', {
  id: text('id').primaryKey(),
  resourceCode: text('resource_code').notNull(), // RES-2026-XXXX
  name: text('name').notNull(),
  type: text('type').notNull().default('LABOR'), // LABOR, EQUIPMENT, MATERIAL, SUBCONTRACTOR
  unitOfMeasure: text('unit_of_measure').notNull().default('HOURS'),
  unitRate: doublePrecision('unit_rate').notNull().default(0),
  capacityPerDay: doublePrecision('capacity_per_day').notNull().default(8),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 289. Resource Assignments
export const phase64ResourceAssignments = pgTable('phase64_resource_assignments', {
  id: text('id').primaryKey(),
  activityId: text('activity_id').notNull(),
  resourceId: text('resource_id').notNull(),
  allocatedQuantity: doublePrecision('allocated_quantity').notNull().default(1),
  actualQuantity: doublePrecision('actual_quantity').notNull().default(0),
  unitRate: doublePrecision('unit_rate').notNull().default(0),
  totalCost: doublePrecision('total_cost').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 290. Project Progress (EVM Core)
export const phase64ProjectProgress = pgTable('phase64_project_progress', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  asOfDate: text('as_of_date').notNull(),
  plannedProgressPercent: doublePrecision('planned_progress_percent').notNull().default(0),
  actualProgressPercent: doublePrecision('actual_progress_percent').notNull().default(0),
  plannedValue: doublePrecision('planned_value').notNull().default(0), // PV
  earnedValue: doublePrecision('earned_value').notNull().default(0), // EV
  actualCost: doublePrecision('actual_cost').notNull().default(0), // AC
  spi: doublePrecision('spi').notNull().default(1.0), // Schedule Performance Index
  cpi: doublePrecision('cpi').notNull().default(1.0), // Cost Performance Index
  scheduleVariance: doublePrecision('schedule_variance').notNull().default(0), // SV = EV - PV
  costVariance: doublePrecision('cost_variance').notNull().default(0), // CV = EV - AC
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 291. Project Delays
export const phase64ProjectDelays = pgTable('phase64_project_delays', {
  id: text('id').primaryKey(),
  delayNumber: text('delay_number').notNull(), // DLY-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  activityId: text('activity_id'),
  delayCategory: text('delay_category').notNull().default('CLIENT'), // CLIENT, CONTRACTOR, WEATHER, PERMIT, MATERIAL, SITE_ACCESS
  description: text('description').notNull(),
  delayDays: integer('delay_days').notNull().default(1),
  impactOnCriticalPath: boolean('impact_on_critical_path').notNull().default(false),
  mitigationPlan: text('mitigation_plan'),
  status: text('status').notNull().default('OPEN'), // OPEN, MITIGATED, RESOLVED, CLAIMED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 292. Project Constraints
export const phase64ProjectConstraints = pgTable('phase64_project_constraints', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  activityId: text('activity_id').notNull(),
  constraintType: text('constraint_type').notNull().default('MUST_START_ON'), // MUST_START_ON, MUST_FINISH_ON, START_NO_EARLIER_THAN, FINISH_NO_LATER_THAN
  constraintDate: text('constraint_date').notNull(),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 293. Project Milestones
export const phase64ProjectMilestones = pgTable('phase64_project_milestones', {
  id: text('id').primaryKey(),
  milestoneNumber: text('milestone_number').notNull(), // MS-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  name: text('name').notNull(),
  targetDate: text('target_date').notNull(),
  actualDate: text('actual_date'),
  paymentPercentage: doublePrecision('payment_percentage').notNull().default(0),
  isKeyMilestone: boolean('is_key_milestone').notNull().default(true),
  status: text('status').notNull().default('PENDING'), // PENDING, ACHIEVED, DELAYED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 294. Project Risks (Schedule & Cost)
export const phase64ProjectRisks = pgTable('phase64_project_risks', {
  id: text('id').primaryKey(),
  riskNumber: text('risk_number').notNull(), // RSK-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  title: text('title').notNull(),
  category: text('category').notNull().default('SCHEDULE'), // SCHEDULE, COST, TECHNICAL, RESOURCE, EXTERNAL
  probability: integer('probability').notNull().default(3), // 1 to 5
  impact: integer('impact').notNull().default(3), // 1 to 5
  riskScore: integer('risk_score').notNull().default(9),
  mitigationStrategy: text('mitigation_strategy'),
  owner: text('owner').notNull().default('Planning Manager'),
  status: text('status').notNull().default('OPEN'), // OPEN, MITIGATED, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 295. Project Issues
export const phase64ProjectIssues = pgTable('phase64_project_issues', {
  id: text('id').primaryKey(),
  issueNumber: text('issue_number').notNull(), // ISS-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  activityId: text('activity_id'),
  title: text('title').notNull(),
  priority: text('priority').notNull().default('MEDIUM'), // HIGH, MEDIUM, LOW, CRITICAL
  assignedTo: text('assigned_to').notNull().default('Site Engineer'),
  resolutionPlan: text('resolution_plan'),
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, RESOLVED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 296. Change Requests (EOT & Variation)
export const phase64ChangeRequests = pgTable('phase64_change_requests', {
  id: text('id').primaryKey(),
  crNumber: text('cr_number').notNull(), // CR-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  title: text('title').notNull(),
  reason: text('reason').notNull(),
  timeExtensionDays: integer('time_extension_days').notNull().default(0),
  costImpact: doublePrecision('cost_impact').notNull().default(0),
  approvalStatus: text('approval_status').notNull().default('SUBMITTED'), // DRAFT, SUBMITTED, APPROVED, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 297. Lookahead Plans (2-3-4 Weeks)
export const phase64LookaheadPlans = pgTable('phase64_lookahead_plans', {
  id: text('id').primaryKey(),
  planNumber: text('plan_number').notNull(), // LAK-2026-XXXX
  projectId: text('project_id').notNull().default('PRJ-101'),
  periodWeeks: integer('period_weeks').notNull().default(3), // 2, 3, 4
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  plannedActivitiesCount: integer('planned_activities_count').notNull().default(0),
  readinessStatus: text('readiness_status').notNull().default('READY'), // READY, CONSTRAINED, BLOCKED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 298. Daily Progress Records
export const phase64DailyProgress = pgTable('phase64_daily_progress', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  activityId: text('activity_id').notNull(),
  reportDate: text('report_date').notNull(),
  workDoneQty: doublePrecision('work_done_qty').notNull().default(0),
  unit: text('unit').notNull().default('MTRS'),
  manpowerCount: integer('manpower_count').notNull().default(0),
  equipmentHours: doublePrecision('equipment_hours').notNull().default(0),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 299. Weekly Progress Summaries
export const phase64WeeklyProgress = pgTable('phase64_weekly_progress', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  weekNumber: integer('week_number').notNull(),
  year: integer('year').notNull().default(2026),
  plannedPercent: doublePrecision('planned_percent').notNull().default(0),
  actualPercent: doublePrecision('actual_percent').notNull().default(0),
  weeklyRemarks: text('weekly_remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 300. Monthly Progress Summaries
export const phase64MonthlyProgress = pgTable('phase64_monthly_progress', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  month: integer('month').notNull(),
  year: integer('year').notNull().default(2026),
  monthlyPlannedValue: doublePrecision('monthly_planned_value').notNull().default(0),
  monthlyEarnedValue: doublePrecision('monthly_earned_value').notNull().default(0),
  monthlyActualCost: doublePrecision('monthly_actual_cost').notNull().default(0),
  status: text('status').notNull().default('SUBMITTED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 301. Project Logs & Audit Trail
export const phase64ProjectLogs = pgTable('phase64_project_logs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull().default('PRJ-101'),
  actionType: text('action_type').notNull(),
  module: text('module').notNull().default('PROJECT_CONTROLS'),
  performedBy: text('performed_by').notNull(),
  details: text('details').notNull(),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 65 – ENTERPRISE BUSINESS INTELLIGENCE (BI), EXECUTIVE DASHBOARD & KPI ANALYTICS
// ============================================================================

// 302. Dashboards
export const phase65Dashboards = pgTable('phase65_dashboards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  roleView: text('role_view').notNull().default('CEO'), // CEO, MD, PROJECT, FINANCE, PROCUREMENT, QAQC, HSE, FLEET, ASSET
  description: text('description'),
  isDefault: boolean('is_default').notNull().default(false),
  isPublic: boolean('is_public').notNull().default(true),
  theme: text('theme').notNull().default('LIGHT'),
  refreshIntervalSeconds: integer('refresh_interval_seconds').notNull().default(300),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 303. Dashboard Widgets
export const phase65DashboardWidgets = pgTable('phase65_dashboard_widgets', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id').notNull(),
  title: text('title').notNull(),
  widgetType: text('widget_type').notNull().default('KPI_CARD'), // KPI_CARD, TREND_CHART, BAR_CHART, PIE_CHART, HEAT_MAP, RANKING_TABLE, RISK_MATRIX, EXECUTIVE_REPORT
  category: text('category').notNull().default('EXECUTIVE'), // PROJECT, FINANCE, PROCUREMENT, QAQC, HSE, FLEET, ASSET
  dataSourceUrl: text('data_source_url'),
  refreshInterval: integer('refresh_interval').notNull().default(60),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 304. Widget Layouts
export const phase65WidgetLayouts = pgTable('phase65_widget_layouts', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id').notNull(),
  widgetId: text('widget_id').notNull(),
  posX: integer('pos_x').notNull().default(0),
  posY: integer('pos_y').notNull().default(0),
  width: integer('width').notNull().default(4),
  height: integer('height').notNull().default(3),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 305. Saved Reports
export const phase65SavedReports = pgTable('phase65_saved_reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  reportType: text('report_type').notNull().default('EXECUTIVE_SUMMARY'),
  module: text('module').notNull().default('CROSS_MODULE'),
  filterParamsJson: text('filter_params_json').notNull().default('{}'),
  format: text('format').notNull().default('PDF'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 306. Report Schedules
export const phase65ReportSchedules = pgTable('phase65_report_schedules', {
  id: text('id').primaryKey(),
  savedReportId: text('saved_report_id').notNull(),
  frequency: text('frequency').notNull().default('WEEKLY'), // DAILY, WEEKLY, MONTHLY
  cronExpression: text('cron_expression').notNull().default('0 8 * * 1'),
  recipientsEmail: text('recipients_email').notNull(),
  lastRunAt: text('last_run_at'),
  nextRunAt: text('next_run_at'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 307. KPI Definitions
export const phase65KpiDefinitions = pgTable('phase65_kpi_definitions', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. KPI-SPI, KPI-CPI, KPI-CASHFLOW
  name: text('name').notNull(),
  module: text('module').notNull().default('GENERAL'),
  formula: text('formula').notNull(),
  unit: text('unit').notNull().default('PERCENT'),
  targetValue: doublePrecision('target_value').notNull().default(100),
  warningThreshold: doublePrecision('warning_threshold').notNull().default(90),
  criticalThreshold: doublePrecision('critical_threshold').notNull().default(80),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 308. KPI Snapshots
export const phase65KpiSnapshots = pgTable('phase65_kpi_snapshots', {
  id: text('id').primaryKey(),
  kpiCode: text('kpi_code').notNull(),
  snapshotDate: text('snapshot_date').notNull(),
  actualValue: doublePrecision('actual_value').notNull(),
  targetValue: doublePrecision('target_value').notNull(),
  status: text('status').notNull().default('NORMAL'), // NORMAL, WARNING, CRITICAL
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 309. Chart Configs
export const phase65ChartConfigs = pgTable('phase65_chart_configs', {
  id: text('id').primaryKey(),
  widgetId: text('widget_id').notNull(),
  chartType: text('chart_type').notNull().default('LINE'), // LINE, BAR, PIE, RADAR, HEATMAP
  xAxisKey: text('x_axis_key').notNull().default('month'),
  yAxisKeysJson: text('y_axis_keys_json').notNull().default('["value"]'),
  colorsJson: text('colors_json').notNull().default('["#2563eb", "#10b981"]'),
  stacked: boolean('stacked').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 310. Alert Rules
export const phase65AlertRules = pgTable('phase65_alert_rules', {
  id: text('id').primaryKey(),
  ruleName: text('rule_name').notNull(),
  kpiCode: text('kpi_code').notNull(),
  condition: text('condition').notNull().default('LESS_THAN'), // LESS_THAN, GREATER_THAN, EQUALS
  thresholdValue: doublePrecision('threshold_value').notNull(),
  severity: text('severity').notNull().default('WARNING'), // INFO, WARNING, CRITICAL
  isNotificationEnabled: boolean('is_notification_enabled').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 311. Alert Notifications
export const phase65AlertNotifications = pgTable('phase65_alert_notifications', {
  id: text('id').primaryKey(),
  alertRuleId: text('alert_rule_id').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').notNull().default('WARNING'),
  isRead: boolean('is_read').notNull().default(false),
  triggeredAt: text('triggered_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 312. Drilldown Logs
export const phase65DrilldownLogs = pgTable('phase65_drilldown_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  sourceWidgetId: text('source_widget_id'),
  targetModule: text('target_module').notNull(),
  filterContextJson: text('filter_context_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 313. Executive Reports
export const phase65ExecutiveReports = pgTable('phase65_executive_reports', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  period: text('period').notNull().default('Q3-2026'),
  executiveSummary: text('executive_summary').notNull(),
  highlightsJson: text('highlights_json').notNull().default('[]'),
  status: text('status').notNull().default('PUBLISHED'), // DRAFT, PUBLISHED, ARCHIVED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 314. AI Insights
export const phase65AiInsights = pgTable('phase65_ai_insights', {
  id: text('id').primaryKey(),
  category: text('category').notNull().default('FINANCIAL_RISK'), // FINANCIAL_RISK, SCHEDULE_SLIPPAGE, SAFETY_ANOMALY, MATERIAL_WASTE
  title: text('title').notNull(),
  insightText: text('insight_text').notNull(),
  recommendedAction: text('recommended_action').notNull(),
  confidenceScore: doublePrecision('confidence_score').notNull().default(0.95),
  impactSeverity: text('impact_severity').notNull().default('HIGH'), // LOW, MEDIUM, HIGH, CRITICAL
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 315. User Preferences
export const phase65UserPreferences = pgTable('phase65_user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  defaultDashboardId: text('default_dashboard_id'),
  preferredTheme: text('preferred_theme').notNull().default('LIGHT'),
  layoutDensity: text('layout_density').notNull().default('COMFORTABLE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 316. Dashboard Logs & Audit Trail
export const phase65DashboardLogs = pgTable('phase65_dashboard_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  action: text('action').notNull(), // VIEW_DASHBOARD, EXPORT_REPORT, MODIFY_WIDGET
  details: text('details').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 66 – ENTERPRISE WORKFLOW, APPROVAL ENGINE & NOTIFICATION CENTER
// ============================================================================

// 317. Workflows Definition
export const phase66Workflows = pgTable('phase66_workflows', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g., WF-PROC-PO, WF-FIN-INV, WF-HR-LEAVE, WF-HSE-INCIDENT
  name: text('name').notNull(),
  module: text('module').notNull().default('CROSS_MODULE'), // PROCUREMENT, FINANCE, INVENTORY, STORE, FLEET, HR, QAQC, HSE, ASSETS, EDMS, PROJECT_CONTROLS
  description: text('description'),
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  triggerType: text('trigger_type').notNull().default('MANUAL'), // MANUAL, AUTOMATIC, THRESHOLD
  minApprovalAmount: doublePrecision('min_approval_amount').notNull().default(0),
  slaHours: integer('sla_hours').notNull().default(24),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 318. Workflow Steps
export const phase66WorkflowSteps = pgTable('phase66_workflow_steps', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  stepOrder: integer('step_order').notNull(),
  stepName: text('step_name').notNull(),
  approverRole: text('approver_role').notNull().default('MANAGER'), // ADMIN, MANAGER, INCHARGE, SUPERVISOR, STORE_KEEPER
  approverUserId: text('approver_user_id'),
  approvalType: text('approval_type').notNull().default('SINGLE'), // SINGLE, SEQUENTIAL, PARALLEL_ALL, PARALLEL_ANY
  conditionExpression: text('condition_expression').notNull().default('true'),
  slaHours: integer('sla_hours').notNull().default(12),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 319. Workflow Instances
export const phase66WorkflowInstances = pgTable('phase66_workflow_instances', {
  id: text('id').primaryKey(),
  workflowId: text('workflow_id').notNull(),
  entityType: text('entity_type').notNull(), // e.g. PO, INVOICE, REQUISITION, LEAVE, NC_REPORT
  entityId: text('entity_id').notNull(),
  title: text('title').notNull(),
  requesterId: text('requester_id').notNull(),
  requesterName: text('requester_name').notNull().default('John Doe'),
  currentStepOrder: integer('current_step_order').notNull().default(1),
  status: text('status').notNull().default('IN_PROGRESS'), // IN_PROGRESS, APPROVED, REJECTED, REVISION_REQUESTED, CANCELLED
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  dataContextJson: text('data_context_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 320. Workflow Tasks
export const phase66WorkflowTasks = pgTable('phase66_workflow_tasks', {
  id: text('id').primaryKey(),
  instanceId: text('instance_id').notNull(),
  stepId: text('step_id').notNull(),
  assignedRoleId: text('assigned_role_id').notNull().default('MANAGER'),
  assignedUserId: text('assigned_user_id'),
  assignedUserName: text('assigned_user_name').notNull().default('Assigned Approver'),
  status: text('status').notNull().default('PENDING'), // PENDING, IN_REVIEW, COMPLETED, DELEGATED, ESCALATED
  dueDate: text('due_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 321. Workflow Approvals
export const phase66WorkflowApprovals = pgTable('phase66_workflow_approvals', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  instanceId: text('instance_id').notNull(),
  approverId: text('approver_id').notNull(),
  approverName: text('approver_name').notNull().default('Approver User'),
  approverRole: text('approver_role').notNull().default('MANAGER'),
  decision: text('decision').notNull(), // APPROVED, REJECTED, REVISION_REQUESTED, DELEGATED
  comments: text('comments'),
  approvedAt: text('approved_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 322. Workflow History
export const phase66WorkflowHistory = pgTable('phase66_workflow_history', {
  id: text('id').primaryKey(),
  instanceId: text('instance_id').notNull(),
  action: text('action').notNull(), // SUBMITTED, APPROVED_STEP_1, REJECTED, ESCALATED, REVISED
  performedBy: text('performed_by').notNull(),
  notes: text('notes'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 323. Notifications
export const phase66Notifications = pgTable('phase66_notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  category: text('category').notNull().default('APPROVAL'), // APPROVAL, SYSTEM, ALERT, ANNOUNCEMENT, TASK
  severity: text('severity').notNull().default('INFO'), // INFO, WARNING, CRITICAL, SUCCESS
  linkUrl: text('link_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 324. Notification Templates
export const phase66NotificationTemplates = pgTable('phase66_notification_templates', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g., TPL_PO_APPROVAL_REQ, TPL_LEAVE_APPROVED
  subjectTemplate: text('subject_template').notNull(),
  bodyTemplate: text('body_template').notNull(),
  channel: text('channel').notNull().default('SYSTEM'), // SYSTEM, EMAIL, SMS, PUSH
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 325. User Notifications
export const phase66UserNotifications = pgTable('phase66_user_notifications', {
  id: text('id').primaryKey(),
  notificationId: text('notification_id').notNull(),
  userId: text('user_id').notNull(),
  isRead: boolean('is_read').notNull().default(false),
  readAt: text('read_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 326. Email Queue
export const phase66EmailQueue = pgTable('phase66_email_queue', {
  id: text('id').primaryKey(),
  recipientEmail: text('recipient_email').notNull(),
  subject: text('subject').notNull(),
  bodyHtml: text('body_html').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, SENT, FAILED
  attempts: integer('attempts').notNull().default(0),
  sentAt: text('sent_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 327. SMS Queue
export const phase66SmsQueue = pgTable('phase66_sms_queue', {
  id: text('id').primaryKey(),
  phoneNumber: text('phone_number').notNull(),
  messageText: text('message_text').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, SENT, FAILED
  sentAt: text('sent_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 328. Push Notifications
export const phase66PushNotifications = pgTable('phase66_push_notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  deviceToken: text('device_token'),
  status: text('status').notNull().default('DELIVERED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 329. Escalations
export const phase66Escalations = pgTable('phase66_escalations', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  instanceId: text('instance_id').notNull(),
  originalApproverId: text('original_approver_id').notNull(),
  escalatedToId: text('escalated_to_id').notNull(),
  escalatedToName: text('escalated_to_name').notNull().default('Executive Director'),
  reason: text('reason').notNull().default('SLA Breach / Unresponsive Approver'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, RESOLVED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 330. Delegations
export const phase66Delegations = pgTable('phase66_delegations', {
  id: text('id').primaryKey(),
  delegatorId: text('delegator_id').notNull(),
  delegatorName: text('delegator_name').notNull(),
  delegateeId: text('delegatee_id').notNull(),
  delegateeName: text('delegatee_name').notNull(),
  moduleScope: text('module_scope').notNull().default('ALL'), // ALL, PROCUREMENT, FINANCE, HR, etc.
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, EXPIRED, REVOKED
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 331. Reminders
export const phase66Reminders = pgTable('phase66_reminders', {
  id: text('id').primaryKey(),
  taskId: text('task_id').notNull(),
  userId: text('user_id').notNull(),
  reminderCount: integer('reminder_count').notNull().default(1),
  lastSentAt: text('last_sent_at').notNull(),
  nextScheduledAt: text('next_scheduled_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 332. Activity Feed
export const phase66ActivityFeed = pgTable('phase66_activity_feed', {
  id: text('id').primaryKey(),
  actorName: text('actor_name').notNull(),
  actionType: text('action_type').notNull(), // SUBMITTED, APPROVED, REJECTED, DELEGATED, ANNOUNCEMENT
  module: text('module').notNull().default('CROSS_MODULE'),
  summary: text('summary').notNull(),
  targetEntity: text('target_entity'),
  targetId: text('target_id'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 333. System Announcements
export const phase66SystemAnnouncements = pgTable('phase66_system_announcements', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  authorName: text('author_name').notNull().default('Executive Office'),
  targetAudience: text('target_audience').notNull().default('ALL_STAFF'), // ALL_STAFF, SITE_MANAGERS, PROJECT_ENGINEERS
  priority: text('priority').notNull().default('NORMAL'), // NORMAL, HIGH, URGENT
  publishedAt: text('published_at').notNull(),
  expiresAt: text('expires_at'),
  isPinned: boolean('is_pinned').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 334. User Preferences
export const phase66UserPreferences = pgTable('phase66_user_preferences', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  emailNotificationsEnabled: boolean('email_notifications_enabled').notNull().default(true),
  smsNotificationsEnabled: boolean('sms_notifications_enabled').notNull().default(false),
  pushNotificationsEnabled: boolean('push_notifications_enabled').notNull().default(true),
  quietHoursStart: text('quiet_hours_start').default('22:00'),
  quietHoursEnd: text('quiet_hours_end').default('06:00'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 67 – ENTERPRISE CRM, CLIENT PORTAL & CUSTOMER SERVICE MANAGEMENT
// ============================================================================

// 335. Customers
export const phase67Customers = pgTable('phase67_customers', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(), // e.g. CUST-2026-001
  companyName: text('company_name').notNull(),
  tradingName: text('trading_name'),
  industry: text('industry').notNull().default('CONSTRUCTION'),
  customerType: text('customer_type').notNull().default('GOVERNMENT'), // GOVERNMENT, PRIVATE_DEVELOPER, MAIN_CONTRACTOR, INFRASTRUCTURE
  tier: text('tier').notNull().default('STRATEGIC'), // PLATINUM, STRATEGIC, KEY_ACCOUNT, STANDARD
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE, SUSPENDED, PROSPECT
  taxRegistrationNo: text('tax_registration_no'),
  creditLimit: doublePrecision('credit_limit').notNull().default(1000000),
  healthScore: integer('health_score').notNull().default(90), // 0-100
  csatScore: doublePrecision('csat_score').notNull().default(4.8), // 1.0 - 5.0
  accountManager: text('account_manager').notNull().default('Executive Account Lead'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 336. Customer Contacts
export const phase67CustomerContacts = pgTable('phase67_customer_contacts', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  fullName: text('full_name').notNull(),
  jobTitle: text('job_title').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  department: text('department').default('Procurement'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 337. Customer Addresses
export const phase67CustomerAddresses = pgTable('phase67_customer_addresses', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  addressType: text('address_type').notNull().default('BILLING'), // BILLING, SHIPPING, HEAD_OFFICE, SITE
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull().default('Dubai'),
  state: text('state').notNull().default('Dubai'),
  country: text('country').notNull().default('UAE'),
  postalCode: text('postal_code'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 338. Leads
export const phase67Leads = pgTable('phase67_leads', {
  id: text('id').primaryKey(),
  leadNumber: text('lead_number').notNull().unique(), // LEAD-2026-101
  companyName: text('company_name').notNull(),
  contactName: text('contact_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  source: text('source').notNull().default('TENDER_PORTAL'), // TENDER_PORTAL, DIRECT_ENQUIRY, REFERRAL, EXPO
  estimatedValue: doublePrecision('estimated_value').notNull().default(0),
  status: text('status').notNull().default('NEW'), // NEW, QUALIFIED, UNQUALIFIED, CONVERTED
  assignedTo: text('assigned_to').notNull().default('Business Development Manager'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 339. Opportunities
export const phase67Opportunities = pgTable('phase67_opportunities', {
  id: text('id').primaryKey(),
  oppNumber: text('opp_number').notNull().unique(), // OPP-2026-501
  title: text('title').notNull(),
  customerId: text('customer_id'),
  leadId: text('lead_id'),
  estimatedValue: doublePrecision('estimated_value').notNull().default(0),
  probabilityPercent: integer('probability_percent').notNull().default(50),
  stage: text('stage').notNull().default('PROPOSAL_SUBMITTED'), // QUALIFICATION, TECHNICAL_PROPOSAL, COMMERCIAL_BID, NEGOTIATION, WON, LOST
  expectedClosingDate: text('expected_closing_date').notNull(),
  ownerName: text('owner_name').notNull().default('Senior BD Lead'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 340. Enquiries
export const phase67Enquiries = pgTable('phase67_enquiries', {
  id: text('id').primaryKey(),
  enquiryNo: text('enquiry_no').notNull().unique(),
  customerId: text('customer_id'),
  contactName: text('contact_name').notNull(),
  subject: text('subject').notNull(),
  details: text('details').notNull(),
  channel: text('channel').notNull().default('PORTAL'), // PORTAL, EMAIL, PHONE, IN_PERSON
  status: text('status').notNull().default('OPEN'), // OPEN, IN_REVIEW, RESPONDED, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 341. Customer Projects
export const phase67CustomerProjects = pgTable('phase67_customer_projects', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  contractValue: doublePrecision('contract_value').notNull().default(0),
  completionPercentage: doublePrecision('completion_percentage').notNull().default(0),
  status: text('status').notNull().default('IN_PROGRESS'), // ON_TRACK, AT_RISK, DELAYED, COMPLETED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 342. Customer Complaints
export const phase67CustomerComplaints = pgTable('phase67_customer_complaints', {
  id: text('id').primaryKey(),
  complaintNo: text('complaint_no').notNull().unique(), // CMP-2026-801
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  projectId: text('project_id'),
  category: text('category').notNull().default('QUALITY'), // QUALITY, SCHEDULE, BILLING, SAFETY, SERVICE
  severity: text('severity').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  subject: text('subject').notNull(),
  description: text('description').notNull(),
  assignedTo: text('assigned_to').notNull().default('QA/QC Manager'),
  status: text('status').notNull().default('UNDER_INVESTIGATION'), // RECEIVED, UNDER_INVESTIGATION, ACTION_TAKEN, RESOLVED, CLOSED
  resolutionNotes: text('resolution_notes'),
  resolvedAt: text('resolved_at'),
  resolvedBy: text('resolved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 343. Service Requests
export const phase67ServiceRequests = pgTable('phase67_service_requests', {
  id: text('id').primaryKey(),
  requestNo: text('request_no').notNull().unique(),
  customerId: text('customer_id').notNull(),
  requestType: text('request_type').notNull().default('SITE_INSPECTION'), // SITE_INSPECTION, DOCUMENT_COPY, VARIATION_QUOTE, MAINTENANCE
  title: text('title').notNull(),
  details: text('details').notNull(),
  status: text('status').notNull().default('SUBMITTED'), // SUBMITTED, IN_PROGRESS, COMPLETED, CANCELLED
  scheduledDate: text('scheduled_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 344. Support Tickets
export const phase67SupportTickets = pgTable('phase67_support_tickets', {
  id: text('id').primaryKey(),
  ticketNo: text('ticket_no').notNull().unique(), // TCK-2026-901
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  subject: text('subject').notNull(),
  category: text('category').notNull().default('BILLING_INQUIRY'), // BILLING_INQUIRY, DRAWING_APPROVAL, SITE_ACCESS, VARIATION, GENERAL
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, URGENT
  assignedTo: text('assigned_to').notNull().default('Customer Support Lead'),
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, WAITING_CLIENT, RESOLVED, CLOSED
  slaHours: integer('sla_hours').notNull().default(24),
  slaBreached: boolean('sla_breached').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 345. Ticket Comments
export const phase67TicketComments = pgTable('phase67_ticket_comments', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull(),
  authorName: text('author_name').notNull(),
  authorRole: text('author_role').notNull().default('SUPPORT_AGENT'), // CLIENT, SUPPORT_AGENT, PROJECT_MANAGER
  commentText: text('comment_text').notNull(),
  isInternalOnly: boolean('is_internal_only').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 346. Ticket Attachments
export const phase67TicketAttachments = pgTable('phase67_ticket_attachments', {
  id: text('id').primaryKey(),
  ticketId: text('ticket_id').notNull(),
  fileName: text('file_name').notNull(),
  fileUrl: text('file_url').notNull(),
  fileSizeKb: integer('file_size_kb').notNull().default(1024),
  uploadedBy: text('uploaded_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 347. Customer Feedback
export const phase67CustomerFeedback = pgTable('phase67_customer_feedback', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  customerName: text('customer_name').notNull(),
  projectId: text('project_id'),
  rating: integer('rating').notNull().default(5), // 1 - 5
  npsScore: integer('nps_score').notNull().default(9), // 0 - 10
  feedbackText: text('feedback_text'),
  category: text('category').notNull().default('PROJECT_HANDOVER'), // PROJECT_HANDOVER, MONTHLY_REVIEW, SUPPORT
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 348. Customer Meetings
export const phase67CustomerMeetings = pgTable('phase67_customer_meetings', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  title: text('title').notNull(),
  meetingType: text('meeting_type').notNull().default('PROGRESS_REVIEW'), // PROGRESS_REVIEW, COMMERCIAL_BID, DISPUTE_RESOLUTION, SITE_WALK
  scheduledAt: text('scheduled_at').notNull(),
  location: text('location').notNull().default('Site Sync HQ / Teams Online'),
  organizerName: text('organizer_name').notNull().default('Account Director'),
  minutesOfMeeting: text('minutes_of_meeting'),
  status: text('status').notNull().default('SCHEDULED'), // SCHEDULED, COMPLETED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 349. Follow-ups
export const phase67Followups = pgTable('phase67_followups', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // CUSTOMER, LEAD, OPPORTUNITY, TICKET
  entityId: text('entity_id').notNull(),
  assignedTo: text('assigned_to').notNull(),
  actionRequired: text('action_required').notNull(),
  dueDate: text('due_date').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, COMPLETED, OVERDUE
  completedAt: text('completed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 350. Portal Users
export const phase67PortalUsers = pgTable('phase67_portal_users', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  email: text('email').notNull().unique(),
  fullName: text('full_name').notNull(),
  passwordHash: text('password_hash').notNull().default('hashed_default'),
  role: text('role').notNull().default('CLIENT_ADMIN'), // CLIENT_ADMIN, CLIENT_PROJECT_REP, CLIENT_FINANCE
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED
  lastLoginAt: text('last_login_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 351. Portal Sessions
export const phase67PortalSessions = pgTable('phase67_portal_sessions', {
  id: text('id').primaryKey(),
  portalUserId: text('portal_user_id').notNull(),
  token: text('token').notNull().unique(),
  ipAddress: text('ip_address').notNull().default('127.0.0.1'),
  expiresAt: text('expires_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 352. Customer Notifications
export const phase67CustomerNotifications = pgTable('phase67_customer_notifications', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  portalUserId: text('portal_user_id'),
  title: text('title').notNull(),
  message: text('message').notNull(),
  category: text('category').notNull().default('INVOICE'), // INVOICE, INSPECTION, APPROVAL, TICKET, MILESTONE
  isRead: boolean('is_read').notNull().default(false),
  readAt: text('read_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 353. Customer Documents
export const phase67CustomerDocuments = pgTable('phase67_customer_documents', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  projectId: text('project_id'),
  title: text('title').notNull(),
  documentType: text('document_type').notNull().default('CONTRACT'), // CONTRACT, DRAWING, INVOICE, HANDOVER, CERTIFICATE
  fileUrl: text('file_url').notNull(),
  fileSizeKb: integer('file_size_kb').notNull().default(2048),
  isPortalVisible: boolean('is_portal_visible').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 354. Customer Logs
export const phase67CustomerLogs = pgTable('phase67_customer_logs', {
  id: text('id').primaryKey(),
  customerId: text('customer_id').notNull(),
  action: text('action').notNull(), // PORTAL_LOGIN, TICKET_CREATED, INVOICE_VIEWED, DOCUMENT_DOWNLOADED
  performedBy: text('performed_by').notNull(),
  details: text('details'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ==========================================
// PHASE 68: ENTERPRISE MOBILE FIELD OPERATIONS, OFFLINE SYNC & GIS INTEGRATION
// ==========================================

// 355. Mobile Devices
export const phase68MobileDevices = pgTable('phase68_mobile_devices', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull().unique(),
  deviceModel: text('device_model').notNull(),
  osPlatform: text('os_platform').notNull(), // ANDROID, IOS, PWA, IPAD_OS
  osVersion: text('os_version').notNull(),
  appVersion: text('app_version').notNull(),
  assignedUserId: text('assigned_user_id').notNull(),
  assignedUserName: text('assigned_user_name').notNull(),
  userRole: text('user_role').notNull().default('SUPERVISOR'),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  batteryLevel: integer('battery_level').notNull().default(100),
  isOnline: boolean('is_online').notNull().default(true),
  lastSyncAt: text('last_sync_at').notNull(),
  deviceStatus: text('device_status').notNull().default('ACTIVE'), // ACTIVE, SUSPENDED, DECOMMISSIONED, LOST
  storageAvailableMb: integer('storage_available_mb').notNull().default(16384),
  offlinePendingCount: integer('offline_pending_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 356. Device Registrations
export const phase68DeviceRegistrations = pgTable('phase68_device_registrations', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  registrationToken: text('registration_token').notNull(),
  requestedBy: text('requested_by').notNull(),
  approvedBy: text('approved_by'),
  status: text('status').notNull().default('APPROVED'), // PENDING, APPROVED, REJECTED, REVOKED
  ipAddress: text('ip_address'),
  macAddress: text('mac_address'),
  registeredAt: text('registered_at').notNull(),
  expiresAt: text('expires_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 357. Sync Queue
export const phase68SyncQueue = pgTable('phase68_sync_queue', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  entityType: text('entity_type').notNull(), // CHECKIN, DFR, PHOTO, FORM_SUBMISSION, SIGNATURE, GPS_POINT, MATERIAL_ISSUE
  entityId: text('entity_id').notNull(),
  action: text('action').notNull(), // CREATE, UPDATE, DELETE, UPLOAD
  payload: text('payload').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, COMPLETED, CONFLICT, FAILED
  retryCount: integer('retry_count').notNull().default(0),
  clientTimestamp: text('client_timestamp').notNull(),
  syncedAt: text('synced_at'),
  errorMessage: text('error_message'),
  conflictResolution: text('conflict_resolution'), // CLIENT_WINS, SERVER_WINS, MANUAL_MERGED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 358. Sync History
export const phase68SyncHistory = pgTable('phase68_sync_history', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  userId: text('user_id').notNull(),
  syncType: text('sync_type').notNull().default('BIDIRECTIONAL'), // FULL, DELTA, BIDIRECTIONAL, BACKGROUND
  recordsPushed: integer('records_pushed').notNull().default(0),
  recordsPulled: integer('records_pulled').notNull().default(0),
  conflictsDetected: integer('conflicts_detected').notNull().default(0),
  durationMs: integer('duration_ms').notNull().default(350),
  status: text('status').notNull().default('SUCCESS'), // SUCCESS, PARTIAL_SUCCESS, FAILED
  networkType: text('network_type').notNull().default('4G_LTE'), // 5G, 4G_LTE, 3G, WIFI, OFFLINE
  startedAt: text('started_at').notNull(),
  completedAt: text('completed_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 359. Offline Transactions
export const phase68OfflineTransactions = pgTable('phase68_offline_transactions', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  userId: text('user_id').notNull(),
  transactionCode: text('transaction_code').notNull(),
  module: text('module').notNull(), // INVENTORY, ATTENDANCE, QAQC, HSE, DFR, WORKFLOW
  transactionType: text('transaction_type').notNull(), // SITE_CHECKIN, FORM_SUBMIT, ASSET_INSPECT, STOCK_CONSUME
  localId: text('local_id').notNull(),
  dataPayload: text('data_payload').notNull(),
  syncStatus: text('sync_status').notNull().default('SYNCED'), // LOCAL_QUEUED, SYNCED, REJECTED, MERGED
  serverSyncTimestamp: text('server_sync_timestamp'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 360. GPS Tracks
export const phase68GpsTracks = pgTable('phase68_gps_tracks', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  projectId: text('project_id').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  altitudeMeters: doublePrecision('altitude_meters').notNull().default(0),
  accuracyMeters: doublePrecision('accuracy_meters').notNull().default(5),
  speedKmph: doublePrecision('speed_kmph').notNull().default(0),
  headingDegrees: doublePrecision('heading_degrees').notNull().default(0),
  batteryPercent: integer('battery_percent').notNull().default(100),
  recordedAt: text('recorded_at').notNull(),
  isGeofenceInside: boolean('is_geofence_inside').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 361. Geofences
export const phase68Geofences = pgTable('phase68_geofences', {
  id: text('id').primaryKey(),
  geofenceCode: text('geofence_code').notNull().unique(),
  name: text('name').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  fenceType: text('fence_type').notNull().default('POLYGON'), // CIRCLE, POLYGON, CORRIDOR_BUFFER
  centerLat: doublePrecision('center_lat').notNull(),
  centerLng: doublePrecision('center_lng').notNull(),
  radiusMeters: doublePrecision('radius_meters').notNull().default(250),
  polygonCoordinates: text('polygon_coordinates'), // JSON Array of [{lat, lng}]
  category: text('category').notNull().default('PROJECT_SITE'), // PROJECT_SITE, PIPELINE_ZONE, WTP_PREMISES, QUARRY, STORE_YARD
  autoCheckinEnabled: boolean('auto_checkin_enabled').notNull().default(true),
  alertOnExit: boolean('alert_on_exit').notNull().default(true),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, INACTIVE
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 362. Geofence Events
export const phase68GeofenceEvents = pgTable('phase68_geofence_events', {
  id: text('id').primaryKey(),
  geofenceId: text('geofence_id').notNull(),
  geofenceName: text('geofence_name').notNull(),
  deviceId: text('device_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  eventType: text('event_type').notNull(), // ENTER, EXIT, DWELL
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  dwellDurationMinutes: integer('dwell_duration_minutes').default(0),
  eventTimestamp: text('event_timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 363. Live Locations
export const phase68LiveLocations = pgTable('phase68_live_locations', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull().default('PERSONNEL'), // PERSONNEL, VEHICLE, HEAVY_EQUIPMENT, DRONE
  entityId: text('entity_id').notNull(),
  entityName: text('entity_name').notNull(),
  roleOrType: text('role_or_type').notNull(), // Resident Engineer, Excavator-04, Water Tanker-12
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  altitude: doublePrecision('altitude').notNull().default(0),
  speed: doublePrecision('speed').notNull().default(0),
  heading: doublePrecision('heading').notNull().default(0),
  battery: integer('battery').notNull().default(100),
  isOnline: boolean('is_online').notNull().default(true),
  currentGeofence: text('current_geofence'),
  lastActiveAt: text('last_active_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 364. Field Visits
export const phase68FieldVisits = pgTable('phase68_field_visits', {
  id: text('id').primaryKey(),
  visitCode: text('visit_code').notNull().unique(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  siteLocation: text('site_location').notNull(),
  purpose: text('purpose').notNull(), // QAQC_INSPECTION, SAFETY_AUDIT, PROGRESS_SURVEY, CLIENT_WALKTHROUGH, COMMISSIONING
  scheduledStartTime: text('scheduled_start_time').notNull(),
  scheduledEndTime: text('scheduled_end_time').notNull(),
  actualStartTime: text('actual_start_time'),
  actualEndTime: text('actual_end_time'),
  status: text('status').notNull().default('IN_PROGRESS'), // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  summaryNotes: text('summary_notes'),
  findingsCount: integer('findings_count').notNull().default(0),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 365. Site Check-ins
export const phase68SiteCheckins = pgTable('phase68_site_checkins', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  geofenceId: text('geofence_id'),
  siteName: text('site_name').notNull(),
  checkinTime: text('checkin_time').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  accuracyMeters: doublePrecision('accuracy_meters').notNull().default(5),
  selfiePhotoUrl: text('selfie_photo_url'),
  isBiometricVerified: boolean('is_biometric_verified').notNull().default(true),
  isOfflineCheckin: boolean('is_offline_checkin').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, CHECKED_OUT, AUTO_EXPIRED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 366. Site Check-outs
export const phase68SiteCheckouts = pgTable('phase68_site_checkouts', {
  id: text('id').primaryKey(),
  checkinId: text('checkin_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  checkoutTime: text('checkout_time').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  totalDurationMinutes: integer('total_duration_minutes').notNull().default(480),
  dailySummaryText: text('daily_summary_text'),
  isAutoCheckout: boolean('is_auto_checkout').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 367. Mobile Photos
export const phase68MobilePhotos = pgTable('phase68_mobile_photos', {
  id: text('id').primaryKey(),
  photoCode: text('photo_code').notNull().unique(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  projectId: text('project_id').notNull(),
  category: text('category').notNull().default('PROGRESS'), // PROGRESS, QAQC_DEFECT, HSE_HAZARD, ASSET_TAG, BILLING_PROOF
  title: text('title').notNull(),
  photoUrl: text('photo_url').notNull(),
  thumbnailUrl: text('thumbnail_url'),
  fileSizeKb: integer('file_size_kb').notNull().default(1024),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  altitude: doublePrecision('altitude').notNull().default(0),
  azimuthHeading: doublePrecision('azimuth_heading').default(0),
  capturedAt: text('captured_at').notNull(),
  isWatermarked: boolean('is_watermarked').notNull().default(true),
  watermarkMetadata: text('watermark_metadata'), // JSON string with timestamp, GPS, project, surveyor
  relatedEntityId: text('related_entity_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 368. Mobile Documents
export const phase68MobileDocuments = pgTable('phase68_mobile_documents', {
  id: text('id').primaryKey(),
  documentCode: text('document_code').notNull().unique(),
  title: text('title').notNull(),
  projectId: text('project_id').notNull(),
  category: text('category').notNull().default('TECHNICAL_DRAWING'), // TECHNICAL_DRAWING, METHOD_STATEMENT, SAFETY_SOP, ITP_CHECKLIST
  fileUrl: text('file_url').notNull(),
  fileSizeKb: integer('file_size_kb').notNull().default(4096),
  cachedForOffline: boolean('cached_for_offline').notNull().default(true),
  versionNumber: text('version_number').notNull().default('v1.0'),
  downloadCount: integer('download_count').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 369. Mobile Forms
export const phase68MobileForms = pgTable('phase68_mobile_forms', {
  id: text('id').primaryKey(),
  formCode: text('form_code').notNull().unique(),
  formTitle: text('form_title').notNull(),
  templateCode: text('template_code').notNull(), // DFR_TEMPLATE, ITP_PIPE_HYDRO, HSE_TOOLBOX_TALK, CONCRETE_POUR_CARD
  projectId: text('project_id').notNull(),
  submittedBy: text('submitted_by').notNull(),
  submittedByName: text('submitted_by_name').notNull(),
  formDataJson: text('form_data_json').notNull(),
  status: text('status').notNull().default('APPROVED'), // DRAFT, SUBMITTED, APPROVED, REJECTED
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  isOfflineSubmitted: boolean('is_offline_submitted').notNull().default(false),
  submittedAt: text('submitted_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 370. Mobile Signatures
export const phase68MobileSignatures = pgTable('phase68_mobile_signatures', {
  id: text('id').primaryKey(),
  signatureCode: text('signature_code').notNull().unique(),
  entityType: text('entity_type').notNull(), // FORM_SUBMISSION, DFR, SITE_HANDOVER, MATERIAL_RECEIPT, CLIENT_MOM
  entityId: text('entity_id').notNull(),
  signerName: text('signer_name').notNull(),
  signerRole: text('signer_role').notNull(), // Resident Engineer, Third Party Auditor, Client PM
  signatureDataUrl: text('signature_data_url').notNull(), // base64 / vector svg
  signedAt: text('signed_at').notNull(),
  ipAddress: text('ip_address'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  isVerified: boolean('is_verified').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 371. Mobile Notifications
export const phase68MobileNotifications = pgTable('phase68_mobile_notifications', {
  id: text('id').primaryKey(),
  recipientUserId: text('recipient_user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  category: text('category').notNull().default('TASK'), // GEOFENCE, TASK, ALERT, APPROVAL, EMERGENCY_WEATHER
  priority: text('priority').notNull().default('HIGH'), // NORMAL, HIGH, CRITICAL
  actionUrl: text('action_url'),
  isDelivered: boolean('is_delivered').notNull().default(true),
  isRead: boolean('is_read').notNull().default(false),
  sentAt: text('sent_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 372. Push Tokens
export const phase68PushTokens = pgTable('phase68_push_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  deviceId: text('device_id').notNull(),
  fcmToken: text('fcm_token').notNull(),
  apnsToken: text('apns_token'),
  platform: text('platform').notNull().default('ANDROID'), // ANDROID, IOS, WEB_PUSH
  isActive: boolean('is_active').notNull().default(true),
  lastRegisteredAt: text('last_registered_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 373. Map Layers
export const phase68MapLayers = pgTable('phase68_map_layers', {
  id: text('id').primaryKey(),
  layerCode: text('layer_code').notNull().unique(),
  layerName: text('layer_name').notNull(),
  category: text('category').notNull().default('GIS_ASSETS'), // GIS_ASSETS, PIPELINE_ALIGNMENT, WATER_UTILITIES, SATELLITE_HYBRID, GEOFENCE_OVERLAY
  layerType: text('layer_type').notNull().default('VECTOR_GEOJSON'), // VECTOR_GEOJSON, RASTER_TILE, WMS_SERVER, KML
  geoJsonData: text('geo_json_data'),
  layerColor: text('layer_color').notNull().default('#06b6d4'),
  opacity: doublePrecision('opacity').notNull().default(0.85),
  isVisibleDefault: boolean('is_visible_default').notNull().default(true),
  zIndex: integer('z_index').notNull().default(10),
  projectId: text('project_id').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 374. Map Markers
export const phase68MapMarkers = pgTable('phase68_map_markers', {
  id: text('id').primaryKey(),
  markerCode: text('marker_code').notNull().unique(),
  name: text('name').notNull(),
  layerId: text('layer_id'),
  projectId: text('project_id').notNull(),
  markerType: text('marker_type').notNull(), // PIPELINE_VALVE, PUMP_HOUSE, WATER_RESERVOIR, WTP_PLANT, FLOW_METER, DEFECT_PIN, HEAVY_EQUIPMENT
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  elevationMeters: doublePrecision('elevation_meters').notNull().default(0),
  attributesJson: text('attributes_json'), // Metadata: flow rate, pipe dia, status, pressure bar
  status: text('status').notNull().default('OPERATIONAL'), // OPERATIONAL, MAINTENANCE_DUE, ALERT_DEFECT, UNDER_CONSTRUCTION
  iconType: text('icon_type').notNull().default('droplet'),
  colorHex: text('color_hex').notNull().default('#3b82f6'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 375. Location History
export const phase68LocationHistory = pgTable('phase68_location_history', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // USER, VEHICLE, ASSET
  entityId: text('entity_id').notNull(),
  latitude: doublePrecision('latitude').notNull(),
  longitude: doublePrecision('longitude').notNull(),
  speedKmph: doublePrecision('speed_kmph').notNull().default(0),
  batteryPercent: integer('battery_percent').notNull().default(100),
  capturedAt: text('captured_at').notNull(),
  geofenceZone: text('geofence_zone'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 376. Mobile Activity Logs
export const phase68MobileActivityLogs = pgTable('phase68_mobile_activity_logs', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  action: text('action').notNull(), // CHECKIN, CHECKOUT, PHOTO_CAPTURE, FORM_SYNC, GPS_BEACON, OFFLINE_CACHE_DOWNLOAD
  details: text('details'),
  ipAddress: text('ip_address'),
  locationText: text('location_text'),
  loggedAt: text('logged_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ==========================================
// PHASE 69: ENTERPRISE PROCUREMENT, VENDOR LIFECYCLE, RFQ & 3-WAY MATCHING
// ==========================================

// 377. Vendor Master
export const phase69VendorMaster = pgTable('phase69_vendor_master', {
  id: text('id').primaryKey(),
  vendorCode: text('vendor_code').notNull().unique(), // VEN-2026-XXXX
  companyName: text('company_name').notNull(),
  tradeName: text('trade_name'),
  registrationNumber: text('registration_number').notNull(),
  taxIdentificationNumber: text('tax_identification_number').notNull(),
  vendorType: text('vendor_type').notNull().default('MANUFACTURER'), // MANUFACTURER, DISTRIBUTOR, CONTRACTOR, SERVICE_PROVIDER, IMPORTER
  categoryCode: text('category_code').notNull().default('PIPES_FITTINGS'),
  status: text('status').notNull().default('ACTIVE'), // PENDING_APPROVAL, PREQUALIFIED, ACTIVE, SUSPENDED, BLACKLISTED
  contactPerson: text('contact_person').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  website: text('website'),
  addressStreet: text('address_street').notNull(),
  city: text('city').notNull(),
  country: text('country').notNull().default('United Arab Emirates'),
  ratingScore: doublePrecision('rating_score').notNull().default(4.5), // 1.0 - 5.0
  creditTermsDays: integer('credit_terms_days').notNull().default(60),
  currency: text('currency').notNull().default('AED'),
  bankName: text('bank_name'),
  bankIban: text('bank_iban'),
  bankSwift: text('bank_swift'),
  isBlacklisted: boolean('is_blacklisted').notNull().default(false),
  totalSpendAmount: doublePrecision('total_spend_amount').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 378. Vendor Categories
export const phase69VendorCategories = pgTable('phase69_vendor_categories', {
  id: text('id').primaryKey(),
  categoryCode: text('category_code').notNull().unique(),
  categoryName: text('category_name').notNull(),
  description: text('description'),
  parentCategoryCode: text('parent_category_code'),
  riskLevel: text('risk_level').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, CRITICAL
  requiresPreqApproval: boolean('requires_preq_approval').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 379. Vendor Evaluations
export const phase69VendorEvaluations = pgTable('phase69_vendor_evaluations', {
  id: text('id').primaryKey(),
  evaluationCode: text('evaluation_code').notNull().unique(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  evaluationPeriod: text('evaluation_period').notNull(), // Q1-2026, Q2-2026, ANNUAL-2026
  technicalScore: doublePrecision('technical_score').notNull().default(85.0), // /100
  commercialScore: doublePrecision('commercial_score').notNull().default(90.0), // /100
  deliveryScore: doublePrecision('delivery_score').notNull().default(88.0), // /100
  qualityScore: doublePrecision('quality_score').notNull().default(92.0), // /100
  hseComplianceScore: doublePrecision('hse_compliance_score').notNull().default(95.0), // /100
  compositeScore: doublePrecision('composite_score').notNull().default(90.0), // Weighted aggregate
  ratingGrade: text('rating_grade').notNull().default('A'), // A_EXCELLENT, B_GOOD, C_ACCEPTABLE, D_PROBATION, F_UNQUALIFIED
  evaluatedBy: text('evaluated_by').notNull(),
  evaluationDate: text('evaluation_date').notNull(),
  recommendationNotes: text('recommendation_notes'),
  status: text('status').notNull().default('APPROVED'), // DRAFT, SUBMITTED, APPROVED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 380. Vendor Documents
export const phase69VendorDocuments = pgTable('phase69_vendor_documents', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  documentType: text('document_type').notNull(), // TRADE_LICENSE, TAX_CERTIFICATE, ISO_9001, ISO_14001, ISO_45001, AUDITED_FINANCIALS, BANK_REFERENCE
  documentNumber: text('document_number').notNull(),
  title: text('title').notNull(),
  fileUrl: text('file_url').notNull(),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  verificationStatus: text('verification_status').notNull().default('VERIFIED'), // PENDING, VERIFIED, EXPIRED, REJECTED
  verifiedBy: text('verified_by'),
  isMandatory: boolean('is_mandatory').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 381. Pre-Qualification
export const phase69Prequalification = pgTable('phase69_prequalification', {
  id: text('id').primaryKey(),
  preqCode: text('preq_code').notNull().unique(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  scopeCategory: text('scope_category').notNull(),
  financialCapacityAed: doublePrecision('financial_capacity_aed').notNull().default(10000000),
  manufacturingCapacityMetersPerDay: integer('manufacturing_capacity_meters_per_day').default(1000),
  majorClientsExperience: text('major_clients_experience'), // JSON array of past projects
  approvalStatus: text('approval_status').notNull().default('PREQUALIFIED'), // APPLIED, UNDER_REVIEW, PREQUALIFIED, CONDITIONALLY_APPROVED, REJECTED
  validUntil: text('valid_until').notNull(),
  reviewedBy: text('reviewed_by').notNull(),
  approvalNotes: text('approval_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 382. Vendor Blacklist
export const phase69VendorBlacklist = pgTable('phase69_vendor_blacklist', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  reasonCategory: text('reason_category').notNull(), // QUALITY_FAILURE, FRAUDULENT_DOCUMENTATION, CONTRACT_DEFAULT, SAFETY_BREACH, SEVERE_DELAY
  description: text('description').notNull(),
  blacklistedDate: text('blacklisted_date').notNull(),
  effectiveUntil: text('effective_until'), // NULL for permanent
  authorizedBy: text('authorized_by').notNull(),
  appealStatus: text('appeal_status').notNull().default('NONE'), // NONE, UNDER_APPEAL, REJECTED, REINSTATED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 383. RFQ (Request For Quotation)
export const phase69Rfq = pgTable('phase69_rfq', {
  id: text('id').primaryKey(),
  rfqNumber: text('rfq_number').notNull().unique(), // RFQ-2026-XXXX
  title: text('title').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  requisitionId: text('requisition_id'),
  category: text('category').notNull().default('PIPES_FITTINGS'),
  issueDate: text('issue_date').notNull(),
  submissionDeadline: text('submission_deadline').notNull(),
  targetDeliveryDate: text('target_delivery_date').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  estimatedBudgetAed: doublePrecision('estimated_budget_aed').notNull().default(0),
  status: text('status').notNull().default('PUBLISHED'), // DRAFT, PUBLISHED, EVALUATION, AWARDED, CLOSED, CANCELLED
  invitedVendorsCount: integer('invited_vendors_count').notNull().default(0),
  quotationsReceivedCount: integer('quotations_received_count').notNull().default(0),
  buyerName: text('buyer_name').notNull(),
  termsAndConditions: text('terms_and_conditions'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 384. RFQ Items
export const phase69RfqItems = pgTable('phase69_rfq_items', {
  id: text('id').primaryKey(),
  rfqId: text('rfq_id').notNull(),
  itemNumber: integer('item_number').notNull(),
  itemCode: text('item_code').notNull(),
  description: text('description').notNull(),
  specification: text('specification'),
  quantity: doublePrecision('quantity').notNull(),
  uom: text('uom').notNull().default('MTRS'), // MTRS, NOS, PCS, TONNES, LOT, SET
  targetUnitPrice: doublePrecision('target_unit_price'),
  requiredDeliveryDate: text('required_delivery_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 385. Vendor Quotations
export const phase69VendorQuotations = pgTable('phase69_vendor_quotations', {
  id: text('id').primaryKey(),
  quotationNumber: text('quotation_number').notNull().unique(), // QOT-2026-XXXX
  rfqId: text('rfq_id').notNull(),
  rfqNumber: text('rfq_number').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  quoteDate: text('quote_date').notNull(),
  validityDays: integer('validity_days').notNull().default(60),
  subtotalAmount: doublePrecision('subtotal_amount').notNull(),
  taxVatAmount: doublePrecision('tax_vat_amount').notNull().default(0),
  totalQuoteAmount: doublePrecision('total_quote_amount').notNull(),
  currency: text('currency').notNull().default('AED'),
  leadTimeDays: integer('lead_time_days').notNull().default(30),
  paymentTerms: text('payment_terms').notNull().default('30 Days PDC'),
  incoterms: text('incoterms').notNull().default('DDP Site'), // EXW, FOB, CIF, DDP
  technicalComplianceStatus: text('technical_compliance_status').notNull().default('COMPLIANT'), // COMPLIANT, DEVIATION, NON_COMPLIANT
  commercialRanking: integer('commercial_ranking').default(1),
  isAwarded: boolean('is_awarded').notNull().default(false),
  status: text('status').notNull().default('UNDER_EVALUATION'), // SUBMITTED, UNDER_EVALUATION, SHORTLISTED, ACCEPTED, REJECTED
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 386. Quote Comparison
export const phase69QuoteComparison = pgTable('phase69_quote_comparison', {
  id: text('id').primaryKey(),
  comparisonCode: text('comparison_code').notNull().unique(),
  rfqId: text('rfq_id').notNull(),
  summaryMatrixJson: text('summary_matrix_json').notNull(), // JSON comparing unit rates, totals, lead times, warranties
  recommendedVendorId: text('recommended_vendor_id').notNull(),
  recommendedVendorName: text('recommended_vendor_name').notNull(),
  recommendedQuoteAmount: doublePrecision('recommended_quote_amount').notNull(),
  costSavingsAmount: doublePrecision('cost_savings_amount').notNull().default(0),
  savingsPercentage: doublePrecision('savings_percentage').notNull().default(0),
  evaluatedBy: text('evaluated_by').notNull(),
  approvedBy: text('approved_by'),
  comparisonStatus: text('comparison_status').notNull().default('APPROVED'), // DRAFT, COMMITTEE_REVIEW, APPROVED, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 387. Purchase Requisitions
export const phase69PurchaseRequisitions = pgTable('phase69_purchase_requisitions', {
  id: text('id').primaryKey(),
  prNumber: text('pr_number').notNull().unique(), // PR-2026-XXXX
  title: text('title').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  department: text('department').notNull().default('Civil & Mechanical Construction'),
  requestedBy: text('requested_by').notNull(),
  requiredDate: text('required_date').notNull(),
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT_SHUTDOWN
  estimatedCostAed: doublePrecision('estimated_cost_aed').notNull().default(0),
  budgetCode: text('budget_code').notNull().default('WBS-PIPE-MAIN-04'),
  budgetAvailableAed: doublePrecision('budget_available_aed').notNull().default(5000000),
  isBudgetApproved: boolean('is_budget_approved').notNull().default(true),
  stockCheckCompleted: boolean('stock_check_completed').notNull().default(true),
  status: text('status').notNull().default('APPROVED'), // DRAFT, SUBMITTED, HOD_APPROVED, FINANCE_APPROVED, PO_ISSUED, REJECTED
  workflowStep: text('workflow_step').notNull().default('PROCUREMENT_SOURCING'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Project Engineer'),
  updatedBy: text('updated_by').notNull().default('Project Engineer'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 388. Purchase Orders
export const phase69PurchaseOrders = pgTable('phase69_purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull().unique(), // PO-2026-XXXX
  prNumber: text('pr_number'),
  rfqNumber: text('rfq_number'),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  poDate: text('po_date').notNull(),
  deliveryDate: text('delivery_date').notNull(),
  deliveryLocation: text('delivery_location').notNull(),
  currency: text('currency').notNull().default('AED'),
  subtotal: doublePrecision('subtotal').notNull(),
  vatRatePercent: doublePrecision('vat_rate_percent').notNull().default(5.0),
  vatAmount: doublePrecision('vat_amount').notNull().default(0),
  totalAmount: doublePrecision('total_amount').notNull(),
  paymentTerms: text('payment_terms').notNull().default('60 Days Credit from GRN'),
  incoterms: text('incoterms').notNull().default('DDP Site'),
  status: text('status').notNull().default('ISSUED'), // DRAFT, PENDING_APPROVAL, ISSUED, PARTIALLY_DELIVERED, DELIVERED, INVOICED, CLOSED, CANCELLED
  buyerName: text('buyer_name').notNull().default('Lead Procurement Manager'),
  approvedBy: text('approved_by').notNull().default('VP Operations'),
  isAdvancePaymentRequired: boolean('is_advance_payment_required').notNull().default(false),
  advancePaymentPercentage: doublePrecision('advance_payment_percentage').default(0),
  retentionPercentage: doublePrecision('retention_percentage').default(5.0),
  performanceGuaranteeRequired: boolean('performance_guarantee_required').notNull().default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 389. PO Items
export const phase69PoItems = pgTable('phase69_po_items', {
  id: text('id').primaryKey(),
  poId: text('po_id').notNull(),
  poNumber: text('po_number').notNull(),
  itemNumber: integer('item_number').notNull(),
  itemCode: text('item_code').notNull(),
  description: text('description').notNull(),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  orderedQuantity: doublePrecision('ordered_quantity').notNull(),
  receivedQuantity: doublePrecision('received_quantity').notNull().default(0),
  balanceQuantity: doublePrecision('balance_quantity').notNull(),
  uom: text('uom').notNull().default('MTRS'),
  unitPrice: doublePrecision('unit_price').notNull(),
  totalPrice: doublePrecision('total_price').notNull(),
  requiredDate: text('required_date'),
  itemStatus: text('item_status').notNull().default('PENDING_DELIVERY'), // PENDING_DELIVERY, PARTIAL, COMPLETED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 390. Contracts
export const phase69Contracts = pgTable('phase69_contracts', {
  id: text('id').primaryKey(),
  contractNumber: text('contract_number').notNull().unique(), // CON-2026-XXXX
  title: text('title').notNull(),
  contractType: text('contract_type').notNull().default('SUBCONTRACT'), // SUPPLY_ONLY, SUBCONTRACT, EPC_LUMPSUM, FIDIC_RED_BOOK, SERVICE_AGREEMENT
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  wbsId: text('wbs_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  effectiveStartDate: text('effective_start_date').notNull(),
  effectiveEndDate: text('effective_end_date').notNull(),
  originalContractValue: doublePrecision('original_contract_value').notNull(),
  revisedContractValue: doublePrecision('revised_contract_value').notNull(),
  paidToDateAmount: doublePrecision('paid_to_date_amount').notNull().default(0),
  retentionWithheldAmount: doublePrecision('retention_withheld_amount').notNull().default(0),
  performanceGuaranteeValue: doublePrecision('performance_guarantee_value').notNull().default(0),
  advancePaymentValue: doublePrecision('advance_payment_value').notNull().default(0),
  currency: text('currency').notNull().default('AED'),
  status: text('status').notNull().default('ACTIVE'), // DRAFT, UNDER_REVIEW, ACTIVE, SUSPENDED, COMPLETED, CLOSED
  liquidatedDamagesCapPercent: doublePrecision('liquidated_damages_cap_percent').notNull().default(10.0),
  defectLiabilityPeriodMonths: integer('defect_liability_period_months').notNull().default(24),
  contractManager: text('contract_manager').notNull(),
  governingLaw: text('governing_law').notNull().default('UAE Civil Code / DIAC Arbitration'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Contracts Admin'),
  updatedBy: text('updated_by').notNull().default('Contracts Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 391. Contract Items
export const phase69ContractItems = pgTable('phase69_contract_items', {
  id: text('id').primaryKey(),
  contractId: text('contract_id').notNull(),
  itemNumber: integer('item_number').notNull(),
  billOfQuantityCode: text('bill_of_quantity_code').notNull(),
  description: text('description').notNull(),
  scopeDescription: text('scope_description'),
  contractQuantity: doublePrecision('contract_quantity').notNull(),
  executedQuantity: doublePrecision('executed_quantity').notNull().default(0),
  uom: text('uom').notNull().default('MTRS'),
  unitRate: doublePrecision('unit_rate').notNull(),
  totalItemValue: doublePrecision('total_item_value').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Contracts Admin'),
  updatedBy: text('updated_by').notNull().default('Contracts Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 392. Contract Variations (Variation Orders / Changes)
export const phase69ContractVariations = pgTable('phase69_contract_variations', {
  id: text('id').primaryKey(),
  variationNumber: text('variation_number').notNull().unique(), // VO-2026-XXXX
  contractId: text('contract_id').notNull(),
  contractNumber: text('contract_number').notNull(),
  title: text('title').notNull(),
  reasonCategory: text('reason_category').notNull().default('SCOPE_EXPANSION'), // SCOPE_EXPANSION, SITE_CONDITIONS, DESIGN_MODIFICATION, REGULATORY_CHANGE
  description: text('description').notNull(),
  variationAmount: doublePrecision('variation_amount').notNull(), // +/- cost
  timeExtensionDays: integer('time_extension_days').notNull().default(0),
  requestedDate: text('requested_date').notNull(),
  approvalDate: text('approval_date'),
  approvedBy: text('approved_by'),
  status: text('status').notNull().default('PROPOSED'), // PROPOSED, CLIENT_SUBMITTED, APPROVED, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 393. Contract Payments (Interim Payment Certificates - IPC)
export const phase69ContractPayments = pgTable('phase69_contract_payments', {
  id: text('id').primaryKey(),
  ipcNumber: text('ipc_number').notNull().unique(), // IPC-2026-XXXX
  contractId: text('contract_id').notNull(),
  contractNumber: text('contract_number').notNull(),
  periodStartDate: text('period_start_date').notNull(),
  periodEndDate: text('period_end_date').notNull(),
  grossAmountCertified: doublePrecision('gross_amount_certified').notNull(),
  lessAdvanceDeduction: doublePrecision('less_advance_deduction').notNull().default(0),
  lessRetentionDeduction: doublePrecision('less_retention_deduction').notNull().default(0),
  netPayableAmount: doublePrecision('net_payable_amount').notNull(),
  vatAmount: doublePrecision('vat_amount').notNull().default(0),
  totalInvoiceAmount: doublePrecision('total_invoice_amount').notNull(),
  paymentStatus: text('payment_status').notNull().default('CERTIFIED'), // CERTIFIED, FINANCE_VERIFIED, PAID, ON_HOLD
  certifiedBy: text('certified_by').notNull(),
  paidDate: text('paid_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 394. Bank Guarantees
export const phase69BankGuarantees = pgTable('phase69_bank_guarantees', {
  id: text('id').primaryKey(),
  bgNumber: text('bg_number').notNull().unique(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  contractNumber: text('contract_number').notNull(),
  issuingBank: text('issuing_bank').notNull(),
  guaranteeType: text('guarantee_type').notNull().default('PERFORMANCE_BOND'), // TENDER_BOND, ADVANCE_PAYMENT_BG, PERFORMANCE_BOND, RETENTION_BOND, MAINTENANCE_BOND
  guaranteeAmountAed: doublePrecision('guarantee_amount_aed').notNull(),
  issueDate: text('issue_date').notNull(),
  expiryDate: text('expiry_date').notNull(),
  claimPeriodDays: integer('claim_period_days').notNull().default(30),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, EXTENDED, INVOKED, RELEASED, EXPIRED
  custodyLocation: text('custody_location').notNull().default('Head Office Finance Vault'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Admin'),
  updatedBy: text('updated_by').notNull().default('Finance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 395. Performance Guarantees
export const phase69PerformanceGuarantees = pgTable('phase69_performance_guarantees', {
  id: text('id').primaryKey(),
  guaranteeRef: text('guarantee_ref').notNull().unique(),
  contractId: text('contract_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  bondPercentage: doublePrecision('bond_percentage').notNull().default(10.0), // 10%
  bondAmountAed: doublePrecision('bond_amount_aed').notNull(),
  validFrom: text('valid_from').notNull(),
  validTo: text('valid_to').notNull(),
  bankConfirmationStatus: text('bank_confirmation_status').notNull().default('AUTHENTICATED'), // PENDING_SWIFT, AUTHENTICATED, EXPIRED
  isOriginalReceived: boolean('is_original_received').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Admin'),
  updatedBy: text('updated_by').notNull().default('Finance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 396. Retention Money
export const phase69RetentionMoney = pgTable('phase69_retention_money', {
  id: text('id').primaryKey(),
  retentionCode: text('retention_code').notNull().unique(),
  contractId: text('contract_id').notNull(),
  contractNumber: text('contract_number').notNull(),
  vendorName: text('vendor_name').notNull(),
  totalRetentionWithheldAed: doublePrecision('total_retention_withheld_aed').notNull(),
  firstReleaseAmountAed: doublePrecision('first_release_amount_aed').notNull().default(0), // 50% at Substantial Completion (TOC)
  secondReleaseAmountAed: doublePrecision('second_release_amount_aed').notNull().default(0), // 50% at Final Completion (FAC/DLP)
  firstReleaseDueDate: text('first_release_due_date'),
  secondReleaseDueDate: text('second_release_due_date'),
  status: text('status').notNull().default('WITHHELD'), // WITHHELD, PARTIALLY_RELEASED, FULLY_RELEASED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Admin'),
  updatedBy: text('updated_by').notNull().default('Finance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 397. Delivery Schedules
export const phase69DeliverySchedules = pgTable('phase69_delivery_schedules', {
  id: text('id').primaryKey(),
  scheduleCode: text('schedule_code').notNull().unique(),
  poNumber: text('po_number').notNull(),
  vendorName: text('vendor_name').notNull(),
  milestoneName: text('milestone_name').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  actualDeliveryDate: text('actual_delivery_date'),
  itemDescription: text('item_description').notNull(),
  scheduledQuantity: doublePrecision('scheduled_quantity').notNull(),
  deliveredQuantity: doublePrecision('delivered_quantity').notNull().default(0),
  onTimeStatus: text('on_time_status').notNull().default('ON_SCHEDULE'), // ON_SCHEDULE, DELAYED, EARLY, DELIVERED
  delayDays: integer('delay_days').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 398. Goods Receipts (GRN)
export const phase69GoodsReceipts = pgTable('phase69_goods_receipts', {
  id: text('id').primaryKey(),
  grnNumber: text('grn_number').notNull().unique(), // GRN-2026-XXXX
  poNumber: text('po_number').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  deliveryNoteNumber: text('delivery_note_number').notNull(),
  receiptDate: text('receipt_date').notNull(),
  siteLocation: text('site_location').notNull(),
  receivedBy: text('received_by').notNull(),
  inspectedBy: text('inspected_by').notNull(),
  inspectionResult: text('inspection_result').notNull().default('ACCEPTED'), // ACCEPTED, CONDITIONALLY_ACCEPTED, REJECTED, PARTIAL_REJECT
  itemsReceivedCount: integer('items_received_count').notNull().default(1),
  rejectionReason: text('rejection_reason'),
  mirNumber: text('mir_number'), // Material Inspection Report Ref
  status: text('status').notNull().default('APPROVED'), // DRAFT, UNDER_INSPECTION, APPROVED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Store Keeper'),
  updatedBy: text('updated_by').notNull().default('Store Keeper'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 399. Invoice Matching
export const phase69InvoiceMatching = pgTable('phase69_invoice_matching', {
  id: text('id').primaryKey(),
  invoiceNumber: text('invoice_number').notNull().unique(),
  poNumber: text('po_number').notNull(),
  grnNumber: text('grn_number').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  invoiceDate: text('invoice_date').notNull(),
  dueDate: text('due_date').notNull(),
  invoiceAmountAed: doublePrecision('invoice_amount_aed').notNull(),
  poAmountAed: doublePrecision('po_amount_aed').notNull(),
  grnAmountAed: doublePrecision('grn_amount_aed').notNull(),
  priceVarianceAed: doublePrecision('price_variance_aed').notNull().default(0),
  quantityVariance: doublePrecision('quantity_variance').notNull().default(0),
  matchStatus: text('match_status').notNull().default('MATCHED'), // MATCHED, VARIANCE_FLAGGED, APPROVED_WITH_VARIANCE, REJECTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Officer'),
  updatedBy: text('updated_by').notNull().default('Finance Officer'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 400. Three-Way Matching
export const phase69ThreeWayMatching = pgTable('phase69_three_way_matching', {
  id: text('id').primaryKey(),
  matchingCode: text('matching_code').notNull().unique(),
  poNumber: text('po_number').notNull(),
  grnNumber: text('grn_number').notNull(),
  invoiceNumber: text('invoice_number').notNull(),
  vendorName: text('vendor_name').notNull(),
  poQuantity: doublePrecision('po_quantity').notNull(),
  grnQuantity: doublePrecision('grn_quantity').notNull(),
  invoiceQuantity: doublePrecision('invoice_quantity').notNull(),
  poUnitPrice: doublePrecision('po_unit_price').notNull(),
  invoiceUnitPrice: doublePrecision('invoice_unit_price').notNull(),
  tolerancePercentage: doublePrecision('tolerance_percentage').notNull().default(1.0),
  isQuantityMatched: boolean('is_quantity_matched').notNull().default(true),
  isPriceMatched: boolean('is_price_matched').notNull().default(true),
  isApprovedForPayment: boolean('is_approved_for_payment').notNull().default(true),
  matchingStatus: text('matching_status').notNull().default('AUTO_RECONCILED'), // AUTO_RECONCILED, MANUAL_OVERRIDE, REJECTED, DISPUTED
  verifiedBy: text('verified_by').notNull().default('Automated 3-Way Engine'),
  verificationTimestamp: text('verification_timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Automated 3-Way Engine'),
  updatedBy: text('updated_by').notNull().default('Automated 3-Way Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 401. Vendor Performance
export const phase69VendorPerformance = pgTable('phase69_vendor_performance', {
  id: text('id').primaryKey(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  evaluationYear: integer('evaluation_year').notNull().default(2026),
  totalOrdersCount: integer('total_orders_count').notNull().default(0),
  onTimeDeliveriesCount: integer('on_time_deliveries_count').notNull().default(0),
  onTimeDeliveryRatePercent: doublePrecision('on_time_delivery_rate_percent').notNull().default(95.0),
  rejectionRatePercent: doublePrecision('rejection_rate_percent').notNull().default(0.5),
  priceCompetitivenessScore: doublePrecision('price_competitiveness_score').notNull().default(90.0),
  averageLeadTimeDays: doublePrecision('average_lead_time_days').notNull().default(25.0),
  overallScore: doublePrecision('overall_score').notNull().default(92.5),
  performanceTier: text('performance_tier').notNull().default('TIER_1_STRATEGIC'), // TIER_1_STRATEGIC, TIER_2_PREFERRED, TIER_3_STANDARD, TIER_4_AT_RISK
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 402. Supplier Scorecards
export const phase69SupplierScorecards = pgTable('phase69_supplier_scorecards', {
  id: text('id').primaryKey(),
  scorecardCode: text('scorecard_code').notNull().unique(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name').notNull(),
  quarterPeriod: text('quarter_period').notNull(), // Q1-2026, Q2-2026
  qualityKpiScore: doublePrecision('quality_kpi_score').notNull().default(94.0),
  deliveryKpiScore: doublePrecision('delivery_kpi_score').notNull().default(92.0),
  commercialKpiScore: doublePrecision('commercial_kpi_score').notNull().default(89.0),
  serviceKpiScore: doublePrecision('service_kpi_score').notNull().default(96.0),
  overallIndex: doublePrecision('overall_index').notNull().default(92.8),
  gradeRank: text('grade_rank').notNull().default('A+'),
  improvementActionPlan: text('improvement_action_plan'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Admin'),
  updatedBy: text('updated_by').notNull().default('Procurement Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 403. Contract Closures
export const phase69ContractClosures = pgTable('phase69_contract_closures', {
  id: text('id').primaryKey(),
  closureCode: text('closure_code').notNull().unique(),
  contractId: text('contract_id').notNull(),
  contractNumber: text('contract_number').notNull(),
  vendorName: text('vendor_name').notNull(),
  finalAccountValueAed: doublePrecision('final_account_value_aed').notNull(),
  totalDeductionsAed: doublePrecision('total_deductions_aed').notNull().default(0),
  netFinalPaymentAed: doublePrecision('net_final_payment_aed').notNull(),
  tocIssuedDate: text('toc_issued_date').notNull(), // Taking Over Certificate
  facIssuedDate: text('fac_issued_date'), // Final Acceptance Certificate
  isPerformanceBondReleased: boolean('is_performance_bond_released').notNull().default(true),
  isNoClaimsCertificateSigned: boolean('is_no_claims_certificate_signed').notNull().default(true),
  closureStatus: text('closure_status').notNull().default('CLOSED_OUT'), // AUDIT_REVIEW, PENDING_NO_CLAIMS, CLOSED_OUT
  closedBy: text('closed_by').notNull(),
  closureDate: text('closure_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Contracts Admin'),
  updatedBy: text('updated_by').notNull().default('Contracts Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 404. Procurement Audit Logs
export const phase69ProcurementAuditLogs = pgTable('phase69_procurement_audit_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(), // VENDOR_REGISTER, RFQ_PUBLISH, QUOTE_AWARD, PO_ISSUE, VARIATION_APPROVE, 3WAY_MATCH_OVERRIDE, CONTRACT_CLOSE
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  referenceNumber: text('reference_number').notNull(),
  performedBy: text('performed_by').notNull(),
  detailsJson: text('details_json'),
  timestamp: text('timestamp').notNull(),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Procurement Auditor'),
  updatedBy: text('updated_by').notNull().default('Procurement Auditor'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 70: ENTERPRISE HRMS & PAYROLL MANAGEMENT SYSTEM TABLES (45 TABLES)
// ============================================================================

// 405. Phase 70 Departments
export const phase70Departments = pgTable('phase70_departments', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  name: text('name').notNull(),
  headOfDepartment: text('head_of_department'),
  budgetAed: doublePrecision('budget_aed').notNull().default(0),
  location: text('location').notNull().default('Head Office'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 406. Phase 70 Designations
export const phase70Designations = pgTable('phase70_designations', {
  id: text('id').primaryKey(),
  code: text('code').notNull().unique(),
  title: text('title').notNull(),
  departmentId: text('department_id'),
  gradeLevel: text('grade_level').notNull().default('L3'),
  minSalary: doublePrecision('min_salary').notNull().default(0),
  maxSalary: doublePrecision('max_salary').notNull().default(0),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 407. Phase 70 Employee Master (360° Profile)
export const phase70EmployeeMaster = pgTable('phase70_employee_master', {
  id: text('id').primaryKey(),
  employeeCode: text('employee_code').notNull().unique(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone').notNull(),
  gender: text('gender').notNull().default('MALE'),
  dateOfBirth: text('date_of_birth').notNull(),
  nationalId: text('national_id'),
  passportNumber: text('passport_number'),
  visaStatus: text('visa_status').notNull().default('EMPLOYMENT_RESIDENCE'),
  joiningDate: text('joining_date').notNull(),
  departmentId: text('department_id').notNull(),
  designationId: text('designation_id').notNull(),
  reportingManagerId: text('reporting_manager_id'),
  employmentType: text('employment_type').notNull().default('FULL_TIME'), // FULL_TIME, CONTRACTOR, CONSULTANT, INTERN
  workLocation: text('work_location').notNull().default('Abu Dhabi HQ'),
  projectId: text('project_id'),
  employmentStatus: text('employment_status').notNull().default('ACTIVE'), // ACTIVE, PROBATION, NOTICE_PERIOD, TERMINATED, RESIGNED
  biometricId: text('biometric_id'),
  grade: text('grade').notNull().default('L3'),
  noticePeriodDays: integer('notice_period_days').notNull().default(30),
  probationEndDate: text('probation_end_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 408. Phase 70 Employee Documents
export const phase70EmployeeDocuments = pgTable('phase70_employee_documents', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  documentType: text('document_type').notNull(), // PASSPORT, VISA, EMIRATES_ID, DEGREE, DRIVING_LICENSE, LABOR_CARD
  documentNumber: text('document_number').notNull(),
  issueDate: text('issue_date'),
  expiryDate: text('expiry_date'),
  fileUrl: text('file_url'),
  verificationStatus: text('verification_status').notNull().default('VERIFIED'),
  verifiedBy: text('verified_by'),
  verifiedAt: text('verified_at'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 409. Phase 70 Employee Bank Accounts
export const phase70EmployeeBankAccounts = pgTable('phase70_employee_bank_accounts', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  bankName: text('bank_name').notNull(),
  branchName: text('branch_name'),
  accountHolderName: text('account_holder_name').notNull(),
  accountNumber: text('account_number').notNull(),
  iban: text('iban').notNull(),
  swiftCode: text('swift_code'),
  isPrimary: boolean('is_primary').notNull().default(true),
  routingCode: text('routing_code'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 410. Phase 70 Salary Structures
export const phase70SalaryStructures = pgTable('phase70_salary_structures', {
  id: text('id').primaryKey(),
  structureCode: text('structure_code').notNull().unique(),
  title: text('title').notNull(),
  grade: text('grade').notNull().default('L3'),
  baseMonthlyAed: doublePrecision('base_monthly_aed').notNull().default(0),
  hraAed: doublePrecision('hra_aed').notNull().default(0),
  conveyanceAed: doublePrecision('conveyance_aed').notNull().default(0),
  medicalAed: doublePrecision('medical_aed').notNull().default(0),
  specialAllowanceAed: doublePrecision('special_allowance_aed').notNull().default(0),
  siteAllowanceAed: doublePrecision('site_allowance_aed').notNull().default(0),
  otRatePerHour: doublePrecision('ot_rate_per_hour').notNull().default(0),
  pfApplicable: boolean('pf_applicable').notNull().default(true),
  esiApplicable: boolean('esi_applicable').notNull().default(false),
  ptApplicable: boolean('pt_applicable').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'),
  effectiveFrom: text('effective_from').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 411. Phase 70 Salary Components
export const phase70SalaryComponents = pgTable('phase70_salary_components', {
  id: text('id').primaryKey(),
  componentCode: text('component_code').notNull().unique(),
  name: text('name').notNull(),
  componentType: text('component_type').notNull(), // EARNING, DEDUCTION, STATUTORY
  calculationFormula: text('calculation_formula'),
  isTaxable: boolean('is_taxable').notNull().default(true),
  isStatutory: boolean('is_statutory').notNull().default(false),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 412. Phase 70 Payroll Periods
export const phase70PayrollPeriods = pgTable('phase70_payroll_periods', {
  id: text('id').primaryKey(),
  periodCode: text('period_code').notNull().unique(),
  monthYear: text('month_year').notNull(), // e.g. "2026-08"
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalWorkingDays: integer('total_working_days').notNull().default(30),
  cutoffDate: text('cutoff_date').notNull(),
  status: text('status').notNull().default('OPEN'), // OPEN, LOCKED, PROCESSED, DISBURSED
  processedAt: text('processed_at'),
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Payroll Admin'),
  updatedBy: text('updated_by').notNull().default('Payroll Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 413. Phase 70 Payroll Runs
export const phase70PayrollRuns = pgTable('phase70_payroll_runs', {
  id: text('id').primaryKey(),
  runNumber: text('run_number').notNull().unique(),
  periodId: text('period_id').notNull(),
  totalEmployees: integer('total_employees').notNull().default(0),
  totalGrossAed: doublePrecision('total_gross_aed').notNull().default(0),
  totalDeductionsAed: doublePrecision('total_deductions_aed').notNull().default(0),
  totalNetAed: doublePrecision('total_net_aed').notNull().default(0),
  totalPfAed: doublePrecision('total_pf_aed').notNull().default(0),
  totalEsiAed: doublePrecision('total_esi_aed').notNull().default(0),
  totalPtAed: doublePrecision('total_pt_aed').notNull().default(0),
  totalLoanDeductionsAed: doublePrecision('total_loan_deductions_aed').notNull().default(0),
  status: text('status').notNull().default('DRAFT'), // DRAFT, REVIEWED, APPROVED, DISBURSED
  executionDate: text('execution_date').notNull(),
  finalizedBy: text('finalized_by'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Payroll Admin'),
  updatedBy: text('updated_by').notNull().default('Payroll Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 414. Phase 70 Pay Slips
export const phase70PaySlips = pgTable('phase70_pay_slips', {
  id: text('id').primaryKey(),
  slipNumber: text('slip_number').notNull().unique(),
  payrollRunId: text('payroll_run_id').notNull(),
  periodId: text('period_id').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeCode: text('employee_code').notNull(),
  employeeName: text('employee_name').notNull(),
  department: text('department').notNull(),
  designation: text('designation').notNull(),
  basicSalaryAed: doublePrecision('basic_salary_aed').notNull().default(0),
  hraAed: doublePrecision('hra_aed').notNull().default(0),
  daAed: doublePrecision('da_aed').notNull().default(0),
  allowancesAed: doublePrecision('allowances_aed').notNull().default(0),
  overtimeHours: doublePrecision('overtime_hours').notNull().default(0),
  overtimeAmountAed: doublePrecision('overtime_amount_aed').notNull().default(0),
  bonusAed: doublePrecision('bonus_aed').notNull().default(0),
  grossEarningsAed: doublePrecision('gross_earnings_aed').notNull().default(0),
  pfDeductionAed: doublePrecision('pf_deduction_aed').notNull().default(0),
  esiDeductionAed: doublePrecision('esi_deduction_aed').notNull().default(0),
  ptDeductionAed: doublePrecision('pt_deduction_aed').notNull().default(0),
  tdsDeductionAed: doublePrecision('tds_deduction_aed').notNull().default(0),
  loanEmiAed: doublePrecision('loan_emi_aed').notNull().default(0),
  advanceDeductionAed: doublePrecision('advance_deduction_aed').notNull().default(0),
  totalDeductionsAed: doublePrecision('total_deductions_aed').notNull().default(0),
  netSalaryAed: doublePrecision('net_salary_aed').notNull().default(0),
  paymentMode: text('payment_mode').notNull().default('WPS_DIRECT_TRANSFER'),
  paymentStatus: text('payment_status').notNull().default('PAID'),
  paymentReference: text('payment_reference'),
  disbursementDate: text('disbursement_date'),
  isHold: boolean('is_hold').notNull().default(false),
  holdReason: text('hold_reason'),
  heldBy: text('held_by'),
  heldAt: text('held_at'),
  unheldReason: text('unheld_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Payroll Admin'),
  updatedBy: text('updated_by').notNull().default('Payroll Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 415. Phase 70 Attendance & Biometric Records
export const phase70Attendance = pgTable('phase70_attendance', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeCode: text('employee_code').notNull(),
  attendanceDate: text('attendance_date').notNull(),
  shiftId: text('shift_id'),
  inTime: text('in_time'),
  outTime: text('out_time'),
  totalHours: doublePrecision('total_hours').notNull().default(0),
  lateMinutes: integer('late_minutes').notNull().default(0),
  earlyExitMinutes: integer('early_exit_minutes').notNull().default(0),
  overtimeHours: doublePrecision('overtime_hours').notNull().default(0),
  status: text('status').notNull().default('PRESENT'), // PRESENT, ABSENT, HALF_DAY, ON_LEAVE, HOLIDAY, WEEK_OFF
  punchSource: text('punch_source').notNull().default('BIOMETRIC_ESSL'), // BIOMETRIC_ESSL, MOBILE_GPS, MANUAL_ENTRY, SYSTEM_OVERRIDE
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  deviceId: text('device_id'),
  actionTaken: text('action_taken'),
  payloadSent: text('payload_sent'),
  rawResponse: text('raw_response'),
  statusCode: text('status_code'),
  executionDurationMs: real('execution_duration_ms'),
  isVerified: boolean('is_verified').notNull().default(true),
  verifiedBy: text('verified_by'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Biometric Engine'),
  updatedBy: text('updated_by').notNull().default('Biometric Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 416. Phase 70 Shift Master
export const phase70ShiftMaster = pgTable('phase70_shift_master', {
  id: text('id').primaryKey(),
  shiftCode: text('shift_code').notNull().unique(),
  shiftName: text('shift_name').notNull(),
  startTime: text('start_time').notNull(), // e.g. "08:00"
  endTime: text('end_time').notNull(), // e.g. "17:00"
  gracePeriodMinutes: integer('grace_period_minutes').notNull().default(15),
  breakDurationMinutes: integer('break_duration_minutes').notNull().default(60),
  totalShiftHours: doublePrecision('total_shift_hours').notNull().default(8),
  isNightShift: boolean('is_night_shift').notNull().default(false),
  isOvernight: boolean('is_overnight').notNull().default(false),
  colorTag: text('color_tag').notNull().default('#3B82F6'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 417. Phase 70 Shift Roster
export const phase70ShiftRoster = pgTable('phase70_shift_roster', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  shiftId: text('shift_id').notNull(),
  rosterDate: text('roster_date').notNull(),
  projectId: text('project_id'),
  isOverride: boolean('is_override').notNull().default(false),
  overrideReason: text('override_reason'),
  assignedBy: text('assigned_by').notNull().default('Operations Manager'),
  status: text('status').notNull().default('SCHEDULED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 418. Phase 70 Leave Types
export const phase70LeaveTypes = pgTable('phase70_leave_types', {
  id: text('id').primaryKey(),
  typeCode: text('type_code').notNull().unique(),
  name: text('name').notNull(),
  annualQuotaDays: integer('annual_quota_days').notNull().default(30),
  isCarryForward: boolean('is_carry_forward').notNull().default(true),
  maxCarryForwardDays: integer('max_carry_forward_days').notNull().default(15),
  isEncashable: boolean('is_encashable').notNull().default(true),
  requiresMedicalCert: boolean('requires_medical_cert').notNull().default(false),
  isPaid: boolean('is_paid').notNull().default(true),
  colorCode: text('color_code').notNull().default('#10B981'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 419. Phase 70 Leave Requests
export const phase70LeaveRequests = pgTable('phase70_leave_requests', {
  id: text('id').primaryKey(),
  requestNumber: text('request_number').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  leaveTypeId: text('leave_type_id').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: doublePrecision('total_days').notNull().default(1),
  reason: text('reason').notNull(),
  contactDuringLeave: text('contact_during_leave'),
  attachmentUrl: text('attachment_url'),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED, CANCELLED
  approvedBy: text('approved_by'),
  approvalRemarks: text('approval_remarks'),
  reviewedAt: text('reviewed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Employee'),
  updatedBy: text('updated_by').notNull().default('Employee'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 420. Phase 70 Holidays
export const phase70Holidays = pgTable('phase70_holidays', {
  id: text('id').primaryKey(),
  holidayName: text('holiday_name').notNull(),
  holidayDate: text('holiday_date').notNull(),
  dayOfWeek: text('day_of_week').notNull(),
  holidayType: text('holiday_type').notNull().default('NATIONAL'), // NATIONAL, RELIGIOUS, REGIONAL, COMPANY
  isOptional: boolean('is_optional').notNull().default(false),
  applicableLocations: text('applicable_locations').notNull().default('ALL'),
  year: integer('year').notNull().default(2026),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 421. Phase 70 Overtime
export const phase70Overtime = pgTable('phase70_overtime', {
  id: text('id').primaryKey(),
  otCode: text('ot_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  otDate: text('ot_date').notNull(),
  shiftId: text('shift_id'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  hoursWorked: doublePrecision('hours_worked').notNull().default(0),
  otRateMultiplier: doublePrecision('ot_rate_multiplier').notNull().default(1.25),
  calculatedAmountAed: doublePrecision('calculated_amount_aed').notNull().default(0),
  reason: text('reason').notNull(),
  projectSite: text('project_site').notNull().default('Site A'),
  supervisorApprovalStatus: text('supervisor_approval_status').notNull().default('APPROVED'),
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Site Supervisor'),
  updatedBy: text('updated_by').notNull().default('Site Supervisor'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 422. Phase 70 Loans
export const phase70Loans = pgTable('phase70_loans', {
  id: text('id').primaryKey(),
  loanCode: text('loan_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  loanType: text('loan_type').notNull().default('PERSONAL'), // PERSONAL, VEHICLE, HOUSING, EMERGENCY
  principalAmountAed: doublePrecision('principal_amount_aed').notNull().default(0),
  interestRate: doublePrecision('interest_rate').notNull().default(0),
  tenureMonths: integer('tenure_months').notNull().default(12),
  monthlyEmiAed: doublePrecision('monthly_emi_aed').notNull().default(0),
  totalRepaidAed: doublePrecision('total_repaid_aed').notNull().default(0),
  outstandingBalanceAed: doublePrecision('outstanding_balance_aed').notNull().default(0),
  disbursementDate: text('disbursement_date'),
  status: text('status').notNull().default('ACTIVE'), // PENDING, ACTIVE, COMPLETED, WRITTEN_OFF
  approvedBy: text('approved_by'),
  deductionStartMonth: text('deduction_start_month'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Admin'),
  updatedBy: text('updated_by').notNull().default('Finance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 423. Phase 70 Salary Advances
export const phase70SalaryAdvances = pgTable('phase70_salary_advances', {
  id: text('id').primaryKey(),
  advanceCode: text('advance_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  requestDate: text('request_date').notNull(),
  amountAed: doublePrecision('amount_aed').notNull().default(0),
  reason: text('reason').notNull(),
  recoveryMonth: text('recovery_month').notNull(),
  recoveryInstallments: integer('recovery_installments').notNull().default(1),
  monthlyRecoveryAed: doublePrecision('monthly_recovery_aed').notNull().default(0),
  recoveredAmountAed: doublePrecision('recovered_amount_aed').notNull().default(0),
  status: text('status').notNull().default('APPROVED'), // PENDING, APPROVED, REJECTED, RECOVERED
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Employee'),
  updatedBy: text('updated_by').notNull().default('Employee'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 424. Phase 70 Expense Claims
export const phase70ExpenseClaims = pgTable('phase70_expense_claims', {
  id: text('id').primaryKey(),
  claimCode: text('claim_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  claimDate: text('claim_date').notNull(),
  category: text('category').notNull().default('SITE_EXPENSE'), // SITE_EXPENSE, FUEL, TOOLS, CLIENT_ENTERTAINMENT, LODGING, MISC
  amountAed: doublePrecision('amount_aed').notNull().default(0),
  billNumber: text('bill_number'),
  receiptUrl: text('receipt_url'),
  projectId: text('project_id'),
  description: text('description').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED, PAID
  approvedBy: text('approved_by'),
  settlementDate: text('settlement_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Employee'),
  updatedBy: text('updated_by').notNull().default('Employee'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 425. Phase 70 Travel Claims
export const phase70TravelClaims = pgTable('phase70_travel_claims', {
  id: text('id').primaryKey(),
  travelCode: text('travel_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  purpose: text('purpose').notNull(),
  origin: text('origin').notNull(),
  destination: text('destination').notNull(),
  departureDate: text('departure_date').notNull(),
  returnDate: text('return_date').notNull(),
  conveyanceExpenseAed: doublePrecision('conveyance_expense_aed').notNull().default(0),
  lodgingExpenseAed: doublePrecision('lodging_expense_aed').notNull().default(0),
  daExpenseAed: doublePrecision('da_expense_aed').notNull().default(0),
  otherExpenseAed: doublePrecision('other_expense_aed').notNull().default(0),
  totalAmountAed: doublePrecision('total_amount_aed').notNull().default(0),
  advanceAdjustedAed: doublePrecision('advance_adjusted_aed').notNull().default(0),
  netPayableAed: doublePrecision('net_payable_aed').notNull().default(0),
  receiptUrls: text('receipt_urls'),
  status: text('status').notNull().default('PENDING'), // PENDING, APPROVED, REJECTED, PAID
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Employee'),
  updatedBy: text('updated_by').notNull().default('Employee'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 426. Phase 70 Training Programs
export const phase70TrainingPrograms = pgTable('phase70_training_programs', {
  id: text('id').primaryKey(),
  programCode: text('program_code').notNull().unique(),
  title: text('title').notNull(),
  trainerName: text('trainer_name').notNull(),
  category: text('category').notNull().default('SAFETY_HSE'), // SAFETY_HSE, TECHNICAL_CIVIL, BIM_ENGINEERING, LEADERSHIP, COMPLIANCE
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  durationHours: doublePrecision('duration_hours').notNull().default(8),
  venueOrLink: text('venue_or_link').notNull().default('Main Auditorium / Virtual'),
  maxParticipants: integer('max_participants').notNull().default(30),
  costPerHeadAed: doublePrecision('cost_per_head_aed').notNull().default(0),
  status: text('status').notNull().default('SCHEDULED'), // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('L&D Admin'),
  updatedBy: text('updated_by').notNull().default('L&D Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 427. Phase 70 Training Attendance & Feedback
export const phase70TrainingAttendance = pgTable('phase70_training_attendance', {
  id: text('id').primaryKey(),
  programId: text('program_id').notNull(),
  employeeId: text('employee_id').notNull(),
  attendanceStatus: text('attendance_status').notNull().default('ATTENDED'), // ENROLLED, ATTENDED, ABSENT, COMPLETED
  assessmentScore: doublePrecision('assessment_score').notNull().default(0),
  preTrainingRating: doublePrecision('pre_training_rating').notNull().default(3),
  postTrainingRating: doublePrecision('post_training_rating').notNull().default(4.5),
  certificateIssued: boolean('certificate_issued').notNull().default(true),
  certificateUrl: text('certificate_url'),
  feedbackNotes: text('feedback_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Trainer'),
  updatedBy: text('updated_by').notNull().default('Trainer'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 428. Phase 70 Employee Skills
export const phase70EmployeeSkills = pgTable('phase70_employee_skills', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  skillName: text('skill_name').notNull(),
  skillCategory: text('skill_category').notNull().default('TECHNICAL'),
  proficiencyLevel: text('proficiency_level').notNull().default('ADVANCED'), // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  yearsExperience: doublePrecision('years_experience').notNull().default(3),
  certified: boolean('certified').notNull().default(true),
  certificationAuthority: text('certification_authority'),
  expiryDate: text('expiry_date'),
  verifiedBy: text('verified_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 429. Phase 70 Performance Reviews
export const phase70PerformanceReviews = pgTable('phase70_performance_reviews', {
  id: text('id').primaryKey(),
  reviewCode: text('review_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  reviewerId: text('reviewer_id').notNull(),
  reviewPeriod: text('review_period').notNull().default('ANNUAL_2026'),
  reviewYear: integer('review_year').notNull().default(2026),
  selfRating: doublePrecision('self_rating').notNull().default(4.2),
  managerRating: doublePrecision('manager_rating').notNull().default(4.4),
  committeeRating: doublePrecision('committee_rating').notNull().default(4.5),
  finalScore: doublePrecision('final_score').notNull().default(4.4),
  performanceTier: text('performance_tier').notNull().default('EXCEEDS_EXPECTATIONS'), // OUTSTANDING, EXCEEDS_EXPECTATIONS, MEETS_EXPECTATIONS, NEEDS_IMPROVEMENT, UNSATISFACTORY
  strengths: text('strengths'),
  developmentAreas: text('development_areas'),
  recommendedSalaryHikePercent: doublePrecision('recommended_salary_hike_percent').notNull().default(8.5),
  recommendedPromotion: boolean('recommended_promotion').notNull().default(false),
  status: text('status').notNull().default('FINALIZED'), // DRAFT, SUBMITTED, REVIEWED, FINALIZED
  reviewDate: text('review_date').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Reviewer'),
  updatedBy: text('updated_by').notNull().default('Reviewer'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 430. Phase 70 Key Performance Indicators (KPI)
export const phase70Kpi = pgTable('phase70_kpi', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  reviewId: text('review_id'),
  kpiTitle: text('kpi_title').notNull(),
  targetMetric: text('target_metric').notNull(),
  achievedMetric: text('achieved_metric').notNull(),
  weightagePercent: doublePrecision('weightage_percent').notNull().default(20),
  score: doublePrecision('score').notNull().default(4.5),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 431. Phase 70 Key Result Areas (KRA)
export const phase70Kra = pgTable('phase70_kra', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  departmentId: text('department_id'),
  kraTitle: text('kra_title').notNull(),
  description: text('description').notNull(),
  weightage: doublePrecision('weightage').notNull().default(25),
  targetDueDate: text('target_due_date').notNull(),
  status: text('status').notNull().default('IN_PROGRESS'),
  rating: doublePrecision('rating').notNull().default(4.0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 432. Phase 70 Promotions
export const phase70Promotions = pgTable('phase70_promotions', {
  id: text('id').primaryKey(),
  promotionCode: text('promotion_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  oldDesignationId: text('old_designation_id').notNull(),
  newDesignationId: text('new_designation_id').notNull(),
  oldGrade: text('old_grade').notNull(),
  newGrade: text('new_grade').notNull(),
  oldSalaryAed: doublePrecision('old_salary_aed').notNull().default(0),
  newSalaryAed: doublePrecision('new_salary_aed').notNull().default(0),
  hikePercent: doublePrecision('hike_percent').notNull().default(0),
  effectiveDate: text('effective_date').notNull(),
  reason: text('reason').notNull(),
  approvedBy: text('approved_by').notNull(),
  status: text('status').notNull().default('APPROVED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 433. Phase 70 Transfers
export const phase70Transfers = pgTable('phase70_transfers', {
  id: text('id').primaryKey(),
  transferCode: text('transfer_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  fromDepartmentId: text('from_department_id'),
  toDepartmentId: text('to_department_id'),
  fromProjectId: text('from_project_id'),
  toProjectId: text('to_project_id'),
  fromLocation: text('from_location').notNull(),
  toLocation: text('to_location').notNull(),
  effectiveDate: text('effective_date').notNull(),
  reason: text('reason').notNull(),
  transferType: text('transfer_type').notNull().default('PERMANENT'), // PERMANENT, TEMPORARY_DEPUTATION
  relocationAllowanceAed: doublePrecision('relocation_allowance_aed').notNull().default(0),
  status: text('status').notNull().default('APPROVED'),
  approvedBy: text('approved_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 434. Phase 70 Disciplinary Actions
export const phase70DisciplinaryActions = pgTable('phase70_disciplinary_actions', {
  id: text('id').primaryKey(),
  incidentCode: text('incident_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  incidentDate: text('incident_date').notNull(),
  violationType: text('violation_type').notNull(), // SAFETY_BREACH, ABSENTEEISM, CODE_OF_CONDUCT, NEGLIGENCE, INSUBORDINATION
  incidentDescription: text('incident_description').notNull(),
  actionTaken: text('action_taken').notNull().default('WRITTEN_WARNING'), // VERBAL_WARNING, WRITTEN_WARNING, SUSPENSION, SALARY_DEDUCTION, TERMINATION
  warningLetterUrl: text('warning_letter_url'),
  inquiryOfficer: text('inquiry_officer').notNull(),
  resolutionDate: text('resolution_date'),
  status: text('status').notNull().default('RESOLVED'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 435. Phase 70 Exit Management
export const phase70ExitManagement = pgTable('phase70_exit_management', {
  id: text('id').primaryKey(),
  exitCode: text('exit_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  resignationDate: text('resignation_date').notNull(),
  requestedRelievingDate: text('requested_relieving_date').notNull(),
  approvedRelievingDate: text('approved_relieving_date').notNull(),
  reasonForExit: text('reason_for_exit').notNull(),
  noticePeriodServedDays: integer('notice_period_served_days').notNull().default(30),
  noticeShortfallDays: integer('notice_shortfall_days').notNull().default(0),
  exitInterviewNotes: text('exit_interview_notes'),
  handoverCompleted: boolean('handover_completed').notNull().default(true),
  itClearanceStatus: text('it_clearance_status').notNull().default('APPROVED'),
  adminClearanceStatus: text('admin_clearance_status').notNull().default('APPROVED'),
  financeClearanceStatus: text('finance_clearance_status').notNull().default('APPROVED'),
  hrClearanceStatus: text('hr_clearance_status').notNull().default('APPROVED'),
  overallStatus: text('overall_status').notNull().default('CLEARANCE_COMPLETED'), // INITIATED, CLEARANCE_IN_PROGRESS, CLEARANCE_COMPLETED, SETTLED, CLOSED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 436. Phase 70 Full & Final Settlement (FnF)
export const phase70FullFinalSettlement = pgTable('phase70_full_final_settlement', {
  id: text('id').primaryKey(),
  settlementCode: text('settlement_code').notNull().unique(),
  exitId: text('exit_id').notNull(),
  employeeId: text('employee_id').notNull(),
  lastWorkingDay: text('last_working_day').notNull(),
  pendingSalaryAed: doublePrecision('pending_salary_aed').notNull().default(0),
  leaveEncashmentDays: doublePrecision('leave_encashment_days').notNull().default(0),
  leaveEncashmentAmountAed: doublePrecision('leave_encashment_amount_aed').notNull().default(0),
  gratuityAmountAed: doublePrecision('gratuity_amount_aed').notNull().default(0),
  bonusAed: doublePrecision('bonus_aed').notNull().default(0),
  otherAllowancesAed: doublePrecision('other_allowances_aed').notNull().default(0),
  loanRecoveryAed: doublePrecision('loan_recovery_aed').notNull().default(0),
  noticeRecoveryAed: doublePrecision('notice_recovery_aed').notNull().default(0),
  otherDeductionsAed: doublePrecision('other_deductions_aed').notNull().default(0),
  netPayableAed: doublePrecision('net_payable_aed').notNull().default(0),
  settlementDate: text('settlement_date').notNull(),
  bankReference: text('bank_reference'),
  paymentMode: text('payment_mode').notNull().default('WPS_DIRECT_TRANSFER'),
  approvalStatus: text('approval_status').notNull().default('APPROVED'),
  approvedBy: text('approved_by').notNull().default('Finance Director'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Admin'),
  updatedBy: text('updated_by').notNull().default('Finance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 437. Phase 70 Gratuity Calculations (End-of-Service Benefit)
export const phase70Gratuity = pgTable('phase70_gratuity', {
  id: text('id').primaryKey(),
  gratuityCode: text('gratuity_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  totalServiceYears: doublePrecision('total_service_years').notNull().default(0),
  totalServiceMonths: integer('total_service_months').notNull().default(0),
  lastDrawnBasicSalaryAed: doublePrecision('last_drawn_basic_salary_aed').notNull().default(0),
  formulaType: text('formula_type').notNull().default('UAE_LABOUR_LAW'), // UAE_LABOUR_LAW, INDIAN_GRATUITY_ACT, STANDARD_GULF
  calculatedGratuityAed: doublePrecision('calculated_gratuity_aed').notNull().default(0),
  approvedAmountAed: doublePrecision('approved_amount_aed').notNull().default(0),
  status: text('status').notNull().default('CALCULATED'),
  disbursementDate: text('disbursement_date'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 438. Phase 70 Bonus Allocations
export const phase70Bonus = pgTable('phase70_bonus', {
  id: text('id').primaryKey(),
  bonusCode: text('bonus_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  bonusType: text('bonus_type').notNull().default('ANNUAL_PERFORMANCE'), // ANNUAL_PERFORMANCE, PROJECT_COMPLETION, FESTIVE_EID_DIWALI, RETENTION
  financialYear: text('financial_year').notNull().default('2025-2026'),
  baseAmountAed: doublePrecision('base_amount_aed').notNull().default(0),
  performanceMultiplier: doublePrecision('performance_multiplier').notNull().default(1.0),
  finalBonusAed: doublePrecision('final_bonus_aed').notNull().default(0),
  payoutMonth: text('payout_month').notNull().default('2026-08'),
  approvalStatus: text('approval_status').notNull().default('APPROVED'),
  approvedBy: text('approved_by').notNull().default('Managing Director'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 439. Phase 70 PF, ESI, Professional Tax Configuration
export const phase70PfEsiPt = pgTable('phase70_pf_esi_pt', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  uanNumber: text('uan_number'),
  pfNumber: text('pf_number'),
  employeePfRate: doublePrecision('employee_pf_rate').notNull().default(0.12),
  employerPfRate: doublePrecision('employer_pf_rate').notNull().default(0.12),
  esiNumber: text('esi_number'),
  employeeEsiRate: doublePrecision('employee_esi_rate').notNull().default(0.0075),
  employerEsiRate: doublePrecision('employer_esi_rate').notNull().default(0.0325),
  ptStateCode: text('pt_state_code').notNull().default('MH'),
  ptCategory: text('pt_category').notNull().default('STANDARD'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 440. Phase 70 Tax Deductions (TDS / Income Tax)
export const phase70TaxDeductions = pgTable('phase70_tax_deductions', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  financialYear: text('financial_year').notNull().default('2026-2027'),
  taxRegime: text('tax_regime').notNull().default('NEW_REGIME'), // OLD_REGIME, NEW_REGIME
  declaredInvestmentsAed: doublePrecision('declared_investments_aed').notNull().default(0),
  verifiedInvestmentsAed: doublePrecision('verified_investments_aed').notNull().default(0),
  standardDeductionAed: doublePrecision('standard_deduction_aed').notNull().default(50000),
  taxableIncomeAed: doublePrecision('taxable_income_aed').notNull().default(0),
  annualTaxAed: doublePrecision('annual_tax_aed').notNull().default(0),
  monthlyTdsAed: doublePrecision('monthly_tds_aed').notNull().default(0),
  panTaxId: text('pan_tax_id'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Finance Admin'),
  updatedBy: text('updated_by').notNull().default('Finance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 441. Phase 70 Employee Assets (Equipment, PPE, Laptops)
export const phase70EmployeeAssets = pgTable('phase70_employee_assets', {
  id: text('id').primaryKey(),
  assetCode: text('asset_code').notNull().unique(),
  employeeId: text('employee_id').notNull(),
  assetType: text('asset_type').notNull().default('LAPTOP'), // LAPTOP, MOBILE, SAFETY_PPE_KIT, TOOLBOX, VEHICLE, ID_BADGE
  modelSerialNumber: text('model_serial_number').notNull(),
  allocationDate: text('allocation_date').notNull(),
  returnDueDate: text('return_due_date'),
  returnDate: text('return_date'),
  assetCondition: text('asset_condition').notNull().default('GOOD'),
  depositAmountAed: doublePrecision('deposit_amount_aed').notNull().default(0),
  status: text('status').notNull().default('ALLOCATED'), // ALLOCATED, RETURNED, DAMAGED, LOST
  handoverNotes: text('handover_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Asset Custodian'),
  updatedBy: text('updated_by').notNull().default('Asset Custodian'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 442. Phase 70 Recruitment Requisitions
export const phase70Recruitment = pgTable('phase70_recruitment', {
  id: text('id').primaryKey(),
  requisitionCode: text('requisition_code').notNull().unique(),
  positionTitle: text('position_title').notNull(),
  departmentId: text('department_id').notNull(),
  vacanciesCount: integer('vacancies_count').notNull().default(1),
  experienceYearsRequired: doublePrecision('experience_years_required').notNull().default(3),
  minQualification: text('min_qualification').notNull().default('Bachelor of Engineering'),
  targetHiringDate: text('target_hiring_date').notNull(),
  salaryBudgetAed: doublePrecision('salary_budget_aed').notNull().default(0),
  hiringManagerId: text('hiring_manager_id'),
  priority: text('priority').notNull().default('HIGH'), // LOW, MEDIUM, HIGH, URGENT
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, ON_HOLD, CLOSED, CANCELLED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Talent Acquisition'),
  updatedBy: text('updated_by').notNull().default('HR Talent Acquisition'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 443. Phase 70 Job Openings
export const phase70JobOpenings = pgTable('phase70_job_openings', {
  id: text('id').primaryKey(),
  jobCode: text('job_code').notNull().unique(),
  recruitmentId: text('recruitment_id').notNull(),
  title: text('title').notNull(),
  location: text('location').notNull().default('Abu Dhabi, UAE'),
  employmentType: text('employment_type').notNull().default('FULL_TIME'),
  jobDescription: text('job_description').notNull(),
  keyResponsibilities: text('key_responsibilities').notNull(),
  requirements: text('requirements').notNull(),
  postedDate: text('posted_date').notNull(),
  closingDate: text('closing_date'),
  isPublished: boolean('is_published').notNull().default(true),
  portalUrl: text('portal_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Talent Acquisition'),
  updatedBy: text('updated_by').notNull().default('HR Talent Acquisition'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 444. Phase 70 Candidates
export const phase70Candidates = pgTable('phase70_candidates', {
  id: text('id').primaryKey(),
  candidateCode: text('candidate_code').notNull().unique(),
  jobOpeningId: text('job_opening_id').notNull(),
  fullName: text('full_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  currentCompany: text('current_company'),
  currentDesignation: text('current_designation'),
  totalExperienceYears: doublePrecision('total_experience_years').notNull().default(0),
  noticePeriodDays: integer('notice_period_days').notNull().default(30),
  currentCtcAed: doublePrecision('current_ctc_aed').notNull().default(0),
  expectedCtcAed: doublePrecision('expected_ctc_aed').notNull().default(0),
  resumeUrl: text('resume_url'),
  status: text('status').notNull().default('APPLIED'), // APPLIED, SHORTLISTED, INTERVIEW_SCHEDULED, OFFERED, HIRED, REJECTED
  sourceChannel: text('source_channel').notNull().default('LINKEDIN'), // LINKEDIN, REFERRAL, AGENCY, DIRECT_PORTAL
  rating: doublePrecision('rating').notNull().default(4.0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Talent Acquisition'),
  updatedBy: text('updated_by').notNull().default('HR Talent Acquisition'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 445. Phase 70 Interviews
export const phase70Interviews = pgTable('phase70_interviews', {
  id: text('id').primaryKey(),
  interviewCode: text('interview_code').notNull().unique(),
  candidateId: text('candidate_id').notNull(),
  jobOpeningId: text('job_opening_id').notNull(),
  roundNumber: integer('round_number').notNull().default(1),
  roundType: text('round_type').notNull().default('TECHNICAL_EVALUATION'), // SCREENING, TECHNICAL_EVALUATION, HR_BEHAVIORAL, MANAGEMENT_FINAL
  scheduledAt: text('scheduled_at').notNull(),
  durationMinutes: integer('duration_minutes').notNull().default(45),
  interviewerIds: text('interviewer_ids'),
  interviewerNames: text('interviewer_names').notNull(),
  meetingLinkOrRoom: text('meeting_link_or_room').notNull().default('Conference Room A / Teams'),
  feedbackNotes: text('feedback_notes'),
  candidateScore: doublePrecision('candidate_score').notNull().default(0),
  recommendation: text('recommendation').notNull().default('HIRE'), // STRONG_HIRE, HIRE, ON_HOLD, REJECT
  status: text('status').notNull().default('COMPLETED'), // SCHEDULED, COMPLETED, CANCELLED, NO_SHOW
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Recruiter'),
  updatedBy: text('updated_by').notNull().default('HR Recruiter'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 446. Phase 70 Offer Letters
export const phase70OfferLetters = pgTable('phase70_offer_letters', {
  id: text('id').primaryKey(),
  offerCode: text('offer_code').notNull().unique(),
  candidateId: text('candidate_id').notNull(),
  jobOpeningId: text('job_opening_id').notNull(),
  designationTitle: text('designation_title').notNull(),
  departmentId: text('department_id').notNull(),
  offeredBasicAed: doublePrecision('offered_basic_aed').notNull().default(0),
  offeredHraAed: doublePrecision('offered_hra_aed').notNull().default(0),
  offeredAllowancesAed: doublePrecision('offered_allowances_aed').notNull().default(0),
  totalGrossAed: doublePrecision('total_gross_aed').notNull().default(0),
  joiningDate: text('joining_date').notNull(),
  offerExpiryDate: text('offer_expiry_date').notNull(),
  status: text('status').notNull().default('ACCEPTED'), // DRAFT, ISSUED, ACCEPTED, DECLINED, WITHDRAWN
  signedOfferLetterUrl: text('signed_offer_letter_url'),
  issuedBy: text('issued_by').notNull().default('Head of HR'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Admin'),
  updatedBy: text('updated_by').notNull().default('HR Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 447. Phase 70 Onboarding Tasks & Checklists
export const phase70Onboarding = pgTable('phase70_onboarding', {
  id: text('id').primaryKey(),
  onboardingCode: text('onboarding_code').notNull().unique(),
  candidateId: text('candidate_id'),
  employeeId: text('employee_id'),
  offerId: text('offer_id'),
  scheduledJoiningDate: text('scheduled_joining_date').notNull(),
  actualJoiningDate: text('actual_joining_date'),
  orientationCompleted: boolean('orientation_completed').notNull().default(true),
  documentationStatus: text('documentation_status').notNull().default('COMPLETED'),
  workstationAllocated: boolean('workstation_allocated').notNull().default(true),
  emailCreated: boolean('email_created').notNull().default(true),
  idCardIssued: boolean('id_card_issued').notNull().default(true),
  bankAccountLinked: boolean('bank_account_linked').notNull().default(true),
  buddyAssigned: text('buddy_assigned'),
  status: text('status').notNull().default('COMPLETED'), // PRE_JOINING, IN_PROGRESS, COMPLETED, DROPPED
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Onboarding Coordinator'),
  updatedBy: text('updated_by').notNull().default('HR Onboarding Coordinator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 448. Phase 70 HR Notifications & Broadcasts
export const phase70HrNotifications = pgTable('phase70_hr_notifications', {
  id: text('id').primaryKey(),
  notificationType: text('notification_type').notNull().default('SYSTEM'), // LEAVE_APPROVED, PAYROLL_READY, APPRAISAL_DUE, POLICY_UPDATE, DOCUMENT_EXPIRING
  recipientId: text('recipient_id').notNull(), // User ID or 'ALL_EMPLOYEES'
  title: text('title').notNull(),
  message: text('message').notNull(),
  actionUrl: text('action_url'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: text('read_at'),
  priority: text('priority').notNull().default('NORMAL'), // LOW, NORMAL, HIGH, CRITICAL
  metadataJson: text('metadata_json'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR System'),
  updatedBy: text('updated_by').notNull().default('HR System'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 449. Phase 70 HR Audit Logs
export const phase70HrAuditLogs = pgTable('phase70_hr_audit_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(), // EMPLOYEE_ONBOARD, SALARY_UPDATE, PAYROLL_DISBURSED, LEAVE_ACTION, PERFORMANCE_SUBMIT, EXIT_INITIATE
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  referenceNumber: text('reference_number').notNull(),
  performedBy: text('performed_by').notNull(),
  detailsJson: text('details_json'),
  timestamp: text('timestamp').notNull(),
  ipAddress: text('ip_address'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('HR Auditor'),
  updatedBy: text('updated_by').notNull().default('HR Auditor'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ==========================================
// PHASE 71: ENTERPRISE ASSET MANAGEMENT (EAM) & PLANT MAINTENANCE
// ==========================================

// 450. Phase 71 Asset Categories
export const phase71AssetCategories = pgTable('phase71_asset_categories', {
  id: text('id').primaryKey(),
  categoryCode: text('category_code').notNull().unique(),
  categoryName: text('category_name').notNull(),
  description: text('description'),
  defaultDepreciationYears: integer('default_depreciation_years').notNull().default(10),
  icon: text('icon').notNull().default('Wrench'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 451. Phase 71 Asset Groups
export const phase71AssetGroups = pgTable('phase71_asset_groups', {
  id: text('id').primaryKey(),
  groupCode: text('group_code').notNull().unique(),
  groupName: text('group_name').notNull(),
  categoryId: text('category_id').notNull(),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 452. Phase 71 Asset Locations
export const phase71AssetLocations = pgTable('phase71_asset_locations', {
  id: text('id').primaryKey(),
  locationCode: text('location_code').notNull().unique(),
  locationName: text('location_name').notNull(),
  siteName: text('site_name').notNull().default('Main Plant / Central Yard'),
  zone: text('zone'),
  building: text('building'),
  floor: text('floor'),
  latitude: doublePrecision('latitude'),
  longitude: doublePrecision('longitude'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 453. Phase 71 Asset Master
export const phase71AssetMaster = pgTable('phase71_asset_master', {
  id: text('id').primaryKey(),
  assetCode: text('asset_code').notNull().unique(),
  assetName: text('asset_name').notNull(),
  categoryId: text('category_id').notNull(),
  groupId: text('group_id'),
  locationId: text('location_id'),
  parentAssetId: text('parent_asset_id'),
  serialNumber: text('serial_number'),
  modelNumber: text('model_number'),
  manufacturer: text('manufacturer'),
  barcode: text('barcode'),
  rfidTag: text('rfid_tag'),
  status: text('status').notNull().default('OPERATIONAL'),
  criticality: text('criticality').notNull().default('MEDIUM'),
  purchaseDate: text('purchase_date'),
  purchaseCostAed: doublePrecision('purchase_cost_aed').notNull().default(0),
  currentBookValueAed: doublePrecision('current_book_value_aed').notNull().default(0),
  warrantyExpiryDate: text('warranty_expiry_date'),
  operatingHours: doublePrecision('operating_hours').notNull().default(0),
  runningMeterReading: doublePrecision('running_meter_reading').notNull().default(0),
  meterUnit: text('meter_unit').notNull().default('HOURS'),
  assignedToEmployeeId: text('assigned_to_employee_id'),
  department: text('department').notNull().default('Plant & Machinery'),
  projectId: text('project_id'),
  specificationsJson: text('specifications_json'),
  photoUrl: text('photo_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 454. Phase 71 Asset Specifications
export const phase71AssetSpecifications = pgTable('phase71_asset_specifications', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  specName: text('spec_name').notNull(),
  specValue: text('spec_value').notNull(),
  unitOfMeasure: text('unit_of_measure'),
  isCritical: boolean('is_critical').notNull().default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 455. Phase 71 Asset Hierarchy
export const phase71AssetHierarchy = pgTable('phase71_asset_hierarchy', {
  id: text('id').primaryKey(),
  parentAssetId: text('parent_asset_id').notNull(),
  childAssetId: text('child_asset_id').notNull(),
  hierarchyLevel: integer('hierarchy_level').notNull().default(1),
  relationType: text('relation_type').notNull().default('SUB_ASSET'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 456. Phase 71 Asset Criticality
export const phase71AssetCriticality = pgTable('phase71_asset_criticality', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull().unique(),
  safetyImpactScore: integer('safety_impact_score').notNull().default(3),
  environmentalImpactScore: integer('environmental_impact_score').notNull().default(3),
  productionLossScore: integer('production_loss_score').notNull().default(3),
  maintenanceCostScore: integer('maintenance_cost_score').notNull().default(3),
  spareLeadTimeScore: integer('spare_lead_time_score').notNull().default(3),
  totalRiskScore: integer('total_risk_score').notNull().default(15),
  rcmCategory: text('rcm_category').notNull().default('CLASS_A_CRITICAL'),
  recommendations: text('recommendations'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 457. Phase 71 Asset Lifecycle
export const phase71AssetLifecycle = pgTable('phase71_asset_lifecycle', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  stage: text('stage').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date'),
  expectedUsefulLifeYears: doublePrecision('expected_useful_life_years').notNull().default(10),
  accumulatedOperatingHours: doublePrecision('accumulated_operating_hours').notNull().default(0),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 458. Phase 71 Asset Acquisition
export const phase71AssetAcquisition = pgTable('phase71_asset_acquisition', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  poNumber: text('po_number'),
  vendorName: text('vendor_name').notNull(),
  invoiceNumber: text('invoice_number'),
  purchasePriceAed: doublePrecision('purchase_price_aed').notNull().default(0),
  customsDutyAed: doublePrecision('customs_duty_aed').notNull().default(0),
  freightCostAed: doublePrecision('freight_cost_aed').notNull().default(0),
  installationCostAed: doublePrecision('installation_cost_aed').notNull().default(0),
  totalCapitalizedCostAed: doublePrecision('total_capitalized_cost_aed').notNull().default(0),
  deliveryDate: text('delivery_date'),
  commissioningDate: text('commissioning_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 459. Phase 71 Asset Depreciation
export const phase71AssetDepreciation = pgTable('phase71_asset_depreciation', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  fiscalYear: text('fiscal_year').notNull(),
  depreciationMethod: text('depreciation_method').notNull().default('STRAIGHT_LINE'),
  openingBookValueAed: doublePrecision('opening_book_value_aed').notNull(),
  depreciationRatePercent: doublePrecision('depreciation_rate_percent').notNull().default(10),
  depreciationAmountAed: doublePrecision('depreciation_amount_aed').notNull(),
  closingBookValueAed: doublePrecision('closing_book_value_aed').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Finance'),
  updatedBy: text('updated_by').notNull().default('EAM Finance'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 460. Phase 71 Asset Warranty
export const phase71AssetWarranty = pgTable('phase71_asset_warranty', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  warrantyType: text('warranty_type').notNull().default('OEM_COMPREHENSIVE'),
  providerName: text('provider_name').notNull(),
  policyNumber: text('policy_number'),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  coverageDetails: text('coverage_details'),
  contactPerson: text('contact_person'),
  contactPhone: text('contact_phone'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 461. Phase 71 Asset Manuals
export const phase71AssetManuals = pgTable('phase71_asset_manuals', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  docTitle: text('doc_title').notNull(),
  docType: text('doc_type').notNull().default('OEM_MANUAL'),
  fileUrl: text('file_url').notNull(),
  version: text('version').notNull().default('v1.0'),
  fileSizeBytes: integer('file_size_bytes').notNull().default(1024),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Admin'),
  updatedBy: text('updated_by').notNull().default('EAM Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 462. Phase 71 Asset Photos
export const phase71AssetPhotos = pgTable('phase71_asset_photos', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  photoUrl: text('photo_url').notNull(),
  photoCaption: text('photo_caption'),
  photoType: text('photo_type').notNull().default('NAMEPLATE'),
  takenAt: text('taken_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('EAM Inspector'),
  updatedBy: text('updated_by').notNull().default('EAM Inspector'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 463. Phase 71 Preventive Maintenance Plans
export const phase71PreventiveMaintenancePlans = pgTable('phase71_preventive_maintenance_plans', {
  id: text('id').primaryKey(),
  planCode: text('plan_code').notNull().unique(),
  planTitle: text('plan_title').notNull(),
  categoryId: text('category_id'),
  assetId: text('asset_id'),
  frequencyType: text('frequency_type').notNull().default('TIME_BASED'),
  intervalDays: integer('interval_days').notNull().default(30),
  meterInterval: doublePrecision('meter_interval').notNull().default(500),
  estimatedDurationHours: doublePrecision('estimated_duration_hours').notNull().default(4),
  requiredCrewCount: integer('required_crew_count').notNull().default(2),
  estimatedCostAed: doublePrecision('estimated_cost_aed').notNull().default(1500),
  checklistTemplateJson: text('checklist_template_json'),
  safetyGuidelines: text('safety_guidelines'),
  status: text('status').notNull().default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Maintenance Planner'),
  updatedBy: text('updated_by').notNull().default('Maintenance Planner'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 464. Phase 71 Maintenance Schedules
export const phase71MaintenanceSchedules = pgTable('phase71_maintenance_schedules', {
  id: text('id').primaryKey(),
  scheduleCode: text('schedule_code').notNull().unique(),
  planId: text('plan_id').notNull(),
  assetId: text('asset_id').notNull(),
  scheduledDate: text('scheduled_date').notNull(),
  dueDate: text('due_date').notNull(),
  triggerSource: text('trigger_source').notNull().default('CALENDAR_CADENCE'),
  status: text('status').notNull().default('SCHEDULED'),
  assignedTeam: text('assigned_team').notNull().default('Mechanical Maintenance Crew A'),
  leadTechnicianId: text('lead_technician_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Maintenance Planner'),
  updatedBy: text('updated_by').notNull().default('Maintenance Planner'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 465. Phase 71 Maintenance Work Orders
export const phase71MaintenanceWorkOrders = pgTable('phase71_maintenance_work_orders', {
  id: text('id').primaryKey(),
  workOrderNumber: text('work_order_number').notNull().unique(),
  title: text('title').notNull(),
  workOrderType: text('work_order_type').notNull().default('PREVENTIVE'),
  priority: text('priority').notNull().default('MEDIUM'),
  assetId: text('asset_id').notNull(),
  scheduleId: text('schedule_id'),
  breakdownId: text('breakdown_id'),
  workOrderId: text('work_order_id'),
  status: text('status').notNull().default('OPEN'),
  requestedBy: text('requested_by').notNull().default('Operations Supervisor'),
  assignedTo: text('assigned_to').notNull().default('Sr. Maintenance Engineer'),
  plannedStartDate: text('planned_start_date').notNull(),
  plannedEndDate: text('planned_end_date').notNull(),
  actualStartDate: text('actual_start_date'),
  actualEndDate: text('actual_end_date'),
  totalLaborHours: doublePrecision('total_labor_hours').notNull().default(0),
  totalLaborCostAed: doublePrecision('total_labor_cost_aed').notNull().default(0),
  totalPartsCostAed: doublePrecision('total_parts_cost_aed').notNull().default(0),
  totalOtherCostAed: doublePrecision('total_other_cost_aed').notNull().default(0),
  totalCostAed: doublePrecision('total_cost_aed').notNull().default(0),
  failureCode: text('failure_code'),
  resolutionSummary: text('resolution_summary'),
  isDowntimeCaused: boolean('is_downtime_caused').notNull().default(false),
  downtimeMinutes: doublePrecision('downtime_minutes').notNull().default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Maintenance Admin'),
  updatedBy: text('updated_by').notNull().default('Maintenance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 466. Phase 71 Maintenance Tasks
export const phase71MaintenanceTasks = pgTable('phase71_maintenance_tasks', {
  id: text('id').primaryKey(),
  workOrderId: text('work_order_id').notNull(),
  taskSequence: integer('task_sequence').notNull().default(1),
  taskDescription: text('task_description').notNull(),
  taskType: text('task_type').notNull().default('INSPECTION_SERVICE'),
  estimatedMinutes: integer('estimated_minutes').notNull().default(60),
  actualMinutes: integer('actual_minutes').notNull().default(0),
  status: text('status').notNull().default('PENDING'),
  completedBy: text('completed_by'),
  completedAt: text('completed_at'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Maintenance Tech'),
  updatedBy: text('updated_by').notNull().default('Maintenance Tech'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 467. Phase 71 Maintenance Checklists
export const phase71MaintenanceChecklists = pgTable('phase71_maintenance_checklists', {
  id: text('id').primaryKey(),
  workOrderId: text('work_order_id').notNull(),
  taskId: text('task_id'),
  checkItem: text('check_item').notNull(),
  expectedCondition: text('expected_condition').notNull(),
  observedCondition: text('observed_condition'),
  isPassed: boolean('is_passed').notNull().default(true),
  isMandatory: boolean('is_mandatory').notNull().default(true),
  checkedBy: text('checked_by'),
  checkedAt: text('checked_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Health Sentinel'),
  updatedBy: text('updated_by').notNull().default('Health Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 9. phase74_ai_failover_logs
export const phase74AiFailoverLogs = pgTable('phase74_ai_failover_logs', {
  id: text('id').primaryKey(),
  requestId: text('request_id').notNull(),
  taskType: text('task_type').notNull(),
  primaryProvider: text('primary_provider').notNull(),
  primaryModel: text('primary_model').notNull(),
  failoverProvider: text('failover_provider').notNull(),
  failoverModel: text('failover_model').notNull(),
  triggerReason: text('trigger_reason').notNull(), // TIMEOUT, RATE_LIMIT_EXCEEDED, HTTP_5XX, AUTH_FAILURE, CIRCUIT_BREAKER_OPEN
  primaryLatencyMs: integer('primary_latency_ms').notNull().default(0),
  failoverLatencyMs: integer('failover_latency_ms').notNull().default(0),
  failoverStatus: text('failover_status').notNull().default('RESOLVED_BY_FALLBACK'), // RESOLVED_BY_FALLBACK, ALL_PROVIDERS_FAILED, TERMINATED
  occurredAt: text('occurred_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Failover Engine'),
  updatedBy: text('updated_by').notNull().default('Failover Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 10. phase74_ai_quality_evaluations
export const phase74AiQualityEvaluations = pgTable('phase74_ai_quality_evaluations', {
  id: text('id').primaryKey(),
  evaluationCode: text('evaluation_code').notNull().unique(),
  comparisonTitle: text('comparison_title').notNull(),
  taskType: text('task_type').notNull(),
  benchmarkPrompt: text('benchmark_prompt').notNull(),
  groundTruthText: text('ground_truth_text'),
  modelACode: text('model_a_code').notNull(),
  modelBCode: text('model_b_code').notNull(),
  modelAResponse: text('model_a_response').notNull(),
  modelBResponse: text('model_b_response').notNull(),
  modelALatencyMs: integer('model_a_latency_ms').notNull().default(180),
  modelBLatencyMs: integer('model_b_latency_ms').notNull().default(340),
  modelACostUsd: real('model_a_cost_usd').notNull().default(0.0002),
  modelBCostUsd: real('model_b_cost_usd').notNull().default(0.0012),
  modelAScore: real('model_a_score').notNull().default(4.8),
  modelBScore: real('model_b_score').notNull().default(4.6),
  winnerModelCode: text('winner_model_code').notNull(),
  evaluatorNotes: text('evaluator_notes'),
  evaluatedByUserId: text('evaluated_by_user_id').notNull(),
  evaluatedAt: text('evaluated_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Quality Benchmarker'),
  updatedBy: text('updated_by').notNull().default('Quality Benchmarker'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 11. phase74_ai_rate_limits
export const phase74AiRateLimits = pgTable('phase74_ai_rate_limits', {
  id: text('id').primaryKey(),
  entityType: text('entity_type').notNull(), // USER, ROLE, API_CLIENT, PROVIDER
  entityKey: text('entity_key').notNull(),
  windowSeconds: integer('window_seconds').notNull().default(60),
  maxRequestsPerWindow: integer('max_requests_per_window').notNull().default(60),
  maxTokensPerWindow: integer('max_tokens_per_window').notNull().default(50000),
  currentRequests: integer('current_requests').notNull().default(0),
  currentTokens: integer('current_tokens').notNull().default(0),
  windowResetAt: text('window_reset_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Rate Limiter'),
  updatedBy: text('updated_by').notNull().default('Rate Limiter'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 12. phase74_ai_data_policies
export const phase74AiDataPolicies = pgTable('phase74_ai_data_policies', {
  id: text('id').primaryKey(),
  policyCode: text('policy_code').notNull().unique(),
  policyName: text('policy_name').notNull(),
  classificationLevel: text('classification_level').notNull(), // PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED
  allowedExternalProvidersJson: text('allowed_external_providers_json').notNull().default('["GEMINI","OPENAI"]'),
  allowCloudLlmTransmission: boolean('allow_cloud_llm_transmission').notNull().default(true),
  anonymizationRequired: boolean('anonymization_required').notNull().default(true),
  redactPiiFieldsJson: text('redact_pii_fields_json').notNull().default('["salary","bankAccount","nationalId","password","phone"]'),
  description: text('description').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Data Governance Officer'),
  updatedBy: text('updated_by').notNull().default('Data Governance Officer'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 13. phase74_ai_api_clients
export const phase74AiApiClients = pgTable('phase74_ai_api_clients', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().unique(), // e.g. client_scada_gateway_01
  clientName: text('client_name').notNull(),
  description: text('description').notNull(),
  clientType: text('client_type').notNull().default('SERVICE_ACCOUNT'), // SERVICE_ACCOUNT, THIRD_PARTY, SCADA_BRIDGE, MOBILE_APP
  scopesJson: text('scopes_json').notNull().default('["ai:read","ai:execute","telemetry:write"]'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, REVOKED, SUSPENDED, EXPIRED
  rateLimitRpm: integer('rate_limit_rpm').notNull().default(120),
  rateLimitTpm: integer('rate_limit_tpm').notNull().default(200000),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  secretHash: text('secret_hash').notNull(),
  secretPrefix: text('secret_prefix').notNull(), // e.g. sk_live_8f...
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Integration Administrator'),
  updatedBy: text('updated_by').notNull().default('Integration Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 14. phase74_ai_api_keys
export const phase74AiApiKeys = pgTable('phase74_ai_api_keys', {
  id: text('id').primaryKey(),
  clientId: text('client_id').notNull().references(() => phase74AiApiClients.id),
  keyName: text('key_name').notNull(),
  keyPrefix: text('key_prefix').notNull(),
  keyHash: text('key_hash').notNull(),
  status: text('status').notNull().default('ACTIVE'),
  lastUsedAt: text('last_used_at'),
  expiresAt: text('expires_at'),
  revokedAt: text('revoked_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 15. phase74_ai_integration_endpoints
export const phase74AiIntegrationEndpoints = pgTable('phase74_ai_integration_endpoints', {
  id: text('id').primaryKey(),
  endpointCode: text('endpoint_code').notNull().unique(), // ESSL_BIOMETRIC, KWA_BILLING_API, SCADA_OPC_UA, SAP_FIN_CONNECTOR, GIS_LAYER_FEED
  name: text('name').notNull(),
  category: text('category').notNull().default('REST_API'), // REST_API, WEBHOOK, MQTT, OPC_UA, DATABASE_LINK
  targetUrl: text('target_url').notNull(),
  authMethod: text('auth_method').notNull().default('BEARER_TOKEN'), // BEARER_TOKEN, BASIC_AUTH, API_KEY_HEADER, HMAC_SHA256, MUTUAL_TLS
  headersJson: text('headers_json'),
  syncDirection: text('sync_direction').notNull().default('INBOUND_OUTBOUND'), // INBOUND, OUTBOUND, INBOUND_OUTBOUND
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, DISABLED, ERROR_BACKOFF
  consecutiveFailures: integer('consecutive_failures').notNull().default(0),
  lastSyncAt: text('last_sync_at'),
  nextSyncAt: text('next_sync_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Integration Administrator'),
  updatedBy: text('updated_by').notNull().default('Integration Administrator'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 16. phase74_ai_webhooks
export const phase74AiWebhooks = pgTable('phase74_ai_webhooks', {
  id: text('id').primaryKey(),
  webhookCode: text('webhook_code').notNull().unique(),
  name: text('name').notNull(),
  targetUrl: text('target_url').notNull(),
  secretKey: text('secret_key').notNull(), // for HMAC-SHA256 signing
  subscribedEventsJson: text('subscribed_events_json').notNull().default('["project.updated","procurement.created","alarm.critical","ai.alert.created"]'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, PAUSED, FAILING, DISABLED
  retryPolicyJson: text('retry_policy_json').notNull().default('{"maxRetries":3,"backoffSeconds":30,"exponential":true}'),
  totalDispatches: integer('total_dispatches').notNull().default(0),
  successfulDispatches: integer('successful_dispatches').notNull().default(0),
  failedDispatches: integer('failed_dispatches').notNull().default(0),
  lastTriggeredAt: text('last_triggered_at'),
  lastResponseStatus: integer('last_response_status'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Webhook Manager'),
  updatedBy: text('updated_by').notNull().default('Webhook Manager'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 17. phase74_ai_webhook_events
export const phase74AiWebhookEvents = pgTable('phase74_ai_webhook_events', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull().unique(),
  eventType: text('event_type').notNull(), // project.created, procurement.created, purchase_order.approved, invoice.created, payment.posted, employee.created, work_order.created, inspection.failed, ncr.created, incident.created, permit.expired, alarm.critical, ai.alert.created
  payloadJson: text('payload_json').notNull(),
  sourceModule: text('source_module').notNull(),
  emittedByUserId: text('emitted_by_user_id'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Event Bus'),
  updatedBy: text('updated_by').notNull().default('Event Bus'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 18. phase74_ai_event_subscriptions
export const phase74AiEventSubscriptions = pgTable('phase74_ai_event_subscriptions', {
  id: text('id').primaryKey(),
  subscriptionCode: text('subscription_code').notNull().unique(),
  webhookId: text('webhook_id').notNull().references(() => phase74AiWebhooks.id),
  eventType: text('event_type').notNull(),
  filterConditionJson: text('filter_condition_json'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('SYSTEM'),
  updatedBy: text('updated_by').notNull().default('SYSTEM'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 19. phase74_ai_sync_jobs
export const phase74AiSyncJobs = pgTable('phase74_ai_sync_jobs', {
  id: text('id').primaryKey(),
  jobCode: text('job_code').notNull().unique(),
  jobName: text('job_name').notNull(),
  endpointId: text('endpoint_id').notNull().references(() => phase74AiIntegrationEndpoints.id),
  scheduleCron: text('schedule_cron').notNull().default('0 */1 * * *'),
  batchSize: integer('batch_size').notNull().default(100),
  status: text('status').notNull().default('IDLE'), // IDLE, RUNNING, COMPLETED, FAILED, RETRYING
  lastRunStatus: text('last_run_status').notNull().default('SUCCESS'),
  recordsProcessed: integer('records_processed').notNull().default(0),
  recordsFailed: integer('records_failed').notNull().default(0),
  lastDurationMs: integer('last_duration_ms').notNull().default(0),
  lastRunAt: text('last_run_at'),
  nextRunAt: text('next_run_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Integration Scheduler'),
  updatedBy: text('updated_by').notNull().default('Integration Scheduler'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 20. phase74_ai_integration_logs
export const phase74AiIntegrationLogs = pgTable('phase74_ai_integration_logs', {
  id: text('id').primaryKey(),
  traceId: text('trace_id').notNull(),
  integrationType: text('integration_type').notNull(), // WEBHOOK_DELIVERY, REST_SYNC, API_CLIENT_REQUEST, DEAD_LETTER_QUEUE
  targetOrSource: text('target_or_source').notNull(),
  direction: text('direction').notNull(), // INBOUND, OUTBOUND
  httpMethod: text('http_method').notNull().default('POST'),
  httpStatus: integer('http_status').notNull().default(200),
  durationMs: integer('duration_ms').notNull().default(45),
  status: text('status').notNull(), // SUCCESS, FAILED, RETRIED, DEAD_LETTER
  requestSummary: text('request_summary').notNull(),
  responseSummary: text('response_summary'),
  errorMessage: text('error_message'),
  retryCount: integer('retry_count').notNull().default(0),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Integration Logger'),
  updatedBy: text('updated_by').notNull().default('Integration Logger'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 21. phase74_ai_gateway_audit_logs
export const phase74AiGatewayAuditLogs = pgTable('phase74_ai_gateway_audit_logs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  userRole: text('user_role').notNull(),
  action: text('action').notNull(), // GATEWAY_CONFIG_UPDATED, PROVIDER_SWITCHED, ROUTING_POLICY_CHANGED, API_CLIENT_CREATED, API_CLIENT_REVOKED, FAILOVER_TRIGGERED, DATA_POLICY_VIOLATION
  details: text('details').notNull(),
  previousStateJson: text('previous_state_json'),
  newStateJson: text('new_state_json'),
  ipAddress: text('ip_address'),
  userAgent: text('user_agent'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Gateway Audit Sentinel'),
  updatedBy: text('updated_by').notNull().default('Gateway Audit Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 22. phase74_ai_provider_metrics
export const phase74AiProviderMetrics = pgTable('phase74_ai_provider_metrics', {
  id: text('id').primaryKey(),
  providerCode: text('provider_code').notNull(),
  modelCode: text('model_code').notNull(),
  uptimePercentage24h: real('uptime_percentage_24h').notNull().default(99.9),
  totalCalls24h: integer('total_calls_24h').notNull().default(0),
  failedCalls24h: integer('failed_calls_24h').notNull().default(0),
  averageLatencyMs24h: integer('average_latency_ms_24h').notNull().default(220),
  p95LatencyMs: integer('p95_latency_ms').notNull().default(480),
  p99LatencyMs: integer('p99_latency_ms').notNull().default(850),
  totalTokens24h: integer('total_tokens_24h').notNull().default(0),
  totalCostUsd24h: real('total_cost_usd_24h').notNull().default(0.0),
  lastUpdated: text('last_updated').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Metrics Collector'),
  updatedBy: text('updated_by').notNull().default('Metrics Collector'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 75: ENTERPRISE ERP ORCHESTRATION, CROSS-MODULE INTEGRATION & COMMAND CENTER
// ============================================================================

// 1. phase75_domain_events
export const phase75DomainEvents = pgTable('phase75_domain_events', {
  id: text('id').primaryKey(),
  eventType: text('event_type').notNull(), // e.g. PO_DELIVERY_DELAYED, SCADA_ALARM_CRITICAL
  sourceModule: text('source_module').notNull(), // e.g. PROCUREMENT, SCADA, QAQC, HSE
  entityType: text('entity_type').notNull(), // e.g. PURCHASE_ORDER, SCADA_DEVICE, NCR
  entityId: text('entity_id').notNull(),
  projectId: text('project_id'),
  severity: text('severity').notNull().default('INFO'), // INFO, LOW, MEDIUM, HIGH, CRITICAL
  payload: text('payload').notNull().default('{}'), // JSON string
  metadata: text('metadata').notNull().default('{}'), // JSON string
  correlationId: text('correlation_id').notNull(),
  causationId: text('causation_id'),
  idempotencyKey: text('idempotency_key').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, PROCESSING, COMPLETED, FAILED, DEAD_LETTER
  retryCount: integer('retry_count').notNull().default(0),
  maxRetries: integer('max_retries').notNull().default(3),
  errorMessage: text('error_message'),
  processedAt: text('processed_at'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Event Bus Sentinel'),
  updatedBy: text('updated_by').notNull().default('Event Bus Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 2. phase75_event_handlers
export const phase75EventHandlers = pgTable('phase75_event_handlers', {
  id: text('id').primaryKey(),
  handlerCode: text('handler_code').notNull(),
  name: text('name').notNull(),
  eventType: text('event_type').notNull(),
  targetModule: text('target_module').notNull(),
  executionOrder: integer('execution_order').notNull().default(1),
  isAsync: boolean('is_async').notNull().default(true),
  timeoutMs: integer('timeout_ms').notNull().default(5000),
  retryLimit: integer('retry_limit').notNull().default(3),
  isEnabled: boolean('is_enabled').notNull().default(true),
  description: text('description').notNull().default(''),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Admin'),
  updatedBy: text('updated_by').notNull().default('System Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 3. phase75_event_processing_logs
export const phase75EventProcessingLogs = pgTable('phase75_event_processing_logs', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull(),
  handlerId: text('handler_id').notNull(),
  handlerCode: text('handler_code').notNull(),
  status: text('status').notNull(), // SUCCESS, FAILED, SKIPPED, RETRIED
  executionTimeMs: integer('execution_time_ms').notNull().default(0),
  resultSummary: text('result_summary').notNull().default(''),
  errorDetails: text('error_details'),
  attemptNumber: integer('attempt_number').notNull().default(1),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Orchestration Engine'),
  updatedBy: text('updated_by').notNull().default('Orchestration Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 4. phase75_failed_events
export const phase75FailedEvents = pgTable('phase75_failed_events', {
  id: text('id').primaryKey(),
  eventId: text('event_id').notNull(),
  eventType: text('event_type').notNull(),
  sourceModule: text('source_module').notNull(),
  failureReason: text('failure_reason').notNull(),
  errorStack: text('error_stack'),
  lastAttemptAt: text('last_attempt_at').notNull(),
  totalRetries: integer('total_retries').notNull().default(0),
  isResolved: boolean('is_resolved').notNull().default(false),
  resolvedBy: text('resolved_by'),
  resolvedAt: text('resolved_at'),
  resolutionNote: text('resolution_note'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Dead Letter Queue'),
  updatedBy: text('updated_by').notNull().default('Dead Letter Queue'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 5. phase75_event_replays
export const phase75EventReplays = pgTable('phase75_event_replays', {
  id: text('id').primaryKey(),
  replayBatchId: text('replay_batch_id').notNull(),
  eventId: text('event_id').notNull(),
  requestedBy: text('requested_by').notNull(),
  status: text('status').notNull().default('PENDING'), // PENDING, SUCCESS, FAILED
  replayCount: integer('replay_count').notNull().default(1),
  outcomeMessage: text('outcome_message'),
  replayedAt: text('replayed_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Replay Controller'),
  updatedBy: text('updated_by').notNull().default('Replay Controller'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 6. phase75_orchestration_rules
export const phase75OrchestrationRules = pgTable('phase75_orchestration_rules', {
  id: text('id').primaryKey(),
  ruleCode: text('rule_code').notNull(),
  ruleName: text('rule_name').notNull(),
  description: text('description').notNull().default(''),
  triggerEventType: text('trigger_event_type').notNull(),
  conditionJson: text('condition_json').notNull().default('{}'), // JSON filtering criteria
  actionType: text('action_type').notNull(), // CREATE_ACTION, DISPATCH_ALERT, TRIGGER_WORKFLOW, UPDATE_PROJECT_HEALTH
  actionPayloadTemplate: text('action_payload_template').notNull().default('{}'),
  targetModule: text('target_module').notNull(),
  priority: integer('priority').notNull().default(10),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Rules Sentinel'),
  updatedBy: text('updated_by').notNull().default('Rules Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 7. phase75_orchestration_actions
export const phase75OrchestrationActions = pgTable('phase75_orchestration_actions', {
  id: text('id').primaryKey(),
  actionCode: text('action_code').notNull(),
  ruleId: text('rule_id'),
  eventId: text('event_id'),
  actionType: text('action_type').notNull(),
  targetModule: text('target_module').notNull(),
  status: text('status').notNull().default('EXECUTED'), // PENDING, EXECUTED, FAILED
  executionResult: text('execution_result').notNull().default('{}'),
  executedAt: text('executed_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Action Executor'),
  updatedBy: text('updated_by').notNull().default('Action Executor'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 8. phase75_correlated_alerts
export const phase75CorrelatedAlerts = pgTable('phase75_correlated_alerts', {
  id: text('id').primaryKey(),
  correlationGroup: text('correlation_group').notNull(), // e.g. CRITICAL_EQUIPMENT_SUPPLY_RISK
  title: text('title').notNull(),
  severity: text('severity').notNull(), // LOW, MEDIUM, HIGH, CRITICAL
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, ACKNOWLEDGED, RESOLVED, SUPPRESSED
  projectId: text('project_id'),
  relatedEntities: text('related_entities').notNull().default('[]'), // JSON array
  sourceEventIds: text('source_event_ids').notNull().default('[]'), // JSON array
  impactAssessment: text('impact_assessment').notNull().default(''),
  recommendedAction: text('recommended_action').notNull().default(''),
  aiInsightText: text('ai_insight_text'),
  aiClassification: text('ai_classification').notNull().default('RULE-BASED'), // DATA-DERIVED, CALCULATED, RULE-BASED, AI-ASSISTED, AI-PREDICTED
  acknowledgedBy: text('acknowledged_by'),
  acknowledgedAt: text('acknowledged_at'),
  resolvedBy: text('resolved_by'),
  resolvedAt: text('resolved_at'),
  resolutionSummary: text('resolution_summary'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Correlation Engine'),
  updatedBy: text('updated_by').notNull().default('Correlation Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 9. phase75_project_health
export const phase75ProjectHealth = pgTable('phase75_project_health', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  overallScore: real('overall_score').notNull().default(85.0), // 0 to 100
  overallStatus: text('overall_status').notNull().default('GREEN'), // GREEN, AMBER, RED, CRITICAL
  scheduleScore: real('schedule_score').notNull().default(85.0),
  costScore: real('cost_score').notNull().default(85.0),
  procurementScore: real('procurement_score').notNull().default(85.0),
  cashFlowScore: real('cash_flow_score').notNull().default(85.0),
  qaqcScore: real('qaqc_score').notNull().default(90.0),
  hseScore: real('hse_score').notNull().default(95.0),
  equipmentScore: real('equipment_score').notNull().default(85.0),
  manpowerScore: real('manpower_score').notNull().default(85.0),
  documentScore: real('document_score').notNull().default(90.0),
  clientScore: real('client_score').notNull().default(88.0),
  // Risk assessments
  scheduleRisk: text('schedule_risk').notNull().default('LOW'),
  costRisk: text('cost_risk').notNull().default('LOW'),
  procurementRisk: text('procurement_risk').notNull().default('LOW'),
  qualityRisk: text('quality_risk').notNull().default('LOW'),
  safetyRisk: text('safety_risk').notNull().default('LOW'),
  equipmentRisk: text('equipment_risk').notNull().default('LOW'),
  manpowerRisk: text('manpower_risk').notNull().default('LOW'),
  clientRisk: text('client_risk').notNull().default('LOW'),
  activeCriticalAlertsCount: integer('active_critical_alerts_count').notNull().default(0),
  activeActionItemsCount: integer('active_action_items_count').notNull().default(0),
  lastCalculatedAt: text('last_calculated_at').notNull(),
  calculationMethod: text('calculation_method').notNull().default('DETERMINISTIC_WEIGHTED'),
  aiSummary: text('ai_summary'),
  aiSummaryClassification: text('ai_summary_classification').notNull().default('CALCULATED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Project Health Engine'),
  updatedBy: text('updated_by').notNull().default('Project Health Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 10. phase75_project_health_snapshots
export const phase75ProjectHealthSnapshots = pgTable('phase75_project_health_snapshots', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  snapshotDate: text('snapshot_date').notNull(),
  overallScore: real('overall_score').notNull(),
  overallStatus: text('overall_status').notNull(),
  dimensionScoresJson: text('dimension_scores_json').notNull().default('{}'),
  keyFactors: text('key_factors').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Health Snapshot Worker'),
  updatedBy: text('updated_by').notNull().default('Health Snapshot Worker'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 11. phase75_enterprise_actions
export const phase75EnterpriseActions = pgTable('phase75_enterprise_actions', {
  id: text('id').primaryKey(),
  actionNumber: text('action_number').notNull(), // e.g. ACT-2026-001
  title: text('title').notNull(),
  description: text('description').notNull().default(''),
  actionType: text('action_type').notNull(), // TASK, APPROVAL, ESCALATION, RECOMMENDATION, FOLLOWUP
  priority: text('priority').notNull().default('MEDIUM'), // LOW, MEDIUM, HIGH, URGENT, CRITICAL
  status: text('status').notNull().default('OPEN'), // OPEN, IN_PROGRESS, PENDING_APPROVAL, RESOLVED, CANCELLED, ESCALATED
  sourceModule: text('source_module').notNull(),
  targetModule: text('target_module').notNull(),
  projectId: text('project_id'),
  entityType: text('entity_type'),
  entityId: text('entity_id'),
  correlatedAlertId: text('correlated_alert_id'),
  assignedToUserId: text('assigned_to_user_id'),
  assignedToRole: text('assigned_to_role'),
  assignedToName: text('assigned_to_name'),
  dueDate: text('due_date'),
  completedAt: text('completed_at'),
  resolutionNotes: text('resolution_notes'),
  actionButtonsJson: text('action_buttons_json').notNull().default('[]'), // Quick action buttons
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Action Center Sentinel'),
  updatedBy: text('updated_by').notNull().default('Action Center Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 12. phase75_action_assignments
export const phase75ActionAssignments = pgTable('phase75_action_assignments', {
  id: text('id').primaryKey(),
  actionId: text('action_id').notNull(),
  assignedUserId: text('assigned_user_id').notNull(),
  assignedRole: text('assigned_role').notNull(),
  assignedByUserId: text('assigned_by_user_id').notNull(),
  assignmentNote: text('assignment_note').notNull().default(''),
  assignedAt: text('assigned_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Action Assignment Controller'),
  updatedBy: text('updated_by').notNull().default('Action Assignment Controller'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 13. phase75_action_history
export const phase75ActionHistory = pgTable('phase75_action_history', {
  id: text('id').primaryKey(),
  actionId: text('action_id').notNull(),
  previousStatus: text('previous_status').notNull(),
  newStatus: text('new_status').notNull(),
  changedByUserId: text('changed_by_user_id').notNull(),
  changedByUserName: text('changed_by_user_name').notNull(),
  comment: text('comment').notNull().default(''),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Action History Logger'),
  updatedBy: text('updated_by').notNull().default('Action History Logger'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 14. phase75_integration_health
export const phase75IntegrationHealth = pgTable('phase75_integration_health', {
  id: text('id').primaryKey(),
  moduleCode: text('module_code').notNull(), // PROCUREMENT, PROJECT_CONTROLS, SCADA, EAM, QAQC, HSE, FINANCE, HRMS, EDMS
  moduleName: text('module_name').notNull(),
  healthStatus: text('health_status').notNull().default('HEALTHY'), // HEALTHY, DEGRADED, CRITICAL, OFFLINE
  eventsInbound24h: integer('events_inbound_24h').notNull().default(0),
  eventsOutbound24h: integer('events_outbound_24h').notNull().default(0),
  failedEvents24h: integer('failed_events_24h').notNull().default(0),
  avgProcessingLatencyMs: integer('avg_processing_latency_ms').notNull().default(45),
  queueDepth: integer('queue_depth').notNull().default(0),
  lastEventTimestamp: text('last_event_timestamp').notNull(),
  lastHealthCheck: text('last_health_check').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Integration Health Monitor'),
  updatedBy: text('updated_by').notNull().default('Integration Health Monitor'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 15. phase75_integration_logs
export const phase75IntegrationLogs = pgTable('phase75_integration_logs', {
  id: text('id').primaryKey(),
  sourceModule: text('source_module').notNull(),
  targetModule: text('target_module').notNull(),
  actionType: text('action_type').notNull(),
  status: text('status').notNull(), // SUCCESS, WARNING, FAILURE
  correlationId: text('correlation_id').notNull(),
  details: text('details').notNull().default(''),
  latencyMs: integer('latency_ms').notNull().default(0),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Integration Logger'),
  updatedBy: text('updated_by').notNull().default('Integration Logger'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 16. phase75_command_center_views
export const phase75CommandCenterViews = pgTable('phase75_command_center_views', {
  id: text('id').primaryKey(),
  viewCode: text('view_code').notNull(),
  viewName: text('view_name').notNull(),
  category: text('category').notNull(), // EXECUTIVE, OPERATIONS, SITES, LOGISTICS, COMMERCIAL
  isDefault: boolean('is_default').notNull().default(false),
  layoutConfigJson: text('layout_config_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('System Layout Designer'),
  updatedBy: text('updated_by').notNull().default('System Layout Designer'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 17. phase75_command_center_widgets
export const phase75CommandCenterWidgets = pgTable('phase75_command_center_widgets', {
  id: text('id').primaryKey(),
  widgetCode: text('widget_code').notNull(),
  widgetTitle: text('widget_title').notNull(),
  widgetType: text('widget_type').notNull(), // METRIC_CARD, CHART, TIMELINE, RADAR, TABLE, ALERTS_LIST
  defaultSize: text('default_size').notNull().default('MEDIUM'), // SMALL, MEDIUM, LARGE, FULL
  refreshIntervalSec: integer('refresh_interval_sec').notNull().default(30),
  configJson: text('config_json').notNull().default('{}'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Widget Registry'),
  updatedBy: text('updated_by').notNull().default('Widget Registry'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 18. phase75_enterprise_alerts
export const phase75EnterpriseAlerts = pgTable('phase75_enterprise_alerts', {
  id: text('id').primaryKey(),
  alertCode: text('alert_code').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  severity: text('severity').notNull().default('INFO'), // INFO, WARNING, HIGH, CRITICAL
  sourceModule: text('source_module').notNull(),
  projectId: text('project_id'),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, ACKNOWLEDGED, RESOLVED, DISMISSED
  isBroadcast: boolean('is_broadcast').notNull().default(false),
  targetRoles: text('target_roles').notNull().default('["ADMIN"]'), // JSON string array
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Alert System'),
  updatedBy: text('updated_by').notNull().default('Alert System'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 19. phase75_enterprise_notifications
export const phase75EnterpriseNotifications = pgTable('phase75_enterprise_notifications', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  title: text('title').notNull(),
  body: text('body').notNull(),
  type: text('type').notNull().default('INFO'), // INFO, WARNING, ALERT, ACTION_REQUIRED
  linkUrl: text('link_url'),
  isRead: boolean('is_read').notNull().default(false),
  readAt: text('read_at'),
  sourceModule: text('source_module').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Notification Dispatcher'),
  updatedBy: text('updated_by').notNull().default('Notification Dispatcher'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 20. phase75_orchestration_audit_logs
export const phase75OrchestrationAuditLogs = pgTable('phase75_orchestration_audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(), // e.g. EVENT_DISPATCH, RULE_EXECUTE, ACTION_ASSIGN, ALERT_ACK, EVENT_REPLAY
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  ipAddress: text('ip_address').notNull().default('127.0.0.1'),
  previousState: text('previous_state'),
  newState: text('new_state'),
  metadata: text('metadata').notNull().default('{}'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Orchestration Audit Sentinel'),
  updatedBy: text('updated_by').notNull().default('Orchestration Audit Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 76: ENTERPRISE MASTER DATA MANAGEMENT (MDM), DATA GOVERNANCE, QUALITY & RECONCILIATION
// ============================================================================

// 1. phase76_master_domains
export const phase76MasterDomains = pgTable('phase76_master_domains', {
  id: text('id').primaryKey(),
  domainCode: text('domain_code').notNull().unique(), // e.g. VENDORS, EMPLOYEES, PROJECTS, MATERIALS, ASSETS, CUSTOMERS, SITES, COST_CENTERS, CONTRACTS
  domainName: text('domain_name').notNull(),
  sourceModule: text('source_module').notNull(),
  entityType: text('entity_type').notNull(),
  description: text('description').notNull().default(''),
  dataOwnerRole: text('data_owner_role').notNull().default('ADMIN'),
  dataStewardUserId: text('data_steward_user_id'),
  dataStewardName: text('data_steward_name'),
  qualityTargetScore: doublePrecision('quality_target_score').notNull().default(90.0),
  currentAverageQuality: doublePrecision('current_average_quality').notNull().default(0.0),
  totalRecordsCount: integer('total_records_count').notNull().default(0),
  activeRecordsCount: integer('active_records_count').notNull().default(0),
  duplicateCandidatesCount: integer('duplicate_candidates_count').notNull().default(0),
  openIssuesCount: integer('open_issues_count').notNull().default(0),
  retentionYears: integer('retention_years').notNull().default(7),
  isArchivalEnabled: boolean('is_archival_enabled').notNull().default(true),
  lastReconciledAt: text('last_reconciled_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('MDM Governance Engine'),
  updatedBy: text('updated_by').notNull().default('MDM Governance Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 2. phase76_master_records
export const phase76MasterRecords = pgTable('phase76_master_records', {
  id: text('id').primaryKey(),
  canonicalId: text('canonical_id').notNull().unique(), // e.g. MDM-VND-001, MDM-EMP-102
  domainCode: text('domain_code').notNull(),
  entityType: text('entity_type').notNull(),
  sourceModule: text('source_module').notNull(),
  sourceEntityId: text('source_entity_id').notNull(),
  primaryName: text('primary_name').notNull(),
  secondaryName: text('secondary_name'),
  code: text('code').notNull(),
  status: text('status').notNull().default('ACTIVE'), // DRAFT, PENDING_APPROVAL, ACTIVE, SUSPENDED, MERGED, ARCHIVED
  approvalStatus: text('approval_status').notNull().default('APPROVED'), // PENDING, APPROVED, REJECTED, CHANGES_REQUESTED
  qualityScore: doublePrecision('quality_score').notNull().default(100.0),
  qualityClassification: text('quality_classification').notNull().default('GOOD'), // EXCELLENT, GOOD, WARNING, POOR, CRITICAL
  version: integer('version').notNull().default(1),
  effectiveDate: text('effective_date').notNull(),
  expiryDate: text('expiry_date'),
  lastVerifiedAt: text('last_verified_at').notNull(),
  verifiedBy: text('verified_by').notNull().default('System Automated Verifier'),
  isGoldenRecord: boolean('is_golden_record').notNull().default(false),
  goldenRecordId: text('golden_record_id'),
  mergedIntoId: text('merged_into_id'),
  mergedAt: text('merged_at'),
  dataPayloadJson: text('data_payload_json').notNull().default('{}'),
  identifiersJson: text('identifiers_json').notNull().default('[]'),
  tagsJson: text('tags_json').notNull().default('[]'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('MDM Registry Service'),
  updatedBy: text('updated_by').notNull().default('MDM Registry Service'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 3. phase76_master_record_versions
export const phase76MasterRecordVersions = pgTable('phase76_master_record_versions', {
  id: text('id').primaryKey(),
  masterRecordId: text('master_record_id').notNull(),
  canonicalId: text('canonical_id').notNull(),
  versionNumber: integer('version_number').notNull(),
  changeType: text('change_type').notNull(), // CREATE, UPDATE, MERGE, STATUS_CHANGE, ROLLBACK
  changeReason: text('change_reason').notNull().default('Master data synchronization'),
  previousPayloadJson: text('previous_payload_json'),
  newPayloadJson: text('new_payload_json').notNull(),
  changedFieldsJson: text('changed_fields_json').notNull().default('[]'),
  effectiveDate: text('effective_date').notNull(),
  expiryDate: text('expiry_date'),
  approvedByUserId: text('approved_by_user_id'),
  approvedByUserName: text('approved_by_user_name'),
  approvedAt: text('approved_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 4. phase76_master_identifiers
export const phase76MasterIdentifiers = pgTable('phase76_master_identifiers', {
  id: text('id').primaryKey(),
  masterRecordId: text('master_record_id').notNull(),
  canonicalId: text('canonical_id').notNull(),
  identifierType: text('identifier_type').notNull(), // TAX_ID, VAT_NO, REG_NO, PASSPORT, EMIRATES_ID, SERIAL_NO, SKU, IBAN, EMAIL, PHONE
  identifierValue: text('identifier_value').notNull(),
  normalizedValue: text('normalized_value').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  isUniqueInDomain: boolean('is_unique_in_domain').notNull().default(true),
  issuingAuthority: text('issuing_authority'),
  validFrom: text('valid_from'),
  validTo: text('valid_to'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Identifier Registry'),
  updatedBy: text('updated_by').notNull().default('Identifier Registry'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 5. phase76_master_relationships
export const phase76MasterRelationships = pgTable('phase76_master_relationships', {
  id: text('id').primaryKey(),
  sourceMasterRecordId: text('source_master_record_id').notNull(),
  sourceCanonicalId: text('source_canonical_id').notNull(),
  targetMasterRecordId: text('target_master_record_id').notNull(),
  targetCanonicalId: text('target_canonical_id').notNull(),
  relationshipType: text('relationship_type').notNull(), // PARENT_CHILD, SUPPLIES_TO, WORKS_ON, LOCATED_AT, BELONGS_TO, COST_CENTER_LINK
  confidenceScore: doublePrecision('confidence_score').notNull().default(1.0),
  isAuthoritative: boolean('is_authoritative').notNull().default(true),
  effectiveDate: text('effective_date').notNull(),
  expiryDate: text('expiry_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Relationship Engine'),
  updatedBy: text('updated_by').notNull().default('Relationship Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 6. phase76_data_quality_rules
export const phase76DataQualityRules = pgTable('phase76_data_quality_rules', {
  id: text('id').primaryKey(),
  ruleCode: text('rule_code').notNull().unique(),
  ruleName: text('rule_name').notNull(),
  domainCode: text('domain_code').notNull(), // ALL or specific domain
  dimension: text('dimension').notNull(), // COMPLETENESS, ACCURACY, CONSISTENCY, UNIQUENESS, VALIDITY, TIMELINESS, REFERENTIAL
  weightPercentage: doublePrecision('weight_percentage').notNull().default(10.0),
  severity: text('severity').notNull().default('WARNING'), // INFO, WARNING, HIGH, CRITICAL
  ruleType: text('rule_type').notNull(), // REGEX, FORMAT, MANDATORY_FIELD, CROSS_FIELD, FOREIGN_REF, RANGE, CUSTOM_LOGIC
  ruleDefinitionJson: text('rule_definition_json').notNull().default('{}'),
  errorMessage: text('error_message').notNull(),
  remediationGuidance: text('remediation_guidance').notNull().default(''),
  isEnabled: boolean('is_enabled').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Rule Config Engine'),
  updatedBy: text('updated_by').notNull().default('Rule Config Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 7. phase76_data_quality_results
export const phase76DataQualityResults = pgTable('phase76_data_quality_results', {
  id: text('id').primaryKey(),
  masterRecordId: text('master_record_id').notNull(),
  canonicalId: text('canonical_id').notNull(),
  domainCode: text('domain_code').notNull(),
  overallScore: doublePrecision('overall_score').notNull(),
  classification: text('classification').notNull(), // EXCELLENT, GOOD, WARNING, POOR, CRITICAL
  dimensionScoresJson: text('dimension_scores_json').notNull().default('{}'),
  rulesEvaluatedCount: integer('rules_evaluated_count').notNull().default(0),
  rulesPassedCount: integer('rules_passed_count').notNull().default(0),
  rulesFailedCount: integer('rules_failed_count').notNull().default(0),
  failedRuleCodesJson: text('failed_rule_codes_json').notNull().default('[]'),
  evaluationTimestamp: text('evaluation_timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Quality Scanner'),
  updatedBy: text('updated_by').notNull().default('Quality Scanner'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 8. phase76_data_quality_issues
export const phase76DataQualityIssues = pgTable('phase76_data_quality_issues', {
  id: text('id').primaryKey(),
  issueCode: text('issue_code').notNull(), // e.g. DQI-2026-001
  issueType: text('issue_type').notNull(), // MISSING_TAX_ID, DUPLICATE_VENDOR, INVALID_PROJECT_REFERENCE, ORPHAN_ASSET, CONFLICTING_COST_CENTER, STALE_EMPLOYEE, INVALID_MATERIAL_UOM
  title: text('title').notNull(),
  description: text('description').notNull(),
  domainCode: text('domain_code').notNull(),
  masterRecordId: text('master_record_id'),
  canonicalId: text('canonical_id'),
  severity: text('severity').notNull().default('WARNING'), // INFO, WARNING, HIGH, CRITICAL
  status: text('status').notNull().default('OPEN'), // OPEN, ASSIGNED, IN_REVIEW, RESOLVED, WONT_FIX
  assignedToUserId: text('assigned_to_user_id'),
  assignedToName: text('assigned_to_name'),
  detectedAt: text('detected_at').notNull(),
  detectedBy: text('detected_by').notNull().default('Automated Quality Scanner'),
  resolutionNotes: text('resolution_notes'),
  resolvedAt: text('resolved_at'),
  resolvedByUserId: text('resolved_by_user_id'),
  resolvedByUserName: text('resolved_by_user_name'),
  aiRemediationSuggestion: text('ai_remediation_suggestion'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Quality Engine'),
  updatedBy: text('updated_by').notNull().default('Quality Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 9. phase76_duplicate_candidates
export const phase76DuplicateCandidates = pgTable('phase76_duplicate_candidates', {
  id: text('id').primaryKey(),
  domainCode: text('domain_code').notNull(),
  candidateARecordId: text('candidate_a_record_id').notNull(),
  candidateACanonicalId: text('candidate_a_canonical_id').notNull(),
  candidateAName: text('candidate_a_name').notNull(),
  candidateBRecordId: text('candidate_b_record_id').notNull(),
  candidateBCanonicalId: text('candidate_b_canonical_id').notNull(),
  candidateBName: text('candidate_b_name').notNull(),
  similarityScore: doublePrecision('similarity_score').notNull(), // 0.0 to 1.0 (e.g. 0.94)
  detectionReason: text('detection_reason').notNull(),
  matchingFieldsJson: text('matching_fields_json').notNull().default('[]'),
  status: text('status').notNull().default('PENDING_REVIEW'), // PENDING_REVIEW, APPROVED_FOR_MERGE, KEPT_SEPARATE, REJECTED, ESCALATED
  reviewedByUserId: text('reviewed_by_user_id'),
  reviewedByUserName: text('reviewed_by_user_name'),
  reviewedAt: text('reviewed_at'),
  reviewNotes: text('review_notes'),
  aiAssistedExplanation: text('ai_assisted_explanation'),
  aiClassification: text('ai_classification').notNull().default('RULE-BASED'), // RULE-BASED, AI-ASSISTED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Duplicate Detection Engine'),
  updatedBy: text('updated_by').notNull().default('Duplicate Detection Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 10. phase76_golden_records
export const phase76GoldenRecords = pgTable('phase76_golden_records', {
  id: text('id').primaryKey(),
  goldenCanonicalId: text('golden_canonical_id').notNull().unique(), // e.g. GLD-VND-001
  domainCode: text('domain_code').notNull(),
  primaryName: text('primary_name').notNull(),
  consolidatedPayloadJson: text('consolidated_payload_json').notNull(),
  sourceRecordIdsJson: text('source_record_ids_json').notNull().default('[]'),
  primarySourceRecordId: text('primary_source_record_id').notNull(),
  survivorshipRulesAppliedJson: text('survivorship_rules_applied_json').notNull().default('[]'),
  confidenceScore: doublePrecision('confidence_score').notNull().default(1.0),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, SUPERSEDED, INACTIVE
  approvedByUserId: text('approved_by_user_id').notNull(),
  approvedByUserName: text('approved_by_user_name').notNull(),
  approvedAt: text('approved_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Golden Record Engine'),
  updatedBy: text('updated_by').notNull().default('Golden Record Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 11. phase76_reconciliation_jobs
export const phase76ReconciliationJobs = pgTable('phase76_reconciliation_jobs', {
  id: text('id').primaryKey(),
  jobCode: text('job_code').notNull().unique(), // e.g. REC-JOB-2026-0816-01
  jobName: text('job_name').notNull(),
  domainCode: text('domain_code').notNull(),
  participatingModulesJson: text('participating_modules_json').notNull(), // e.g. ["PROCUREMENT", "CONTRACTS", "FINANCE"]
  status: text('status').notNull().default('PENDING'), // PENDING, RUNNING, COMPLETED, FAILED, CANCELLED
  triggerType: text('trigger_type').notNull().default('MANUAL'), // MANUAL, SCHEDULED, EVENT_DRIVEN
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  recordsScannedCount: integer('records_scanned_count').notNull().default(0),
  issuesFoundCount: integer('issues_found_count').notNull().default(0),
  issuesResolvedCount: integer('issues_resolved_count').notNull().default(0),
  orphanRecordsCount: integer('orphan_records_count').notNull().default(0),
  conflictsCount: integer('conflicts_count').notNull().default(0),
  summaryReportJson: text('summary_report_json').notNull().default('{}'),
  executedByUserId: text('executed_by_user_id').notNull().default('SYSTEM'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Reconciliation Scheduler'),
  updatedBy: text('updated_by').notNull().default('Reconciliation Scheduler'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 12. phase76_data_lineage
export const phase76DataLineage = pgTable('phase76_data_lineage', {
  id: text('id').primaryKey(),
  masterRecordId: text('master_record_id').notNull(),
  canonicalId: text('canonical_id').notNull(),
  domainCode: text('domain_code').notNull(),
  sourceModule: text('source_module').notNull(),
  sourceSystem: text('source_system').notNull().default('SiteSync ERP Core'),
  consumingModulesJson: text('consuming_modules_json').notNull().default('[]'),
  transactionEntitiesJson: text('transaction_entities_json').notNull().default('[]'),
  reportsDependentJson: text('reports_dependent_json').notNull().default('[]'),
  aiAnalyticsFeedsJson: text('ai_analytics_feeds_json').notNull().default('[]'),
  lineageGraphJson: text('lineage_graph_json').notNull().default('{}'),
  lastLineageMappedAt: text('last_lineage_mapped_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Lineage Mapper Engine'),
  updatedBy: text('updated_by').notNull().default('Lineage Mapper Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 13. phase76_data_stewards
export const phase76DataStewards = pgTable('phase76_data_stewards', {
  id: text('id').primaryKey(),
  domainCode: text('domain_code').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  stewardshipRole: text('stewardship_role').notNull(), // DATA_OWNER, DATA_STEWARD, APPROVER, REVIEWER
  assignedAt: text('assigned_at').notNull(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Governance Admin'),
  updatedBy: text('updated_by').notNull().default('Governance Admin'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 14. phase76_data_change_requests
export const phase76DataChangeRequests = pgTable('phase76_data_change_requests', {
  id: text('id').primaryKey(),
  requestCode: text('request_code').notNull().unique(), // e.g. MCR-2026-0042
  masterRecordId: text('master_record_id').notNull(),
  canonicalId: text('canonical_id').notNull(),
  domainCode: text('domain_code').notNull(),
  requestType: text('request_type').notNull(), // UPDATE_ATTRIBUTES, BANK_ACCOUNT_CHANGE, MERGE_REQUEST, STATUS_CHANGE, RETIREMENT
  reason: text('reason').notNull(),
  currentValueJson: text('current_value_json').notNull(),
  proposedValueJson: text('proposed_value_json').notNull(),
  changedFieldsJson: text('changed_fields_json').notNull().default('[]'),
  status: text('status').notNull().default('PENDING_APPROVAL'), // PENDING_APPROVAL, APPROVED, REJECTED, CANCELLED
  workflowTaskId: text('workflow_task_id'),
  submittedByUserId: text('submitted_by_user_id').notNull(),
  submittedByUserName: text('submitted_by_user_name').notNull(),
  submittedAt: text('submitted_at').notNull(),
  approvedByUserId: text('approved_by_user_id'),
  approvedByUserName: text('approved_by_user_name'),
  approvedAt: text('approved_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Change Control Engine'),
  updatedBy: text('updated_by').notNull().default('Change Control Engine'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 15. phase76_retention_policies
export const phase76RetentionPolicies = pgTable('phase76_retention_policies', {
  id: text('id').primaryKey(),
  policyCode: text('policy_code').notNull().unique(), // e.g. RET-VND-FIN-07Y
  policyName: text('policy_name').notNull(),
  domainCode: text('domain_code').notNull(),
  retentionPeriodMonths: integer('retention_period_months').notNull().default(84), // 7 years
  statutoryBasis: text('statutory_basis').notNull().default('Commercial & Tax Compliance'),
  requiresLegalHoldCheck: boolean('requires_legal_hold_check').notNull().default(true),
  actionOnExpiry: text('action_on_expiry').notNull().default('ARCHIVE_READONLY'), // ARCHIVE_READONLY, NOTIFY_STEWARD, SOFT_DELETE_ELIGIBLE
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Governance Policy Sentinel'),
  updatedBy: text('updated_by').notNull().default('Governance Policy Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 16. phase76_legal_holds
export const phase76LegalHolds = pgTable('phase76_legal_holds', {
  id: text('id').primaryKey(),
  holdCode: text('hold_code').notNull().unique(), // e.g. LH-2026-009
  title: text('title').notNull(),
  reason: text('reason').notNull(),
  domainCode: text('domain_code').notNull(),
  targetEntityId: text('target_entity_id'),
  targetCanonicalId: text('target_canonical_id'),
  isGlobalForDomain: boolean('is_global_for_domain').notNull().default(false),
  status: text('status').notNull().default('ACTIVE'), // ACTIVE, RELEASED, EXPIRED
  placedByUserId: text('placed_by_user_id').notNull(),
  placedByUserName: text('placed_by_user_name').notNull(),
  placedAt: text('placed_at').notNull(),
  releasedByUserId: text('released_by_user_id'),
  releasedByUserName: text('released_by_user_name'),
  releasedAt: text('released_at'),
  releaseReason: text('release_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('Legal & Compliance Sentinel'),
  updatedBy: text('updated_by').notNull().default('Legal & Compliance Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// 17. phase76_governance_audit_logs
export const phase76GovernanceAuditLogs = pgTable('phase76_governance_audit_logs', {
  id: text('id').primaryKey(),
  action: text('action').notNull(), // e.g. RECORD_CREATED, MERGE_EXECUTED, QUALITY_SCAN, CHANGE_APPROVED, LEGAL_HOLD_PLACED
  domainCode: text('domain_code').notNull(),
  canonicalId: text('canonical_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name').notNull(),
  userRole: text('user_role').notNull(),
  ipAddress: text('ip_address').notNull().default('127.0.0.1'),
  previousStateJson: text('previous_state_json'),
  newStateJson: text('new_state_json'),
  changeSummary: text('change_summary').notNull(),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull().default('MDM Governance Sentinel'),
  updatedBy: text('updated_by').notNull().default('MDM Governance Sentinel'),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

// ============================================================================
// PHASE 76 REMEDIATION — P1.2-A: RUNTIME DDL RECONCILED TABLES (42 TABLES)
// Formally mapped to represent existing live PostgreSQL tables and repository DDL.
// ============================================================================

// ----------------------------------------------------------------------------
// Fleet & Transport (7 Tables)
// ----------------------------------------------------------------------------

export const fleetVehicles = pgTable('fleet_vehicles', {
  id: text('id').primaryKey(),
  vehicleNumber: text('vehicle_number').notNull(),
  vehicleType: text('vehicle_type').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  year: integer('year').notNull(),
  chassisNumber: text('chassis_number'),
  engineNumber: text('engine_number'),
  fuelType: text('fuel_type').notNull(),
  tankCapacityLiters: doublePrecision('tank_capacity_liters'),
  currentOdometerKm: doublePrecision('current_odometer_km'),
  status: text('status').notNull(),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  assignedSiteId: text('assigned_site_id'),
  assignedSiteName: text('assigned_site_name'),
  assignedDriverId: text('assigned_driver_id'),
  assignedDriverName: text('assigned_driver_name'),
  insurancePolicyNumber: text('insurance_policy_number'),
  insuranceExpiry: text('insurance_expiry'),
  rcExpiry: text('rc_expiry'),
  fitnessExpiry: text('fitness_expiry'),
  pollutionExpiry: text('pollution_expiry'),
  permitExpiry: text('permit_expiry'),
  roadTaxExpiry: text('road_tax_expiry'),
  documents: jsonb('documents'),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const fleetDrivers = pgTable('fleet_drivers', {
  id: text('id').primaryKey(),
  driverName: text('driver_name').notNull(),
  licenseNumber: text('license_number').notNull(),
  licenseCategory: text('license_category').notNull(),
  licenseExpiry: text('license_expiry'),
  medicalExpiry: text('medical_expiry'),
  assignedVehicleId: text('assigned_vehicle_id'),
  assignedVehicleNumber: text('assigned_vehicle_number'),
  experienceYears: integer('experience_years'),
  contactNumber: text('contact_number'),
  email: text('email'),
  emergencyContactName: text('emergency_contact_name'),
  emergencyContactRelation: text('emergency_contact_relation'),
  emergencyContactPhone: text('emergency_contact_phone'),
  status: text('status').notNull(),
  documents: jsonb('documents'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const fleetEquipment = pgTable('fleet_equipment', {
  id: text('id').primaryKey(),
  equipmentCode: text('equipment_code').notNull(),
  equipmentName: text('equipment_name').notNull(),
  category: text('category').notNull(),
  manufacturer: text('manufacturer').notNull(),
  model: text('model').notNull(),
  serialNumber: text('serial_number'),
  purchaseDate: text('purchase_date'),
  warrantyExpiry: text('warranty_expiry'),
  currentLocation: text('current_location'),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  assignedSiteId: text('assigned_site_id'),
  assignedSiteName: text('assigned_site_name'),
  assignedOperatorId: text('assigned_operator_id'),
  assignedOperatorName: text('assigned_operator_name'),
  runningHours: doublePrecision('running_hours'),
  fuelCapacityLiters: doublePrecision('fuel_capacity_liters'),
  status: text('status').notNull(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const fleetFuelLogs = pgTable('fleet_fuel_logs', {
  id: text('id').primaryKey(),
  fuelLogCode: text('fuel_log_code').notNull(),
  assetType: text('asset_type').notNull(),
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name'),
  assetCode: text('asset_code'),
  quantityLiters: doublePrecision('quantity_liters').notNull(),
  unitPrice: doublePrecision('unit_price').notNull(),
  totalCost: doublePrecision('total_cost').notNull(),
  fuelStation: text('fuel_station'),
  odometerReadingKm: doublePrecision('odometer_reading_km'),
  runningHours: doublePrecision('running_hours'),
  mileageCalculated: doublePrecision('mileage_calculated'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  siteId: text('site_id'),
  siteName: text('site_name'),
  filledById: text('filled_by_id'),
  filledByName: text('filled_by_name'),
  fillDate: text('fill_date').notNull(),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const fleetMaintenance = pgTable('fleet_maintenance', {
  id: text('id').primaryKey(),
  maintenanceCode: text('maintenance_code').notNull(),
  assetType: text('asset_type').notNull(),
  assetId: text('asset_id').notNull(),
  assetName: text('asset_name'),
  assetCode: text('asset_code'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  maintenanceType: text('maintenance_type').notNull(),
  category: text('category').notNull(),
  serviceDate: text('service_date').notNull(),
  completionDate: text('completion_date'),
  odometerKm: doublePrecision('odometer_km'),
  runningHours: doublePrecision('running_hours'),
  costAmount: doublePrecision('cost_amount'),
  vendorName: text('vendor_name'),
  invoiceNumber: text('invoice_number'),
  description: text('description'),
  performedBy: text('performed_by'),
  status: text('status').notNull(),
  nextServiceDueKm: doublePrecision('next_service_due_km'),
  nextServiceDueDate: text('next_service_due_date'),
  nextServiceDueHours: doublePrecision('next_service_due_hours'),
  createdAt: text('created_at').notNull(),
});

export const fleetTripLogs = pgTable('fleet_trip_logs', {
  id: text('id').primaryKey(),
  tripCode: text('trip_code').notNull(),
  vehicleId: text('vehicle_id').notNull(),
  vehicleNumber: text('vehicle_number'),
  driverId: text('driver_id').notNull(),
  driverName: text('driver_name'),
  origin: text('origin'),
  destination: text('destination'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteId: text('site_id'),
  siteName: text('site_name'),
  purpose: text('purpose'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  startOdometerKm: doublePrecision('start_odometer_km').notNull(),
  endOdometerKm: doublePrecision('end_odometer_km'),
  distanceKm: doublePrecision('distance_km'),
  fuelUsedLiters: doublePrecision('fuel_used_liters'),
  gatePassRef: text('gate_pass_ref'),
  notes: text('notes'),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
});

export const fleetNotifications = pgTable('fleet_notifications', {
  id: text('id').primaryKey(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  urgency: text('urgency').notNull(),
  assetId: text('asset_id'),
  assetName: text('asset_name'),
  assetType: text('asset_type'),
  dueDate: text('due_date'),
  daysRemaining: integer('days_remaining'),
  read: boolean('read'),
  createdAt: text('created_at').notNull(),
});

// ----------------------------------------------------------------------------
// Core Human Resources (11 Tables)
// ----------------------------------------------------------------------------

export const hrEmployees = pgTable('hr_employees', {
  id: text('id').primaryKey(),
  employeeCode: text('employee_code').notNull(),
  photoUrl: text('photo_url'),
  fullName: text('full_name').notNull(),
  mobile: text('mobile'),
  email: text('email'),
  address: text('address'),
  emergencyContact: jsonb('emergency_contact'),
  dateOfBirth: text('date_of_birth'),
  joiningDate: text('joining_date'),
  department: text('department'),
  designation: text('designation'),
  branch: text('branch'),
  role: text('role'),
  reportingManager: text('reporting_manager'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteAssignment: text('site_assignment'),
  employmentType: text('employment_type'),
  salaryStructure: jsonb('salary_structure'),
  status: text('status'),
  documents: jsonb('documents'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrAttendances = pgTable('hr_attendances', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeCode: text('employee_code'),
  employeeName: text('employee_name'),
  department: text('department'),
  date: text('date').notNull(),
  checkIn: text('check_in'),
  checkOut: text('check_out'),
  shift: text('shift'),
  status: text('status'),
  lateMinutes: integer('late_minutes'),
  earlyExitMinutes: integer('early_exit_minutes'),
  overtimeHours: doublePrecision('overtime_hours'),
  workingHours: doublePrecision('working_hours'),
  locationPunchIn: text('location_punch_in'),
  locationPunchOut: text('location_punch_out'),
  esslDeviceId: text('essl_device_id'),
  isManualEntry: boolean('is_manual_entry'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrPayrolls = pgTable('hr_payrolls', {
  id: text('id').primaryKey(),
  payrollMonth: text('payroll_month').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeCode: text('employee_code'),
  employeeName: text('employee_name'),
  designation: text('designation'),
  department: text('department'),
  bankAccount: text('bank_account'),
  bankName: text('bank_name'),
  daysInMonth: integer('days_in_month'),
  daysWorked: integer('days_worked'),
  paidLeaves: integer('paid_leaves'),
  unpaidLeaves: integer('unpaid_leaves'),
  overtimeHours: doublePrecision('overtime_hours'),
  basicEarnedUsd: doublePrecision('basic_earned_usd'),
  hraEarnedUsd: doublePrecision('hra_earned_usd'),
  daEarnedUsd: doublePrecision('da_earned_usd'),
  allowancesUsd: doublePrecision('allowances_usd'),
  overtimePayUsd: doublePrecision('overtime_pay_usd'),
  bonusUsd: doublePrecision('bonus_usd'),
  grossSalaryUsd: doublePrecision('gross_salary_usd'),
  pfDeductionUsd: doublePrecision('pf_deduction_usd'),
  esiDeductionUsd: doublePrecision('esi_deduction_usd'),
  taxTdsUsd: doublePrecision('tax_tds_usd'),
  otherDeductionsUsd: doublePrecision('other_deductions_usd'),
  totalDeductionsUsd: doublePrecision('total_deductions_usd'),
  netSalaryUsd: doublePrecision('net_salary_usd'),
  paymentStatus: text('payment_status').notNull(),
  paymentDate: text('payment_date'),
  utrReference: text('utr_reference'),
  createdAt: text('created_at').notNull(),
});

export const hrLeaveRequests = pgTable('hr_leave_requests', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  leaveCategory: text('leave_category').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: doublePrecision('total_days').notNull(),
  reason: text('reason'),
  status: text('status').notNull(),
  appliedOn: text('applied_on').notNull(),
  approvedBy: text('approved_by'),
  managerRemarks: text('manager_remarks'),
  createdAt: text('created_at').notNull(),
});

export const hrLeaveBalances = pgTable('hr_leave_balances', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id'),
  balances: jsonb('balances').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrLabourWorkers = pgTable('hr_labour_workers', {
  id: text('id').primaryKey(),
  workerCode: text('worker_code').notNull(),
  fullName: text('full_name').notNull(),
  skillCategory: text('skill_category'),
  contractorName: text('contractor_name'),
  dailyWageRateUsd: doublePrecision('daily_wage_rate_usd'),
  overtimeHourlyRateUsd: doublePrecision('overtime_hourly_rate_usd'),
  assignedProjectId: text('assigned_project_id'),
  assignedProjectName: text('assigned_project_name'),
  assignedSite: text('assigned_site'),
  mobile: text('mobile'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
});

export const hrLabourAllocations = pgTable('hr_labour_allocations', {
  id: text('id').primaryKey(),
  date: text('date').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  siteName: text('site_name'),
  contractorName: text('contractor_name'),
  skilledWorkersCount: integer('skilled_workers_count'),
  unskilledWorkersCount: integer('unskilled_workers_count'),
  regularHours: doublePrecision('regular_hours'),
  overtimeHours: doublePrecision('overtime_hours'),
  totalLaborCostUsd: doublePrecision('total_labor_cost_usd'),
  supervisorIncharge: text('supervisor_incharge'),
  createdAt: text('created_at').notNull(),
});

export const hrDutyLogs = pgTable('hr_duty_logs', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  date: text('date').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  workDescription: text('work_description'),
  workingHours: doublePrecision('working_hours'),
  equipmentUsed: jsonb('equipment_used'),
  vehicleUsed: jsonb('vehicle_used'),
  materialsUsed: jsonb('materials_used'),
  remarks: text('remarks'),
  photoUrl: text('photo_url'),
  verifiedBy: text('verified_by'),
  approvedBy: text('approved_by'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
});

export const hrEsslDevices = pgTable('hr_essl_devices', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  deviceName: text('device_name').notNull(),
  siteLocation: text('site_location'),
  ipAddress: text('ip_address'),
  port: integer('port'),
  status: text('status'),
  lastSyncTime: text('last_sync_time'),
  totalLogsToday: integer('total_logs_today'),
  createdAt: text('created_at').notNull(),
});

export const hrAttendanceCorrections = pgTable('hr_attendance_corrections', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name'),
  date: text('date'),
  originalCheckIn: text('original_check_in'),
  originalCheckOut: text('original_check_out'),
  requestedCheckIn: text('requested_check_in'),
  requestedCheckOut: text('requested_check_out'),
  reason: text('reason'),
  status: text('status'),
  appliedOn: text('applied_on'),
  reviewedBy: text('reviewed_by'),
  reviewRemarks: text('review_remarks'),
  createdAt: text('created_at').notNull(),
});

export const hrNotifications = pgTable('hr_notifications', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  message: text('message').notNull(),
  type: text('type').notNull(),
  timestamp: text('timestamp').notNull(),
  isRead: boolean('is_read'),
  actionUrl: text('action_url'),
  createdAt: text('created_at').notNull(),
});

// ----------------------------------------------------------------------------
// Enterprise Statutory Rules & Indian Statutory Foundation (P2.11)
// ----------------------------------------------------------------------------

export const hrStatutoryRules = pgTable('hr_statutory_rules', {
  id: text('id').primaryKey(),
  ruleCode: text('rule_code').notNull().unique(),
  jurisdiction: text('jurisdiction').notNull().default('INDIA'), // 'INDIA' | 'UAE' | 'GLOBAL'
  ruleType: text('rule_type').notNull(), // 'EPF' | 'ESIC' | 'PROFESSIONAL_TAX' | 'TDS' | 'GRATUITY' | 'BONUS' | 'WPS'
  title: text('title').notNull(),
  description: text('description'),
  effectiveFrom: text('effective_from').notNull(),
  effectiveTo: text('effective_to'),
  parameters: jsonb('parameters').notNull(), // Slabs, rates, ceilings, exemption rules
  version: integer('version').notNull().default(1),
  isActive: boolean('is_active').notNull().default(true),
  createdBy: text('created_by').notNull().default('System Administrator'),
  updatedBy: text('updated_by').notNull().default('System Administrator'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrEmployeeStatutoryProfiles = pgTable('hr_employee_statutory_profiles', {
  id: text('id').primaryKey(),
  employeeId: text('employee_id').notNull().unique(),
  employeeCode: text('employee_code').notNull(),
  statutoryJurisdiction: text('statutory_jurisdiction').notNull().default('INDIA'),
  uanNumber: text('uan_number'),
  pfNumber: text('pf_number'),
  pfOptOut: boolean('pf_opt_out').notNull().default(false),
  vpfPercentage: doublePrecision('vpf_percentage').notNull().default(0),
  esiNumber: text('esi_number'),
  esiApplicable: boolean('esi_applicable').notNull().default(true),
  panNumber: text('pan_number'),
  taxRegime: text('tax_regime').notNull().default('NEW_REGIME'), // 'NEW_REGIME' | 'OLD_REGIME'
  ptState: text('pt_state').notNull().default('MH'),
  gratuityEnrolled: boolean('gratuity_enrolled').notNull().default(true),
  gratuityAccruedAmount: doublePrecision('gratuity_accrued_amount').notNull().default(0),
  bankAccountNumber: text('bank_account_number'),
  bankIfscCode: text('bank_ifsc_code'),
  bankName: text('bank_name'),
  branchName: text('branch_name'),
  paymentMode: text('payment_mode').notNull().default('NEFT_RTGS'), // 'NEFT_RTGS' | 'WPS_SIF' | 'CHEQUE' | 'CASH'
  customDeductions: jsonb('custom_deductions'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrPayrollRuns = pgTable('hr_payroll_runs', {
  id: text('id').primaryKey(),
  runNumber: text('run_number').notNull().unique(), // e.g. PRUN-2026-08-001
  payrollMonth: text('payroll_month').notNull(), // '2026-08'
  jurisdiction: text('jurisdiction').notNull().default('INDIA'),
  currency: text('currency').notNull().default('INR'),
  exchangeRateToInr: doublePrecision('exchange_rate_to_inr').notNull().default(1.0),
  totalEmployees: integer('total_employees').notNull().default(0),
  totalGrossPay: doublePrecision('total_gross_pay').notNull().default(0),
  totalDeductions: doublePrecision('total_deductions').notNull().default(0),
  totalNetPay: doublePrecision('total_net_pay').notNull().default(0),
  totalEmployerPf: doublePrecision('total_employer_pf').notNull().default(0),
  totalEmployerEsi: doublePrecision('total_employer_esi').notNull().default(0),
  totalGratuityAccrual: doublePrecision('total_gratuity_accrual').notNull().default(0),
  totalTds: doublePrecision('total_tds').notNull().default(0),
  totalPt: doublePrecision('total_pt').notNull().default(0),
  // Maker-Checker & Locking Governance
  status: text('status').notNull().default('DRAFT'), // 'DRAFT' | 'CALCULATED' | 'SUBMITTED_FOR_REVIEW' | 'VERIFIED' | 'APPROVED' | 'DISBURSED' | 'LOCKED'
  makerUserId: text('maker_user_id'),
  makerUserName: text('maker_user_name'),
  makerTimestamp: text('maker_timestamp'),
  checkerUserId: text('checker_user_id'),
  checkerUserName: text('checker_user_name'),
  checkerTimestamp: text('checker_timestamp'),
  checkerRemarks: text('checker_remarks'),
  isLocked: boolean('is_locked').notNull().default(false),
  lockHash: text('lock_hash'),
  disbursedAt: text('disbursed_at'),
  neftBatchReference: text('neft_batch_reference'),
  auditTrail: jsonb('audit_trail'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const hrAuditTrail = pgTable('hr_audit_trail', {
  id: text('id').primaryKey(),
  action: text('action').notNull(),
  entityType: text('entity_type').notNull(), // 'PAYROLL_RUN' | 'STATUTORY_RULE' | 'EMPLOYEE_STATUTORY' | 'PAYSLIP'
  entityId: text('entity_id').notNull(),
  userId: text('user_id'),
  userName: text('user_name'),
  userRole: text('user_role'),
  details: jsonb('details'),
  previousState: jsonb('previous_state'),
  newState: jsonb('new_state'),
  ipAddress: text('ip_address'),
  timestamp: text('timestamp').notNull(),
});

// ----------------------------------------------------------------------------
// Water Authority Engineering / KWA (6 Tables)
// ----------------------------------------------------------------------------

export const kwaProjects = pgTable('kwa_projects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(),
  name: text('name').notNull(),
  client: text('client'),
  type: text('type'),
  location: text('location'),
  status: text('status'),
  progress: doublePrecision('progress'),
  budgetInr: text('budget_inr'),
  spentInr: text('spent_inr'),
  startDate: text('start_date'),
  targetCompletionDate: text('target_completion_date'),
  pipeMaterial: text('pipe_material'),
  pipeDiameterMm: integer('pipe_diameter_mm'),
  totalLengthKm: doublePrecision('total_length_km'),
  laidLengthKm: doublePrecision('laid_length_km'),
  valveCountInstalled: integer('valve_count_installed'),
  pumpsInstalled: integer('pumps_installed'),
  scadaStatus: text('scada_status'),
  civilProgress: doublePrecision('civil_progress'),
  mechanicalProgress: doublePrecision('mechanical_progress'),
  electricalProgress: doublePrecision('electrical_progress'),
  testingProgress: doublePrecision('testing_progress'),
  createdAt: text('created_at').notNull(),
});

export const kwaPipelineSections = pgTable('kwa_pipeline_sections', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  sectionName: text('section_name').notNull(),
  pipeMaterial: text('pipe_material'),
  pipeDiameterMm: integer('pipe_diameter_mm'),
  pipeClass: text('pipe_class'),
  totalLengthMeters: doublePrecision('total_length_meters'),
  laidLengthMeters: doublePrecision('laid_length_meters'),
  remainingLengthMeters: doublePrecision('remaining_length_meters'),
  startChainage: text('start_chainage'),
  endChainage: text('end_chainage'),
  gpsStartLocation: text('gps_start_location'),
  gpsEndLocation: text('gps_end_location'),
  totalJoints: integer('total_joints'),
  completedJoints: integer('completed_joints'),
  crossingType: text('crossing_type'),
  status: text('status'),
  createdAt: text('created_at').notNull(),
});

export const kwaValves = pgTable('kwa_valves', {
  id: text('id').primaryKey(),
  valveNumber: text('valve_number').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  valveType: text('valve_type'),
  sizeMm: integer('size_mm'),
  ratingPn: text('rating_pn'),
  actuator: text('actuator'),
  chainageLocation: text('chainage_location'),
  gpsCoordinates: text('gps_coordinates'),
  installationDate: text('installation_date'),
  chamberBuilt: boolean('chamber_built'),
  testingStatus: text('testing_status'),
  inspectedBy: text('inspected_by'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const kwaTestReports = pgTable('kwa_test_reports', {
  id: text('id').primaryKey(),
  testNo: text('test_no').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  testType: text('test_type'),
  chainageSection: text('chainage_section'),
  pipeDiameterMm: integer('pipe_diameter_mm'),
  testPressureBar: doublePrecision('test_pressure_bar'),
  holdingDurationMinutes: integer('holding_duration_minutes'),
  allowableDropBar: doublePrecision('allowable_drop_bar'),
  actualDropBar: doublePrecision('actual_drop_bar'),
  testResult: text('test_result'),
  kwaWitnessOfficer: text('kwa_witness_officer'),
  testDate: text('test_date'),
  certificateRef: text('certificate_ref'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const kwaDailyReports = pgTable('kwa_daily_reports', {
  id: text('id').primaryKey(),
  dprNumber: text('dpr_number').notNull(),
  date: text('date').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  siteLocation: text('site_location'),
  weather: text('weather'),
  startChainage: text('start_chainage'),
  endChainage: text('end_chainage'),
  workCategory: text('work_category'),
  workDoneDetails: text('work_done_details'),
  quantityLaidMeters: doublePrecision('quantity_laid_meters'),
  jointsCompletedCount: integer('joints_completed_count'),
  manpowerCount: jsonb('manpower_count'),
  equipmentUsed: jsonb('equipment_used'),
  vehiclesUsed: jsonb('vehicles_used'),
  materialsConsumed: jsonb('materials_consumed'),
  photoUrls: jsonb('photo_urls'),
  remarks: text('remarks'),
  delayReason: text('delay_reason'),
  tomorrowPlan: text('tomorrow_plan'),
  preparedByName: text('prepared_by_name'),
  approvedByName: text('approved_by_name'),
  createdAt: text('created_at').notNull(),
});

export const kwaDocuments = pgTable('kwa_documents', {
  id: text('id').primaryKey(),
  docNumber: text('doc_number').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  revisionNo: text('revision_no'),
  fileType: text('file_type'),
  sizeBytes: integer('size_bytes'),
  uploadedBy: text('uploaded_by'),
  uploadDate: text('upload_date'),
  status: text('status'),
  downloadUrl: text('download_url'),
  createdAt: text('created_at').notNull(),
});

// ----------------------------------------------------------------------------
// Core Procurement & BOQ (12 Tables)
// ----------------------------------------------------------------------------

export const procurementVendors = pgTable('procurement_vendors', {
  id: text('id').primaryKey(),
  vendorCode: text('vendor_code').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  gstin: text('gstin'),
  pan: text('pan'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  contactPersons: jsonb('contact_persons'),
  bankDetails: jsonb('bank_details'),
  paymentTerms: text('payment_terms'),
  creditPeriodDays: integer('credit_period_days'),
  rating: doublePrecision('rating'),
  status: text('status'),
  documents: jsonb('documents'),
  performance: jsonb('performance'),
  createdAt: text('created_at').notNull(),
});

export const procurementRfqs = pgTable('procurement_rfqs', {
  id: text('id').primaryKey(),
  rfqCode: text('rfq_code').notNull(),
  title: text('title').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  invitedVendorIds: jsonb('invited_vendor_ids'),
  invitedVendorNames: jsonb('invited_vendor_names'),
  dueDate: text('due_date'),
  items: jsonb('items'),
  status: text('status'),
  approvalStatus: text('approval_status'),
  attachments: jsonb('attachments'),
  createdDate: text('created_date'),
  createdByName: text('created_by_name'),
  createdAt: text('created_at').notNull(),
});

export const procurementQuotations = pgTable('procurement_quotations', {
  id: text('id').primaryKey(),
  quotationNo: text('quotation_no').notNull(),
  rfqId: text('rfq_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name'),
  submittedDate: text('submitted_date'),
  items: jsonb('items'),
  subtotalUsd: doublePrecision('subtotal_usd'),
  taxUsd: doublePrecision('tax_usd'),
  freightUsd: doublePrecision('freight_usd'),
  netTotalUsd: doublePrecision('net_total_usd').notNull(),
  leadTimeDays: integer('lead_time_days'),
  warrantyMonths: integer('warranty_months'),
  deliverySchedule: text('delivery_schedule'),
  technicalCompliance: text('technical_compliance'),
  technicalRemarks: text('technical_remarks'),
  commercialCompliance: text('commercial_compliance'),
  commercialRemarks: text('commercial_remarks'),
  isL1Bidder: boolean('is_l1_bidder'),
  createdAt: text('created_at').notNull(),
});

export const procurementRequisitions = pgTable('procurement_requisitions', {
  id: text('id').primaryKey(),
  prNumber: text('pr_number').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  requestedByName: text('requested_by_name'),
  department: text('department'),
  urgency: text('urgency'),
  status: text('status').notNull(),
  createdDate: text('created_date'),
  requiredByDate: text('required_by_date'),
  budgetAllocatedUsd: doublePrecision('budget_allocated_usd'),
  items: jsonb('items'),
  remarks: text('remarks'),
  verifiedByName: text('verified_by_name'),
  approvedByName: text('approved_by_name'),
  createdAt: text('created_at').notNull(),
});

export const procurementPurchaseOrders = pgTable('procurement_purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull(),
  prId: text('pr_id'),
  rfqId: text('rfq_id'),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name'),
  vendorCode: text('vendor_code'),
  vendorGstin: text('vendor_gstin'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteAddress: text('site_address'),
  poDate: text('po_date'),
  deliveryDueDate: text('delivery_due_date'),
  paymentTerms: text('payment_terms'),
  freightTerms: text('freight_terms'),
  subtotalUsd: doublePrecision('subtotal_usd'),
  discountUsd: doublePrecision('discount_usd'),
  gstUsd: doublePrecision('gst_usd'),
  freightUsd: doublePrecision('freight_usd'),
  netAmountUsd: doublePrecision('net_amount_usd').notNull(),
  status: text('status').notNull(),
  approvalStatus: text('approval_status'),
  items: jsonb('items'),
  termsAndConditions: text('terms_and_conditions'),
  issuedByName: text('issued_by_name'),
  approvedByName: text('approved_by_name'),
  createdAt: text('created_at').notNull(),
});

export const procurementGrns = pgTable('procurement_grns', {
  id: text('id').primaryKey(),
  grnNumber: text('grn_number').notNull(),
  poId: text('po_id').notNull(),
  poNumber: text('po_number').notNull(),
  vendorId: text('vendor_id'),
  vendorName: text('vendor_name'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  warehouseId: text('warehouse_id'),
  warehouseName: text('warehouse_name'),
  receivedDate: text('received_date'),
  challanNo: text('challan_no'),
  challanDate: text('challan_date'),
  inspectedByName: text('inspected_by_name'),
  qualityStatus: text('quality_status'),
  items: jsonb('items'),
  stockUpdated: boolean('stock_updated'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const procurementWorkOrders = pgTable('procurement_work_orders', {
  id: text('id').primaryKey(),
  woNumber: text('wo_number').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  contractorName: text('contractor_name'),
  contractorCode: text('contractor_code'),
  startDate: text('start_date'),
  targetCompletionDate: text('target_completion_date'),
  contractValueUsd: doublePrecision('contract_value_usd'),
  revisedValueUsd: doublePrecision('revised_value_usd'),
  executedValueUsd: doublePrecision('executed_value_usd'),
  status: text('status').notNull(),
  scopeOfWork: text('scope_of_work'),
  attachments: jsonb('attachments'),
  variations: jsonb('variations'),
  completionCertificate: jsonb('completion_certificate'),
  createdAt: text('created_at').notNull(),
});

export const procurementBoqItems = pgTable('procurement_boq_items', {
  id: text('id').primaryKey(),
  itemCode: text('item_code').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  wbsId: text('wbs_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  category: text('category'),
  description: text('description'),
  unit: text('unit'),
  quantity: doublePrecision('quantity').notNull(),
  rateUsd: doublePrecision('rate_usd').notNull(),
  sanctionedAmountUsd: doublePrecision('sanctioned_amount_usd'),
  executedQuantity: doublePrecision('executed_quantity'),
  balanceQuantity: doublePrecision('balance_quantity'),
  variationQuantity: doublePrecision('variation_quantity'),
  runningQuantity: doublePrecision('running_quantity'),
  executedAmountUsd: doublePrecision('executed_amount_usd'),
  progressPercent: doublePrecision('progress_percent'),
  createdAt: text('created_at').notNull(),
});

export const procurementMeasurementEntries = pgTable('procurement_measurement_entries', {
  id: text('id').primaryKey(),
  mbNumber: text('mb_number').notNull(),
  entryDate: text('entry_date'),
  measurementDate: text('measurement_date'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  boqItemId: text('boq_item_id').notNull(),
  boqItemCode: text('boq_item_code'),
  boqDescription: text('boq_description'),
  contractorName: text('contractor_name'),
  chainageLocation: text('chainage_location'),
  locationChainage: text('location_chainage'),
  lengthMeters: doublePrecision('length_meters'),
  breadthMeters: doublePrecision('breadth_meters'),
  depthMeters: doublePrecision('depth_meters'),
  heightMeters: doublePrecision('height_meters'),
  calculatedQuantity: doublePrecision('calculated_quantity'),
  quantity: doublePrecision('quantity'),
  unit: text('unit'),
  valuationUsd: doublePrecision('valuation_usd'),
  status: text('status').notNull(),
  recordedByName: text('recorded_by_name'),
  verifiedByName: text('verified_by_name'),
  approvedByName: text('approved_by_name'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const procurementTenders = pgTable('procurement_tenders', {
  id: text('id').primaryKey(),
  tenderNo: text('tender_no'),
  tenderNumber: text('tender_number'),
  title: text('title').notNull(),
  clientAuthority: text('client_authority'),
  authorityName: text('authority_name'),
  category: text('category'),
  estimatedValueUsd: doublePrecision('estimated_value_usd'),
  emdAmountUsd: doublePrecision('emd_amount_usd'),
  emdInstrument: text('emd_instrument'),
  publishDate: text('publish_date'),
  submissionDueDate: text('submission_due_date'),
  eligibilityCriteria: text('eligibility_criteria'),
  tenderStatus: text('tender_status'),
  status: text('status'),
  isAwarded: boolean('is_awarded'),
  technicalBidSubmitted: boolean('technical_bid_submitted'),
  financialBidSubmitted: boolean('financial_bid_submitted'),
  quotedAmountUsd: doublePrecision('quoted_amount_usd'),
  bidSubmission: jsonb('bid_submission'),
  awardDetails: jsonb('award_details'),
  tenderDocumentsUrl: jsonb('tender_documents_url'),
  createdAt: text('created_at').notNull(),
});

export const procurementCostControls = pgTable('procurement_cost_controls', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  totalBudgetUsd: doublePrecision('total_budget_usd').notNull(),
  purchaseCostUsd: doublePrecision('purchase_cost_usd'),
  materialCostUsd: doublePrecision('material_cost_usd'),
  labourCostUsd: doublePrecision('labour_cost_usd'),
  equipmentCostUsd: doublePrecision('equipment_cost_usd'),
  vehicleCostUsd: doublePrecision('vehicle_cost_usd'),
  runningCostUsd: doublePrecision('running_cost_usd'),
  totalSpentUsd: doublePrecision('total_spent_usd'),
  committedPoUsd: doublePrecision('committed_po_usd'),
  remainingBudgetUsd: doublePrecision('remaining_budget_usd'),
  costVarianceUsd: doublePrecision('cost_variance_usd'),
  variancePercent: doublePrecision('variance_percent'),
  costStatus: text('cost_status'),
  createdAt: text('created_at').notNull(),
});

export const procurementMaterialRequests = pgTable('procurement_material_requests', {
  id: text('id').primaryKey(),
  requestNo: text('request_no').notNull(),
  requestDate: text('request_date'),
  requestedByUserId: text('requested_by_user_id'),
  requestedByUserName: text('requested_by_user_name'),
  employeeId: text('employee_id'),
  designation: text('designation'),
  department: text('department'),
  company: text('company'),
  branch: text('branch'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  unloadingPoint: text('unloading_point'),
  contactNumber: text('contact_number'),
  requiredDate: text('required_date'),
  priority: text('priority'),
  remarks: text('remarks'),
  status: text('status').notNull(),
  currentApproverRole: text('current_approver_role'),
  currentApproverId: text('current_approver_id'),
  currentApproverName: text('current_approver_name'),
  items: jsonb('items'),
  approvalHistory: jsonb('approval_history'),
  receipts: jsonb('receipts'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ----------------------------------------------------------------------------
// Legacy Phase 70 Pre-Refactor Stubs (6 Tables)
// ----------------------------------------------------------------------------

export const legacyPhase70Employees = pgTable('phase70_employees', {
  id: text('id').primaryKey(),
  employeeCode: text('employee_code').notNull(),
  firstName: text('first_name').notNull(),
  lastName: text('last_name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  gender: text('gender').notNull(),
  dateOfBirth: text('date_of_birth').notNull(),
  nationalId: text('national_id'),
  passportNumber: text('passport_number'),
  visaStatus: text('visa_status').notNull(),
  joiningDate: text('joining_date').notNull(),
  departmentId: text('department_id').notNull(),
  designationId: text('designation_id').notNull(),
  reportingManagerId: text('reporting_manager_id'),
  employmentType: text('employment_type').notNull(),
  workLocation: text('work_location').notNull(),
  projectId: text('project_id'),
  employmentStatus: text('employment_status').notNull(),
  biometricId: text('biometric_id'),
  grade: text('grade').notNull(),
  noticePeriodDays: integer('notice_period_days').notNull(),
  probationEndDate: text('probation_end_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull(),
});

export const legacyPhase70Shifts = pgTable('phase70_shifts', {
  id: text('id').primaryKey(),
  shiftCode: text('shift_code').notNull(),
  shiftName: text('shift_name').notNull(),
  startTime: text('start_time').notNull(),
  endTime: text('end_time').notNull(),
  gracePeriodMinutes: integer('grace_period_minutes').notNull(),
  breakDurationMinutes: integer('break_duration_minutes').notNull(),
  totalShiftHours: doublePrecision('total_shift_hours').notNull(),
  isNightShift: boolean('is_night_shift').notNull(),
  isOvernight: boolean('is_overnight').notNull(),
  colorTag: text('color_tag').notNull(),
  isActive: boolean('is_active').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull(),
});

export const legacyPhase70Payslips = pgTable('phase70_payslips', {
  id: text('id').primaryKey(),
  payslipNumber: text('payslip_number').notNull(),
  employeeId: text('employee_id').notNull(),
  payrollPeriodId: text('payroll_period_id').notNull(),
  workingDays: integer('working_days').notNull(),
  presentDays: doublePrecision('present_days').notNull(),
  lossOfPayDays: doublePrecision('loss_of_pay_days').notNull(),
  paidLeaveDays: doublePrecision('paid_leave_days').notNull(),
  overtimeHours: doublePrecision('overtime_hours').notNull(),
  basicSalaryAed: doublePrecision('basic_salary_aed').notNull(),
  hraAed: doublePrecision('hra_aed').notNull(),
  conveyanceAed: doublePrecision('conveyance_aed').notNull(),
  medicalAed: doublePrecision('medical_aed').notNull(),
  specialAllowanceAed: doublePrecision('special_allowance_aed').notNull(),
  siteAllowanceAed: doublePrecision('site_allowance_aed').notNull(),
  otAmountAed: doublePrecision('ot_amount_aed').notNull(),
  bonusAed: doublePrecision('bonus_aed').notNull(),
  grossEarningsAed: doublePrecision('gross_earnings_aed').notNull(),
  providentFundAed: doublePrecision('provident_fund_aed').notNull(),
  taxDeductionAed: doublePrecision('tax_deduction_aed').notNull(),
  loanEmiAed: doublePrecision('loan_emi_aed').notNull(),
  advanceRecoveryAed: doublePrecision('advance_recovery_aed').notNull(),
  otherDeductionsAed: doublePrecision('other_deductions_aed').notNull(),
  totalDeductionsAed: doublePrecision('total_deductions_aed').notNull(),
  netPayableAed: doublePrecision('net_payable_aed').notNull(),
  paymentMode: text('payment_mode').notNull(),
  paymentStatus: text('payment_status').notNull(),
  disbursementDate: text('disbursement_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull(),
});

export const legacyPhase70LeaveApplications = pgTable('phase70_leave_applications', {
  id: text('id').primaryKey(),
  leaveNumber: text('leave_number').notNull(),
  employeeId: text('employee_id').notNull(),
  leaveTypeId: text('leave_type_id').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  totalDays: doublePrecision('total_days').notNull(),
  reason: text('reason').notNull(),
  status: text('status').notNull(),
  approvedBy: text('approved_by'),
  approvalDate: text('approval_date'),
  approvalRemarks: text('approval_remarks'),
  contactDuringLeave: text('contact_during_leave'),
  attachmentUrl: text('attachment_url'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull(),
});

export const legacyPhase70EmployeeLoans = pgTable('phase70_employee_loans', {
  id: text('id').primaryKey(),
  loanCode: text('loan_code').notNull(),
  employeeId: text('employee_id').notNull(),
  loanType: text('loan_type').notNull(),
  principalAmountAed: doublePrecision('principal_amount_aed').notNull(),
  interestRate: doublePrecision('interest_rate').notNull(),
  tenureMonths: integer('tenure_months').notNull(),
  monthlyEmiAed: doublePrecision('monthly_emi_aed').notNull(),
  totalRepayableAed: doublePrecision('total_repayable_aed').notNull(),
  balanceOutstandingAed: doublePrecision('balance_outstanding_aed').notNull(),
  status: text('status').notNull(),
  disbursementDate: text('disbursement_date'),
  deductionStartMonth: text('deduction_start_month'),
  approvedBy: text('approved_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull(),
});

export const legacyPhase70RecruitmentRequisitions = pgTable('phase70_recruitment_requisitions', {
  id: text('id').primaryKey(),
  requisitionCode: text('requisition_code').notNull(),
  positionTitle: text('position_title').notNull(),
  departmentId: text('department_id').notNull(),
  vacanciesCount: integer('vacancies_count').notNull(),
  experienceYearsRequired: doublePrecision('experience_years_required').notNull(),
  minQualification: text('min_qualification').notNull(),
  targetHiringDate: text('target_hiring_date').notNull(),
  salaryBudgetAed: doublePrecision('salary_budget_aed').notNull(),
  hiringManagerId: text('hiring_manager_id'),
  priority: text('priority').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  deletedAt: text('deleted_at'),
  isDeleted: boolean('is_deleted').notNull(),
});

// ============================================================================
// PHASE 77 / P2.0: CONTRACTOR RUNNING ACCOUNT (RA) BILLING & CERTIFICATION
// ============================================================================

export const procurementVendorsTable = pgTable('procurement_vendors', {
  id: text('id').primaryKey(),
  vendorCode: text('vendor_code').notNull(),
  name: text('name').notNull(),
  category: text('category'),
  gstin: text('gstin'),
  pan: text('pan'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  pincode: text('pincode'),
  contactPersons: jsonb('contact_persons'),
  bankDetails: jsonb('bank_details'),
  paymentTerms: text('payment_terms'),
  creditPeriodDays: integer('credit_period_days').default(30),
  rating: doublePrecision('rating').default(5.0),
  status: text('status'),
  documents: jsonb('documents'),
  performance: jsonb('performance'),
  createdAt: text('created_at').notNull(),
});

export const procurementRfqsTable = pgTable('procurement_rfqs', {
  id: text('id').primaryKey(),
  rfqCode: text('rfq_code').notNull(),
  title: text('title').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  invitedVendorIds: jsonb('invited_vendor_ids'),
  invitedVendorNames: jsonb('invited_vendor_names'),
  dueDate: text('due_date'),
  items: jsonb('items'),
  status: text('status'),
  approvalStatus: text('approval_status'),
  attachments: jsonb('attachments'),
  createdDate: text('created_date'),
  createdByName: text('created_by_name'),
  createdAt: text('created_at').notNull(),
});

export const procurementQuotationsTable = pgTable('procurement_quotations', {
  id: text('id').primaryKey(),
  quotationNo: text('quotation_no').notNull(),
  rfqId: text('rfq_id').notNull(),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name'),
  submittedDate: text('submitted_date'),
  items: jsonb('items'),
  subtotalUSD: doublePrecision('subtotal_usd'),
  taxUSD: doublePrecision('tax_usd'),
  freightUSD: doublePrecision('freight_usd'),
  netTotalUSD: doublePrecision('net_total_usd').notNull(),
  leadTimeDays: integer('lead_time_days'),
  warrantyMonths: integer('warranty_months'),
  deliverySchedule: text('delivery_schedule'),
  technicalCompliance: text('technical_compliance'),
  technicalRemarks: text('technical_remarks'),
  commercialCompliance: text('commercial_compliance'),
  commercialRemarks: text('commercial_remarks'),
  isL1Bidder: boolean('is_l1_bidder').default(false),
  createdAt: text('created_at').notNull(),
});

export const procurementRequisitionsTable = pgTable('procurement_requisitions', {
  id: text('id').primaryKey(),
  prNumber: text('pr_number').notNull(),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  requestedByName: text('requested_by_name'),
  department: text('department'),
  urgency: text('urgency'),
  status: text('status').notNull(),
  createdDate: text('created_date'),
  requiredByDate: text('required_by_date'),
  budgetAllocatedUSD: doublePrecision('budget_allocated_usd'),
  items: jsonb('items'),
  remarks: text('remarks'),
  verifiedByName: text('verified_by_name'),
  approvedByName: text('approved_by_name'),
  createdAt: text('created_at').notNull(),
});

export const procurementPurchaseOrdersTable = pgTable('procurement_purchase_orders', {
  id: text('id').primaryKey(),
  poNumber: text('po_number').notNull(),
  prId: text('pr_id'),
  rfqId: text('rfq_id'),
  vendorId: text('vendor_id').notNull(),
  vendorName: text('vendor_name'),
  vendorCode: text('vendor_code'),
  vendorGstin: text('vendor_gstin'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteAddress: text('site_address'),
  poDate: text('po_date'),
  deliveryDueDate: text('delivery_due_date'),
  paymentTerms: text('payment_terms'),
  freightTerms: text('freight_terms'),
  subtotalUSD: doublePrecision('subtotal_usd'),
  discountUSD: doublePrecision('discount_usd'),
  gstUSD: doublePrecision('gst_usd'),
  freightUSD: doublePrecision('freight_usd'),
  netAmountUSD: doublePrecision('net_amount_usd').notNull(),
  status: text('status').notNull(),
  approvalStatus: text('approval_status'),
  items: jsonb('items'),
  termsAndConditions: text('terms_and_conditions'),
  issuedByName: text('issued_by_name'),
  approvedByName: text('approved_by_name'),
  createdAt: text('created_at').notNull(),
});

export const procurementGrnsTable = pgTable('procurement_grns', {
  id: text('id').primaryKey(),
  grnNumber: text('grn_number').notNull(),
  poId: text('po_id').notNull(),
  poNumber: text('po_number').notNull(),
  vendorId: text('vendor_id'),
  vendorName: text('vendor_name'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  warehouseId: text('warehouse_id'),
  warehouseName: text('warehouse_name'),
  receivedDate: text('received_date'),
  challanNo: text('challan_no'),
  challanDate: text('challan_date'),
  inspectedByName: text('inspected_by_name'),
  qualityStatus: text('quality_status'),
  items: jsonb('items'),
  stockUpdated: boolean('stock_updated').default(true),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const procurementWorkOrdersTable = pgTable('procurement_work_orders', {
  id: text('id').primaryKey(),
  woNumber: text('wo_number').notNull(),
  title: text('title').notNull(),
  category: text('category'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  contractorName: text('contractor_name'),
  contractorCode: text('contractor_code'),
  startDate: text('start_date'),
  targetCompletionDate: text('target_completion_date'),
  contractValueUSD: doublePrecision('contract_value_usd'),
  revisedValueUSD: doublePrecision('revised_value_usd'),
  executedValueUSD: doublePrecision('executed_value_usd'),
  status: text('status').notNull(),
  scopeOfWork: text('scope_of_work'),
  attachments: jsonb('attachments'),
  variations: jsonb('variations'),
  completionCertificate: jsonb('completion_certificate'),
  createdAt: text('created_at').notNull(),
});

export const procurementBoqItemsTable = pgTable('procurement_boq_items', {
  id: text('id').primaryKey(),
  itemCode: text('item_code').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  category: text('category'),
  description: text('description'),
  unit: text('unit'),
  quantity: doublePrecision('quantity').notNull(),
  rateUSD: doublePrecision('rate_usd').notNull(),
  sanctionedAmountUSD: doublePrecision('sanctioned_amount_usd'),
  executedQuantity: doublePrecision('executed_quantity').default(0),
  balanceQuantity: doublePrecision('balance_quantity').default(0),
  variationQuantity: doublePrecision('variation_quantity').default(0),
  runningQuantity: doublePrecision('running_quantity').default(0),
  executedAmountUSD: doublePrecision('executed_amount_usd').default(0),
  progressPercent: doublePrecision('progress_percent').default(0),
  createdAt: text('created_at').notNull(),
});

export const procurementMeasurementEntriesTable = pgTable('procurement_measurement_entries', {
  id: text('id').primaryKey(),
  mbNumber: text('mb_number').notNull(),
  entryDate: text('entry_date'),
  measurementDate: text('measurement_date'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  boqItemId: text('boq_item_id').notNull(),
  boqItemCode: text('boq_item_code'),
  boqDescription: text('boq_description'),
  contractorName: text('contractor_name'),
  chainageLocation: text('chainage_location'),
  locationChainage: text('location_chainage'),
  lengthMeters: doublePrecision('length_meters').default(0),
  breadthMeters: doublePrecision('breadth_meters').default(0),
  depthMeters: doublePrecision('depth_meters').default(0),
  heightMeters: doublePrecision('height_meters').default(0),
  calculatedQuantity: doublePrecision('calculated_quantity').default(0),
  quantity: doublePrecision('quantity').default(0),
  unit: text('unit'),
  valuationUSD: doublePrecision('valuation_usd').default(0),
  status: text('status').notNull(),
  recordedByName: text('recorded_by_name'),
  verifiedByName: text('verified_by_name'),
  approvedByName: text('approved_by_name'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
});

export const procurementTendersTable = pgTable('procurement_tenders', {
  id: text('id').primaryKey(),
  tenderNo: text('tender_no'),
  tenderNumber: text('tender_number'),
  title: text('title').notNull(),
  clientAuthority: text('client_authority'),
  authorityName: text('authority_name'),
  category: text('category'),
  estimatedValueUSD: doublePrecision('estimated_value_usd'),
  emdAmountUSD: doublePrecision('emd_amount_usd'),
  emdInstrument: text('emd_instrument'),
  publishDate: text('publish_date'),
  submissionDueDate: text('submission_due_date'),
  eligibilityCriteria: text('eligibility_criteria'),
  tenderStatus: text('tender_status'),
  status: text('status'),
  isAwarded: boolean('is_awarded').default(false),
  technicalBidSubmitted: boolean('technical_bid_submitted').default(false),
  financialBidSubmitted: boolean('financial_bid_submitted').default(false),
  quotedAmountUSD: doublePrecision('quoted_amount_usd'),
  bidSubmission: jsonb('bid_submission'),
  awardDetails: jsonb('award_details'),
  tenderDocumentsUrl: jsonb('tender_documents_url'),
  createdAt: text('created_at').notNull(),
});

export const procurementCostControlsTable = pgTable('procurement_cost_controls', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  totalBudgetUSD: doublePrecision('total_budget_usd').notNull(),
  purchaseCostUSD: doublePrecision('purchase_cost_usd').default(0),
  materialCostUSD: doublePrecision('material_cost_usd').default(0),
  labourCostUSD: doublePrecision('labour_cost_usd').default(0),
  equipmentCostUSD: doublePrecision('equipment_cost_usd').default(0),
  vehicleCostUSD: doublePrecision('vehicle_cost_usd').default(0),
  runningCostUSD: doublePrecision('running_cost_usd').default(0),
  totalSpentUSD: doublePrecision('total_spent_usd').default(0),
  committedPOUSD: doublePrecision('committed_po_usd').default(0),
  remainingBudgetUSD: doublePrecision('remaining_budget_usd').default(0),
  costVarianceUSD: doublePrecision('cost_variance_usd').default(0),
  variancePercent: doublePrecision('variance_percent').default(0),
  costStatus: text('cost_status'),
  createdAt: text('created_at').notNull(),
});

export const procurementMaterialRequestsTable = pgTable('procurement_material_requests', {
  id: text('id').primaryKey(),
  requestNo: text('request_no').notNull(),
  requestDate: text('request_date'),
  requestedByUserId: text('requested_by_user_id'),
  requestedByUserName: text('requested_by_user_name'),
  employeeId: text('employee_id'),
  designation: text('designation'),
  department: text('department'),
  company: text('company'),
  branch: text('branch'),
  projectId: text('project_id'),
  projectName: text('project_name'),
  siteName: text('site_name'),
  unloadingPoint: text('unloading_point'),
  contactNumber: text('contact_number'),
  requiredDate: text('required_date'),
  priority: text('priority'),
  remarks: text('remarks'),
  status: text('status').notNull(),
  currentApproverRole: text('current_approver_role'),
  currentApproverId: text('current_approver_id'),
  currentApproverName: text('current_approver_name'),
  items: jsonb('items'),
  approvalHistory: jsonb('approval_history'),
  receipts: jsonb('receipts'),
  attachments: jsonb('attachments'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

export const procurementRaBillsTable = pgTable('procurement_ra_bills', {
  id: text('id').primaryKey(),
  billNumber: text('bill_number').notNull(),
  workOrderId: text('work_order_id'),
  workOrderNumber: text('work_order_number'),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  contractorName: text('contractor_name'),
  contractorCode: text('contractor_code'),
  billDate: text('bill_date'),
  billingPeriodStart: text('billing_period_start'),
  billingPeriodEnd: text('billing_period_end'),
  billType: text('bill_type'),
  sequenceNumber: integer('sequence_number').default(1),
  isFinalBill: boolean('is_final_bill').default(false),
  status: text('status').notNull(),
  items: jsonb('items'),
  financials: jsonb('financials'),
  contractorRepresentative: text('contractor_representative'),
  qsVerifier: text('qs_verifier'),
  siteEngineer: text('site_engineer'),
  projectDirector: text('project_director'),
  financeApprover: text('finance_approver'),
  paymentReferenceNumber: text('payment_reference_number'),
  paymentDisbursedDate: text('payment_disbursed_date'),
  remarks: text('remarks'),
  auditTrail: jsonb('audit_trail'),
  attachments: jsonb('attachments'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
});

export const projectCashRequestsTable = pgTable('project_cash_requests', {
  id: text('id').primaryKey(),
  requestCode: text('request_code').notNull().unique(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name').notNull(),
  employeeCode: text('employee_code'),
  divisionId: text('division_id'),
  divisionName: text('division_name'),
  departmentId: text('department_id'),
  departmentName: text('department_name'),
  currency: text('currency').default('AED'),
  originalAmount: doublePrecision('original_amount'),
  exchangeRate: doublePrecision('exchange_rate').default(1.0),
  baseAmount: doublePrecision('base_amount'),
  baseCurrency: text('base_currency').default('AED'),
  amount: doublePrecision('amount').notNull(),
  approvedAmount: doublePrecision('approved_amount'),
  disbursedAmount: doublePrecision('disbursed_amount'),
  purpose: text('purpose').notNull(),
  category: text('category').default('SITE_OPERATIONS').notNull(), // 'SITE_OPERATIONS' | 'EMERGENCY_PURCHASE' | 'PETTY_CASH' | 'TRAVEL' | 'LABOR_PAYMENT' | 'TESTING_FEES' | 'OTHER'
  requiredDate: text('required_date'),
  status: text('status').default('SUBMITTED').notNull(), // 'DRAFT' | 'SUBMITTED' | 'INCHARGE_REVIEWED' | 'APPROVED' | 'DISBURSED' | 'SETTLED' | 'PARTIALLY_SETTLED' | 'REJECTED'
  siteInchargeId: text('site_incharge_id'),
  siteInchargeName: text('site_incharge_name'),
  inchargeRemarks: text('incharge_remarks'),
  projectDirectorId: text('project_director_id'),
  projectDirectorName: text('project_director_name'),
  directorRemarks: text('director_remarks'),
  financeApproverId: text('finance_approver_id'),
  financeApproverName: text('finance_approver_name'),
  financeRemarks: text('finance_remarks'),
  paymentMethod: text('payment_method'), // 'CASH' | 'BANK_TRANSFER' | 'CHEQUE'
  paymentReference: text('payment_reference'),
  disbursedAt: text('disbursed_at'),
  settlementStatus: text('settlement_status').default('PENDING').notNull(), // 'PENDING' | 'SUBMITTED' | 'AUDITED' | 'SETTLED' | 'OVERDUE'
  settledAmount: doublePrecision('settled_amount').default(0),
  remainingBalance: doublePrecision('remaining_balance').default(0),
  supportingDocuments: jsonb('supporting_documents'),
  approvalHistory: jsonb('approval_history'),
  auditTrail: jsonb('audit_trail'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const projectCashSettlementsTable = pgTable('project_cash_settlements', {
  id: text('id').primaryKey(),
  settlementCode: text('settlement_code').notNull().unique(),
  cashRequestId: text('cash_request_id').notNull(),
  projectId: text('project_id').notNull(),
  employeeId: text('employee_id').notNull(),
  employeeName: text('employee_name').notNull(),
  currency: text('currency').default('AED'),
  originalExpenseAmount: doublePrecision('original_expense_amount'),
  exchangeRate: doublePrecision('exchange_rate').default(1.0),
  baseExpenseAmount: doublePrecision('base_expense_amount'),
  baseCurrency: text('base_currency').default('AED'),
  totalExpenseAmount: doublePrecision('total_expense_amount').notNull(),
  unspentCashReturned: doublePrecision('unspent_cash_returned').default(0).notNull(),
  status: text('status').default('SUBMITTED').notNull(), // 'SUBMITTED' | 'AUDITED' | 'APPROVED' | 'REJECTED'
  voucherItems: jsonb('voucher_items'),
  invoicesAndReceipts: jsonb('invoices_and_receipts'),
  auditorId: text('auditor_id'),
  auditorName: text('auditor_name'),
  auditRemarks: text('audit_remarks'),
  submittedAt: text('submitted_at').notNull(),
  settledAt: text('settled_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});





export const hrBiometricRawPunches = pgTable('hr_biometric_raw_punches', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  biometricId: text('biometric_id').notNull(),
  employeeId: text('employee_id'),
  employeeCode: text('employee_code'),
  employeeName: text('employee_name'),
  rawTimestamp: text('raw_timestamp').notNull(),
  punchType: text('punch_type').notNull().default('CHECK_IN'),
  verificationMode: text('verification_mode').notNull().default('FINGERPRINT'),
  rawPayload: text('raw_payload'),
  sourceFingerprint: text('source_fingerprint'),
  isProcessed: boolean('is_processed').notNull().default(false),
  createdAt: text('created_at').notNull(),
}, (table) => ({
  sourceFingerprintUnique: uniqueIndex('uq_hr_biometric_raw_source_fingerprint').on(table.sourceFingerprint),
}));


// ==========================================
// PHASE 5A: ENTERPRISE IDEMPOTENCY REGISTRY
// ==========================================
export const idempotencyKeys = pgTable("idempotency_keys", {
  id: text("id").primaryKey(),
  key: text("key").notNull(),
  userId: text("user_id").notNull(),
  method: text("method").notNull(),
  routePath: text("route_path").notNull(),
  requestHash: text("request_hash").notNull(),
  status: text("status").notNull().default("IN_PROGRESS"), // "IN_PROGRESS" | "COMPLETED" | "FAILED"
  statusCode: integer("status_code"),
  responseBody: jsonb("response_body"),
  responseHeaders: jsonb("response_headers"),
  createdAt: text("created_at").notNull(),
  completedAt: text("completed_at"),
  lockedUntil: text("locked_until").notNull(),
  expiresAt: text("expires_at").notNull(),
  replayCount: integer("replay_count").notNull().default(0),
});


// ==========================================
// PHASE 5B: CENTRALIZED DOCUMENT NUMBERING ENGINE
// ==========================================
export const documentSequences = pgTable("document_sequences", {
  id: text("id").primaryKey(),
  companyId: text("company_id"),
  branchId: text("branch_id"),
  projectId: text("project_id"),
  entityType: text("entity_type").notNull(),
  fiscalYear: text("fiscal_year").notNull(),
  scopeType: text("scope_type").notNull().default("COMPANY"),
  prefix: text("prefix").notNull(),
  formatPattern: text("format_pattern").notNull().default("{PREFIX}-{FY}-{SEQ}"),
  currentSequence: integer("current_sequence").notNull().default(0),
  padLength: integer("pad_length").notNull().default(4),
  step: integer("step").notNull().default(1),
  resetFrequency: text("reset_frequency").notNull().default("YEARLY"),
  lastResetDate: text("last_reset_date"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const documentNumberingPolicies = pgTable("document_numbering_policies", {
  id: text("id").primaryKey(),
  companyId: text("company_id"),
  entityType: text("entity_type").notNull(),
  scopeType: text("scope_type").notNull().default("COMPANY"),
  prefix: text("prefix").notNull(),
  formatPattern: text("format_pattern").notNull().default("{PREFIX}-{FY}-{SEQ}"),
  padLength: integer("pad_length").notNull().default(4),
  step: integer("step").notNull().default(1),
  resetFrequency: text("reset_frequency").notNull().default("YEARLY"),
  fiscalYearStartMonth: integer("fiscal_year_start_month").notNull().default(1),
  allowManualOverride: boolean("allow_manual_override").notNull().default(true),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: text("created_at").notNull(),
  updatedAt: text("updated_at").notNull(),
});

export const documentAllocations = pgTable("document_allocations", {
  id: text("id").primaryKey(),
  sequenceId: text("sequence_id"),
  entityType: text("entity_type").notNull(),
  allocatedNumber: text("allocated_number").notNull(),
  sequenceValue: integer("sequence_value").notNull(),
  companyId: text("company_id"),
  branchId: text("branch_id"),
  projectId: text("project_id"),
  fiscalYear: text("fiscal_year").notNull(),
  documentId: text("document_id"),
  allocatedBy: text("allocated_by"),
  createdAt: text("created_at").notNull(),
});


export const phase71MaintenanceLabor = pgTable('phase71_maintenance_labor', {
  id: text('id').primaryKey(),
  workOrderId: text('work_order_id'),
  technicianId: text('technician_id'),
  technicianName: text('technician_name'),
  hoursLogged: real('hours_logged').default(0),
  hourlyRateAed: real('hourly_rate_aed').default(0),
  totalCostAed: real('total_cost_aed').default(0),
  loggedDate: text('logged_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71MaintenanceSpareParts = pgTable('phase71_maintenance_spare_parts', {
  id: text('id').primaryKey(),
  workOrderId: text('work_order_id'),
  sparePartId: text('spare_part_id'),
  partNumber: text('part_number'),
  partName: text('part_name'),
  quantityUsed: real('quantity_used').default(0),
  unitCostAed: real('unit_cost_aed').default(0),
  totalCostAed: real('total_cost_aed').default(0),
  warehouseId: text('warehouse_id'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71MaintenanceHistory = pgTable('phase71_maintenance_history', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  workOrderId: text('work_order_id'),
  referenceNumber: text('reference_number'),
  maintenanceType: text('maintenance_type'),
  eventType: text('event_type'),
  summary: text('summary'),
  actionTaken: text('action_taken'),
  downtimeHours: real('downtime_hours').default(0),
  loggedBy: text('logged_by'),
  eventDate: text('event_date'),
  completedDate: text('completed_date'),
  costAed: real('cost_aed').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71BreakdownReports = pgTable('phase71_breakdown_reports', {
  id: text('id').primaryKey(),
  breakdownNumber: text('breakdown_number').notNull(),
  assetId: text('asset_id').notNull(),
  breakdownDate: text('breakdown_date'),
  breakdownTime: text('breakdown_time'),
  reportedBy: text('reported_by'),
  initialSymptoms: text('initial_symptoms'),
  severity: text('severity').notNull().default('CRITICAL_STOPPAGE'),
  suspectedRootCause: text('suspected_root_cause'),
  emergencyWorkOrderId: text('emergency_work_order_id'),
  productionImpact: text('production_impact').default('LINE_HALTED'),
  status: text('status').notNull().default('REPORTED'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71DowntimeLogs = pgTable('phase71_downtime_logs', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  breakdownId: text('breakdown_id'),
  workOrderId: text('work_order_id'),
  startTime: text('start_time').notNull(),
  endTime: text('end_time'),
  durationMinutes: real('duration_minutes').default(0),
  totalDowntimeMinutes: real('total_downtime_minutes').default(0),
  downtimeCategory: text('downtime_category'),
  lossCostAed: real('loss_cost_aed').default(0),
  resolvedBy: text('resolved_by'),
  reason: text('reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71ConditionMonitoring = pgTable('phase71_condition_monitoring', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  sensorId: text('sensor_id'),
  parameterName: text('parameter_name').notNull(),
  parameterValue: real('parameter_value').notNull(),
  unit: text('unit').notNull(),
  thresholdMin: real('threshold_min').default(0),
  thresholdMax: real('threshold_max').default(100),
  alertSeverity: text('alert_severity').default('NORMAL'),
  measuredAt: text('measured_at').notNull(),
  isAlarmActive: boolean('is_alarm_active').default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71MeterReadings = pgTable('phase71_meter_readings', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  meterType: text('meter_type').notNull(),
  currentReading: real('current_reading').notNull(),
  unit: text('unit'),
  recordedAt: text('recorded_at').notNull(),
  recordedBy: text('recorded_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71CalibrationRecords = pgTable('phase71_calibration_records', {
  id: text('id').primaryKey(),
  calibrationNumber: text('calibration_number').notNull(),
  assetId: text('asset_id').notNull(),
  instrumentName: text('instrument_name'),
  calibrationAgency: text('calibration_agency'),
  certificateNumber: text('certificate_number'),
  calibratedDate: text('calibrated_date'),
  nextDueDate: text('next_due_date'),
  standardUsed: text('standard_used'),
  resultStatus: text('result_status').default('PASS_WITHIN_TOLERANCE'),
  uncertaintyMeasurement: text('uncertainty_measurement'),
  approvedBy: text('approved_by'),
  certificateUrl: text('certificate_url'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71InspectionRecords = pgTable('phase71_inspection_records', {
  id: text('id').primaryKey(),
  inspectionNumber: text('inspection_number').notNull(),
  assetId: text('asset_id').notNull(),
  inspectorName: text('inspector_name'),
  inspectionType: text('inspection_type').default('THIRD_PARTY_STATUTORY'),
  inspectionDate: text('inspection_date'),
  complianceStandard: text('compliance_standard'),
  overallRating: text('overall_rating').default('SATISFACTORY'),
  observations: text('observations'),
  recommendedActions: text('recommended_actions'),
  passStatus: boolean('pass_status').default(true),
  nextInspectionDate: text('next_inspection_date'),
  reportUrl: text('report_url'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71MaintenanceCosts = pgTable('phase71_maintenance_costs', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  costPeriod: text('cost_period'),
  preventiveCostAed: real('preventive_cost_aed').default(0),
  correctiveCostAed: real('corrective_cost_aed').default(0),
  sparePartsCostAed: real('spare_parts_cost_aed').default(0),
  externalVendorCostAed: real('external_vendor_cost_aed').default(0),
  totalMaintenanceCostAed: real('total_maintenance_cost_aed').default(0),
  budgetAed: real('budget_aed').default(0),
  varianceAed: real('variance_aed').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71AssetDisposal = pgTable('phase71_asset_disposal', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  disposalDate: text('disposal_date'),
  disposalMethod: text('disposal_method'),
  salePriceAed: real('sale_price_aed').default(0),
  scrapValueAed: real('scrap_value_aed').default(0),
  approvedBy: text('approved_by'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase71AssetAuditLogs = pgTable('phase71_asset_audit_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  referenceNumber: text('reference_number'),
  performedBy: text('performed_by'),
  detailsJson: jsonb('details_json'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72DeviceTypes = pgTable('phase72_device_types', {
  id: text('id').primaryKey(),
  typeCode: text('type_code').notNull(),
  typeName: text('type_name').notNull(),
  category: text('category'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72Devices = pgTable('phase72_devices', {
  id: text('id').primaryKey(),
  deviceCode: text('device_code').notNull(),
  deviceName: text('device_name').notNull(),
  deviceTypeId: text('device_type_id'),
  modelId: text('model_id'),
  serialNumber: text('serial_number'),
  manufacturer: text('manufacturer'),
  protocol: text('protocol'),
  communicationProtocol: text('communication_protocol'),
  ipAddress: text('ip_address'),
  macAddress: text('mac_address'),
  firmwareVersion: text('firmware_version'),
  status: text('status').default('ONLINE'),
  assetId: text('asset_id'),
  projectId: text('project_id'),
  location: text('location'),
  installationDate: text('installation_date'),
  lastHeartbeat: text('last_heartbeat'),
  batteryLevel: real('battery_level'),
  signalStrength: real('signal_strength'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72DeviceModels = pgTable('phase72_device_models', {
  id: text('id').primaryKey(),
  modelCode: text('model_code').notNull(),
  modelName: text('model_name').notNull(),
  manufacturer: text('manufacturer'),
  supportedProtocols: jsonb('supported_protocols'),
  specifications: jsonb('specifications'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72DeviceCredentials = pgTable('phase72_device_credentials', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  authType: text('auth_type').notNull(),
  apiKeyHash: text('api_key_hash'),
  certificateArn: text('certificate_arn'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72Gateways = pgTable('phase72_gateways', {
  id: text('id').primaryKey(),
  gatewayCode: text('gateway_code').notNull(),
  gatewayName: text('gateway_name').notNull(),
  ipAddress: text('ip_address'),
  port: integer('port'),
  protocol: text('protocol'),
  status: text('status').default('ONLINE'),
  connectedDevicesCount: integer('connected_devices_count').default(0),
  lastPing: text('last_ping'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72RtuUnits = pgTable('phase72_rtu_units', {
  id: text('id').primaryKey(),
  rtuCode: text('rtu_code').notNull(),
  rtuName: text('rtu_name').notNull(),
  stationLocation: text('station_location'),
  channelCount: integer('channel_count').default(16),
  communicationMedium: text('communication_medium'),
  status: text('status').default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72PlcUnits = pgTable('phase72_plc_units', {
  id: text('id').primaryKey(),
  plcCode: text('plc_code').notNull(),
  plcName: text('plc_name').notNull(),
  rackSlot: text('rack_slot'),
  cpuModel: text('cpu_model'),
  ipAddress: text('ip_address'),
  programChecksum: text('program_checksum'),
  status: text('status').default('RUN'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72Sensors = pgTable('phase72_sensors', {
  id: text('id').primaryKey(),
  sensorCode: text('sensor_code').notNull(),
  sensorName: text('sensor_name').notNull(),
  sensorType: text('sensor_type').notNull(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  unitOfMeasure: text('unit_of_measure'),
  minRange: real('min_range'),
  maxRange: real('max_range'),
  accuracy: text('accuracy'),
  status: text('status').default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72SensorChannels = pgTable('phase72_sensor_channels', {
  id: text('id').primaryKey(),
  sensorId: text('sensor_id'),
  channelNumber: integer('channel_number').notNull(),
  channelName: text('channel_name'),
  signalType: text('signal_type'),
  scalingFactor: real('scaling_factor').default(1.0),
  offsetValue: real('offset_value').default(0.0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72TelemetryPoints = pgTable('phase72_telemetry_points', {
  id: text('id').primaryKey(),
  pointCode: text('point_code').notNull(),
  pointName: text('point_name').notNull(),
  deviceId: text('device_id'),
  sensorId: text('sensor_id'),
  dataType: text('data_type').default('FLOAT'),
  engineeringUnit: text('engineering_unit'),
  currentValue: real('current_value'),
  rawCurrentValue: real('raw_current_value'),
  quality: text('quality').default('GOOD'),
  dataQuality: text('data_quality'),
  lastUpdated: text('last_updated'),
  lastTimestamp: text('last_timestamp'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72TelemetryReadings = pgTable('phase72_telemetry_readings', {
  id: text('id').primaryKey(),
  pointId: text('point_id'),
  sensorId: text('sensor_id'),
  assetId: text('asset_id'),
  rawVal: real('raw_val'),
  engVal: real('eng_val'),
  unit: text('unit'),
  isAlarmTriggered: boolean('is_alarm_triggered'),
  deviceId: text('device_id'),
  numericValue: real('numeric_value'),
  stringValue: text('string_value'),
  booleanValue: boolean('boolean_value'),
  quality: text('quality').default('GOOD'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72DeviceStatus = pgTable('phase72_device_status', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  status: text('status').notNull(),
  statusReason: text('status_reason'),
  changedAt: text('changed_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72DeviceCommands = pgTable('phase72_device_commands', {
  id: text('id').primaryKey(),
  commandCode: text('command_code').notNull(),
  deviceId: text('device_id').notNull(),
  assetId: text('asset_id'),
  commandType: text('command_type').notNull(),
  targetRegister: text('target_register'),
  parameterValue: text('parameter_value'),
  timeoutSeconds: integer('timeout_seconds').default(30),
  requestedBy: text('requested_by'),
  authorizedBy: text('authorized_by'),
  status: text('status').default('PENDING'),
  executionResponse: text('execution_response'),
  createdBy: text('created_by'),
  updatedBy: text('updated_by'),
  responsePayload: jsonb('response_payload'),
  executedAt: text('executed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72CommandLogs = pgTable('phase72_command_logs', {
  id: text('id').primaryKey(),
  commandId: text('command_id').notNull(),
  deviceId: text('device_id'),
  actionTaken: text('action_taken'),
  payloadSent: text('payload_sent'),
  rawResponse: text('raw_response'),
  statusCode: text('status_code'),
  executionDurationMs: real('execution_duration_ms'),
  logMessage: text('log_message'),
  severity: text('severity').default('INFO'),
  createdAt: text('created_at').notNull(),
});

export const phase72AlarmRules = pgTable('phase72_alarm_rules', {
  id: text('id').primaryKey(),
  ruleCode: text('rule_code').notNull(),
  ruleName: text('rule_name').notNull(),
  pointId: text('point_id'),
  sensorType: text('sensor_type'),
  conditionType: text('condition_type'),
  thresholdValue: real('threshold_value'),
  highHighLimit: real('high_high_limit'),
  highLimit: real('high_limit'),
  lowLimit: real('low_limit'),
  lowLowLimit: real('low_low_limit'),
  deadband: real('deadband'),
  severity: text('severity').default('WARNING'),
  priority: text('priority').default('P2'),
  suppressionMinutes: integer('suppression_minutes').default(15),
  hysteresis: real('hysteresis').default(0),
  isEnabled: boolean('is_enabled').default(true),
  autoCreateWorkOrder: boolean('auto_create_work_order').default(false),
  notificationChannel: text('notification_channel'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72Alarms = pgTable('phase72_alarms', {
  id: text('id').primaryKey(),
  alarmCode: text('alarm_code'),
  alarmNumber: text('alarm_number'),
  ruleId: text('rule_id'),
  pointId: text('point_id'),
  deviceId: text('device_id'),
  sensorId: text('sensor_id'),
  assetId: text('asset_id'),
  alarmType: text('alarm_type'),
  severity: text('severity').notNull(),
  priority: text('priority').default('P2'),
  title: text('title'),
  message: text('message'),
  alarmMessage: text('alarm_message'),
  triggerValue: real('trigger_value'),
  thresholdValue: real('threshold_value'),
  unit: text('unit'),
  triggeredAt: text('triggered_at').notNull(),
  acknowledgedAt: text('acknowledged_at'),
  acknowledgedBy: text('acknowledged_by'),
  resolvedAt: text('resolved_at'),
  resolvedBy: text('resolved_by'),
  resolutionNotes: text('resolution_notes'),
  slaDueMinutes: integer('sla_due_minutes'),
  isWorkOrderCreated: boolean('is_work_order_created').default(false),
  workOrderId: text('work_order_id'),
  status: text('status').default('ACTIVE'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72AlarmAcknowledgements = pgTable('phase72_alarm_acknowledgements', {
  id: text('id').primaryKey(),
  alarmId: text('alarm_id').notNull(),
  acknowledgedBy: text('acknowledged_by'),
  userId: text('user_id'),
  userName: text('user_name'),
  ackTime: text('ack_time'),
  comments: text('comments'),
  notes: text('notes'),
  expectedAction: text('expected_action'),
  actionTaken: text('action_taken'),
  createdAt: text('created_at').notNull(),
});

export const phase72AlarmEscalations = pgTable('phase72_alarm_escalations', {
  id: text('id').primaryKey(),
  alarmId: text('alarm_id').notNull(),
  escalationLevel: integer('escalation_level').notNull(),
  escalatedToRole: text('escalated_to_role'),
  escalatedAt: text('escalated_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72EquipmentHealth = pgTable('phase72_equipment_health', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  overallHealthScore: real('overall_health_score'),
  vibrationHealthScore: real('vibration_health_score'),
  thermalHealthScore: real('thermal_health_score'),
  lubricationHealthScore: real('lubrication_health_score'),
  electricalHealthScore: real('electrical_health_score'),
  healthStatus: text('health_status').default('GOOD'),
  assessmentDate: text('assessment_date'),
  healthScore: real('health_score'),
  conditionScore: real('condition_score'),
  availabilityPercent: real('availability_percent'),
  reliabilityPercent: real('reliability_percent'),
  totalRunningHours: real('total_running_hours'),
  activeAlarmsCount: integer('active_alarms_count'),
  criticalAlarmsCount: integer('critical_alarms_count'),
  temperatureStatus: text('temperature_status'),
  vibrationStatus: text('vibration_status'),
  pressureStatus: text('pressure_status'),
  energyEfficiencyPercent: real('energy_efficiency_percent'),
  failureRiskLevel: text('failure_risk_level'),
  lastCalculatedAt: text('last_calculated_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72ConditionMonitoring = pgTable('phase72_condition_monitoring', {
  id: text('id').primaryKey(),
  assetId: text('asset_id').notNull(),
  parameterName: text('parameter_name'),
  value: real('value'),
  status: text('status'),
  recordedAt: text('recorded_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72PredictiveModels = pgTable('phase72_predictive_models', {
  id: text('id').primaryKey(),
  modelCode: text('model_code').notNull(),
  modelName: text('model_name').notNull(),
  modelType: text('model_type'),
  algorithm: text('algorithm'),
  targetEquipmentType: text('target_equipment_type'),
  modelProvider: text('model_provider'),
  isActive: boolean('is_active').default(true),
  lastTrainedAt: text('last_trained_at'),
  targetAssetCategory: text('target_asset_category'),
  accuracyScore: real('accuracy_score'),
  featuresUsed: jsonb('features_used'),
  version: text('version').default('1.0.0'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72Predictions = pgTable('phase72_predictions', {
  id: text('id').primaryKey(),
  modelId: text('model_id'),
  assetId: text('asset_id').notNull(),
  predictionType: text('prediction_type').notNull(),
  predictedRulHours: real('predicted_rul_hours'),
  failureRiskScore: real('failure_risk_score'),
  riskClassification: text('risk_classification'),
  predictedFailureMode: text('predicted_failure_mode'),
  confidencePercent: real('confidence_percent'),
  recommendedAction: text('recommended_action'),
  generatedAt: text('generated_at').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72Anomalies = pgTable('phase72_anomalies', {
  id: text('id').primaryKey(),
  anomalyCode: text('anomaly_code').notNull(),
  assetId: text('asset_id').notNull(),
  sensorId: text('sensor_id'),
  parameterName: text('parameter_name'),
  anomalyScore: real('anomaly_score'),
  severity: text('severity').default('MEDIUM'),
  observedValue: real('observed_value'),
  expectedValue: real('expected_value'),
  unit: text('unit'),
  status: text('status').default('INVESTIGATING'),
  detectedAt: text('detected_at').notNull(),
  rootCauseNotes: text('root_cause_notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72EnergyReadings = pgTable('phase72_energy_readings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  timestamp: text('timestamp').notNull(),
  activePowerKw: real('active_power_kw'),
  apparentPowerKva: real('apparent_power_kva'),
  energyKwh: real('energy_kwh'),
  voltagePhaseA: real('voltage_phase_a'),
  voltagePhaseB: real('voltage_phase_b'),
  voltagePhaseC: real('voltage_phase_c'),
  currentPhaseA: real('current_phase_a'),
  currentPhaseB: real('current_phase_b'),
  currentPhaseC: real('current_phase_c'),
  powerFactor: real('power_factor'),
  frequencyHz: real('frequency_hz'),
  specificEnergyKwhM3: real('specific_energy_kwh_m3'),
  createdAt: text('created_at').notNull(),
});

export const phase72FlowReadings = pgTable('phase72_flow_readings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  flowRateM3h: real('flow_rate_m3h'),
  totalizedVolumeM3: real('totalized_volume_m3'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72PressureReadings = pgTable('phase72_pressure_readings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  pressureBar: real('pressure_bar'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72LevelReadings = pgTable('phase72_level_readings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  levelMeters: real('level_meters'),
  levelPercentage: real('level_percentage'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72VibrationReadings = pgTable('phase72_vibration_readings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  overallVibrationRmsMms: real('overall_vibration_rms_mms'),
  peakAccelerationG: real('peak_acceleration_g'),
  crestFactor: real('crest_factor'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72TemperatureReadings = pgTable('phase72_temperature_readings', {
  id: text('id').primaryKey(),
  deviceId: text('device_id'),
  assetId: text('asset_id'),
  temperatureCelsius: real('temperature_celsius'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72ScadaTags = pgTable('phase72_scada_tags', {
  id: text('id').primaryKey(),
  tagCode: text('tag_code').notNull(),
  tagName: text('tag_name').notNull(),
  deviceId: text('device_id'),
  sensorId: text('sensor_id'),
  dataType: text('data_type').default('FLOAT'),
  engineeringUnit: text('engineering_unit'),
  highHighLimit: real('high_high_limit'),
  highLimit: real('high_limit'),
  lowLimit: real('low_limit'),
  lowLowLimit: real('low_low_limit'),
  lastValue: real('last_value'),
  lastUpdated: text('last_updated'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72ScadaTagHistory = pgTable('phase72_scada_tag_history', {
  id: text('id').primaryKey(),
  tagId: text('tag_id').notNull(),
  tagValue: real('tag_value'),
  quality: text('quality').default('GOOD'),
  recordedAt: text('recorded_at').notNull(),
});

export const phase72ScadaDashboards = pgTable('phase72_scada_dashboards', {
  id: text('id').primaryKey(),
  dashboardCode: text('dashboard_code').notNull(),
  dashboardTitle: text('dashboard_title').notNull(),
  dashboardType: text('dashboard_type').default('WATER_TREATMENT_PLANT'),
  layoutJson: jsonb('layout_json'),
  isDefault: boolean('is_default').default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72ScadaWidgets = pgTable('phase72_scada_widgets', {
  id: text('id').primaryKey(),
  dashboardId: text('dashboard_id').notNull(),
  widgetTitle: text('widget_title').notNull(),
  widgetType: text('widget_type').notNull(),
  tagBindings: jsonb('tag_bindings'),
  positionConfig: jsonb('position_config'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  isDeleted: boolean('is_deleted').notNull().default(false),
});

export const phase72DeviceEvents = pgTable('phase72_device_events', {
  id: text('id').primaryKey(),
  deviceId: text('device_id').notNull(),
  eventType: text('event_type').notNull(),
  eventPayload: jsonb('event_payload'),
  eventTimestamp: text('event_timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72DataQualityLogs = pgTable('phase72_data_quality_logs', {
  id: text('id').primaryKey(),
  pointId: text('point_id').notNull(),
  issueType: text('issue_type').notNull(),
  reportedAt: text('reported_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72CommunicationLogs = pgTable('phase72_communication_logs', {
  id: text('id').primaryKey(),
  gatewayId: text('gateway_id'),
  protocol: text('protocol'),
  bytesTransferred: integer('bytes_transferred'),
  packetLossPercent: real('packet_loss_percent'),
  loggedAt: text('logged_at').notNull(),
  createdAt: text('created_at').notNull(),
});

export const phase72TelemetrySyncQueue = pgTable('phase72_telemetry_sync_queue', {
  id: text('id').primaryKey(),
  payloadJson: jsonb('payload_json').notNull(),
  status: text('status').default('PENDING'),
  retryCount: integer('retry_count').default(0),
  createdAt: text('created_at').notNull(),
});

export const phase72IotAuditLogs = pgTable('phase72_iot_audit_logs', {
  id: text('id').primaryKey(),
  actionType: text('action_type').notNull(),
  entityType: text('entity_type').notNull(),
  entityId: text('entity_id').notNull(),
  performedBy: text('performed_by'),
  detailsJson: jsonb('details_json'),
  timestamp: text('timestamp').notNull(),
  createdAt: text('created_at').notNull(),
});


// ============================================================
// Commercial ERP persistence layer
// Canonical persistence for commercial/tender/contract execution.
// Demo fixtures must only be seeded in DEMO environments.
// ============================================================

export const commercialTenders = pgTable('commercial_tenders', {
  id: text('id').primaryKey(),
  tenderRefNumber: text('tender_ref_number').notNull(),
  tenderTitle: text('tender_title').notNull(),
  clientAuthority: text('client_authority').notNull(),
  clientType: text('client_type').notNull(),
  sector: text('sector').notNull(),
  tenderType: text('tender_type').notNull(),
  estimatedProjectValue: doublePrecision('estimated_project_value').notNull(),
  currency: text('currency').notNull(),
  emdAmount: doublePrecision('emd_amount').default(0),
  tenderFee: doublePrecision('tender_fee').default(0),
  emdMode: text('emd_mode'),
  publicationDate: text('publication_date').notNull(),
  preBidMeetingDate: text('pre_bid_meeting_date'),
  submissionDeadline: text('submission_deadline').notNull(),
  bidValidityDays: integer('bid_validity_days').default(0),
  eligibilityCriteria: text('eligibility_criteria'),
  technicalScoreThreshold: doublePrecision('technical_score_threshold'),
  quotedBidAmount: doublePrecision('quoted_bid_amount'),
  expectedGrossMarginPercent: doublePrecision('expected_gross_margin_percent'),
  bidManagerId: text('bid_manager_id'),
  bidManagerName: text('bid_manager_name'),
  status: text('status').notNull(),
  awardDetails: jsonb('award_details'),
  documents: jsonb('documents'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialRateAnalyses = pgTable('commercial_rate_analyses', {
  id: text('id').primaryKey(),
  analysisCode: text('analysis_code').notNull(),
  tenderId: text('tender_id'),
  boqItemId: text('boq_item_id'),
  itemCode: text('item_code').notNull(),
  itemDescription: text('item_description').notNull(),
  unit: text('unit').notNull(),
  materialCostPerUnit: doublePrecision('material_cost_per_unit').default(0),
  laborCostPerUnit: doublePrecision('labor_cost_per_unit').default(0),
  machineryCostPerUnit: doublePrecision('machinery_cost_per_unit').default(0),
  subcontractCostPerUnit: doublePrecision('subcontract_cost_per_unit').default(0),
  overheadPercent: doublePrecision('overhead_percent').default(0),
  profitPercent: doublePrecision('profit_percent').default(0),
  netRatePerUnit: doublePrecision('net_rate_per_unit').notNull(),
  quotedRatePerUnit: doublePrecision('quoted_rate_per_unit').notNull(),
  componentsBreakdown: jsonb('components_breakdown'),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialSubcontracts = pgTable('commercial_subcontracts', {
  id: text('id').primaryKey(),
  agreementNumber: text('agreement_number').notNull(),
  subcontractorName: text('subcontractor_name').notNull(),
  subcontractorCode: text('subcontractor_code').notNull(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  contractId: text('contract_id'),
  wbsId: text('wbs_id'),
  packageTitle: text('package_title').notNull(),
  tradeCategory: text('trade_category').notNull(),
  contractType: text('contract_type').notNull(),
  contractValue: doublePrecision('contract_value').notNull(),
  currency: text('currency').notNull(),
  retentionPercent: doublePrecision('retention_percent').default(0),
  mobilizationAdvancePercent: doublePrecision('mobilization_advance_percent').default(0),
  mobilizationAdvancePaid: doublePrecision('mobilization_advance_paid').default(0),
  mobilizationAdvanceRecovered: doublePrecision('mobilization_advance_recovered').default(0),
  totalBilledAmount: doublePrecision('total_billed_amount').default(0),
  totalCertifiedAmount: doublePrecision('total_certified_amount').default(0),
  totalPaidAmount: doublePrecision('total_paid_amount').default(0),
  totalRetentionWithheld: doublePrecision('total_retention_withheld').default(0),
  startDate: text('start_date').notNull(),
  completionDate: text('completion_date'),
  status: text('status').notNull(),
  performanceRating: doublePrecision('performance_rating'),
  complianceDocumentsVerified: boolean('compliance_documents_verified').default(false),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialSubcontractBills = pgTable('commercial_subcontract_bills', {
  id: text('id').primaryKey(),
  subcontractId: text('subcontract_id').notNull(),
  subcontractNumber: text('subcontract_number').notNull(),
  subcontractorName: text('subcontractor_name').notNull(),
  billNumber: text('bill_number').notNull(),
  billPeriodStart: text('bill_period_start').notNull(),
  billPeriodEnd: text('bill_period_end').notNull(),
  submissionDate: text('submission_date').notNull(),
  grossClaimedAmount: doublePrecision('gross_claimed_amount').notNull(),
  certifiedAmount: doublePrecision('certified_amount').default(0),
  currency: text('currency').notNull(),
  retentionPercent: doublePrecision('retention_percent').default(0),
  retentionAmount: doublePrecision('retention_amount').default(0),
  mobilizationRecovery: doublePrecision('mobilization_recovery').default(0),
  otherDeductions: doublePrecision('other_deductions').default(0),
  netCertifiedPayable: doublePrecision('net_certified_payable').default(0),
  status: text('status').notNull(),
  certifiedBy: text('certified_by'),
  certifiedDate: text('certified_date'),
  remarks: text('remarks'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialVariationOrders = pgTable('commercial_variation_orders', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  contractId: text('contract_id'),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  voNumber: text('vo_number').notNull(),
  title: text('title').notNull(),
  scopeDescription: text('scope_description').notNull(),
  variationType: text('variation_type').notNull(),
  claimedAmount: doublePrecision('claimed_amount').notNull(),
  approvedAmount: doublePrecision('approved_amount').default(0),
  currency: text('currency').notNull(),
  timeExtensionDays: integer('time_extension_days').default(0),
  impactOnCriticalPath: boolean('impact_on_critical_path').default(false),
  status: text('status').notNull(),
  clientReference: text('client_reference'),
  submittedDate: text('submitted_date').notNull(),
  approvedDate: text('approved_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const commercialClientIpcs = pgTable('commercial_client_ipcs', {
  id: text('id').primaryKey(),
  projectId: text('project_id').notNull(),
  projectName: text('project_name'),
  contractId: text('contract_id'),
  ipcNumber: text('ipc_number').notNull(),
  billingPeriod: text('billing_period').notNull(),
  grossWorkDoneClaimed: doublePrecision('gross_work_done_claimed').notNull(),
  grossWorkDoneCertified: doublePrecision('gross_work_done_certified').default(0),
  materialsOnSiteValue: doublePrecision('materials_on_site_value').default(0),
  retentionDeduction: doublePrecision('retention_deduction').default(0),
  mobilizationRecovery: doublePrecision('mobilization_recovery').default(0),
  statutoryTds: doublePrecision('statutory_tds').default(0),
  netReceivableAmount: doublePrecision('net_receivable_amount').default(0),
  currency: text('currency').notNull(),
  status: text('status').notNull(),
  submissionDate: text('submission_date').notNull(),
  certificationDate: text('certification_date'),
  dueDate: text('due_date'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

/**
 * Central Cost Code Master
 * Company-wide or project/WBS-specific controllership code.
 */
export const costCodes = pgTable('cost_codes', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  projectId: text('project_id'),
  wbsId: text('wbs_id'),
  parentId: text('parent_id'),
  code: text('code').notNull(),
  name: text('name').notNull(),
  category: text('category').notNull(),
  level: integer('level').default(1).notNull(),
  isBillable: boolean('is_billable').default(true).notNull(),
  isDirectCost: boolean('is_direct_cost').default(true).notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: text('created_by').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

// ============================================================
// Enterprise Estimation & Cost Build-up
// Tender/project commercial pre-construction control.
// ============================================================

export const estimateHeaders = pgTable('estimate_headers', {
  id: text('id').primaryKey(),
  companyId: text('company_id').notNull(),
  branchId: text('branch_id'),
  tenderId: text('tender_id'),
  projectId: text('project_id'),
  estimateNumber: text('estimate_number').notNull(),
  title: text('title').notNull(),
  estimateType: text('estimate_type').notNull(),
  currency: text('currency').notNull(),
  description: text('description'),
  currentRevisionNumber: integer('current_revision_number').default(1).notNull(),
  status: text('status').notNull(),
  createdBy: text('created_by').notNull(),
  createdByName: text('created_by_name').notNull(),
  updatedBy: text('updated_by').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  deletedAt: text('deleted_at'),
});

export const estimateRevisions = pgTable('estimate_revisions', {
  id: text('id').primaryKey(),
  estimateId: text('estimate_id').notNull(),
  revisionNumber: integer('revision_number').notNull(),
  revisionLabel: text('revision_label'),
  status: text('status').notNull(),
  description: text('description'),
  directCost: doublePrecision('direct_cost').default(0).notNull(),
  overheadAmount: doublePrecision('overhead_amount').default(0).notNull(),
  contingencyAmount: doublePrecision('contingency_amount').default(0).notNull(),
  profitAmount: doublePrecision('profit_amount').default(0).notNull(),
  taxAmount: doublePrecision('tax_amount').default(0).notNull(),
  totalCost: doublePrecision('total_cost').default(0).notNull(),
  totalPrice: doublePrecision('total_price').default(0).notNull(),
  approvedBy: text('approved_by'),
  approvedAt: text('approved_at'),
  createdBy: text('created_by').notNull(),
  createdByName: text('created_by_name').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const estimateLines = pgTable('estimate_lines', {
  id: text('id').primaryKey(),
  revisionId: text('revision_id').notNull(),
  lineNumber: integer('line_number').notNull(),
  itemCode: text('item_code').notNull(),
  description: text('description').notNull(),
  unit: text('unit').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  directRate: doublePrecision('direct_rate').default(0).notNull(),
  directAmount: doublePrecision('direct_amount').default(0).notNull(),
  overheadPercent: doublePrecision('overhead_percent').default(0).notNull(),
  profitPercent: doublePrecision('profit_percent').default(0).notNull(),
  quotedRate: doublePrecision('quoted_rate').default(0).notNull(),
  quotedAmount: doublePrecision('quoted_amount').default(0).notNull(),
  wbsId: text('wbs_id'),
  boqItemId: text('boq_item_id'),
  costCodeId: text('cost_code_id'),
  costCode: text('cost_code'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const estimateResources = pgTable('estimate_resources', {
  id: text('id').primaryKey(),
  lineId: text('line_id').notNull(),
  resourceType: text('resource_type').notNull(),
  resourceCode: text('resource_code'),
  description: text('description').notNull(),
  unit: text('unit').notNull(),
  quantity: doublePrecision('quantity').notNull(),
  unitRate: doublePrecision('unit_rate').notNull(),
  amount: doublePrecision('amount').notNull(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});
export * from "./enterprise_audit.schema";
export * from "./enterprise_admin_services.schema";
