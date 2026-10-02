import assert from 'node:assert/strict';
import { HSERepository } from '../src/api/repositories/hse.repository';

async function runHseOperationalVerification() {
  const repo = new HSERepository();
  const stamp = Date.now();
  const actor = 'CI HSE Test Actor';

  const tbt = await repo.createToolboxTalk({
    tbtNumber: `TBT-CI-${stamp}`,
    topic: 'CI verification toolbox talk',
    conductedBy: actor,
    location: 'Test Site',
    talkDate: new Date().toISOString().split('T')[0],
    attendeesCount: 12,
    keyPoints: 'Verify toolbox talk transactional persistence and audit.',
    attendeesList: 'CI participants',
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(tbt.createdBy, actor);

  const inspection = await repo.createSafetyInspection({
    inspectionNumber: `SINS-CI-${stamp}`,
    inspectionType: 'WEEKLY_SITE',
    location: 'Test Site',
    inspectorName: actor,
    inspectionDate: new Date().toISOString().split('T')[0],
    totalItemsChecked: 10,
    compliantItems: 9,
    nonCompliantItems: 1,
    findings: 'One corrective action identified.',
    status: 'ACTION_REQUIRED',
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(Number(inspection.scorePercentage), 90);

  const training = await repo.createTrainingRecord({
    trainingNumber: `TRN-CI-${stamp}`,
    courseName: 'HSE Induction Verification',
    trainerName: actor,
    trainingDate: '2026-10-02',
    validityMonths: 12,
    participantsCount: 4,
    participantsList: 'CI-01, CI-02, CI-03, CI-04',
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(training.status, 'VALID');
  assert.match(training.expiryDate, /^2027-10-/);

  const drill = await repo.createEmergencyDrill({
    drillNumber: `DRL-CI-${stamp}`,
    drillType: 'FIRE_EVACUATION',
    location: 'Test Site',
    drillDate: '2026-10-02',
    evacuationTimeSeconds: 180,
    participantsCount: 25,
    observerName: actor,
    performanceRating: 'NEEDS_IMPROVEMENT',
    recommendations: 'Repeat drill after corrective briefing.',
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(drill.performanceRating, 'NEEDS_IMPROVEMENT');

  const fire = await repo.createFireEquipment({
    equipmentTag: `FE-CI-${stamp}`,
    equipmentType: 'FIRE_EXTINGUISHER_CO2',
    location: 'Test Site',
    lastInspectionDate: '2026-10-02',
    nextInspectionDue: '2027-04-02',
    pressureStatus: 'NORMAL',
    physicalCondition: 'GOOD',
    inspectorName: actor,
    status: 'OPERATIONAL',
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(fire.createdBy, actor);

  const environment = await repo.createEnvironmentLog({
    recordNumber: `ENV-CI-${stamp}`,
    location: 'Test Site',
    parameter: 'NOISE_LEVEL',
    measuredValue: 81,
    unit: 'dBA',
    permissibleLimit: 75,
    monitoringDate: '2026-10-02',
    monitoredBy: actor,
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(environment.complianceStatus, 'EXCEEDED');

  const waste = await repo.createWasteLog({
    manifestNumber: `WST-CI-${stamp}`,
    wasteCategory: 'HAZARDOUS',
    wasteType: 'Used Oil',
    quantityKg: 25,
    disposalMethod: 'AUTHORIZED_RECYCLER',
    approvedContractor: 'CI Test Recycler',
    disposalDate: '2026-10-02',
    certificateRef: 'CI-PENDING',
    status: 'DISPOSED',
    createdBy: actor,
    updatedBy: actor,
  });
  assert.equal(waste.status, 'STORED_ON_SITE', 'Waste creation must not bypass controlled disposal lifecycle');
  assert.equal(waste.createdBy, actor);

  console.log('HSE operational verification passed: Toolbox, Safety Inspection, Training, Drill, Fire Equipment, Environment and Waste.');
}

runHseOperationalVerification().catch((error) => {
  console.error('HSE operational verification failed:', error);
  process.exit(1);
});
