import { z } from 'zod';

export const CreateItpSchema = z.object({
  itpNumber: z.string().optional(),
  title: z.string().min(3, 'ITP title must be at least 3 characters'),
  discipline: z.string().default('MECHANICAL'),
  projectId: z.string().default('PRJ-101'),
  projectName: z.string().default('Al Reem Mechanical Piping & Structural Hub'),
  revisionNumber: z.string().default('R0'),
  standardReference: z.string().optional(),
  status: z.string().default('APPROVED'),
});

export const CreateInspectionSchema = z.object({
  inspectionNumber: z.string().optional(),
  itpId: z.string().optional(),
  title: z.string().min(3, 'Title is required'),
  discipline: z.string().default('MECHANICAL'),
  inspectionType: z.string().default('SITE_INSPECTION'),
  projectId: z.string().default('PRJ-101'),
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
  projectId: z.string().default('PRJ-101'),
  title: z.string().min(3, 'NCR title is required'),
  severity: z.string().default('MAJOR'),
  description: z.string().min(5, 'Description is required'),
  location: z.string().min(2, 'Location is required'),
  issuedTo: z.string().min(2, 'Issued To is required'),
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
  quantityReceived: z.number().default(100),
  unitOfMeasure: z.string().default('Pcs'),
  heatNumberCertRef: z.string().optional(),
  inspectionDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  visualCheck: z.string().default('PASS'),
  dimensionalCheck: z.string().default('PASS'),
  certVerification: z.string().default('VERIFIED'),
  result: z.string().default('ACCEPTED'),
  remarks: z.string().optional(),
});

export const CreateSiteTestSchema = z.object({
  testNumber: z.string().optional(),
  testType: z.string().default('CONCRETE_CUBE'),
  locationChainage: z.string().min(2, 'Location/Chainage is required'),
  testedByLab: z.string().default('Site QA Lab'),
  sampleDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  testDate: z.string().default(() => new Date().toISOString().split('T')[0]),
  requiredValue: z.string().default('M30 Grade - 30 N/mm2'),
  obtainedValue: z.string().default('33.5 N/mm2'),
  result: z.string().default('PASS'),
  witnessedBy: z.string().optional(),
  remarks: z.string().optional(),
});

export const CreateWeldingInspectionSchema = z.object({
  reportNumber: z.string().optional(),
  jointNumber: z.string().default('J-101'),
  welderId: z.string().default('W-809'),
  pipeDiameterInch: z.number().default(12),
  pipeMaterial: z.string().default('Carbon Steel A106 Gr B'),
  wpsNumber: z.string().default('WPS-MECH-001'),
  fitupStatus: z.string().default('ACCEPTED'),
  visualStatus: z.string().default('ACCEPTED'),
  ndtMethod: z.string().default('RADIOGRAPHY_RT'),
  ndtResult: z.string().default('PASS'),
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
