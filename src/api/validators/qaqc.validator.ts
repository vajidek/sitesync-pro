import { z } from 'zod';

export const CreateItpSchema = z.object({
  itpNumber: z.string().optional(),
  title: z.string().min(3, 'ITP title must be at least 3 characters'),
  discipline: z.string().default('MECHANICAL'),
  projectId: z.string().min(1, 'Project is required'),
  projectName: z.string().min(1, 'Project name is required'),
  revisionNumber: z.string().default('R0'),
  standardReference: z.string().optional(),
  preparedBy: z.string().min(2, 'Prepared by is required'),
  status: z.string().default('DRAFT'),
  items: z.array(z.object({
    itemNumber: z.number().int().positive().optional(),
    activityDescription: z.string().min(2),
    referenceDoc: z.string().optional(),
    acceptanceCriteria: z.string().min(2),
    inspectionType: z.string().default('HOLD_POINT'),
    contractorCheck: z.boolean().default(true),
    consultantCheck: z.boolean().default(true),
    clientCheck: z.boolean().default(true),
    remarks: z.string().optional(),
  })).optional(),
});

export const CreateInspectionSchema = z.object({
  inspectionNumber: z.string().optional(),
  itpId: z.string().optional(),
  title: z.string().min(3, 'Title is required'),
  discipline: z.string().default('MECHANICAL'),
  inspectionType: z.string().default('SITE_INSPECTION'),
  projectId: z.string().min(1, 'Project is required'),
  location: z.string().min(2, 'Location is required'),
  requestedDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  inspectionDate: z.string().optional(),
  inspectorName: z.string().optional(),
  clientRepresentative: z.string().optional(),
  remarks: z.string().optional(),
  items: z.array(z.object({
    checkPoint: z.string(),
    acceptanceCriteria: z.string(),
    observedResult: z.string().optional(),
    status: z.string().default('PASS'),
    comments: z.string().optional(),
  })).optional(),
});

export const CreateNcrSchema = z.object({
  ncrNumber: z.string().optional(),
  inspectionId: z.string().optional(),
  projectId: z.string().min(1, 'Project is required'),
  title: z.string().min(3, 'NCR title is required'),
  severity: z.string().default('MAJOR'),
  description: z.string().min(5, 'Description is required'),
  location: z.string().min(2, 'Location is required'),
  issuedTo: z.string().min(2, 'Issued To is required'),
  issuedBy: z.string().min(2, 'Issued By is required'),
  targetCloseDate: z.string().default(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  }),
  rootCause: z.string().optional(),
  disposition: z.string().default('REWORK'),
  remarks: z.string().optional(),
});

export const CreateCapaSchema = z.object({
  capaNumber: z.string().optional(),
  ncrId: z.string().min(1, 'NCR ID is required'),
  actionPlan: z.string().min(5, 'Action Plan is required'),
  assignedTo: z.string().min(2, 'Assigned To is required'),
  dueDate: z.string().default(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    return d.toISOString().split('T')[0];
  }),
  riskCategory: z.string().optional(),
  preventiveMeasure: z.string().optional(),
});

export const CreateMirSchema = z.object({
  mirNumber: z.string().optional(),
  materialName: z.string().min(2, 'Material Name is required'),
  supplierName: z.string().min(2, 'Supplier Name is required'),
  poNumber: z.string().optional(),
  deliveryNoteNumber: z.string().optional(),
  quantityReceived: z.number().positive('Quantity received must be greater than zero'),
  unitOfMeasure: z.string().min(1, 'Unit of measure is required'),
  heatNumberCertRef: z.string().optional(),
  inspectionDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  visualCheck: z.string().min(1, 'Visual check result is required'),
  dimensionalCheck: z.string().min(1, 'Dimensional check result is required'),
  certVerification: z.string().min(1, 'Certificate verification result is required'),
  result: z.string().min(1, 'Inspection result is required'),
  remarks: z.string().optional(),
});

export const CreateSiteTestSchema = z.object({
  testNumber: z.string().optional(),
  testType: z.string().min(1, 'Test type is required'),
  locationChainage: z.string().min(2, 'Location/Chainage is required'),
  testedByLab: z.string().min(2, 'Testing laboratory is required'),
  sampleDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  testDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  requiredValue: z.string().min(1, 'Required value/acceptance criterion is required'),
  obtainedValue: z.string().min(1, 'Obtained value is required'),
  result: z.string().min(1, 'Test result is required'),
  witnessedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export const CreateWeldingInspectionSchema = z.object({
  reportNumber: z.string().optional(),
  jointNumber: z.string().min(1, 'Joint number is required'),
  welderId: z.string().min(1, 'Welder ID is required'),
  pipeDiameterInch: z.number().positive('Pipe diameter must be greater than zero'),
  pipeMaterial: z.string().min(2, 'Pipe material is required'),
  wpsNumber: z.string().min(1, 'WPS number is required'),
  fitupStatus: z.string().min(1, 'Fit-up status is required'),
  visualStatus: z.string().min(1, 'Visual status is required'),
  ndtMethod: z.string().min(1, 'NDT method is required'),
  ndtResult: z.string().min(1, 'NDT result is required'),
  repairCount: z.number().default(0),
});

export const CreateHydroTestSchema = z.object({
  testPackageNumber: z.string().optional(),
  lineOrTankNumber: z.string().default('Line 14-PL-201'),
  testMedium: z.string().default('POTABLE_WATER'),
  designPressureBar: z.number().default(10),
  testPressureBar: z.number().default(15),
  testDurationHours: z.number().default(24),
  holdingTimeMinutes: z.number().default(120),
  pressureDropObservedBar: z.number().default(0.0),
  allowableDropBar: z.number().default(0.2),
  result: z.string().default('PASS'),
  kwaWitnessName: z.string().default('Lead Inspection Engineer'),
  consultantWitnessName: z.string().default('Lead Consultant QA'),
});

export const CreatePressureTestSchema = z.object({
  testNumber: z.string().optional(),
  equipmentPipelineRef: z.string().default('Air Line AL-901'),
  testMedium: z.string().default('COMPRESSED_AIR'),
  testPressureBar: z.number().default(3.5),
  gaugeCalibCertRef: z.string().default('CAL-2026-881'),
  startPressureBar: z.number().default(3.5),
  endPressureBar: z.number().default(3.5),
  result: z.string().default('PASS'),
  remarks: z.string().optional(),
});

export const CreatePunchListSchema = z.object({
  punchNumber: z.string().optional(),
  subsystemRef: z.string().default('Clear Water Pump House #1'),
  category: z.string().default('CATEGORY_B'),
  description: z.string().min(3, 'Description is required'),
  location: z.string().default('Pump Room B'),
  assignedContractor: z.string().default('Subcon Mech Ltd'),
  targetDate: z.string().default(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  }),
  status: z.string().default('OPEN'),
});

export const CreateSnagListSchema = z.object({
  snagNumber: z.string().optional(),
  buildingZone: z.string().default('Filter House Floor 2'),
  snagDetail: z.string().min(3, 'Snag Detail is required'),
  severity: z.string().default('LOW'),
  trade: z.string().default('CIVIL'),
  status: z.string().default('PENDING'),
});
