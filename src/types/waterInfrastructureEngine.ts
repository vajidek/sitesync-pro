// Water Infrastructure & Engineering Enterprise Types

export type WaterProjectType =
  | 'Water Treatment Plant (WTP)'
  | 'Over Head Service Reservoir (OHSR)'
  | 'Ground Level Service Reservoir (GLSR)'
  | 'Clear Water Pumping Main'
  | 'Raw Water Pumping Main'
  | 'MS Pipeline'
  | 'DI Pipeline'
  | 'HDPE Pipeline'
  | 'Pump House'
  | 'Intake Well'
  | 'Electro Mechanical Works'
  | 'SCADA';

export type MechanicalWorkCategory =
  | 'Pipe Laying'
  | 'Pipe Jointing'
  | 'Flange Joint'
  | 'Valve Installation'
  | 'Air Valve Chamber'
  | 'Scour Valve Chamber'
  | 'Flow Meter Chamber'
  | 'Pump Installation'
  | 'Motor Installation'
  | 'Hydro Testing'
  | 'Leak Testing'
  | 'Painting'
  | 'Erection'
  | 'Fabrication'
  | 'Alignment'
  | 'Commissioning';

export type PipeMaterial = 'MS (Mild Steel)' | 'DI (Ductile Iron)' | 'HDPE (High-Density Polyethylene)';

export type PipeClass =
  | 'K9'
  | 'K7'
  | 'PN10'
  | 'PN16'
  | 'IS 3589 Fe 410'
  | 'PE 100 PN 12.5'
  | 'PE 100 PN 16';

export type CrossingType =
  | 'Highway Crossing (HDD/Jack Push)'
  | 'Railway Crossing'
  | 'River Crossing'
  | 'Canal Crossing'
  | 'Culvert Crossing'
  | 'None';

export interface PipelineSection {
  id: string;
  projectId: string;
  projectName: string;
  sectionName: string; // e.g., "Ch 0+000 to Ch 4+200 - Pumping Main"
  pipeMaterial: PipeMaterial;
  pipeDiameterMM: number; // e.g. 400, 600, 800, 1000, 1200
  pipeClass: PipeClass;
  totalLengthMeters: number;
  laidLengthMeters: number;
  remainingLengthMeters: number;
  startChainage: string; // "Ch 0+000"
  endChainage: string;   // "Ch 4+200"
  gpsStartLocation: string; // "9.5280° N, 76.8231° E (Aruvikkara WTP)"
  gpsEndLocation: string;   // "9.5120° N, 76.8510° E (PTP Nagar GLSR)"
  totalJoints: number;
  completedJoints: number;
  crossingType: CrossingType;
  status: 'Survey Phase' | 'Excavation' | 'Laying In Progress' | 'Hydro Testing' | 'Commissioned';
}

export type ValveType =
  | 'Butterfly Valve (BFV)'
  | 'Sluice Valve (SV)'
  | 'Single Orifice Air Valve'
  | 'Double Orifice Kinetic Air Valve'
  | 'Scour Valve (SV)'
  | 'Non-Return Valve (NRV)'
  | 'Pressure Reducing Valve (PRV)'
  | 'Pressure Sustaining Valve (PSV)';

export type ActuatorType = 'Manual Gearbox' | 'Electric Actuator' | 'Hydraulic Actuator' | 'Pneumatic Actuator';

export interface ValveRecord {
  id: string;
  valveNumber: string; // e.g. "VLV-WTR-WTP-001"
  projectId: string;
  projectName: string;
  valveType: ValveType;
  sizeMM: number; // e.g. 300, 600, 900
  ratingPN: string; // e.g. "PN16"
  actuator: ActuatorType;
  chainageLocation: string; // e.g. "Ch 2+450 (Chamber #12)"
  gpsCoordinates: string;
  installationDate: string;
  chamberBuilt: boolean;
  testingStatus: 'Pending' | 'Hydro Tested' | 'Approved by Authority';
  inspectedBy: string; // "Executive Engineer / Consultant"
  remarks?: string;
}

export type TestType =
  | 'Hydro Test'
  | 'Pressure Test'
  | 'Leak Test'
  | 'Pump Trial'
  | 'Motor Trial'
  | 'Flow Test';

export interface WaterTestReport {
  id: string;
  testNo: string; // e.g. "TR-WTR-HT-2026-089"
  projectId: string;
  projectName: string;
  testType: TestType;
  chainageSection: string; // "Ch 1+200 to Ch 2+000"
  pipeDiameterMM: number;
  testPressureBar: number; // e.g. 15 Bar
  holdingDurationMinutes: number; // e.g. 120 mins
  allowableDropBar: number;
  actualDropBar: number;
  testResult: 'PASS' | 'FAIL' | 'PENDING RE-TEST';
  kwaWitnessOfficer?: string; // Backwards compatibility alias
  witnessOfficer: string; // "Er. Jayakrishnan S (AEE, Water Authority)"
  testDate: string;
  certificateRef?: string;
  remarks?: string;
}

export interface WaterDailySiteReport {
  id: string;
  dprNumber: string; // "DPR-WTR-2026-08-01"
  date: string;
  projectId: string;
  projectName: string;
  siteLocation: string;
  weather: 'Clear / Sunny' | 'Overcast' | 'Moderate Rain' | 'Heavy Monsoon Rain';
  startChainage: string;
  endChainage: string;
  workCategory: MechanicalWorkCategory;
  workDoneDetails: string;
  quantityLaidMeters?: number;
  jointsCompletedCount?: number;
  manpowerCount: {
    siteEngineers: number;
    fitters: number;
    welders: number;
    riggers: number;
    helpers: number;
    masons: number;
    total: number;
  };
  equipmentUsed: Array<{
    equipmentName: string;
    hoursOperated: number;
    status: string;
  }>;
  vehiclesUsed: Array<{
    vehicleNo: string;
    tripsCount: number;
    materialCarried: string;
  }>;
  materialsConsumed: Array<{
    materialName: string;
    quantity: number;
    unit: string;
  }>;
  photoUrls?: string[];
  remarks: string;
  delayReason?: string;
  tomorrowPlan: string;
  preparedByName: string;
  approvedByName: string;
}

export type WaterDocumentCategory =
  | 'GADP & Civil Drawings'
  | 'Longitudinal Section (L-Section)'
  | 'Alignment & Chainage Sheets'
  | 'Method Statements'
  | 'Inspection Call / Reports'
  | 'Client Letters'
  | 'RFI (Request for Information)'
  | 'NCR (Non-Conformance Report)'
  | 'Authority Approval Letters'
  | 'Completion & Handover Reports';

export interface WaterDocument {
  id: string;
  docNumber: string; // "WTR-DOC-DRAW-045"
  title: string;
  category: WaterDocumentCategory;
  projectId: string;
  projectName: string;
  revisionNo: string;
  fileType: string;
  sizeBytes: number;
  uploadedBy: string;
  uploadDate: string;
  status: 'Under Review' | 'Approved by Authority' | 'Revision Required';
  downloadUrl: string;
}

export interface WaterProjectDashboardMetrics {
  totalProjectsCount: number;
  activePipelineLengthKm: number;
  activeKWAPipelinesKms?: number; // Alias for backward compatibility
  totalValvesInstalled: number;
  flowMetersInstalled: number;
  pumpsInstalledCount: number;
  overallCivilProgress: number; // %
  overallMechanicalProgress: number; // %
  overallElectricalProgress: number; // %
  overallTestingProgress: number; // %
  commissioningStatus: 'Phase 1 Commissioned' | 'Hydro Testing Phase' | 'Pipelaying in Progress' | 'SCADA Integration';
}

// Backward compatibility type aliases
export type KWAProjectType = WaterProjectType;
export type KWATestReport = WaterTestReport;
export type KWADailySiteReport = WaterDailySiteReport;
export type KWADocumentCategory = WaterDocumentCategory;
export type KWADocument = WaterDocument;
export type KWAProjectDashboardMetrics = WaterProjectDashboardMetrics;
