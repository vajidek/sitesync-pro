import { z } from 'zod';

// 1. Department Schema
export const createDepartmentSchema = z.object({
  code: z.string().min(2, 'Department code is required'),
  name: z.string().min(2, 'Department name is required'),
  headOfDepartment: z.string().optional(),
  budgetAed: z.number().nonnegative().default(0),
  location: z.string().default('Head Office'),
  isActive: z.boolean().default(true),
});

// 2. Designation Schema
export const createDesignationSchema = z.object({
  code: z.string().min(2, 'Designation code is required'),
  title: z.string().min(2, 'Designation title is required'),
  departmentId: z.string().optional(),
  gradeLevel: z.string().default('L3'),
  minSalary: z.number().nonnegative().default(0),
  maxSalary: z.number().nonnegative().default(0),
  isActive: z.boolean().default(true),
});

// 3. Employee Master Schema
export const createEmployeeSchema = z.object({
  employeeCode: z.string().optional(),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone number is required'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']).default('MALE'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationalId: z.string().optional(),
  passportNumber: z.string().optional(),
  visaStatus: z.string().default('EMPLOYMENT_RESIDENCE'),
  joiningDate: z.string().min(1, 'Joining date is required'),
  departmentId: z.string().min(1, 'Department is required'),
  designationId: z.string().min(1, 'Designation is required'),
  reportingManagerId: z.string().optional(),
  employmentType: z.enum(['FULL_TIME', 'CONTRACTOR', 'CONSULTANT', 'INTERN']).default('FULL_TIME'),
  workLocation: z.string().default('Abu Dhabi HQ'),
  projectId: z.string().optional(),
  employmentStatus: z.enum(['ACTIVE', 'PROBATION', 'NOTICE_PERIOD', 'TERMINATED', 'RESIGNED']).default('ACTIVE'),
  biometricId: z.string().optional(),
  grade: z.string().default('L3'),
  noticePeriodDays: z.number().int().nonnegative().default(30),
  probationEndDate: z.string().optional(),
});

export const updateEmployeeSchema = createEmployeeSchema.partial();

// 4. Employee Document Schema
export const createEmployeeDocumentSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  documentType: z.enum(['PASSPORT', 'VISA', 'EMIRATES_ID', 'DEGREE', 'DRIVING_LICENSE', 'LABOR_CARD', 'CERTIFICATE']),
  documentNumber: z.string().min(1, 'Document number is required'),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  fileUrl: z.string().optional(),
  verificationStatus: z.enum(['PENDING', 'VERIFIED', 'REJECTED']).default('VERIFIED'),
  notes: z.string().optional(),
});

// 5. Employee Bank Account Schema
export const createBankAccountSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  bankName: z.string().min(2, 'Bank name is required'),
  branchName: z.string().optional(),
  accountHolderName: z.string().min(2, 'Account holder name is required'),
  accountNumber: z.string().min(4, 'Account number is required'),
  iban: z.string().min(15, 'Valid IBAN is required'),
  swiftCode: z.string().optional(),
  isPrimary: z.boolean().default(true),
  routingCode: z.string().optional(),
});

// 6. Salary Structure Schema
export const createSalaryStructureSchema = z.object({
  structureCode: z.string().min(2, 'Structure code is required'),
  title: z.string().min(2, 'Title is required'),
  grade: z.string().default('L3'),
  baseMonthlyAed: z.number().nonnegative(),
  hraAed: z.number().nonnegative().default(0),
  conveyanceAed: z.number().nonnegative().default(0),
  medicalAed: z.number().nonnegative().default(0),
  specialAllowanceAed: z.number().nonnegative().default(0),
  siteAllowanceAed: z.number().nonnegative().default(0),
  otRatePerHour: z.number().nonnegative().default(0),
  pfApplicable: z.boolean().default(true),
  esiApplicable: z.boolean().default(false),
  ptApplicable: z.boolean().default(false),
  status: z.enum(['ACTIVE', 'INACTIVE']).default('ACTIVE'),
  effectiveFrom: z.string().min(1, 'Effective date is required'),
});

// 7. Salary Component Schema
export const createSalaryComponentSchema = z.object({
  componentCode: z.string().min(2, 'Component code is required'),
  name: z.string().min(2, 'Component name is required'),
  componentType: z.enum(['EARNING', 'DEDUCTION', 'STATUTORY']),
  calculationFormula: z.string().optional(),
  isTaxable: z.boolean().default(true),
  isStatutory: z.boolean().default(false),
  isActive: z.boolean().default(true),
});

// 8. Payroll Period & Run Schema
export const createPayrollPeriodSchema = z.object({
  periodCode: z.string().min(2, 'Period code is required'),
  monthYear: z.string().min(7, 'Month-Year (YYYY-MM) is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalWorkingDays: z.number().int().positive().default(30),
  cutoffDate: z.string().min(1, 'Cutoff date is required'),
  status: z.enum(['OPEN', 'LOCKED', 'PROCESSED', 'DISBURSED']).default('OPEN'),
});

export const executePayrollRunSchema = z.object({
  periodId: z.string().min(1, 'Period ID is required'),
  remarks: z.string().optional(),
  paymentMode: z.string().default('WPS_DIRECT_TRANSFER'),
});

// 9. Attendance & Biometric Punch Schema
export const recordAttendanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  employeeCode: z.string().optional(),
  attendanceDate: z.string().min(1, 'Attendance date is required'),
  shiftId: z.string().optional(),
  inTime: z.string().optional(),
  outTime: z.string().optional(),
  totalHours: z.number().nonnegative().optional(),
  lateMinutes: z.number().int().nonnegative().default(0),
  earlyExitMinutes: z.number().int().nonnegative().default(0),
  overtimeHours: z.number().nonnegative().default(0),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY', 'ON_LEAVE', 'HOLIDAY', 'WEEK_OFF']).default('PRESENT'),
  punchSource: z.enum(['BIOMETRIC_ESSL', 'MOBILE_GPS', 'MANUAL_ENTRY', 'SYSTEM_OVERRIDE']).default('BIOMETRIC_ESSL'),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  deviceId: z.string().optional(),
  remarks: z.string().optional(),
});

export const syncEsslBiometricSchema = z.object({
  deviceId: z.string().default('ESSL-DX-901'),
  syncDate: z.string().optional(),
  records: z.array(z.object({
    biometricId: z.string(),
    timestamp: z.string(),
    punchType: z.enum(['CHECK_IN', 'CHECK_OUT']),
  })).optional(),
});

// 10. Shift Master & Roster Schema
export const createShiftSchema = z.object({
  shiftCode: z.string().min(2, 'Shift code is required'),
  shiftName: z.string().min(2, 'Shift name is required'),
  startTime: z.string().min(4, 'Start time (HH:MM) is required'),
  endTime: z.string().min(4, 'End time (HH:MM) is required'),
  gracePeriodMinutes: z.number().int().nonnegative().default(15),
  breakDurationMinutes: z.number().int().nonnegative().default(60),
  totalShiftHours: z.number().positive().default(8),
  isNightShift: z.boolean().default(false),
  isOvernight: z.boolean().default(false),
  colorTag: z.string().default('#3B82F6'),
  isActive: z.boolean().default(true),
});

export const assignRosterSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  shiftId: z.string().min(1, 'Shift ID is required'),
  rosterDate: z.string().min(1, 'Roster date is required'),
  projectId: z.string().optional(),
  isOverride: z.boolean().default(false),
  overrideReason: z.string().optional(),
});

// 11. Leave Type & Request Schema
export const createLeaveTypeSchema = z.object({
  typeCode: z.string().min(2, 'Type code is required'),
  name: z.string().min(2, 'Leave name is required'),
  annualQuotaDays: z.number().int().positive().default(30),
  isCarryForward: z.boolean().default(true),
  maxCarryForwardDays: z.number().int().nonnegative().default(15),
  isEncashable: z.boolean().default(true),
  requiresMedicalCert: z.boolean().default(false),
  isPaid: z.boolean().default(true),
  colorCode: z.string().default('#10B981'),
  isActive: z.boolean().default(true),
});

export const applyLeaveSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  leaveTypeId: z.string().min(1, 'Leave type ID is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  totalDays: z.number().positive(),
  reason: z.string().min(3, 'Reason for leave is required'),
  contactDuringLeave: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

export const reviewLeaveSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED', 'CANCELLED']),
  approvalRemarks: z.string().optional(),
});

// 12. Holiday Schema
export const createHolidaySchema = z.object({
  holidayName: z.string().min(2, 'Holiday name is required'),
  holidayDate: z.string().min(1, 'Holiday date is required'),
  dayOfWeek: z.string().min(2, 'Day of week is required'),
  holidayType: z.enum(['NATIONAL', 'RELIGIOUS', 'REGIONAL', 'COMPANY']).default('NATIONAL'),
  isOptional: z.boolean().default(false),
  applicableLocations: z.string().default('ALL'),
  year: z.number().int().default(2026),
});

// 13. Overtime Schema
export const createOvertimeSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  otDate: z.string().min(1, 'Date is required'),
  shiftId: z.string().optional(),
  startTime: z.string().min(4, 'Start time is required'),
  endTime: z.string().min(4, 'End time is required'),
  hoursWorked: z.number().positive(),
  otRateMultiplier: z.number().positive().default(1.25),
  reason: z.string().min(3, 'Reason is required'),
  projectSite: z.string().default('Site A'),
  remarks: z.string().optional(),
});

// 14. Loan & Advance Schema
export const createLoanSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  loanType: z.enum(['PERSONAL', 'VEHICLE', 'HOUSING', 'EMERGENCY']).default('PERSONAL'),
  principalAmountAed: z.number().positive('Principal amount must be positive'),
  interestRate: z.number().nonnegative().default(0),
  tenureMonths: z.number().int().positive().default(12),
  disbursementDate: z.string().optional(),
  deductionStartMonth: z.string().optional(),
});

export const requestSalaryAdvanceSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  amountAed: z.number().positive('Advance amount must be positive'),
  reason: z.string().min(3, 'Reason is required'),
  recoveryMonth: z.string().min(1, 'Recovery month is required'),
  recoveryInstallments: z.number().int().positive().default(1),
});

// 15. Expense & Travel Claim Schema
export const createExpenseClaimSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  claimDate: z.string().min(1, 'Claim date is required'),
  category: z.enum(['SITE_EXPENSE', 'FUEL', 'TOOLS', 'CLIENT_ENTERTAINMENT', 'LODGING', 'MISC']).default('SITE_EXPENSE'),
  amountAed: z.number().positive('Amount must be positive'),
  billNumber: z.string().optional(),
  receiptUrl: z.string().optional(),
  projectId: z.string().optional(),
  description: z.string().min(3, 'Description is required'),
});

export const createTravelClaimSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  purpose: z.string().min(3, 'Purpose is required'),
  origin: z.string().min(2, 'Origin is required'),
  destination: z.string().min(2, 'Destination is required'),
  departureDate: z.string().min(1, 'Departure date is required'),
  returnDate: z.string().min(1, 'Return date is required'),
  conveyanceExpenseAed: z.number().nonnegative().default(0),
  lodgingExpenseAed: z.number().nonnegative().default(0),
  daExpenseAed: z.number().nonnegative().default(0),
  otherExpenseAed: z.number().nonnegative().default(0),
  advanceAdjustedAed: z.number().nonnegative().default(0),
  receiptUrls: z.string().optional(),
});

// 16. Training & Skills Schema
export const createTrainingProgramSchema = z.object({
  title: z.string().min(3, 'Title is required'),
  trainerName: z.string().min(2, 'Trainer name is required'),
  category: z.enum(['SAFETY_HSE', 'TECHNICAL_CIVIL', 'BIM_ENGINEERING', 'LEADERSHIP', 'COMPLIANCE']).default('SAFETY_HSE'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().min(1, 'End date is required'),
  durationHours: z.number().positive().default(8),
  venueOrLink: z.string().default('Main Auditorium / Virtual'),
  maxParticipants: z.number().int().positive().default(30),
  costPerHeadAed: z.number().nonnegative().default(0),
});

export const createSkillSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  skillName: z.string().min(2, 'Skill name is required'),
  skillCategory: z.string().default('TECHNICAL'),
  proficiencyLevel: z.enum(['BEGINNER', 'INTERMEDIATE', 'ADVANCED', 'EXPERT']).default('ADVANCED'),
  yearsExperience: z.number().nonnegative().default(3),
  certified: z.boolean().default(true),
  certificationAuthority: z.string().optional(),
  expiryDate: z.string().optional(),
});

// 17. Performance Review, KPI & KRA Schema
export const createPerformanceReviewSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  reviewerId: z.string().min(1, 'Reviewer ID is required'),
  reviewPeriod: z.string().default('ANNUAL_2026'),
  reviewYear: z.number().int().default(2026),
  selfRating: z.number().min(1).max(5).default(4.0),
  managerRating: z.number().min(1).max(5).default(4.0),
  committeeRating: z.number().min(1).max(5).default(4.0),
  performanceTier: z.enum(['OUTSTANDING', 'EXCEEDS_EXPECTATIONS', 'MEETS_EXPECTATIONS', 'NEEDS_IMPROVEMENT', 'UNSATISFACTORY']).default('EXCEEDS_EXPECTATIONS'),
  strengths: z.string().optional(),
  developmentAreas: z.string().optional(),
  recommendedSalaryHikePercent: z.number().nonnegative().default(8.5),
  recommendedPromotion: z.boolean().default(false),
  status: z.enum(['DRAFT', 'SUBMITTED', 'REVIEWED', 'FINALIZED']).default('FINALIZED'),
  reviewDate: z.string().min(1, 'Review date is required'),
});

export const createKpiSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  reviewId: z.string().optional(),
  kpiTitle: z.string().min(2, 'KPI title is required'),
  targetMetric: z.string().min(1, 'Target metric is required'),
  achievedMetric: z.string().min(1, 'Achieved metric is required'),
  weightagePercent: z.number().positive().default(20),
  score: z.number().min(0).max(5).default(4.5),
  remarks: z.string().optional(),
});

// 18. Promotion & Transfer Schema
export const createPromotionSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  oldDesignationId: z.string().min(1, 'Current designation is required'),
  newDesignationId: z.string().min(1, 'New designation is required'),
  oldGrade: z.string().min(1, 'Current grade is required'),
  newGrade: z.string().min(1, 'New grade is required'),
  oldSalaryAed: z.number().nonnegative(),
  newSalaryAed: z.number().positive(),
  hikePercent: z.number().nonnegative(),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  reason: z.string().min(3, 'Reason is required'),
});

export const createTransferSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  fromDepartmentId: z.string().optional(),
  toDepartmentId: z.string().optional(),
  fromProjectId: z.string().optional(),
  toProjectId: z.string().optional(),
  fromLocation: z.string().min(2, 'From location is required'),
  toLocation: z.string().min(2, 'To location is required'),
  effectiveDate: z.string().min(1, 'Effective date is required'),
  reason: z.string().min(3, 'Reason is required'),
  transferType: z.enum(['PERMANENT', 'TEMPORARY_DEPUTATION']).default('PERMANENT'),
  relocationAllowanceAed: z.number().nonnegative().default(0),
});

// 19. Disciplinary & Exit Management Schema
export const createDisciplinaryActionSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  incidentDate: z.string().min(1, 'Incident date is required'),
  violationType: z.enum(['SAFETY_BREACH', 'ABSENTEEISM', 'CODE_OF_CONDUCT', 'NEGLIGENCE', 'INSUBORDINATION']),
  incidentDescription: z.string().min(5, 'Incident description is required'),
  actionTaken: z.enum(['VERBAL_WARNING', 'WRITTEN_WARNING', 'SUSPENSION', 'SALARY_DEDUCTION', 'TERMINATION']).default('WRITTEN_WARNING'),
  warningLetterUrl: z.string().optional(),
  inquiryOfficer: z.string().min(2, 'Inquiry officer name is required'),
  resolutionDate: z.string().optional(),
  status: z.enum(['PENDING_INQUIRY', 'RESOLVED', 'DISMISSED']).default('RESOLVED'),
  remarks: z.string().optional(),
});

export const initiateExitSchema = z.object({
  employeeId: z.string().min(1, 'Employee ID is required'),
  resignationDate: z.string().min(1, 'Resignation date is required'),
  requestedRelievingDate: z.string().min(1, 'Requested relieving date is required'),
  approvedRelievingDate: z.string().min(1, 'Approved relieving date is required'),
  reasonForExit: z.string().min(3, 'Reason for exit is required'),
  noticePeriodServedDays: z.number().int().nonnegative().default(30),
  noticeShortfallDays: z.number().int().nonnegative().default(0),
  exitInterviewNotes: z.string().optional(),
});

export const createFullFinalSettlementSchema = z.object({
  exitId: z.string().min(1, 'Exit ID is required'),
  employeeId: z.string().min(1, 'Employee ID is required'),
  lastWorkingDay: z.string().min(1, 'Last working day is required'),
  pendingSalaryAed: z.number().nonnegative().default(0),
  leaveEncashmentDays: z.number().nonnegative().default(0),
  leaveEncashmentAmountAed: z.number().nonnegative().default(0),
  gratuityAmountAed: z.number().nonnegative().default(0),
  bonusAed: z.number().nonnegative().default(0),
  otherAllowancesAed: z.number().nonnegative().default(0),
  loanRecoveryAed: z.number().nonnegative().default(0),
  noticeRecoveryAed: z.number().nonnegative().default(0),
  otherDeductionsAed: z.number().nonnegative().default(0),
  settlementDate: z.string().min(1, 'Settlement date is required'),
  bankReference: z.string().optional(),
  paymentMode: z.string().default('WPS_DIRECT_TRANSFER'),
});

// 20. Recruitment & Hiring Pipeline Schema
export const createRecruitmentRequisitionSchema = z.object({
  positionTitle: z.string().min(2, 'Position title is required'),
  departmentId: z.string().min(1, 'Department is required'),
  vacanciesCount: z.number().int().positive().default(1),
  experienceYearsRequired: z.number().nonnegative().default(3),
  minQualification: z.string().default('Bachelor of Engineering'),
  targetHiringDate: z.string().min(1, 'Target hiring date is required'),
  salaryBudgetAed: z.number().positive('Salary budget must be positive'),
  hiringManagerId: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('HIGH'),
});

export const createJobOpeningSchema = z.object({
  recruitmentId: z.string().min(1, 'Recruitment requisition ID is required'),
  title: z.string().min(2, 'Job title is required'),
  location: z.string().default('Abu Dhabi, UAE'),
  employmentType: z.enum(['FULL_TIME', 'CONTRACTOR', 'CONSULTANT', 'INTERN']).default('FULL_TIME'),
  jobDescription: z.string().min(10, 'Job description is required'),
  keyResponsibilities: z.string().min(10, 'Key responsibilities are required'),
  requirements: z.string().min(10, 'Requirements are required'),
  postedDate: z.string().min(1, 'Posted date is required'),
  closingDate: z.string().optional(),
  isPublished: z.boolean().default(true),
  portalUrl: z.string().optional(),
});

export const createCandidateSchema = z.object({
  jobOpeningId: z.string().min(1, 'Job opening ID is required'),
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(5, 'Valid phone is required'),
  currentCompany: z.string().optional(),
  currentDesignation: z.string().optional(),
  totalExperienceYears: z.number().nonnegative().default(0),
  noticePeriodDays: z.number().int().nonnegative().default(30),
  currentCtcAed: z.number().nonnegative().default(0),
  expectedCtcAed: z.number().nonnegative().default(0),
  resumeUrl: z.string().optional(),
  sourceChannel: z.enum(['LINKEDIN', 'REFERRAL', 'AGENCY', 'DIRECT_PORTAL']).default('LINKEDIN'),
  rating: z.number().min(0).max(5).default(4.0),
});

export const scheduleInterviewSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  jobOpeningId: z.string().min(1, 'Job opening ID is required'),
  roundNumber: z.number().int().positive().default(1),
  roundType: z.enum(['SCREENING', 'TECHNICAL_EVALUATION', 'HR_BEHAVIORAL', 'MANAGEMENT_FINAL']).default('TECHNICAL_EVALUATION'),
  scheduledAt: z.string().min(1, 'Scheduled time is required'),
  durationMinutes: z.number().int().positive().default(45),
  interviewerNames: z.string().min(2, 'Interviewer name(s) is required'),
  meetingLinkOrRoom: z.string().default('Conference Room A / Teams'),
  feedbackNotes: z.string().optional(),
  candidateScore: z.number().min(0).max(10).optional(),
  recommendation: z.enum(['STRONG_HIRE', 'HIRE', 'ON_HOLD', 'REJECT']).default('HIRE'),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']).default('SCHEDULED'),
});

export const createOfferLetterSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  jobOpeningId: z.string().min(1, 'Job opening ID is required'),
  designationTitle: z.string().min(2, 'Designation title is required'),
  departmentId: z.string().min(1, 'Department ID is required'),
  offeredBasicAed: z.number().positive('Basic salary must be positive'),
  offeredHraAed: z.number().nonnegative().default(0),
  offeredAllowancesAed: z.number().nonnegative().default(0),
  joiningDate: z.string().min(1, 'Joining date is required'),
  offerExpiryDate: z.string().min(1, 'Offer expiry date is required'),
  signedOfferLetterUrl: z.string().optional(),
});

export const createOnboardingTaskSchema = z.object({
  candidateId: z.string().optional(),
  employeeId: z.string().optional(),
  offerId: z.string().optional(),
  scheduledJoiningDate: z.string().min(1, 'Scheduled joining date is required'),
  actualJoiningDate: z.string().optional(),
  orientationCompleted: z.boolean().default(false),
  documentationStatus: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED']).default('PENDING'),
  workstationAllocated: z.boolean().default(false),
  emailCreated: z.boolean().default(false),
  idCardIssued: z.boolean().default(false),
  bankAccountLinked: z.boolean().default(false),
  buddyAssigned: z.string().optional(),
  status: z.enum(['PRE_JOINING', 'IN_PROGRESS', 'COMPLETED', 'DROPPED']).default('PRE_JOINING'),
  remarks: z.string().optional(),
});
