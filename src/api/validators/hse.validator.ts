import { z } from 'zod';

export const CreateIncidentSchema = z.object({
  incidentNumber: z.string().optional(),
  title: z.string().min(3, 'Incident title is required'),
  incidentType: z.string().min(1, 'Incident type is required'),
  severity: z.string().min(1, 'Incident severity is required'),
  location: z.string().min(2, 'Location is required'),
  projectId: z.string().min(1, 'Project is required'),
  projectName: z.string().min(1, 'Project name is required'),
  incidentDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  injuredPersonName: z.string().optional(),
  injuredPersonRole: z.string().optional(),
  description: z.string().min(5, 'Description is required'),
  immediateAction: z.string().optional(),
  rootCause: z.string().optional(),
  correctiveAction: z.string().optional(),
  preventiveAction: z.string().optional(),
  status: z.literal('REPORTED').optional(),
  investigatorName: z.string().optional(),
  reportedBy: z.string().min(2, 'Reporter is required'),
});

export const CreateNearMissSchema = z.object({
  nearMissNumber: z.string().optional(),
  title: z.string().min(3, 'Title is required'),
  category: z.string().default('UNSAFE_ACT'),
  location: z.string().min(2, 'Location is required'),
  reportedDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  potentialSeverity: z.string().default('MEDIUM'),
  description: z.string().min(5, 'Description is required'),
  preventiveAction: z.string().optional(),
  status: z.string().default('OPEN'),
  reportedBy: z.string().min(2, 'Reporter is required'),
});

export const CreateHazardReportSchema = z.object({
  hazardNumber: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  hazardType: z.string().default('PHYSICAL'),
  riskLevel: z.string().default('MEDIUM'),
  description: z.string().min(5, 'Description is required'),
  recommendedAction: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  status: z.string().default('IDENTIFIED'),
  reportedBy: z.string().min(2, 'Reporter is required'),
});

export const CreateRiskAssessmentSchema = z.object({
  assessmentNumber: z.string().optional(),
  activityName: z.string().min(3, 'Activity name is required'),
  departmentOrSite: z.string().min(2, 'Department or Site is required'),
  hazardDescription: z.string().min(5, 'Hazard description is required'),
  severity: z.number().min(1).max(5).default(3),
  likelihood: z.number().min(1).max(5).default(3),
  existingControls: z.string().optional(),
  additionalControls: z.string().optional(),
  residualSeverity: z.number().min(1).max(5).optional(),
  residualLikelihood: z.number().min(1).max(5).optional(),
  assessedBy: z.string().min(2, 'Assessor is required'),
  reviewDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  status: z.string().default('ACTIVE'),
});

export const CreateJsaSchema = z.object({
  jsaNumber: z.string().optional(),
  jobTitle: z.string().min(3, 'Job title is required'),
  location: z.string().min(2, 'Location is required'),
  supervisorName: z.string().min(2, 'Supervisor name is required'),
  jsaDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  jobSteps: z.string().min(5, 'Job steps are required'),
  requiredPpe: z.string().default('Safety Helmet, Shoes, High-Vis Vest, Safety Glasses'),
  permitRequired: z.boolean().default(false),
  status: z.string().default('DRAFT'),
  approvedBy: z.string().optional(),
});

export const CreateToolboxTalkSchema = z.object({
  tbtNumber: z.string().optional(),
  topic: z.string().min(3, 'Topic is required'),
  conductedBy: z.string().min(2, 'Conducted by is required'),
  location: z.string().min(2, 'Location is required'),
  talkDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  attendeesCount: z.number().default(10),
  keyPoints: z.string().min(5, 'Key points are required'),
  attendeesList: z.string().optional(),
  status: z.string().default('COMPLETED'),
});

export const CreateWorkPermitSchema = z.object({
  permitNumber: z.string().optional(),
  permitType: z.string().min(1, 'Permit type is required'),
  location: z.string().min(2, 'Location is required'),
  description: z.string().min(5, 'Description is required'),
  contractorName: z.string().min(2, 'Contractor name is required'),
  supervisorName: z.string().min(2, 'Supervisor name is required'),
  issueDateTime: z.string().min(1, 'Issue date/time is required'),
  expiryDateTime: z.string().min(1, 'Expiry date/time is required'),
  safetyChecklist: z.string().min(1, 'Safety checklist is required'),
  isolationStatus: z.string().min(1, 'Isolation status is required'),
  gasTestResult: z.string().optional(),
  status: z.literal('PENDING_APPROVAL').optional(),
  approvedBy: z.undefined().optional(),
}).superRefine((value, ctx) => {
  const issueMs = Date.parse(value.issueDateTime);
  const expiryMs = Date.parse(value.expiryDateTime);
  if (!Number.isFinite(issueMs) || !Number.isFinite(expiryMs) || expiryMs <= issueMs) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['expiryDateTime'], message: 'Expiry must be later than issue time.' });
  }
  const permitType = value.permitType.trim().toUpperCase();
  if (['HOT_WORK', 'CONFINED_SPACE', 'RADIOGRAPHY'].includes(permitType) && !value.gasTestResult?.trim()) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['gasTestResult'], message: 'Gas test result is required for this permit type.' });
  }
});

export const CreateSafetyInspectionSchema = z.object({
  inspectionNumber: z.string().optional(),
  inspectionType: z.string().default('WEEKLY_SITE'),
  location: z.string().min(2, 'Location is required'),
  inspectorName: z.string().min(2, 'Inspector name is required'),
  inspectionDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  totalItemsChecked: z.number().int().min(0).default(0),
  compliantItems: z.number().int().min(0).default(0),
  nonCompliantItems: z.number().int().min(0).default(0),
  findings: z.string().optional(),
  status: z.string().default('ACTION_REQUIRED'),
});

export const CreatePpeIssuanceSchema = z.object({
  issuanceNumber: z.string().optional(),
  employeeId: z.string().min(2, 'Employee ID is required'),
  employeeName: z.string().min(2, 'Employee Name is required'),
  department: z.string().default('SITE_OPERATIONS'),
  ppeItem: z.string().min(2, 'PPE Item is required'),
  quantity: z.number().default(1),
  issueDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  expiryDate: z.string().optional(),
  condition: z.string().default('NEW'),
  issuedBy: z.string().min(2, 'Issued by is required'),
});

export const CreateTrainingRecordSchema = z.object({
  trainingNumber: z.string().optional(),
  courseName: z.string().min(3, 'Course Name is required'),
  trainerName: z.string().min(2, 'Trainer Name is required'),
  trainingDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  validityMonths: z.number().default(12),
  participantsCount: z.number().default(1),
  participantsList: z.string().optional(),
  status: z.string().default('VALID'),
});

export const CreateEmergencyDrillSchema = z.object({
  drillNumber: z.string().optional(),
  drillType: z.string().default('FIRE_EVACUATION'),
  location: z.string().min(2, 'Location is required'),
  drillDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  evacuationTimeSeconds: z.number().default(180),
  participantsCount: z.number().default(45),
  observerName: z.string().min(2, 'Observer Name is required'),
  performanceRating: z.string().default('SATISFACTORY'),
  recommendations: z.string().optional(),
});

export const CreateFireEquipmentSchema = z.object({
  equipmentTag: z.string().min(2, 'Equipment Tag is required'),
  equipmentType: z.string().default('FIRE_EXTINGUISHER_CO2'),
  location: z.string().min(2, 'Location is required'),
  lastInspectionDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  nextInspectionDue: z.string().default(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 6);
    return d.toISOString().split('T')[0];
  }),
  pressureStatus: z.string().default('NORMAL'),
  physicalCondition: z.string().default('GOOD'),
  inspectorName: z.string().default('Safety Inspector'),
  status: z.string().default('OPERATIONAL'),
});

export const CreateEnvironmentMonitoringSchema = z.object({
  recordNumber: z.string().optional(),
  location: z.string().min(2, 'Location is required'),
  parameter: z.string().default('NOISE_LEVEL'),
  measuredValue: z.number(),
  unit: z.string().default('dBA'),
  permissibleLimit: z.number(),
  monitoringDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  monitoredBy: z.string().default('Environmental Officer'),
});

export const CreateWasteManagementSchema = z.object({
  manifestNumber: z.string().optional(),
  wasteCategory: z.string().default('HAZARDOUS'),
  wasteType: z.string().min(2, 'Waste Type is required'),
  quantityKg: z.number().positive('Quantity must be positive'),
  disposalMethod: z.string().default('AUTHORIZED_RECYCLER'),
  approvedContractor: z.string().min(2, 'Approved Contractor is required'),
  disposalDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  certificateRef: z.string().optional(),
  status: z.string().default('DISPOSED'),
});
