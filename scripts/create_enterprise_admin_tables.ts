import { createPool } from '../src/db';

export async function createEnterpriseAdminAndCommercialTables() {
  const pool = createPool();
  const client = await pool.connect();
  try {
    console.log('Ensuring Enterprise Admin, ITAM/ITSM, and Commercial tables exist in PostgreSQL...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS admin_visitors (
        id text PRIMARY KEY,
        pass_number text NOT NULL,
        full_name text NOT NULL,
        company text NOT NULL,
        phone text NOT NULL,
        email text,
        host_employee_id text NOT NULL,
        host_employee_name text NOT NULL,
        host_department text NOT NULL,
        purpose text NOT NULL,
        id_proof_type text DEFAULT 'NATIONAL_ID',
        id_proof_number text,
        badge_number text NOT NULL,
        check_in_time text NOT NULL,
        check_out_time text,
        status text NOT NULL DEFAULT 'CHECKED_IN',
        has_vehicle boolean DEFAULT false,
        vehicle_plate_number text,
        nda_signed boolean DEFAULT true,
        belongings_declared text,
        security_notes text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_meeting_rooms (
        id text PRIMARY KEY,
        room_code text NOT NULL UNIQUE,
        room_name text NOT NULL,
        floor_location text NOT NULL,
        capacity integer NOT NULL,
        facilities jsonb NOT NULL,
        status text NOT NULL DEFAULT 'AVAILABLE',
        notes text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_meetings (
        id text PRIMARY KEY,
        meeting_code text NOT NULL,
        room_id text NOT NULL,
        room_name text NOT NULL,
        title text NOT NULL,
        description text,
        organizer_id text NOT NULL,
        organizer_name text NOT NULL,
        department text NOT NULL,
        meeting_date text NOT NULL,
        start_time text NOT NULL,
        end_time text NOT NULL,
        attendees jsonb NOT NULL,
        agenda_items jsonb NOT NULL,
        minutes_of_meeting text,
        action_items jsonb,
        status text NOT NULL DEFAULT 'SCHEDULED',
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_notices (
        id text PRIMARY KEY,
        notice_number text NOT NULL,
        title text NOT NULL,
        category text NOT NULL,
        priority text NOT NULL DEFAULT 'NORMAL',
        target_audience text NOT NULL DEFAULT 'ALL',
        target_department text,
        publish_date text NOT NULL,
        expiry_date text,
        content text NOT NULL,
        author_id text NOT NULL,
        author_name text NOT NULL,
        author_role text NOT NULL,
        attachment_url text,
        is_pinned boolean DEFAULT false,
        requires_acknowledgment boolean DEFAULT false,
        acknowledgments_count integer DEFAULT 0,
        status text NOT NULL DEFAULT 'PUBLISHED',
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS admin_service_requests (
        id text PRIMARY KEY,
        request_number text NOT NULL,
        category text NOT NULL,
        title text NOT NULL,
        description text NOT NULL,
        requester_id text NOT NULL,
        requester_name text NOT NULL,
        department text NOT NULL,
        priority text NOT NULL DEFAULT 'NORMAL',
        needed_by_date text NOT NULL,
        estimated_cost double precision DEFAULT 0,
        request_details jsonb NOT NULL,
        status text NOT NULL DEFAULT 'SUBMITTED',
        approved_by text,
        approved_at text,
        rejection_reason text,
        admin_remarks text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS it_assets (
        id text PRIMARY KEY,
        asset_tag text NOT NULL UNIQUE,
        asset_name text NOT NULL,
        category text NOT NULL,
        brand text NOT NULL,
        model text NOT NULL,
        serial_number text NOT NULL,
        mac_address text,
        ip_address text,
        operating_system text,
        specifications jsonb NOT NULL,
        assigned_to_employee_id text,
        assigned_to_employee_name text,
        department text,
        location text NOT NULL,
        purchase_date text NOT NULL,
        purchase_cost double precision NOT NULL,
        warranty_expiry_date text NOT NULL,
        status text NOT NULL DEFAULT 'ALLOCATED',
        condition text NOT NULL DEFAULT 'GOOD',
        notes text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS it_software_licenses (
        id text PRIMARY KEY,
        license_code text NOT NULL UNIQUE,
        software_name text NOT NULL,
        publisher text NOT NULL,
        category text NOT NULL,
        license_type text NOT NULL,
        total_seats integer NOT NULL,
        allocated_seats integer NOT NULL DEFAULT 0,
        license_key text,
        purchase_date text NOT NULL,
        renewal_date text,
        annual_cost double precision NOT NULL DEFAULT 0,
        allocated_users jsonb NOT NULL DEFAULT '[]'::jsonb,
        compliance_status text NOT NULL DEFAULT 'COMPLIANT',
        status text NOT NULL DEFAULT 'ACTIVE',
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS it_service_tickets (
        id text PRIMARY KEY,
        ticket_number text NOT NULL UNIQUE,
        title text NOT NULL,
        category text NOT NULL,
        priority text NOT NULL DEFAULT 'MEDIUM',
        sla_hours integer NOT NULL DEFAULT 24,
        requester_id text NOT NULL,
        requester_name text NOT NULL,
        requester_email text NOT NULL,
        department text NOT NULL,
        assigned_technician_id text,
        assigned_technician_name text,
        description text NOT NULL,
        status text NOT NULL DEFAULT 'OPEN',
        resolution_notes text,
        resolved_at text,
        sla_breached boolean DEFAULT false,
        activity_log jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS it_access_requests (
        id text PRIMARY KEY,
        request_number text NOT NULL UNIQUE,
        request_type text NOT NULL,
        target_system text NOT NULL,
        requested_role text NOT NULL,
        requester_id text NOT NULL,
        requester_name text NOT NULL,
        beneficiary_employee_id text NOT NULL,
        beneficiary_employee_name text NOT NULL,
        business_justification text NOT NULL,
        duration_days integer DEFAULT 365,
        status text NOT NULL DEFAULT 'PENDING_APPROVAL',
        approved_by text,
        approved_at text,
        provisioned_by text,
        provisioned_at text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS commercial_tenders (
        id text PRIMARY KEY,
        tender_ref_number text NOT NULL UNIQUE,
        tender_title text NOT NULL,
        client_authority text NOT NULL,
        client_type text NOT NULL,
        sector text NOT NULL,
        tender_type text NOT NULL,
        estimated_project_value double precision NOT NULL,
        currency text NOT NULL DEFAULT 'INR',
        emd_amount double precision NOT NULL DEFAULT 0,
        tender_fee double precision NOT NULL DEFAULT 0,
        emd_mode text DEFAULT 'BANK_GUARANTEE',
        publication_date text NOT NULL,
        pre_bid_meeting_date text,
        submission_deadline text NOT NULL,
        bid_validity_days integer DEFAULT 120,
        eligibility_criteria text,
        technical_score_threshold double precision DEFAULT 75.0,
        quoted_bid_amount double precision,
        expected_gross_margin_percent double precision DEFAULT 14.5,
        bid_manager_id text NOT NULL,
        bid_manager_name text NOT NULL,
        status text NOT NULL DEFAULT 'IN_ESTIMATION',
        award_details jsonb,
        documents jsonb NOT NULL DEFAULT '[]'::jsonb,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS commercial_rate_analyses (
        id text PRIMARY KEY,
        analysis_code text NOT NULL UNIQUE,
        tender_id text,
        item_code text NOT NULL,
        item_description text NOT NULL,
        unit text NOT NULL,
        material_cost_per_unit double precision NOT NULL DEFAULT 0,
        labor_cost_per_unit double precision NOT NULL DEFAULT 0,
        machinery_cost_per_unit double precision NOT NULL DEFAULT 0,
        subcontract_cost_per_unit double precision NOT NULL DEFAULT 0,
        overhead_percent double precision NOT NULL DEFAULT 10.0,
        profit_percent double precision NOT NULL DEFAULT 12.0,
        net_rate_per_unit double precision NOT NULL,
        quoted_rate_per_unit double precision NOT NULL,
        components_breakdown jsonb NOT NULL,
        status text NOT NULL DEFAULT 'APPROVED',
        created_at text NOT NULL,
        updated_at text NOT NULL
      );

      CREATE TABLE IF NOT EXISTS commercial_subcontracts (
        id text PRIMARY KEY,
        agreement_number text NOT NULL UNIQUE,
        subcontractor_name text NOT NULL,
        subcontractor_code text NOT NULL,
        project_id text NOT NULL,
        project_name text NOT NULL,
        package_title text NOT NULL,
        trade_category text NOT NULL,
        contract_type text NOT NULL DEFAULT 'ITEM_RATE_BOQ',
        contract_value double precision NOT NULL,
        retention_percent double precision NOT NULL DEFAULT 5.0,
        mobilization_advance_percent double precision DEFAULT 10.0,
        mobilization_advance_paid double precision DEFAULT 0,
        mobilization_advance_recovered double precision DEFAULT 0,
        total_billed_amount double precision DEFAULT 0,
        total_certified_amount double precision DEFAULT 0,
        total_paid_amount double precision DEFAULT 0,
        total_retention_withheld double precision DEFAULT 0,
        start_date text NOT NULL,
        completion_date text NOT NULL,
        status text NOT NULL DEFAULT 'ACTIVE',
        performance_rating double precision DEFAULT 4.2,
        compliance_documents_verified boolean DEFAULT true,
        notes text,
        created_at text NOT NULL,
        updated_at text NOT NULL
      );
    `);

    console.log('✅ All Enterprise Admin, IT, and Commercial tables successfully verified/created.');
  } catch (err: any) {
    console.error('Error creating enterprise admin/commercial tables:', err);
    throw err;
  } finally {
    client.release();
  }
}

if (process.argv[1]?.endsWith('create_enterprise_admin_tables.ts')) {
  createEnterpriseAdminAndCommercialTables()
    .then(() => process.exit(0))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
}
