-- SiteSync Pro schema baseline repair
-- These ORM-backed tables were added after the original migration baseline.
-- Create them before the numbered hardening migrations run so fresh and upgraded
-- databases share the same current schema foundation.

CREATE TABLE IF NOT EXISTS "funding_agencies" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "contact_person" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "consultants" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "contact_person" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "clients" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "contact_person" TEXT,
  "email" TEXT,
  "phone" TEXT,
  "address" TEXT,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "currencies" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "symbol" TEXT NOT NULL,
  "exchange_rate" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "decimal_precision" INTEGER NOT NULL DEFAULT 2,
  "is_base_currency" BOOLEAN NOT NULL DEFAULT FALSE,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "exchange_rates" (
  "id" TEXT PRIMARY KEY,
  "from_currency" TEXT NOT NULL,
  "to_currency" TEXT NOT NULL,
  "rate" DOUBLE PRECISION NOT NULL,
  "effective_date" TEXT NOT NULL,
  "rate_type" TEXT NOT NULL DEFAULT 'CORPORATE',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "project_priorities" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "project_statuses" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "project_structures" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "parent_id" TEXT,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "display_order" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "daily_progress_reports" (
  "id" TEXT PRIMARY KEY,
  "dpr_number" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "package_id" TEXT,
  "zone_id" TEXT,
  "area_id" TEXT,
  "section_id" TEXT,
  "location" TEXT,
  "date" TEXT NOT NULL,
  "shift" TEXT NOT NULL DEFAULT 'DAY',
  "department_name" TEXT,
  "prepared_by_id" TEXT,
  "prepared_by_name" TEXT,
  "checked_by_id" TEXT,
  "checked_by_name" TEXT,
  "approved_by_id" TEXT,
  "approved_by_name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "site_conditions" JSONB,
  "created_by" TEXT,
  "updated_by" TEXT,
  "approved_by" TEXT,
  "deleted_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress_entries" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "activity_id" TEXT,
  "department" TEXT,
  "responsible_engineer_id" TEXT,
  "responsible_engineer_name" TEXT,
  "supervisor_name" TEXT,
  "contractor_name" TEXT,
  "subcontractor_name" TEXT,
  "planned_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "today_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "cumulative_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "remaining_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "progress_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL DEFAULT 'm',
  "working_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "start_time" TEXT,
  "end_time" TEXT,
  "remarks" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "deleted_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress_photos" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "entry_id" TEXT,
  "category" TEXT NOT NULL DEFAULT 'DURING',
  "gps_lat" DOUBLE PRECISION,
  "gps_lng" DOUBLE PRECISION,
  "caption" TEXT,
  "photo_category" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress_documents" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "document_type" TEXT NOT NULL DEFAULT 'REPORT',
  "file_size" TEXT,
  "uploaded_by" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress_weather" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "condition" TEXT NOT NULL DEFAULT 'SUNNY',
  "humidity" DOUBLE PRECISION,
  "rainfall" DOUBLE PRECISION,
  "wind_speed" DOUBLE PRECISION,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress_delays" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "responsible_party" TEXT,
  "impact" TEXT,
  "affected_boq_id" TEXT,
  "affected_wbs_id" TEXT,
  "estimated_delay_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "corrective_action" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS "daily_progress_approvals" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "approver_id" TEXT,
  "approver_name" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "daily_progress_comments" (
  "id" TEXT PRIMARY KEY,
  "dpr_id" TEXT NOT NULL,
  "author_id" TEXT,
  "author_name" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'ENGINEER',
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "resource_types" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_groups" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type_id" TEXT,
  "department_id" TEXT,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_skills" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'GENERAL',
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_skill_mapping" (
  "id" TEXT PRIMARY KEY,
  "resource_id" TEXT NOT NULL,
  "skill_id" TEXT NOT NULL,
  "proficiency_level" TEXT NOT NULL DEFAULT 'INTERMEDIATE',
  "expiry_date" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_plans" (
  "id" TEXT PRIMARY KEY,
  "plan_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "project_id" TEXT,
  "department_id" TEXT,
  "plan_type" TEXT NOT NULL DEFAULT 'PROJECT',
  "end_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "recurrence_interval" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_allocations" (
  "id" TEXT PRIMARY KEY,
  "allocation_number" TEXT NOT NULL,
  "plan_id" TEXT,
  "resource_id" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "department_id" TEXT,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "allocated_qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "working_hours_per_day" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "status" TEXT NOT NULL DEFAULT 'ALLOCATED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_assignment_history" (
  "id" TEXT PRIMARY KEY,
  "allocation_id" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "previous_project_id" TEXT,
  "new_project_id" TEXT,
  "assigned_date" TEXT NOT NULL,
  "unassigned_date" TEXT,
  "assigned_by" TEXT,
  "remarks" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_shift_templates" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "start_time" TEXT NOT NULL DEFAULT '08:00',
  "end_time" TEXT NOT NULL DEFAULT '17:00',
  "break_duration_minutes" DOUBLE PRECISION NOT NULL DEFAULT 60,
  "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "is_overtime_allowed" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_working_calendars" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "weekly_off_days" TEXT NOT NULL DEFAULT 'SUNDAY',
  "shift_template_id" TEXT,
  "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_holidays" (
  "id" TEXT PRIMARY KEY,
  "calendar_id" TEXT,
  "holiday_date" TEXT NOT NULL,
  "holiday_name" TEXT NOT NULL,
  "holiday_type" TEXT NOT NULL DEFAULT 'NATIONAL',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_calendars" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "resource_id" TEXT,
  "calendar_type" TEXT NOT NULL DEFAULT 'SHIFT',
  "shift_name" TEXT NOT NULL DEFAULT 'DAY',
  "start_time" TEXT,
  "end_time" TEXT,
  "is_working_day" BOOLEAN NOT NULL DEFAULT TRUE,
  "remarks" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_availability" (
  "id" TEXT PRIMARY KEY,
  "resource_id" TEXT NOT NULL,
  "resource_type" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "total_capacity" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "allocated_capacity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reserved_capacity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "available_capacity" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "utilization_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "idle_percentage" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_requests" (
  "id" TEXT PRIMARY KEY,
  "request_number" TEXT NOT NULL,
  "project_id" TEXT,
  "department_id" TEXT,
  "requested_by" TEXT,
  "title" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "required_end_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "approval_remarks" TEXT,
  "remarks" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_request_items" (
  "id" TEXT PRIMARY KEY,
  "request_id" TEXT NOT NULL,
  "resource_type_id" TEXT,
  "resource_id" TEXT,
  "requested_qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "approved_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "rejected_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "issued_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pending_qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "unit" TEXT NOT NULL DEFAULT 'NOS',
  "estimated_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "remarks" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_utilization" (
  "id" TEXT PRIMARY KEY,
  "resource_id" TEXT NOT NULL,
  "project_id" TEXT,
  "department_id" TEXT,
  "date" TEXT NOT NULL,
  "planned_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "actual_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "idle_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "utilization_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "efficiency_score" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_reservations" (
  "id" TEXT PRIMARY KEY,
  "reservation_number" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "project_id" TEXT,
  "department_id" TEXT,
  "reserved_by" TEXT,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "reserved_qty" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'CONFIRMED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_conflicts" (
  "id" TEXT PRIMARY KEY,
  "resource_id" TEXT NOT NULL,
  "conflict_type" TEXT NOT NULL,
  "second_allocation_id" TEXT,
  "conflict_date" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "resolution_status" TEXT NOT NULL DEFAULT 'UNRESOLVED',
  "resolution_notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_logs" (
  "id" TEXT PRIMARY KEY,
  "resource_id" TEXT,
  "action_type" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "ip_address" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "resource_costs" (
  "id" TEXT PRIMARY KEY,
  "resource_id" TEXT NOT NULL,
  "hourly_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "daily_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "monthly_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "idle_cost_per_hour" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "effective_date" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "material_subcategories" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "warehouse_locations" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "warehouse_id" TEXT NOT NULL,
  "zone" TEXT,
  "rack" TEXT,
  "shelf" TEXT,
  "bin" TEXT,
  "capacity" DOUBLE PRECISION DEFAULT 1000,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "goods_receipts" (
  "id" TEXT PRIMARY KEY,
  "grn_number" TEXT NOT NULL,
  "po_number" TEXT,
  "vendor_id" TEXT,
  "vendor_name" TEXT,
  "warehouse_id" TEXT NOT NULL,
  "warehouse_name" TEXT NOT NULL,
  "delivery_note_no" TEXT,
  "received_date" TEXT NOT NULL,
  "received_by" TEXT NOT NULL,
  "inspected_by" TEXT,
  "qc_status" TEXT NOT NULL DEFAULT 'PASSED',
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "goods_receipt_items" (
  "id" TEXT PRIMARY KEY,
  "grn_id" TEXT NOT NULL,
  "material_id" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "ordered_qty" DOUBLE PRECISION NOT NULL,
  "received_qty" DOUBLE PRECISION NOT NULL,
  "accepted_qty" DOUBLE PRECISION NOT NULL,
  "rejected_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "batch_number" TEXT,
  "expiry_date" TEXT,
  "location_id" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "material_issues" (
  "id" TEXT PRIMARY KEY,
  "issue_number" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "wbs_id" TEXT,
  "wbs_code" TEXT,
  "boq_item_id" TEXT,
  "boq_ref" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "department" TEXT,
  "warehouse_id" TEXT NOT NULL,
  "warehouse_name" TEXT NOT NULL,
  "issued_to" TEXT NOT NULL,
  "issued_by" TEXT NOT NULL,
  "issue_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "material_issue_items" (
  "id" TEXT PRIMARY KEY,
  "issue_id" TEXT NOT NULL,
  "material_id" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "requested_qty" DOUBLE PRECISION NOT NULL,
  "issued_qty" DOUBLE PRECISION NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "batch_number" TEXT,
  "location_id" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "material_transfers" (
  "id" TEXT PRIMARY KEY,
  "transfer_number" TEXT NOT NULL,
  "source_warehouse_id" TEXT NOT NULL,
  "source_warehouse_name" TEXT NOT NULL,
  "target_warehouse_id" TEXT NOT NULL,
  "target_warehouse_name" TEXT NOT NULL,
  "requested_by" TEXT,
  "approved_by" TEXT,
  "dispatched_by" TEXT,
  "received_by" TEXT,
  "transfer_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "material_transfer_items" (
  "id" TEXT PRIMARY KEY,
  "transfer_id" TEXT NOT NULL,
  "material_id" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "transfer_qty" DOUBLE PRECISION NOT NULL,
  "batch_number" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "material_returns" (
  "id" TEXT PRIMARY KEY,
  "return_number" TEXT NOT NULL,
  "return_type" TEXT NOT NULL DEFAULT 'SITE_TO_STORE',
  "project_name" TEXT,
  "warehouse_id" TEXT NOT NULL,
  "warehouse_name" TEXT NOT NULL,
  "returned_by" TEXT NOT NULL,
  "received_by" TEXT NOT NULL,
  "return_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "material_return_items" (
  "id" TEXT PRIMARY KEY,
  "return_id" TEXT NOT NULL,
  "material_id" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "returned_qty" DOUBLE PRECISION NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "batch_number" TEXT,
  "condition" TEXT NOT NULL DEFAULT 'GOOD',
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "inventory_adjustments" (
  "id" TEXT PRIMARY KEY,
  "adjustment_number" TEXT NOT NULL,
  "warehouse_id" TEXT NOT NULL,
  "warehouse_name" TEXT NOT NULL,
  "material_id" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "material_code" TEXT NOT NULL,
  "adjustment_type" TEXT NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "reason" TEXT NOT NULL,
  "adjusted_by" TEXT NOT NULL,
  "approved_by" TEXT,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "inventory_logs" (
  "id" TEXT PRIMARY KEY,
  "material_id" TEXT,
  "warehouse_id" TEXT,
  "action_type" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "ip_address" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "purchase_requisitions" (
  "id" TEXT PRIMARY KEY,
  "pr_number" TEXT NOT NULL UNIQUE,
  "project_id" TEXT,
  "project_name" TEXT,
  "wbs_code" TEXT,
  "department" TEXT,
  "requested_by" TEXT NOT NULL,
  "required_date" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "current_approver" TEXT,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "purchase_requisition_items" (
  "id" TEXT PRIMARY KEY,
  "pr_id" TEXT NOT NULL,
  "material_id" TEXT,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'PCS',
  "estimated_unit_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "estimated_total_price" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "specification" TEXT,
  "required_date" TEXT,
  "boq_ref" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "request_for_quotations" (
  "id" TEXT PRIMARY KEY,
  "rfq_number" TEXT NOT NULL UNIQUE,
  "pr_id" TEXT,
  "pr_number" TEXT,
  "title" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "issued_date" TEXT NOT NULL,
  "submission_deadline" TEXT NOT NULL,
  "issued_by" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "rfq_items" (
  "id" TEXT PRIMARY KEY,
  "rfq_id" TEXT NOT NULL,
  "pr_item_id" TEXT,
  "material_id" TEXT,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'PCS',
  "specification" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "rfq_vendors" (
  "id" TEXT PRIMARY KEY,
  "rfq_id" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "vendor_email" TEXT,
  "status" TEXT NOT NULL DEFAULT 'INVITED',
  "responded_at" TEXT
);

CREATE TABLE IF NOT EXISTS "vendor_quotations" (
  "id" TEXT PRIMARY KEY,
  "quotation_number" TEXT NOT NULL UNIQUE,
  "rfq_id" TEXT NOT NULL,
  "rfq_number" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "quotation_date" TEXT NOT NULL,
  "valid_until" TEXT,
  "payment_terms" TEXT,
  "delivery_lead_time_days" INTEGER NOT NULL DEFAULT 0,
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "technical_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commercial_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "vendor_quotation_items" (
  "id" TEXT PRIMARY KEY,
  "quotation_id" TEXT NOT NULL,
  "rfq_item_id" TEXT,
  "material_id" TEXT,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "offered_quantity" DOUBLE PRECISION NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL,
  "total_price" DOUBLE PRECISION NOT NULL,
  "brand_model" TEXT,
  "country_of_origin" TEXT,
  "compliance_remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "technical_evaluations" (
  "id" TEXT PRIMARY KEY,
  "evaluation_number" TEXT NOT NULL UNIQUE,
  "rfq_id" TEXT NOT NULL,
  "quotation_id" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "evaluator_id" TEXT NOT NULL,
  "evaluator_name" TEXT NOT NULL,
  "evaluation_date" TEXT NOT NULL,
  "specification_compliance_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "delivery_lead_time_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overall_technical_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "recommendation" TEXT NOT NULL DEFAULT 'QUALIFIED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "commercial_evaluations" (
  "id" TEXT PRIMARY KEY,
  "evaluation_number" TEXT NOT NULL UNIQUE,
  "rfq_id" TEXT NOT NULL,
  "quotation_id" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "evaluator_id" TEXT NOT NULL,
  "evaluator_name" TEXT NOT NULL,
  "evaluation_date" TEXT NOT NULL,
  "unit_price_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "payment_terms_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_value_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overall_commercial_score" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "recommendation" TEXT NOT NULL DEFAULT 'QUALIFIED',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "comparative_statements" (
  "id" TEXT PRIMARY KEY,
  "statement_number" TEXT NOT NULL UNIQUE,
  "rfq_id" TEXT NOT NULL,
  "rfq_number" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "prepared_by" TEXT NOT NULL,
  "prepared_date" TEXT NOT NULL,
  "recommended_vendor_id" TEXT,
  "recommended_vendor_name" TEXT,
  "recommended_quotation_id" TEXT,
  "justification" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "approved_by" TEXT,
  "approved_at" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "phase56_purchase_orders" (
  "id" TEXT PRIMARY KEY,
  "po_number" TEXT NOT NULL UNIQUE,
  "pr_id" TEXT,
  "pr_number" TEXT,
  "rfq_id" TEXT,
  "quotation_id" TEXT,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "warehouse_id" TEXT,
  "warehouse_name" TEXT,
  "po_date" TEXT NOT NULL,
  "expected_delivery_date" TEXT,
  "payment_terms" TEXT,
  "incoterms" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "discount_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "revised_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "revision_count" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "issued_by" TEXT,
  "approved_by" TEXT,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "purchase_order_items" (
  "id" TEXT PRIMARY KEY,
  "po_id" TEXT NOT NULL,
  "material_id" TEXT,
  "material_code" TEXT NOT NULL,
  "material_name" TEXT NOT NULL,
  "ordered_qty" DOUBLE PRECISION NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL,
  "total_price" DOUBLE PRECISION NOT NULL,
  "received_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "outstanding_qty" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'PCS',
  "specification" TEXT,
  "boq_ref" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "purchase_order_revisions" (
  "id" TEXT PRIMARY KEY,
  "po_id" TEXT NOT NULL,
  "revision_number" INTEGER NOT NULL,
  "revised_by" TEXT NOT NULL,
  "revised_date" TEXT NOT NULL,
  "reason_for_revision" TEXT NOT NULL,
  "previous_total_amount" DOUBLE PRECISION NOT NULL,
  "new_total_amount" DOUBLE PRECISION NOT NULL,
  "changes_summary" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "purchase_order_approvals" (
  "id" TEXT PRIMARY KEY,
  "po_id" TEXT,
  "pr_id" TEXT,
  "entity_type" TEXT NOT NULL,
  "step" INTEGER NOT NULL,
  "approver_role" TEXT NOT NULL,
  "approver_id" TEXT,
  "approver_name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "action_date" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "delivery_schedules" (
  "id" TEXT PRIMARY KEY,
  "po_id" TEXT NOT NULL,
  "po_number" TEXT NOT NULL,
  "po_item_id" TEXT,
  "material_name" TEXT NOT NULL,
  "scheduled_date" TEXT NOT NULL,
  "scheduled_qty" DOUBLE PRECISION NOT NULL,
  "delivered_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "balance_qty" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "destination_warehouse_name" TEXT,
  "carrier_name" TEXT,
  "tracking_number" TEXT,
  "remarks" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "vendor_performance" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "po_id" TEXT,
  "po_number" TEXT,
  "evaluation_period" TEXT,
  "quality_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "commercial_competitiveness_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overall_rating" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "evaluator_name" TEXT NOT NULL,
  "comments" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "procurement_logs" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "entity_number" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL DEFAULT 'SYSTEM_MIGRATION',
  "details" TEXT NOT NULL,
  "ip_address" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "budget_allocations" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "cost_center_code" TEXT NOT NULL,
  "allocated_amount" DOUBLE PRECISION NOT NULL,
  "committed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "actual_spent_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "available_amount" DOUBLE PRECISION NOT NULL,
  "fiscal_year" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "procurement_comments" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "user_role" TEXT,
  "comment_text" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "procurement_documents" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL DEFAULT 0,
  "uploaded_by" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "phase57_vendors" (
  "id" TEXT PRIMARY KEY,
  "vendor_code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'General Supplier',
  "classification" TEXT NOT NULL DEFAULT 'APPROVED',
  "scorecard_grade" TEXT NOT NULL DEFAULT 'A',
  "trade_license_expiry" TEXT,
  "gstin" TEXT,
  "pan" TEXT,
  "msme_reg_no" TEXT,
  "iso_certified" BOOLEAN NOT NULL DEFAULT FALSE,
  "payment_terms" TEXT DEFAULT 'NET_30',
  "credit_period_days" INTEGER DEFAULT 30,
  "risk_level" TEXT DEFAULT 'LOW',
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "vendor_categories" (
  "id" TEXT PRIMARY KEY,
  "category_code" TEXT NOT NULL UNIQUE,
  "category_name" TEXT NOT NULL,
  "description" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "vendor_contacts" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "contact_name" TEXT NOT NULL,
  "designation" TEXT,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_addresses" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "address_type" TEXT NOT NULL DEFAULT 'OFFICE',
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'UAE',
  "pincode" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_bank_accounts" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "bank_name" TEXT NOT NULL,
  "branch_name" TEXT,
  "account_number" TEXT NOT NULL,
  "account_holder_name" TEXT NOT NULL,
  "ifsc_code" TEXT,
  "swift_code" TEXT,
  "iban" TEXT,
  "is_primary" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_certifications" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "cert_type" TEXT NOT NULL,
  "issuing_authority" TEXT NOT NULL,
  "issue_date" TEXT NOT NULL,
  "expiry_date" TEXT NOT NULL,
  "document_url" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_documents" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "file_name" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "expiry_date" TEXT,
  "uploaded_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_ratings" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "rating_period" TEXT NOT NULL,
  "quality_rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "delivery_rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "price_competitiveness" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "safety_rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "scorecard_grade" TEXT NOT NULL DEFAULT 'A',
  "evaluator_name" TEXT NOT NULL,
  "comments" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_blacklist" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "blacklisted_by" TEXT NOT NULL,
  "blacklisted_date" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "duration_months" INTEGER NOT NULL DEFAULT 12,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "revoked_date" TEXT,
  "revocation_reason" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "vendor_audits" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "audit_number" TEXT NOT NULL UNIQUE,
  "audit_date" TEXT NOT NULL,
  "auditor_name" TEXT NOT NULL,
  "audit_type" TEXT NOT NULL DEFAULT 'ANNUAL_SURVEILLANCE',
  "findings" TEXT,
  "corrective_action_plan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PASSED',
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase57_contracts" (
  "id" TEXT PRIMARY KEY,
  "contract_number" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "contract_type" TEXT NOT NULL DEFAULT 'SUPPLY',
  "vendor_name" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "package_id" TEXT,
  "wbs_code" TEXT,
  "department" TEXT DEFAULT 'Contracts',
  "contract_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "revised_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "revised_end_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "retention_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "security_deposit_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "performance_guarantee_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ld_percent_per_week" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "max_ld_cap_percent" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  "total_ld_penalties" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "terms_and_conditions" TEXT,
  "notes" TEXT,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "deleted_at" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE TABLE IF NOT EXISTS "contract_items" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "material_or_service_code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'PCS',
  "rate" DOUBLE PRECISION NOT NULL,
  "total_amount" DOUBLE PRECISION NOT NULL,
  "boq_ref" TEXT,
  "wbs_ref" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_milestones" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "milestone_number" INTEGER NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "target_date" TEXT NOT NULL,
  "actual_completion_date" TEXT,
  "milestone_weightage_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_payments" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "certificate_number" TEXT NOT NULL UNIQUE,
  "billing_period" TEXT NOT NULL,
  "gross_amount" DOUBLE PRECISION NOT NULL,
  "retention_deducted" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "advance_adjusted" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "penalty_deducted" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "net_payable_amount" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "reference_no" TEXT,
  "certified_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_claims" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "project_id" TEXT,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "claim_number" TEXT NOT NULL UNIQUE,
  "claim_type" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "event_date" TEXT,
  "notice_date" TEXT,
  "claimed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "approved_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "claimed_days" INTEGER NOT NULL DEFAULT 0,
  "approved_days" INTEGER NOT NULL DEFAULT 0,
  "client_reference" TEXT,
  "change_event_reference" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "reviewed_by" TEXT,
  "approved_by" TEXT,
  "approved_date" TEXT,
  "rejection_reason" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_change_evidence" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "document_id" TEXT NOT NULL,
  "evidence_type" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "contract_retentions" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "retention_number" TEXT NOT NULL UNIQUE,
  "accumulated_retention" DOUBLE PRECISION NOT NULL,
  "released_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "balance_retention" DOUBLE PRECISION NOT NULL,
  "release_stage" TEXT NOT NULL DEFAULT 'DEFECT_LIABILITY_PERIOD',
  "status" TEXT NOT NULL DEFAULT 'HELD',
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_penalties" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "penalty_number" TEXT NOT NULL UNIQUE,
  "penalty_type" TEXT NOT NULL DEFAULT 'LIQUIDATED_DAMAGES',
  "reason" TEXT NOT NULL,
  "applied_date" TEXT NOT NULL,
  "deducted_in_payment_id" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_documents" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_size" INTEGER NOT NULL DEFAULT 0,
  "version_number" INTEGER NOT NULL DEFAULT 1,
  "uploaded_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_approvals" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "step" INTEGER NOT NULL,
  "approver_role" TEXT NOT NULL,
  "approver_id" TEXT NOT NULL,
  "approver_name" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "action_date" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "contract_logs" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "contract_number" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase58_assets" (
  "id" TEXT PRIMARY KEY,
  "asset_number" TEXT NOT NULL UNIQUE,
  "qr_code" TEXT,
  "barcode" TEXT,
  "rfid_tag" TEXT,
  "category" TEXT NOT NULL DEFAULT 'HEAVY_EQUIPMENT',
  "asset_group" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "department" TEXT NOT NULL DEFAULT 'FLEET_PLANT',
  "warehouse_id" TEXT,
  "current_location" TEXT NOT NULL,
  "gps_coordinates" TEXT,
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "serial_number" TEXT NOT NULL,
  "purchase_date" TEXT NOT NULL,
  "commission_date" TEXT,
  "warranty_start_date" TEXT,
  "warranty_end_date" TEXT,
  "insurance_policy_no" TEXT,
  "insurance_expiry_date" TEXT,
  "amc_contract_no" TEXT,
  "amc_expiry_date" TEXT,
  "purchase_value" DOUBLE PRECISION NOT NULL,
  "current_value" DOUBLE PRECISION NOT NULL,
  "residual_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "useful_life_years" INTEGER NOT NULL DEFAULT 10,
  "depreciation_method" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
  "responsible_employee_name" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "odometer_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fuel_efficiency_km_per_l" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "asset_categories" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "default_depreciation_rate_percent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_groups" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category_code" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_locations" (
  "id" TEXT PRIMARY KEY,
  "location_code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "site_name" TEXT NOT NULL,
  "zone" TEXT,
  "address" TEXT,
  "gps_lat_long" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_assignments" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "assigned_date" TEXT NOT NULL,
  "expected_return_date" TEXT,
  "actual_return_date" TEXT,
  "purpose" TEXT NOT NULL,
  "condition_on_assign" TEXT NOT NULL DEFAULT 'EXCELLENT',
  "condition_on_return" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_transfers" (
  "id" TEXT PRIMARY KEY,
  "transfer_number" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "from_location" TEXT NOT NULL,
  "to_location" TEXT NOT NULL,
  "from_project_id" TEXT,
  "to_project_id" TEXT,
  "requested_by" TEXT NOT NULL,
  "approved_by" TEXT,
  "dispatch_date" TEXT NOT NULL,
  "received_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DISPATCHED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_meter_readings" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "reading_type" TEXT NOT NULL DEFAULT 'RUNNING_HOURS',
  "unit" TEXT NOT NULL DEFAULT 'HRS',
  "reading_date" TEXT NOT NULL,
  "recorded_by" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_maintenance_plans" (
  "id" TEXT PRIMARY KEY,
  "plan_number" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "plan_type" TEXT NOT NULL DEFAULT 'PREVENTIVE',
  "interval_meter_value" DOUBLE PRECISION DEFAULT 250,
  "next_due_date" TEXT NOT NULL,
  "next_due_meter_value" DOUBLE PRECISION,
  "task_description" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "estimated_duration_hours" DOUBLE PRECISION NOT NULL DEFAULT 4,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_work_orders" (
  "id" TEXT PRIMARY KEY,
  "work_order_number" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "work_order_type" TEXT NOT NULL DEFAULT 'PREVENTIVE',
  "description" TEXT NOT NULL,
  "maintenance_plan_id" TEXT,
  "failure_code" TEXT,
  "assigned_technician" TEXT NOT NULL,
  "scheduled_start_date" TEXT NOT NULL,
  "scheduled_end_date" TEXT NOT NULL,
  "actual_start_date" TEXT,
  "actual_end_date" TEXT,
  "labor_hours_spent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "labor_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "parts_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "downtime_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "root_cause_analysis" TEXT,
  "status" TEXT NOT NULL DEFAULT 'CREATED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_checklists" (
  "id" TEXT PRIMARY KEY,
  "work_order_id" TEXT NOT NULL,
  "checklist_item" TEXT NOT NULL,
  "is_passed" BOOLEAN NOT NULL DEFAULT FALSE,
  "inspector_notes" TEXT,
  "inspected_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_spare_parts_consumption" (
  "id" TEXT PRIMARY KEY,
  "work_order_id" TEXT NOT NULL,
  "part_code" TEXT NOT NULL,
  "part_name" TEXT NOT NULL,
  "quantity" DOUBLE PRECISION NOT NULL,
  "unit_of_measure" TEXT NOT NULL DEFAULT 'PCS',
  "unit_cost" DOUBLE PRECISION NOT NULL,
  "total_cost" DOUBLE PRECISION NOT NULL,
  "issued_by_warehouse_id" TEXT,
  "consumed_date" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_calibrations" (
  "id" TEXT PRIMARY KEY,
  "calibration_number" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "calibration_date" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "certified_vendor_name" TEXT NOT NULL,
  "certificate_no" TEXT NOT NULL,
  "accuracy_range" TEXT,
  "result_status" TEXT NOT NULL DEFAULT 'PASSED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_fuel_logs" (
  "id" TEXT PRIMARY KEY,
  "log_number" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "fuel_type" TEXT NOT NULL DEFAULT 'DIESEL',
  "price_per_liter" DOUBLE PRECISION NOT NULL,
  "total_amount" DOUBLE PRECISION NOT NULL,
  "odometer_reading" DOUBLE PRECISION,
  "running_hour_reading" DOUBLE PRECISION,
  "fuel_station_vendor" TEXT NOT NULL,
  "driver_or_operator_name" TEXT NOT NULL,
  "log_date" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_depreciations" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "fiscal_year" TEXT NOT NULL,
  "depreciation_amount" DOUBLE PRECISION NOT NULL,
  "closing_book_value" DOUBLE PRECISION NOT NULL,
  "depreciation_rate_percent" DOUBLE PRECISION NOT NULL,
  "method_used" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
  "posted_to_finance" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "asset_audits" (
  "id" TEXT PRIMARY KEY,
  "audit_number" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "audited_by" TEXT NOT NULL,
  "audit_date" TEXT NOT NULL,
  "physical_condition" TEXT NOT NULL DEFAULT 'GOOD',
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_vehicles" (
  "id" TEXT PRIMARY KEY,
  "vehicle_number" TEXT NOT NULL UNIQUE,
  "qr_code" TEXT,
  "category" TEXT NOT NULL DEFAULT 'HEAVY_COMMERCIAL',
  "project_id" TEXT,
  "project_name" TEXT,
  "current_site" TEXT NOT NULL DEFAULT 'Main Depot',
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "vin" TEXT NOT NULL UNIQUE,
  "engine_number" TEXT NOT NULL,
  "chassis_number" TEXT NOT NULL,
  "year" INTEGER NOT NULL DEFAULT 2025,
  "purchase_date" TEXT NOT NULL,
  "purchase_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "current_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fuel_type" TEXT NOT NULL DEFAULT 'DIESEL',
  "mileage_km_per_l" DOUBLE PRECISION NOT NULL DEFAULT 5.5,
  "engine_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "odometer_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
  "assigned_driver_name" TEXT,
  "gps_device_id" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_drivers" (
  "id" TEXT PRIMARY KEY,
  "driver_code" TEXT NOT NULL UNIQUE,
  "full_name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "license_number" TEXT NOT NULL UNIQUE,
  "license_category" TEXT NOT NULL DEFAULT 'HEAVY_VEHICLE',
  "license_expiry" TEXT NOT NULL,
  "badge_number" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "safety_violations_count" INTEGER NOT NULL DEFAULT 0,
  "assigned_vehicle_id" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_trips" (
  "id" TEXT PRIMARY KEY,
  "trip_number" TEXT NOT NULL UNIQUE,
  "vehicle_number" TEXT NOT NULL,
  "driver_id" TEXT NOT NULL,
  "driver_name" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "purpose" TEXT NOT NULL,
  "origin_location" TEXT NOT NULL,
  "destination_location" TEXT NOT NULL,
  "planned_departure_date" TEXT NOT NULL,
  "planned_arrival_date" TEXT NOT NULL,
  "actual_departure_date" TEXT,
  "actual_arrival_date" TEXT,
  "start_odometer_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "end_odometer_km" DOUBLE PRECISION,
  "distance_km" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "fuel_consumed_liters" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "trip_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_fuel_logs" (
  "id" TEXT PRIMARY KEY,
  "fuel_log_number" TEXT NOT NULL UNIQUE,
  "vehicle_number" TEXT NOT NULL,
  "driver_name" TEXT NOT NULL,
  "fuel_station" TEXT NOT NULL,
  "fuel_type" TEXT NOT NULL DEFAULT 'DIESEL',
  "quantity_liters" DOUBLE PRECISION NOT NULL,
  "cost_per_liter" DOUBLE PRECISION NOT NULL,
  "total_cost" DOUBLE PRECISION NOT NULL,
  "odometer_km" DOUBLE PRECISION NOT NULL,
  "fill_date" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_maintenance" (
  "id" TEXT PRIMARY KEY,
  "maintenance_number" TEXT NOT NULL UNIQUE,
  "vehicle_number" TEXT NOT NULL,
  "maintenance_type" TEXT NOT NULL DEFAULT 'PREVENTIVE',
  "service_vendor" TEXT NOT NULL,
  "cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "downtime_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "start_date" TEXT NOT NULL,
  "completion_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_accidents" (
  "id" TEXT PRIMARY KEY,
  "accident_number" TEXT NOT NULL UNIQUE,
  "vehicle_number" TEXT NOT NULL,
  "driver_id" TEXT NOT NULL,
  "driver_name" TEXT NOT NULL,
  "incident_date" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MINOR',
  "estimated_repair_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "insurance_claimed" BOOLEAN NOT NULL DEFAULT FALSE,
  "claim_number" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REPORTED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase59_fleet_documents" (
  "id" TEXT PRIMARY KEY,
  "doc_number" TEXT NOT NULL UNIQUE,
  "vehicle_number" TEXT NOT NULL,
  "doc_type" TEXT NOT NULL DEFAULT 'INSURANCE',
  "issuing_authority" TEXT NOT NULL,
  "issue_date" TEXT NOT NULL,
  "expiry_date" TEXT NOT NULL,
  "cost_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'VALID',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_chart_of_accounts" (
  "id" TEXT PRIMARY KEY,
  "account_code" TEXT NOT NULL UNIQUE,
  "account_name" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "account_group" TEXT NOT NULL,
  "account_type" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "parent_account_id" TEXT,
  "is_header_account" BOOLEAN NOT NULL DEFAULT FALSE,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "current_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_cost_centers" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "center_type" TEXT NOT NULL DEFAULT 'COST_CENTER',
  "manager_name" TEXT NOT NULL DEFAULT 'Financial Controller',
  "annual_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "utilized_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_journal_entries" (
  "id" TEXT PRIMARY KEY,
  "voucher_number" TEXT NOT NULL UNIQUE,
  "reference_number" TEXT,
  "narration" TEXT NOT NULL,
  "total_debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'POSTED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_journal_lines" (
  "id" TEXT PRIMARY KEY,
  "journal_id" TEXT NOT NULL,
  "voucher_number" TEXT NOT NULL,
  "account_id" TEXT NOT NULL,
  "account_code" TEXT NOT NULL,
  "account_name" TEXT NOT NULL,
  "cost_center_id" TEXT,
  "debit_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "credit_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "line_description" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_general_ledger" (
  "id" TEXT PRIMARY KEY,
  "gl_number" TEXT NOT NULL UNIQUE,
  "voucher_number" TEXT NOT NULL,
  "posting_date" TEXT NOT NULL,
  "account_id" TEXT NOT NULL,
  "account_code" TEXT NOT NULL,
  "account_name" TEXT NOT NULL,
  "debit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "credit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "running_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "narration" TEXT NOT NULL,
  "cost_center_code" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_ap_invoices" (
  "id" TEXT PRIMARY KEY,
  "invoice_number" TEXT NOT NULL UNIQUE,
  "vendor_name" TEXT NOT NULL,
  "invoice_date" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "outstanding_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'UNPAID',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_ar_invoices" (
  "id" TEXT PRIMARY KEY,
  "invoice_number" TEXT NOT NULL UNIQUE,
  "customer_name" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "invoice_date" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "total_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tax_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "received_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "outstanding_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'UNPAID',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_bank_accounts" (
  "id" TEXT PRIMARY KEY,
  "account_number" TEXT NOT NULL UNIQUE,
  "bank_name" TEXT NOT NULL,
  "branch_name" TEXT NOT NULL,
  "swift_code" TEXT,
  "currency" TEXT NOT NULL DEFAULT 'USD',
  "current_balance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_cash_transactions" (
  "id" TEXT PRIMARY KEY,
  "transaction_number" TEXT NOT NULL UNIQUE,
  "transaction_type" TEXT NOT NULL,
  "transaction_date" TEXT NOT NULL,
  "payee_or_payer" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'CLEARED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_budget_masters" (
  "id" TEXT PRIMARY KEY,
  "budget_name" TEXT NOT NULL,
  "fiscal_year" TEXT NOT NULL DEFAULT '2026',
  "cost_center_code" TEXT NOT NULL,
  "allocated_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "consumed_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "committed_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "remaining_budget" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase60_tax_records" (
  "id" TEXT PRIMARY KEY,
  "tax_code" TEXT NOT NULL UNIQUE,
  "tax_type" TEXT NOT NULL DEFAULT 'VAT',
  "is_recoverable" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT
);

CREATE TABLE IF NOT EXISTS "phase61_document_categories" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "color_code" TEXT DEFAULT '#3b82f6',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_folders" (
  "id" TEXT PRIMARY KEY,
  "folder_name" TEXT NOT NULL,
  "parent_id" TEXT,
  "department" TEXT DEFAULT 'Engineering',
  "is_system_folder" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_files" (
  "id" TEXT PRIMARY KEY,
  "document_number" TEXT NOT NULL UNIQUE,
  "description" TEXT,
  "folder_id" TEXT NOT NULL,
  "category_id" TEXT,
  "file_type" TEXT NOT NULL DEFAULT 'PDF',
  "file_size_bytes" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "file_url" TEXT,
  "current_version" TEXT NOT NULL DEFAULT 'v1.0',
  "revision_number" INTEGER NOT NULL DEFAULT 1,
  "vendor_id" TEXT,
  "contract_id" TEXT,
  "po_id" TEXT,
  "asset_id" TEXT,
  "hr_employee_id" TEXT,
  "qa_inspection_id" TEXT,
  "checked_out_by" TEXT,
  "checked_out_at" TEXT,
  "is_favorite" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_locked" BOOLEAN NOT NULL DEFAULT FALSE,
  "ocr_text_content" TEXT,
  "watermark_text" TEXT,
  "qr_code_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_versions" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "version_name" TEXT NOT NULL,
  "revision_number" INTEGER NOT NULL DEFAULT 1,
  "file_url" TEXT NOT NULL,
  "file_size_bytes" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "change_summary" TEXT,
  "uploaded_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "is_major_version" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_metadata" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "meta_key" TEXT NOT NULL,
  "data_type" TEXT NOT NULL DEFAULT 'STRING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_tags" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "tag_name" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_folder_permissions" (
  "id" TEXT PRIMARY KEY,
  "folder_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "can_upload" BOOLEAN NOT NULL DEFAULT FALSE,
  "can_edit" BOOLEAN NOT NULL DEFAULT FALSE,
  "can_delete" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_permissions" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "role" TEXT NOT NULL,
  "can_download" BOOLEAN NOT NULL DEFAULT TRUE,
  "can_edit" BOOLEAN NOT NULL DEFAULT FALSE,
  "can_approve" BOOLEAN NOT NULL DEFAULT FALSE,
  "can_delete" BOOLEAN NOT NULL DEFAULT FALSE,
  "can_share" BOOLEAN NOT NULL DEFAULT FALSE,
  "can_archive" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_checkouts" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "checked_out_by" TEXT NOT NULL,
  "checked_out_at" TEXT NOT NULL,
  "expected_check_in_date" TEXT,
  "checkout_notes" TEXT,
  "is_checked_in" BOOLEAN NOT NULL DEFAULT FALSE,
  "checked_in_at" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_reviews" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "reviewer_name" TEXT NOT NULL,
  "review_role" TEXT NOT NULL DEFAULT 'INSPECTING_ENGINEER',
  "comments" TEXT NOT NULL,
  "review_outcome" TEXT NOT NULL DEFAULT 'RECOMMENDED',
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_approvals" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "approver_name" TEXT NOT NULL,
  "approval_role" TEXT NOT NULL DEFAULT 'PROJECT_MANAGER',
  "approval_stage" TEXT NOT NULL DEFAULT 'FINAL_APPROVAL',
  "decision" TEXT NOT NULL DEFAULT 'APPROVED',
  "approval_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_workflows" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "workflow_name" TEXT NOT NULL,
  "due_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_comments" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "author_name" TEXT NOT NULL,
  "comment_text" TEXT NOT NULL,
  "page_number" INTEGER,
  "annotation_coordinates" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_attachments" (
  "id" TEXT PRIMARY KEY,
  "parent_document_id" TEXT NOT NULL,
  "attachment_title" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "file_size_bytes" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_links" (
  "id" TEXT PRIMARY KEY,
  "source_document_id" TEXT NOT NULL,
  "target_document_id" TEXT NOT NULL,
  "link_type" TEXT NOT NULL DEFAULT 'REFERENCES',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_download_logs" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "downloaded_by" TEXT NOT NULL,
  "ip_address" TEXT,
  "download_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_access_logs" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "accessed_by" TEXT NOT NULL,
  "action_type" TEXT NOT NULL DEFAULT 'VIEW',
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_audit_logs" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "actor_name" TEXT NOT NULL,
  "action_executed" TEXT NOT NULL,
  "timestamp" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'LOGGED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_expiry" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "expiry_date" TEXT NOT NULL,
  "reminder_days_before" INTEGER NOT NULL DEFAULT 30,
  "is_expired" BOOLEAN NOT NULL DEFAULT FALSE,
  "renewed_at" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_archive" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "archive_reason" TEXT NOT NULL DEFAULT 'PROJECT_COMPLETED',
  "archived_by" TEXT NOT NULL,
  "archived_at" TEXT NOT NULL,
  "retention_until_date" TEXT,
  "is_restored" BOOLEAN NOT NULL DEFAULT FALSE,
  "restored_at" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ARCHIVED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_templates" (
  "id" TEXT PRIMARY KEY,
  "template_name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'SAFETY',
  "description" TEXT,
  "version" TEXT NOT NULL DEFAULT 'v1.0',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_shares" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "share_token" TEXT NOT NULL UNIQUE,
  "shared_with_email" TEXT,
  "recipient_name" TEXT,
  "permission_level" TEXT NOT NULL DEFAULT 'READ_ONLY',
  "password_protected" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase61_document_notifications" (
  "id" TEXT PRIMARY KEY,
  "document_id" TEXT NOT NULL,
  "recipient_user" TEXT NOT NULL,
  "notification_type" TEXT NOT NULL DEFAULT 'APPROVAL_REQUEST',
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_itp_masters" (
  "id" TEXT PRIMARY KEY,
  "itp_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "discipline" TEXT NOT NULL DEFAULT 'MECHANICAL',
  "project_name" TEXT NOT NULL,
  "revision_number" TEXT NOT NULL DEFAULT 'R0',
  "standard_reference" TEXT,
  "approved_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_itp_checklists" (
  "id" TEXT PRIMARY KEY,
  "itp_id" TEXT NOT NULL,
  "item_number" INTEGER NOT NULL DEFAULT 1,
  "activity_description" TEXT NOT NULL,
  "reference_doc" TEXT,
  "inspection_type" TEXT NOT NULL DEFAULT 'HOLD_POINT',
  "consultant_check" BOOLEAN NOT NULL DEFAULT TRUE,
  "client_check" BOOLEAN NOT NULL DEFAULT TRUE,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_inspections" (
  "id" TEXT PRIMARY KEY,
  "inspection_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "discipline" TEXT NOT NULL DEFAULT 'MECHANICAL',
  "inspection_type" TEXT NOT NULL DEFAULT 'SITE_INSPECTION',
  "location" TEXT NOT NULL,
  "requested_date" TEXT NOT NULL,
  "inspection_date" TEXT,
  "inspector_name" TEXT,
  "client_representative" TEXT,
  "result" TEXT NOT NULL DEFAULT 'PENDING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_inspection_items" (
  "id" TEXT PRIMARY KEY,
  "inspection_id" TEXT NOT NULL,
  "check_point" TEXT NOT NULL,
  "acceptance_criteria" TEXT NOT NULL,
  "observed_result" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PASS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_ncr" (
  "id" TEXT PRIMARY KEY,
  "ncr_number" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'MAJOR',
  "location" TEXT NOT NULL,
  "issued_to" TEXT NOT NULL,
  "target_close_date" TEXT NOT NULL,
  "actual_close_date" TEXT,
  "root_cause" TEXT,
  "disposition" TEXT DEFAULT 'REWORK',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_corrective_actions" (
  "id" TEXT PRIMARY KEY,
  "capa_number" TEXT NOT NULL,
  "action_plan" TEXT NOT NULL,
  "assigned_to" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "completion_date" TEXT,
  "verification_status" TEXT NOT NULL DEFAULT 'PENDING',
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_preventive_actions" (
  "id" TEXT PRIMARY KEY,
  "preventive_action_number" TEXT NOT NULL,
  "ncr_id" TEXT,
  "risk_category" TEXT NOT NULL DEFAULT 'PROCESS_FAILURE',
  "preventive_measure" TEXT NOT NULL,
  "responsible_person" TEXT NOT NULL,
  "implementation_date" TEXT NOT NULL,
  "review_frequency" TEXT NOT NULL DEFAULT 'MONTHLY',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_material_inspections" (
  "id" TEXT PRIMARY KEY,
  "mir_number" TEXT NOT NULL,
  "supplier_name" TEXT NOT NULL,
  "po_number" TEXT,
  "delivery_note_number" TEXT,
  "quantity_received" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit_of_measure" TEXT NOT NULL DEFAULT 'Pcs',
  "heat_number_cert_ref" TEXT,
  "visual_check" TEXT NOT NULL DEFAULT 'PASS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_site_tests" (
  "id" TEXT PRIMARY KEY,
  "test_number" TEXT NOT NULL,
  "tested_by_lab" TEXT NOT NULL DEFAULT 'Site QA Lab',
  "sample_date" TEXT NOT NULL,
  "test_date" TEXT NOT NULL,
  "required_value" TEXT NOT NULL,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_welding_inspections" (
  "id" TEXT PRIMARY KEY,
  "report_number" TEXT NOT NULL,
  "pipe_material" TEXT NOT NULL DEFAULT 'Carbon Steel A106 Gr B',
  "wps_number" TEXT NOT NULL DEFAULT 'WPS-MECH-001',
  "inspector_signature" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_hydro_tests" (
  "id" TEXT PRIMARY KEY,
  "test_package_number" TEXT NOT NULL,
  "test_pressure_bar" DOUBLE PRECISION NOT NULL DEFAULT 15,
  "test_duration_hours" DOUBLE PRECISION NOT NULL DEFAULT 24,
  "holding_time_minutes" INTEGER NOT NULL DEFAULT 120,
  "pressure_drop_observed_bar" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  "allowable_drop_bar" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
  "result" TEXT NOT NULL DEFAULT 'PASS',
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_pressure_tests" (
  "id" TEXT PRIMARY KEY,
  "test_number" TEXT NOT NULL,
  "test_medium" TEXT NOT NULL DEFAULT 'COMPRESSED_AIR',
  "gauge_calib_cert_ref" TEXT NOT NULL DEFAULT 'CAL-2026-881',
  "start_pressure_bar" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
  "end_pressure_bar" DOUBLE PRECISION NOT NULL DEFAULT 3.5,
  "result" TEXT NOT NULL DEFAULT 'PASS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_punch_lists" (
  "id" TEXT PRIMARY KEY,
  "punch_number" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "assigned_contractor" TEXT NOT NULL,
  "target_date" TEXT NOT NULL,
  "completion_date" TEXT,
  "cleared_by_inspector" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_snag_lists" (
  "id" TEXT PRIMARY KEY,
  "snag_number" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'LOW',
  "rectification_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_quality_documents" (
  "id" TEXT PRIMARY KEY,
  "document_code" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'METHOD_STATEMENT',
  "file_url" TEXT,
  "approval_status" TEXT NOT NULL DEFAULT 'APPROVED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_quality_approvals" (
  "id" TEXT PRIMARY KEY,
  "reference_type" TEXT NOT NULL,
  "approval_stage" TEXT NOT NULL DEFAULT 'INSPECTOR',
  "decision" TEXT NOT NULL DEFAULT 'APPROVED',
  "signed_at" TEXT NOT NULL,
  "digital_stamp_ref" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_quality_logs" (
  "id" TEXT PRIMARY KEY,
  "action_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase62_quality_notifications" (
  "id" TEXT PRIMARY KEY,
  "recipient_user" TEXT NOT NULL,
  "notification_type" TEXT NOT NULL DEFAULT 'INSPECTION_REQUEST',
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_incidents" (
  "id" TEXT PRIMARY KEY,
  "incident_number" TEXT NOT NULL,
  "incident_type" TEXT NOT NULL DEFAULT 'FIRST_AID',
  "project_id" TEXT,
  "project_name" TEXT,
  "incident_date" TEXT NOT NULL,
  "injured_person_name" TEXT,
  "injured_person_role" TEXT,
  "description" TEXT NOT NULL,
  "immediate_action" TEXT,
  "root_cause" TEXT,
  "corrective_action" TEXT,
  "preventive_action" TEXT,
  "status" TEXT NOT NULL DEFAULT 'REPORTED',
  "reported_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_near_miss" (
  "id" TEXT PRIMARY KEY,
  "near_miss_number" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'UNSAFE_ACT',
  "reported_date" TEXT NOT NULL,
  "potential_severity" TEXT NOT NULL DEFAULT 'MEDIUM',
  "preventive_action" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_hazard_reports" (
  "id" TEXT PRIMARY KEY,
  "hazard_number" TEXT NOT NULL,
  "hazard_type" TEXT NOT NULL DEFAULT 'PHYSICAL',
  "recommended_action" TEXT,
  "assigned_to" TEXT,
  "due_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IDENTIFIED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_risk_assessments" (
  "id" TEXT PRIMARY KEY,
  "assessment_number" TEXT NOT NULL,
  "department_or_site" TEXT NOT NULL,
  "hazard_description" TEXT NOT NULL,
  "severity" INTEGER NOT NULL DEFAULT 3,
  "additional_controls" TEXT,
  "residual_severity" INTEGER DEFAULT 2,
  "residual_likelihood" INTEGER DEFAULT 2,
  "residual_risk_score" INTEGER DEFAULT 4,
  "assessed_by" TEXT NOT NULL,
  "review_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_jsa" (
  "id" TEXT PRIMARY KEY,
  "jsa_number" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "supervisor_name" TEXT NOT NULL,
  "jsa_date" TEXT NOT NULL,
  "job_steps" TEXT NOT NULL,
  "permit_required" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'DRAFT',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_toolbox_talks" (
  "id" TEXT PRIMARY KEY,
  "tbt_number" TEXT NOT NULL,
  "conducted_by" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "talk_date" TEXT NOT NULL,
  "attendees_count" INTEGER NOT NULL DEFAULT 0,
  "key_points" TEXT NOT NULL,
  "attendees_list" TEXT,
  "status" TEXT NOT NULL DEFAULT 'COMPLETED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_work_permits" (
  "id" TEXT PRIMARY KEY,
  "permit_number" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "contractor_name" TEXT NOT NULL,
  "supervisor_name" TEXT NOT NULL,
  "issue_date_time" TEXT NOT NULL,
  "expiry_date_time" TEXT NOT NULL,
  "safety_checklist" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_safety_inspections" (
  "id" TEXT PRIMARY KEY,
  "inspection_number" TEXT NOT NULL,
  "inspector_name" TEXT NOT NULL,
  "inspection_date" TEXT NOT NULL,
  "total_items_checked" INTEGER NOT NULL DEFAULT 0,
  "compliant_items" INTEGER NOT NULL DEFAULT 0,
  "non_compliant_items" INTEGER NOT NULL DEFAULT 0,
  "score_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "findings" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTION_REQUIRED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_ppe_issuance" (
  "id" TEXT PRIMARY KEY,
  "issuance_number" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "ppe_item" TEXT NOT NULL,
  "issue_date" TEXT NOT NULL,
  "expiry_date" TEXT,
  "condition" TEXT NOT NULL DEFAULT 'NEW',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_training_records" (
  "id" TEXT PRIMARY KEY,
  "training_number" TEXT NOT NULL,
  "training_date" TEXT NOT NULL,
  "validity_months" INTEGER NOT NULL DEFAULT 12,
  "expiry_date" TEXT NOT NULL,
  "participants_count" INTEGER NOT NULL DEFAULT 1,
  "participants_list" TEXT,
  "status" TEXT NOT NULL DEFAULT 'VALID',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_emergency_drills" (
  "id" TEXT PRIMARY KEY,
  "drill_number" TEXT NOT NULL,
  "drill_date" TEXT NOT NULL,
  "evacuation_time_seconds" INTEGER NOT NULL DEFAULT 180,
  "participants_count" INTEGER NOT NULL DEFAULT 0,
  "observer_name" TEXT NOT NULL,
  "performance_rating" TEXT NOT NULL DEFAULT 'SATISFACTORY',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_fire_equipment" (
  "id" TEXT PRIMARY KEY,
  "equipment_tag" TEXT NOT NULL,
  "last_inspection_date" TEXT NOT NULL,
  "next_inspection_due" TEXT NOT NULL,
  "pressure_status" TEXT NOT NULL DEFAULT 'NORMAL',
  "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_environment_monitoring" (
  "id" TEXT PRIMARY KEY,
  "record_number" TEXT NOT NULL,
  "location" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "parameter" TEXT NOT NULL DEFAULT 'NOISE_LEVEL',
  "measured_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL DEFAULT 'dBA',
  "permissible_limit" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "compliance_status" TEXT NOT NULL DEFAULT 'COMPLIANT',
  "monitoring_date" TEXT NOT NULL DEFAULT CURRENT_DATE::text,
  "monitored_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_waste_management" (
  "id" TEXT PRIMARY KEY,
  "manifest_number" TEXT NOT NULL,
  "waste_category" TEXT NOT NULL DEFAULT 'HAZARDOUS',
  "waste_type" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "quantity_kg" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "disposal_method" TEXT NOT NULL DEFAULT 'AUTHORIZED_RECYCLER',
  "approved_contractor" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "disposal_date" TEXT NOT NULL,
  "certificate_ref" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DISPOSED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "updated_by" TEXT NOT NULL DEFAULT 'SYSTEM_DEMO_SEED',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_hse_documents" (
  "id" TEXT PRIMARY KEY,
  "document_code" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'SAFETY_POLICY',
  "file_url" TEXT,
  "approval_status" TEXT NOT NULL DEFAULT 'APPROVED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_hse_approvals" (
  "id" TEXT PRIMARY KEY,
  "reference_type" TEXT NOT NULL,
  "approval_stage" TEXT NOT NULL DEFAULT 'SAFETY_OFFICER',
  "decision" TEXT NOT NULL DEFAULT 'APPROVED',
  "signed_at" TEXT NOT NULL,
  "digital_stamp_ref" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_hse_notifications" (
  "id" TEXT PRIMARY KEY,
  "recipient_user" TEXT NOT NULL,
  "notification_type" TEXT NOT NULL DEFAULT 'INCIDENT_ALERT',
  "message" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase63_hse_logs" (
  "id" TEXT PRIMARY KEY,
  "action_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_projects_wbs" (
  "id" TEXT PRIMARY KEY,
  "wbs_number" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "description" TEXT,
  "level" INTEGER NOT NULL DEFAULT 1,
  "parent_id" TEXT,
  "budget_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "planned_start_date" TEXT,
  "planned_end_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_work_packages" (
  "id" TEXT PRIMARY KEY,
  "wp_number" TEXT NOT NULL,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "name" TEXT NOT NULL,
  "code" TEXT NOT NULL,
  "deliverable" TEXT,
  "responsible_person" TEXT NOT NULL DEFAULT 'Project Manager',
  "estimated_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "planned_start_date" TEXT,
  "planned_end_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PLANNED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_activities" (
  "id" TEXT PRIMARY KEY,
  "activity_number" TEXT NOT NULL,
  "wbs_id" TEXT NOT NULL,
  "wp_id" TEXT,
  "activity_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT,
  "duration_days" INTEGER NOT NULL DEFAULT 1,
  "planned_start_date" TEXT NOT NULL,
  "planned_end_date" TEXT NOT NULL,
  "actual_start_date" TEXT,
  "actual_end_date" TEXT,
  "early_start" TEXT,
  "early_finish" TEXT,
  "late_start" TEXT,
  "late_finish" TEXT,
  "total_float" INTEGER NOT NULL DEFAULT 0,
  "free_float" INTEGER NOT NULL DEFAULT 0,
  "is_critical" BOOLEAN NOT NULL DEFAULT FALSE,
  "percent_complete" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "planned_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "actual_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'NOT_STARTED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_activity_relationships" (
  "id" TEXT PRIMARY KEY,
  "predecessor_activity_id" TEXT NOT NULL,
  "successor_activity_id" TEXT NOT NULL,
  "relationship_type" TEXT NOT NULL DEFAULT 'FS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_baselines" (
  "id" TEXT PRIMARY KEY,
  "baseline_number" TEXT NOT NULL,
  "baseline_name" TEXT NOT NULL,
  "approved_by" TEXT NOT NULL DEFAULT 'Project Director',
  "approved_date" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT 'V1.0',
  "is_current_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "total_duration_days" INTEGER NOT NULL DEFAULT 180,
  "total_planned_cost" DOUBLE PRECISION NOT NULL DEFAULT 5000000,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_calendars" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "calendar_name" TEXT NOT NULL DEFAULT 'Standard 6-Day Site Calendar',
  "working_days_per_week" INTEGER NOT NULL DEFAULT 6,
  "working_hours_per_day" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "holidays_json" TEXT NOT NULL DEFAULT '[]',
  "is_default" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_resources" (
  "id" TEXT PRIMARY KEY,
  "resource_code" TEXT NOT NULL,
  "type" TEXT NOT NULL DEFAULT 'LABOR',
  "unit_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "capacity_per_day" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_resource_assignments" (
  "id" TEXT PRIMARY KEY,
  "activity_id" TEXT NOT NULL,
  "resource_id" TEXT NOT NULL,
  "allocated_quantity" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "actual_quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_progress" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "as_of_date" TEXT NOT NULL,
  "planned_progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "actual_progress_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "planned_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_delays" (
  "id" TEXT PRIMARY KEY,
  "delay_number" TEXT NOT NULL,
  "activity_id" TEXT,
  "delay_category" TEXT NOT NULL DEFAULT 'CLIENT',
  "delay_days" INTEGER NOT NULL DEFAULT 1,
  "impact_on_critical_path" BOOLEAN NOT NULL DEFAULT FALSE,
  "mitigation_plan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_constraints" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "activity_id" TEXT NOT NULL,
  "constraint_type" TEXT NOT NULL DEFAULT 'MUST_START_ON',
  "reason" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_milestones" (
  "id" TEXT PRIMARY KEY,
  "milestone_number" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "target_date" TEXT NOT NULL,
  "actual_date" TEXT,
  "payment_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "is_key_milestone" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_risks" (
  "id" TEXT PRIMARY KEY,
  "risk_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'SCHEDULE',
  "mitigation_strategy" TEXT,
  "owner" TEXT NOT NULL DEFAULT 'Planning Manager',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_issues" (
  "id" TEXT PRIMARY KEY,
  "issue_number" TEXT NOT NULL,
  "activity_id" TEXT,
  "title" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "resolution_plan" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_change_requests" (
  "id" TEXT PRIMARY KEY,
  "cr_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "time_extension_days" INTEGER NOT NULL DEFAULT 0,
  "cost_impact" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "approval_status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_lookahead_plans" (
  "id" TEXT PRIMARY KEY,
  "plan_number" TEXT NOT NULL,
  "period_weeks" INTEGER NOT NULL DEFAULT 3,
  "end_date" TEXT NOT NULL,
  "planned_activities_count" INTEGER NOT NULL DEFAULT 0,
  "readiness_status" TEXT NOT NULL DEFAULT 'READY',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_daily_progress" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "activity_id" TEXT NOT NULL,
  "report_date" TEXT NOT NULL,
  "work_done_qty" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "unit" TEXT NOT NULL DEFAULT 'MTRS',
  "manpower_count" INTEGER NOT NULL DEFAULT 0,
  "equipment_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_weekly_progress" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "week_number" INTEGER NOT NULL,
  "year" INTEGER NOT NULL DEFAULT 2026,
  "planned_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "actual_percent" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "weekly_remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_monthly_progress" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "month" INTEGER NOT NULL,
  "year" INTEGER NOT NULL DEFAULT 2026,
  "monthly_planned_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "monthly_earned_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "monthly_actual_cost" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase64_project_logs" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL DEFAULT 'PRJ-101',
  "action_type" TEXT NOT NULL,
  "module" TEXT NOT NULL DEFAULT 'PROJECT_CONTROLS',
  "performed_by" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_dashboards" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "role_view" TEXT NOT NULL DEFAULT 'CEO',
  "is_default" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_public" BOOLEAN NOT NULL DEFAULT TRUE,
  "theme" TEXT NOT NULL DEFAULT 'LIGHT',
  "refresh_interval_seconds" INTEGER NOT NULL DEFAULT 300,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_dashboard_widgets" (
  "id" TEXT PRIMARY KEY,
  "dashboard_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "widget_type" TEXT NOT NULL DEFAULT 'KPI_CARD',
  "refresh_interval" INTEGER NOT NULL DEFAULT 60,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_widget_layouts" (
  "id" TEXT PRIMARY KEY,
  "dashboard_id" TEXT NOT NULL,
  "widget_id" TEXT NOT NULL,
  "pos_x" INTEGER NOT NULL DEFAULT 0,
  "pos_y" INTEGER NOT NULL DEFAULT 0,
  "width" INTEGER NOT NULL DEFAULT 4,
  "height" INTEGER NOT NULL DEFAULT 3,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_saved_reports" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "report_type" TEXT NOT NULL DEFAULT 'EXECUTIVE_SUMMARY',
  "module" TEXT NOT NULL DEFAULT 'CROSS_MODULE',
  "filter_params_json" TEXT NOT NULL DEFAULT '{}',
  "format" TEXT NOT NULL DEFAULT 'PDF',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_report_schedules" (
  "id" TEXT PRIMARY KEY,
  "saved_report_id" TEXT NOT NULL,
  "frequency" TEXT NOT NULL DEFAULT 'WEEKLY',
  "recipients_email" TEXT NOT NULL,
  "last_run_at" TEXT,
  "next_run_at" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_kpi_definitions" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "module" TEXT NOT NULL DEFAULT 'GENERAL',
  "formula" TEXT NOT NULL,
  "unit" TEXT NOT NULL DEFAULT 'PERCENT',
  "target_value" DOUBLE PRECISION NOT NULL DEFAULT 100,
  "warning_threshold" DOUBLE PRECISION NOT NULL DEFAULT 90,
  "critical_threshold" DOUBLE PRECISION NOT NULL DEFAULT 80,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_kpi_snapshots" (
  "id" TEXT PRIMARY KEY,
  "kpi_code" TEXT NOT NULL,
  "snapshot_date" TEXT NOT NULL,
  "actual_value" DOUBLE PRECISION NOT NULL,
  "target_value" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'NORMAL',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_chart_configs" (
  "id" TEXT PRIMARY KEY,
  "widget_id" TEXT NOT NULL,
  "chart_type" TEXT NOT NULL DEFAULT 'LINE',
  "y_axis_keys_json" TEXT NOT NULL DEFAULT '["value"]',
  "colors_json" TEXT NOT NULL DEFAULT '["#2563eb", "#10b981"]',
  "stacked" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_alert_rules" (
  "id" TEXT PRIMARY KEY,
  "rule_name" TEXT NOT NULL,
  "kpi_code" TEXT NOT NULL,
  "condition" TEXT NOT NULL DEFAULT 'LESS_THAN',
  "severity" TEXT NOT NULL DEFAULT 'WARNING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_alert_notifications" (
  "id" TEXT PRIMARY KEY,
  "alert_rule_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "severity" TEXT NOT NULL DEFAULT 'WARNING',
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "triggered_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_drilldown_logs" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "source_widget_id" TEXT,
  "target_module" TEXT NOT NULL,
  "filter_context_json" TEXT NOT NULL DEFAULT '{}',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_executive_reports" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "period" TEXT NOT NULL DEFAULT 'Q3-2026',
  "executive_summary" TEXT NOT NULL,
  "highlights_json" TEXT NOT NULL DEFAULT '[]',
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_ai_insights" (
  "id" TEXT PRIMARY KEY,
  "category" TEXT NOT NULL DEFAULT 'FINANCIAL_RISK',
  "insight_text" TEXT NOT NULL,
  "recommended_action" TEXT NOT NULL,
  "confidence_score" DOUBLE PRECISION NOT NULL DEFAULT 0.95,
  "impact_severity" TEXT NOT NULL DEFAULT 'HIGH',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_user_preferences" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "default_dashboard_id" TEXT,
  "preferred_theme" TEXT NOT NULL DEFAULT 'LIGHT',
  "layout_density" TEXT NOT NULL DEFAULT 'COMFORTABLE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase65_dashboard_logs" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_workflows" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "module" TEXT NOT NULL DEFAULT 'CROSS_MODULE',
  "description" TEXT,
  "version" INTEGER NOT NULL DEFAULT 1,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "trigger_type" TEXT NOT NULL DEFAULT 'MANUAL',
  "min_approval_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "sla_hours" INTEGER NOT NULL DEFAULT 24,
  "policy_config" JSONB NOT NULL DEFAULT '{}'::jsonb,
  "verification_required" BOOLEAN NOT NULL DEFAULT TRUE,
  "approval_required" BOOLEAN NOT NULL DEFAULT TRUE,
  "prevent_maker_verification" BOOLEAN NOT NULL DEFAULT TRUE,
  "prevent_maker_approval" BOOLEAN NOT NULL DEFAULT TRUE,
  "prevent_verifier_approval" BOOLEAN NOT NULL DEFAULT TRUE,
  "require_higher_authority" BOOLEAN NOT NULL DEFAULT FALSE,
  "hierarchy_scope" TEXT NOT NULL DEFAULT 'PROJECT',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_workflow_steps" (
  "id" TEXT PRIMARY KEY,
  "workflow_id" TEXT NOT NULL,
  "step_order" INTEGER NOT NULL,
  "step_name" TEXT NOT NULL,
  "approver_role" TEXT NOT NULL DEFAULT 'MANAGER',
  "approver_user_id" TEXT,
  "approval_type" TEXT NOT NULL DEFAULT 'SINGLE',
  "condition_expression" TEXT NOT NULL DEFAULT 'true',
  "sla_hours" INTEGER NOT NULL DEFAULT 12,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_workflow_instances" (
  "id" TEXT PRIMARY KEY,
  "workflow_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "requester_id" TEXT NOT NULL,
  "requester_name" TEXT NOT NULL DEFAULT 'John Doe',
  "current_step_order" INTEGER NOT NULL DEFAULT 1,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "data_context_json" TEXT NOT NULL DEFAULT '{}',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_workflow_tasks" (
  "id" TEXT PRIMARY KEY,
  "instance_id" TEXT NOT NULL,
  "step_id" TEXT NOT NULL,
  "assigned_role_id" TEXT NOT NULL DEFAULT 'MANAGER',
  "assigned_user_id" TEXT,
  "assigned_user_name" TEXT NOT NULL DEFAULT 'Assigned Approver',
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "due_date" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_workflow_approvals" (
  "id" TEXT PRIMARY KEY,
  "task_id" TEXT NOT NULL,
  "instance_id" TEXT NOT NULL,
  "approver_id" TEXT NOT NULL,
  "approver_name" TEXT NOT NULL DEFAULT 'Approver User',
  "approver_role" TEXT NOT NULL DEFAULT 'MANAGER',
  "decision" TEXT NOT NULL,
  "comments" TEXT,
  "approved_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_workflow_history" (
  "id" TEXT PRIMARY KEY,
  "instance_id" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL DEFAULT 'SYSTEM_MIGRATION',
  "notes" TEXT,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_notifications" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'APPROVAL',
  "severity" TEXT NOT NULL DEFAULT 'INFO',
  "link_url" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_notification_templates" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "subject_template" TEXT NOT NULL DEFAULT '',
  "body_template" TEXT NOT NULL,
  "channel" TEXT NOT NULL DEFAULT 'SYSTEM',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_user_notifications" (
  "id" TEXT PRIMARY KEY,
  "notification_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "read_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_email_queue" (
  "id" TEXT PRIMARY KEY,
  "recipient_email" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "body_html" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "attempts" INTEGER NOT NULL DEFAULT 0,
  "sent_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_sms_queue" (
  "id" TEXT PRIMARY KEY,
  "phone_number" TEXT NOT NULL,
  "message_text" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_push_notifications" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "device_token" TEXT,
  "status" TEXT NOT NULL DEFAULT 'DELIVERED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_escalations" (
  "id" TEXT PRIMARY KEY,
  "task_id" TEXT NOT NULL,
  "instance_id" TEXT NOT NULL,
  "original_approver_id" TEXT NOT NULL,
  "escalated_to_id" TEXT NOT NULL,
  "escalated_to_name" TEXT NOT NULL DEFAULT 'Executive Director',
  "reason" TEXT NOT NULL DEFAULT 'SLA Breach / Unresponsive Approver',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_delegations" (
  "id" TEXT PRIMARY KEY,
  "delegator_id" TEXT NOT NULL,
  "delegator_name" TEXT NOT NULL,
  "delegatee_id" TEXT NOT NULL,
  "delegatee_name" TEXT NOT NULL,
  "module_scope" TEXT NOT NULL DEFAULT 'ALL',
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "reason" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_reminders" (
  "id" TEXT PRIMARY KEY,
  "task_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "reminder_count" INTEGER NOT NULL DEFAULT 1,
  "last_sent_at" TEXT NOT NULL,
  "next_scheduled_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_activity_feed" (
  "id" TEXT PRIMARY KEY,
  "actor_name" TEXT NOT NULL,
  "action_type" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "target_entity" TEXT,
  "target_id" TEXT,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_system_announcements" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "author_name" TEXT NOT NULL DEFAULT 'Executive Office',
  "target_audience" TEXT NOT NULL DEFAULT 'ALL_STAFF',
  "published_at" TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP::text,
  "expires_at" TEXT,
  "is_pinned" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase66_user_preferences" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "email_notifications_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "sms_notifications_enabled" BOOLEAN NOT NULL DEFAULT FALSE,
  "push_notifications_enabled" BOOLEAN NOT NULL DEFAULT TRUE,
  "quiet_hours_start" TEXT DEFAULT '22:00',
  "quiet_hours_end" TEXT DEFAULT '06:00',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customers" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "trading_name" TEXT,
  "industry" TEXT NOT NULL DEFAULT 'CONSTRUCTION',
  "customer_type" TEXT NOT NULL DEFAULT 'GOVERNMENT',
  "credit_limit" DOUBLE PRECISION NOT NULL DEFAULT 1000000,
  "health_score" INTEGER NOT NULL DEFAULT 90,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customer_contacts" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "job_title" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "is_primary" BOOLEAN NOT NULL DEFAULT FALSE,
  "department" TEXT DEFAULT 'Procurement',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_leads" (
  "id" TEXT PRIMARY KEY,
  "lead_number" TEXT NOT NULL UNIQUE,
  "contact_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "source" TEXT NOT NULL DEFAULT 'TENDER_PORTAL',
  "status" TEXT NOT NULL DEFAULT 'NEW',
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_opportunities" (
  "id" TEXT PRIMARY KEY,
  "opp_number" TEXT NOT NULL UNIQUE,
  "customer_id" TEXT,
  "lead_id" TEXT,
  "estimated_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "probability_percent" INTEGER NOT NULL DEFAULT 50,
  "stage" TEXT NOT NULL DEFAULT 'PROPOSAL_SUBMITTED',
  "owner_name" TEXT NOT NULL DEFAULT 'Senior BD Lead',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customer_projects" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "contract_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "completion_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customer_complaints" (
  "id" TEXT PRIMARY KEY,
  "complaint_no" TEXT NOT NULL UNIQUE,
  "customer_name" TEXT NOT NULL,
  "project_id" TEXT,
  "category" TEXT NOT NULL DEFAULT 'QUALITY',
  "description" TEXT NOT NULL,
  "assigned_to" TEXT NOT NULL DEFAULT 'QA/QC Manager',
  "status" TEXT NOT NULL DEFAULT 'UNDER_INVESTIGATION',
  "resolved_at" TEXT,
  "resolved_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_support_tickets" (
  "id" TEXT PRIMARY KEY,
  "ticket_no" TEXT NOT NULL UNIQUE,
  "customer_name" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'BILLING_INQUIRY',
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "sla_breached" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_ticket_comments" (
  "id" TEXT PRIMARY KEY,
  "ticket_id" TEXT NOT NULL,
  "author_name" TEXT NOT NULL,
  "author_role" TEXT NOT NULL DEFAULT 'SUPPORT_AGENT',
  "is_internal_only" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customer_feedback" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "customer_name" TEXT NOT NULL,
  "project_id" TEXT,
  "rating" INTEGER NOT NULL DEFAULT 5,
  "category" TEXT NOT NULL DEFAULT 'PROJECT_HANDOVER',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customer_meetings" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "meeting_type" TEXT NOT NULL DEFAULT 'PROGRESS_REVIEW',
  "location" TEXT NOT NULL DEFAULT 'Site Sync HQ / Teams Online',
  "organizer_name" TEXT NOT NULL DEFAULT 'Account Director',
  "minutes_of_meeting" TEXT,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_followups" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "assigned_to" TEXT NOT NULL,
  "action_required" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_portal_users" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "full_name" TEXT NOT NULL,
  "password_hash" TEXT NOT NULL DEFAULT 'hashed_default',
  "role" TEXT NOT NULL DEFAULT 'CLIENT_ADMIN',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase67_customer_documents" (
  "id" TEXT PRIMARY KEY,
  "customer_id" TEXT NOT NULL,
  "project_id" TEXT,
  "title" TEXT NOT NULL,
  "document_type" TEXT NOT NULL DEFAULT 'CONTRACT',
  "file_size_kb" INTEGER NOT NULL DEFAULT 2048,
  "is_portal_visible" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_devices" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL UNIQUE,
  "device_model" TEXT NOT NULL,
  "os_platform" TEXT NOT NULL,
  "app_version" TEXT NOT NULL,
  "assigned_user_id" TEXT NOT NULL,
  "assigned_user_name" TEXT NOT NULL,
  "user_role" TEXT NOT NULL DEFAULT 'SUPERVISOR',
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "battery_level" INTEGER NOT NULL DEFAULT 100,
  "is_online" BOOLEAN NOT NULL DEFAULT TRUE,
  "last_sync_at" TEXT NOT NULL,
  "device_status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "offline_pending_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_device_registrations" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "registration_token" TEXT NOT NULL,
  "requested_by" TEXT NOT NULL,
  "approved_by" TEXT,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "mac_address" TEXT,
  "registered_at" TEXT NOT NULL,
  "expires_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_sync_queue" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "client_timestamp" TEXT NOT NULL,
  "synced_at" TEXT,
  "error_message" TEXT,
  "conflict_resolution" TEXT,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_sync_history" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "sync_type" TEXT NOT NULL DEFAULT 'BIDIRECTIONAL',
  "records_pulled" INTEGER NOT NULL DEFAULT 0,
  "conflicts_detected" INTEGER NOT NULL DEFAULT 0,
  "duration_ms" INTEGER NOT NULL DEFAULT 350,
  "status" TEXT NOT NULL DEFAULT 'SUCCESS',
  "completed_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_offline_transactions" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "transaction_code" TEXT NOT NULL,
  "module" TEXT NOT NULL,
  "data_payload" TEXT NOT NULL,
  "sync_status" TEXT NOT NULL DEFAULT 'SYNCED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_gps_tracks" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "altitude_meters" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "accuracy_meters" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "speed_kmph" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "heading_degrees" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "battery_percent" INTEGER NOT NULL DEFAULT 100,
  "recorded_at" TEXT NOT NULL,
  "is_geofence_inside" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_geofences" (
  "id" TEXT PRIMARY KEY,
  "geofence_code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "fence_type" TEXT NOT NULL DEFAULT 'POLYGON',
  "center_lng" DOUBLE PRECISION NOT NULL,
  "radius_meters" DOUBLE PRECISION NOT NULL DEFAULT 250,
  "polygon_coordinates" TEXT,
  "alert_on_exit" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_geofence_events" (
  "id" TEXT PRIMARY KEY,
  "geofence_id" TEXT NOT NULL,
  "geofence_name" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "dwell_duration_minutes" INTEGER DEFAULT 0,
  "event_timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_live_locations" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL DEFAULT 'PERSONNEL',
  "entity_name" TEXT NOT NULL,
  "role_or_type" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "altitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "speed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "heading" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "battery" INTEGER NOT NULL DEFAULT 100,
  "is_online" BOOLEAN NOT NULL DEFAULT TRUE,
  "current_geofence" TEXT,
  "last_active_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_field_visits" (
  "id" TEXT PRIMARY KEY,
  "visit_code" TEXT NOT NULL UNIQUE,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "site_location" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "scheduled_end_time" TEXT NOT NULL,
  "actual_start_time" TEXT,
  "actual_end_time" TEXT,
  "status" TEXT NOT NULL DEFAULT 'IN_PROGRESS',
  "findings_count" INTEGER NOT NULL DEFAULT 0,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_site_checkins" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "geofence_id" TEXT,
  "site_name" TEXT NOT NULL,
  "checkin_time" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "accuracy_meters" DOUBLE PRECISION NOT NULL DEFAULT 5,
  "selfie_photo_url" TEXT,
  "is_biometric_verified" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_offline_checkin" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_site_checkouts" (
  "id" TEXT PRIMARY KEY,
  "checkin_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "checkout_time" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "total_duration_minutes" INTEGER NOT NULL DEFAULT 480,
  "daily_summary_text" TEXT,
  "is_auto_checkout" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_photos" (
  "id" TEXT PRIMARY KEY,
  "photo_code" TEXT NOT NULL UNIQUE,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'PROGRESS',
  "photo_url" TEXT NOT NULL,
  "thumbnail_url" TEXT,
  "file_size_kb" INTEGER NOT NULL DEFAULT 1024,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "altitude" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "azimuth_heading" DOUBLE PRECISION DEFAULT 0,
  "captured_at" TEXT NOT NULL,
  "is_watermarked" BOOLEAN NOT NULL DEFAULT TRUE,
  "watermark_metadata" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_documents" (
  "id" TEXT PRIMARY KEY,
  "document_code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'TECHNICAL_DRAWING',
  "file_size_kb" INTEGER NOT NULL DEFAULT 4096,
  "cached_for_offline" BOOLEAN NOT NULL DEFAULT TRUE,
  "version_number" TEXT NOT NULL DEFAULT 'v1.0',
  "download_count" INTEGER NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_forms" (
  "id" TEXT PRIMARY KEY,
  "form_code" TEXT NOT NULL UNIQUE,
  "form_title" TEXT NOT NULL,
  "template_code" TEXT NOT NULL,
  "submitted_by" TEXT NOT NULL,
  "submitted_by_name" TEXT NOT NULL,
  "form_data_json" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "longitude" DOUBLE PRECISION,
  "is_offline_submitted" BOOLEAN NOT NULL DEFAULT FALSE,
  "submitted_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_signatures" (
  "id" TEXT PRIMARY KEY,
  "signature_code" TEXT NOT NULL UNIQUE,
  "entity_type" TEXT NOT NULL,
  "signer_name" TEXT NOT NULL,
  "signer_role" TEXT NOT NULL,
  "ip_address" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "is_verified" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_notifications" (
  "id" TEXT PRIMARY KEY,
  "recipient_user_id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'TASK',
  "is_delivered" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "sent_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_push_tokens" (
  "id" TEXT PRIMARY KEY,
  "user_id" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "fcm_token" TEXT NOT NULL,
  "apns_token" TEXT,
  "platform" TEXT NOT NULL DEFAULT 'ANDROID',
  "last_registered_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_map_layers" (
  "id" TEXT PRIMARY KEY,
  "layer_code" TEXT NOT NULL UNIQUE,
  "layer_name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'GIS_ASSETS',
  "layer_color" TEXT NOT NULL DEFAULT '#06b6d4',
  "opacity" DOUBLE PRECISION NOT NULL DEFAULT 0.85,
  "is_visible_default" BOOLEAN NOT NULL DEFAULT TRUE,
  "z_index" INTEGER NOT NULL DEFAULT 10,
  "project_id" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_map_markers" (
  "id" TEXT PRIMARY KEY,
  "marker_code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "layer_id" TEXT,
  "project_id" TEXT NOT NULL,
  "marker_type" TEXT NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "elevation_meters" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "attributes_json" TEXT,
  "color_hex" TEXT NOT NULL DEFAULT '#3b82f6',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_location_history" (
  "id" TEXT PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION NOT NULL,
  "longitude" DOUBLE PRECISION NOT NULL,
  "speed_kmph" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "battery_percent" INTEGER NOT NULL DEFAULT 100,
  "captured_at" TEXT NOT NULL,
  "geofence_zone" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase68_mobile_activity_logs" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "user_id" TEXT NOT NULL,
  "user_name" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "ip_address" TEXT,
  "location_text" TEXT,
  "logged_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_master" (
  "id" TEXT PRIMARY KEY,
  "vendor_code" TEXT NOT NULL UNIQUE,
  "company_name" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "trade_name" TEXT,
  "registration_number" TEXT NOT NULL,
  "category_code" TEXT NOT NULL DEFAULT 'PIPES_FITTINGS',
  "contact_person" TEXT NOT NULL DEFAULT 'UNSPECIFIED',
  "tax_identification_number" TEXT NOT NULL,
  "vendor_type" TEXT NOT NULL DEFAULT 'MANUFACTURER',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "website" TEXT,
  "address_street" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'United Arab Emirates',
  "rating_score" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
  "credit_terms_days" INTEGER NOT NULL DEFAULT 60,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "bank_name" TEXT,
  "bank_iban" TEXT,
  "bank_swift" TEXT,
  "is_blacklisted" BOOLEAN NOT NULL DEFAULT FALSE,
  "total_spend_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_categories" (
  "id" TEXT PRIMARY KEY,
  "category_code" TEXT NOT NULL UNIQUE,
  "category_name" TEXT NOT NULL,
  "description" TEXT,
  "parent_category_code" TEXT,
  "risk_level" TEXT NOT NULL DEFAULT 'MEDIUM',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_evaluations" (
  "id" TEXT PRIMARY KEY,
  "evaluation_code" TEXT NOT NULL UNIQUE,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "evaluation_period" TEXT NOT NULL,
  "evaluation_date" TEXT NOT NULL,
  "recommendation_notes" TEXT,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_documents" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "document_type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "file_url" TEXT NOT NULL,
  "issue_date" TEXT NOT NULL,
  "expiry_date" TEXT NOT NULL,
  "verification_status" TEXT NOT NULL DEFAULT 'VERIFIED',
  "is_mandatory" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_prequalification" (
  "id" TEXT PRIMARY KEY,
  "preq_code" TEXT NOT NULL UNIQUE,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "scope_category" TEXT NOT NULL,
  "financial_capacity_aed" DOUBLE PRECISION NOT NULL DEFAULT 10000000,
  "manufacturing_capacity_meters_per_day" INTEGER DEFAULT 1000,
  "major_clients_experience" TEXT,
  "reviewed_by" TEXT NOT NULL,
  "approval_notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_blacklist" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "reason_category" TEXT NOT NULL,
  "blacklisted_date" TEXT NOT NULL,
  "effective_until" TEXT,
  "appeal_status" TEXT NOT NULL DEFAULT 'NONE',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_rfq" (
  "id" TEXT PRIMARY KEY,
  "rfq_number" TEXT NOT NULL UNIQUE,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "requisition_id" TEXT,
  "category" TEXT NOT NULL DEFAULT 'PIPES_FITTINGS',
  "issue_date" TEXT NOT NULL,
  "submission_deadline" TEXT NOT NULL,
  "target_delivery_date" TEXT NOT NULL,
  "delivery_location" TEXT NOT NULL,
  "estimated_budget_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PUBLISHED',
  "quotations_received_count" INTEGER NOT NULL DEFAULT 0,
  "buyer_name" TEXT NOT NULL,
  "terms_and_conditions" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_rfq_items" (
  "id" TEXT PRIMARY KEY,
  "rfq_id" TEXT NOT NULL,
  "item_number" INTEGER NOT NULL,
  "item_code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "specification" TEXT,
  "quantity" DOUBLE PRECISION NOT NULL,
  "uom" TEXT NOT NULL DEFAULT 'MTRS',
  "required_delivery_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_quotations" (
  "id" TEXT PRIMARY KEY,
  "quotation_number" TEXT NOT NULL UNIQUE,
  "rfq_number" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "quote_date" TEXT NOT NULL,
  "validity_days" INTEGER NOT NULL DEFAULT 60,
  "subtotal_amount" DOUBLE PRECISION NOT NULL,
  "tax_vat_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_quote_amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "lead_time_days" INTEGER NOT NULL DEFAULT 30,
  "payment_terms" TEXT NOT NULL DEFAULT '30 Days PDC',
  "incoterms" TEXT NOT NULL DEFAULT 'DDP Site',
  "is_awarded" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'UNDER_EVALUATION',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_quote_comparison" (
  "id" TEXT PRIMARY KEY,
  "comparison_code" TEXT NOT NULL UNIQUE,
  "rfq_id" TEXT NOT NULL,
  "summary_matrix_json" TEXT NOT NULL,
  "recommended_vendor_name" TEXT NOT NULL,
  "recommended_quote_amount" DOUBLE PRECISION NOT NULL,
  "cost_savings_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "savings_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "evaluated_by" TEXT NOT NULL,
  "approved_by" TEXT,
  "comparison_status" TEXT NOT NULL DEFAULT 'APPROVED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_purchase_requisitions" (
  "id" TEXT PRIMARY KEY,
  "pr_number" TEXT NOT NULL UNIQUE,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "department" TEXT NOT NULL DEFAULT 'Civil & Mechanical Construction',
  "requested_by" TEXT NOT NULL,
  "required_date" TEXT NOT NULL,
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "budget_code" TEXT NOT NULL DEFAULT 'WBS-PIPE-MAIN-04',
  "budget_available_aed" DOUBLE PRECISION NOT NULL DEFAULT 5000000,
  "is_budget_approved" BOOLEAN NOT NULL DEFAULT TRUE,
  "stock_check_completed" BOOLEAN NOT NULL DEFAULT TRUE,
  "status" TEXT NOT NULL DEFAULT 'APPROVED',
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Project Engineer',
  "updated_by" TEXT NOT NULL DEFAULT 'Project Engineer',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_purchase_orders" (
  "id" TEXT PRIMARY KEY,
  "po_number" TEXT NOT NULL UNIQUE,
  "rfq_number" TEXT,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "po_date" TEXT NOT NULL,
  "delivery_date" TEXT NOT NULL,
  "delivery_location" TEXT NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "subtotal" DOUBLE PRECISION NOT NULL,
  "vat_rate_percent" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
  "vat_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_amount" DOUBLE PRECISION NOT NULL,
  "payment_terms" TEXT NOT NULL DEFAULT '60 Days Credit from GRN',
  "incoterms" TEXT NOT NULL DEFAULT 'DDP Site',
  "status" TEXT NOT NULL DEFAULT 'ISSUED',
  "approved_by" TEXT NOT NULL DEFAULT 'VP Operations',
  "is_advance_payment_required" BOOLEAN NOT NULL DEFAULT FALSE,
  "advance_payment_percentage" DOUBLE PRECISION DEFAULT 0,
  "retention_percentage" DOUBLE PRECISION DEFAULT 5.0,
  "performance_guarantee_required" BOOLEAN NOT NULL DEFAULT FALSE,
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_po_items" (
  "id" TEXT PRIMARY KEY,
  "po_id" TEXT NOT NULL,
  "po_number" TEXT NOT NULL,
  "item_number" INTEGER NOT NULL,
  "item_code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "ordered_quantity" DOUBLE PRECISION NOT NULL,
  "received_quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "balance_quantity" DOUBLE PRECISION NOT NULL,
  "uom" TEXT NOT NULL DEFAULT 'MTRS',
  "unit_price" DOUBLE PRECISION NOT NULL,
  "total_price" DOUBLE PRECISION NOT NULL,
  "required_date" TEXT,
  "item_status" TEXT NOT NULL DEFAULT 'PENDING_DELIVERY',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_contracts" (
  "id" TEXT PRIMARY KEY,
  "contract_number" TEXT NOT NULL UNIQUE,
  "contract_type" TEXT NOT NULL DEFAULT 'SUBCONTRACT',
  "vendor_name" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "wbs_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "effective_start_date" TEXT NOT NULL,
  "effective_end_date" TEXT NOT NULL,
  "original_contract_value" DOUBLE PRECISION NOT NULL,
  "revised_contract_value" DOUBLE PRECISION NOT NULL,
  "paid_to_date_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "retention_withheld_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "performance_guarantee_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "advance_payment_value" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "currency" TEXT NOT NULL DEFAULT 'AED',
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "defect_liability_period_months" INTEGER NOT NULL DEFAULT 24,
  "contract_manager" TEXT NOT NULL,
  "governing_law" TEXT NOT NULL DEFAULT 'UAE Civil Code / DIAC Arbitration',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Contracts Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Contracts Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_contract_items" (
  "id" TEXT PRIMARY KEY,
  "contract_id" TEXT NOT NULL,
  "item_number" INTEGER NOT NULL,
  "bill_of_quantity_code" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "scope_description" TEXT,
  "contract_quantity" DOUBLE PRECISION NOT NULL,
  "executed_quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "uom" TEXT NOT NULL DEFAULT 'MTRS',
  "unit_rate" DOUBLE PRECISION NOT NULL,
  "total_item_value" DOUBLE PRECISION NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Contracts Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Contracts Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_contract_variations" (
  "id" TEXT PRIMARY KEY,
  "variation_number" TEXT NOT NULL UNIQUE,
  "contract_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "reason_category" TEXT NOT NULL DEFAULT 'SCOPE_EXPANSION',
  "variation_amount" DOUBLE PRECISION NOT NULL,
  "requested_date" TEXT NOT NULL,
  "approval_date" TEXT,
  "approved_by" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PROPOSED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_contract_payments" (
  "id" TEXT PRIMARY KEY,
  "ipc_number" TEXT NOT NULL UNIQUE,
  "contract_number" TEXT NOT NULL,
  "period_start_date" TEXT NOT NULL,
  "period_end_date" TEXT NOT NULL,
  "gross_amount_certified" DOUBLE PRECISION NOT NULL,
  "less_advance_deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "less_retention_deduction" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "net_payable_amount" DOUBLE PRECISION NOT NULL,
  "vat_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_invoice_amount" DOUBLE PRECISION NOT NULL,
  "payment_status" TEXT NOT NULL DEFAULT 'CERTIFIED',
  "paid_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_bank_guarantees" (
  "id" TEXT PRIMARY KEY,
  "bg_number" TEXT NOT NULL UNIQUE,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "contract_number" TEXT NOT NULL,
  "issuing_bank" TEXT NOT NULL,
  "guarantee_type" TEXT NOT NULL DEFAULT 'PERFORMANCE_BOND',
  "issue_date" TEXT NOT NULL,
  "expiry_date" TEXT NOT NULL,
  "claim_period_days" INTEGER NOT NULL DEFAULT 30,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_performance_guarantees" (
  "id" TEXT PRIMARY KEY,
  "guarantee_ref" TEXT NOT NULL UNIQUE,
  "contract_id" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "bond_percentage" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  "valid_from" TEXT NOT NULL,
  "valid_to" TEXT NOT NULL,
  "bank_confirmation_status" TEXT NOT NULL DEFAULT 'AUTHENTICATED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_retention_money" (
  "id" TEXT PRIMARY KEY,
  "retention_code" TEXT NOT NULL UNIQUE,
  "contract_id" TEXT NOT NULL,
  "contract_number" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "total_retention_withheld_aed" DOUBLE PRECISION NOT NULL,
  "first_release_amount_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "second_release_due_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'WITHHELD',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_delivery_schedules" (
  "id" TEXT PRIMARY KEY,
  "schedule_code" TEXT NOT NULL UNIQUE,
  "po_number" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "milestone_name" TEXT NOT NULL,
  "scheduled_date" TEXT NOT NULL,
  "actual_delivery_date" TEXT,
  "item_description" TEXT NOT NULL,
  "scheduled_quantity" DOUBLE PRECISION NOT NULL,
  "delivered_quantity" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "on_time_status" TEXT NOT NULL DEFAULT 'ON_SCHEDULE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_goods_receipts" (
  "id" TEXT PRIMARY KEY,
  "grn_number" TEXT NOT NULL UNIQUE,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "delivery_note_number" TEXT NOT NULL,
  "receipt_date" TEXT NOT NULL,
  "site_location" TEXT NOT NULL,
  "received_by" TEXT NOT NULL,
  "inspected_by" TEXT NOT NULL,
  "inspection_result" TEXT NOT NULL DEFAULT 'ACCEPTED',
  "rejection_reason" TEXT,
  "mir_number" TEXT,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Store Keeper',
  "updated_by" TEXT NOT NULL DEFAULT 'Store Keeper',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_invoice_matching" (
  "id" TEXT PRIMARY KEY,
  "invoice_number" TEXT NOT NULL UNIQUE,
  "po_number" TEXT NOT NULL,
  "grn_number" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "invoice_date" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "invoice_amount_aed" DOUBLE PRECISION NOT NULL,
  "po_amount_aed" DOUBLE PRECISION NOT NULL,
  "grn_amount_aed" DOUBLE PRECISION NOT NULL,
  "price_variance_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "quantity_variance" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "match_status" TEXT NOT NULL DEFAULT 'MATCHED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Finance Officer',
  "updated_by" TEXT NOT NULL DEFAULT 'Finance Officer',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_three_way_matching" (
  "id" TEXT PRIMARY KEY,
  "matching_code" TEXT NOT NULL UNIQUE,
  "po_number" TEXT NOT NULL,
  "grn_number" TEXT NOT NULL,
  "invoice_number" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "po_quantity" DOUBLE PRECISION NOT NULL,
  "grn_quantity" DOUBLE PRECISION NOT NULL,
  "invoice_quantity" DOUBLE PRECISION NOT NULL,
  "po_unit_price" DOUBLE PRECISION NOT NULL,
  "invoice_unit_price" DOUBLE PRECISION NOT NULL,
  "tolerance_percentage" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "is_quantity_matched" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_price_matched" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_approved_for_payment" BOOLEAN NOT NULL DEFAULT TRUE,
  "matching_status" TEXT NOT NULL DEFAULT 'AUTO_RECONCILED',
  "verification_timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Automated 3-Way Engine',
  "updated_by" TEXT NOT NULL DEFAULT 'Automated 3-Way Engine',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_vendor_performance" (
  "id" TEXT PRIMARY KEY,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "evaluation_year" INTEGER NOT NULL DEFAULT 2026,
  "total_orders_count" INTEGER NOT NULL DEFAULT 0,
  "on_time_deliveries_count" INTEGER NOT NULL DEFAULT 0,
  "on_time_delivery_rate_percent" DOUBLE PRECISION NOT NULL DEFAULT 95.0,
  "rejection_rate_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
  "price_competitiveness_score" DOUBLE PRECISION NOT NULL DEFAULT 90.0,
  "average_lead_time_days" DOUBLE PRECISION NOT NULL DEFAULT 25.0,
  "overall_score" DOUBLE PRECISION NOT NULL DEFAULT 92.5,
  "performance_tier" TEXT NOT NULL DEFAULT 'TIER_1_STRATEGIC',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_supplier_scorecards" (
  "id" TEXT PRIMARY KEY,
  "scorecard_code" TEXT NOT NULL UNIQUE,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "quarter_period" TEXT NOT NULL,
  "delivery_kpi_score" DOUBLE PRECISION NOT NULL DEFAULT 92.0,
  "commercial_kpi_score" DOUBLE PRECISION NOT NULL DEFAULT 89.0,
  "service_kpi_score" DOUBLE PRECISION NOT NULL DEFAULT 96.0,
  "overall_index" DOUBLE PRECISION NOT NULL DEFAULT 92.8,
  "grade_rank" TEXT NOT NULL DEFAULT 'A+',
  "improvement_action_plan" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_contract_closures" (
  "id" TEXT PRIMARY KEY,
  "closure_code" TEXT NOT NULL UNIQUE,
  "contract_id" TEXT NOT NULL,
  "contract_number" TEXT NOT NULL,
  "vendor_name" TEXT NOT NULL,
  "final_account_value_aed" DOUBLE PRECISION NOT NULL,
  "total_deductions_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "net_final_payment_aed" DOUBLE PRECISION NOT NULL,
  "toc_issued_date" TEXT NOT NULL,
  "is_no_claims_certificate_signed" BOOLEAN NOT NULL DEFAULT TRUE,
  "closure_status" TEXT NOT NULL DEFAULT 'CLOSED_OUT',
  "closure_date" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Contracts Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Contracts Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase69_procurement_audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "reference_number" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL,
  "details_json" TEXT,
  "timestamp" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Procurement Auditor',
  "updated_by" TEXT NOT NULL DEFAULT 'Procurement Auditor',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_departments" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "head_of_department" TEXT,
  "budget_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "location" TEXT NOT NULL DEFAULT 'Head Office',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_designations" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "department_id" TEXT,
  "grade_level" TEXT NOT NULL DEFAULT 'L3',
  "min_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "max_salary" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_employee_master" (
  "id" TEXT PRIMARY KEY,
  "employee_code" TEXT NOT NULL UNIQUE,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT NOT NULL UNIQUE,
  "phone" TEXT NOT NULL,
  "gender" TEXT NOT NULL DEFAULT 'MALE',
  "date_of_birth" TEXT NOT NULL,
  "national_id" TEXT,
  "passport_number" TEXT,
  "visa_status" TEXT NOT NULL DEFAULT 'EMPLOYMENT_RESIDENCE',
  "joining_date" TEXT NOT NULL,
  "department_id" TEXT NOT NULL,
  "designation_id" TEXT NOT NULL,
  "reporting_manager_id" TEXT,
  "employment_type" TEXT NOT NULL DEFAULT 'FULL_TIME',
  "work_location" TEXT NOT NULL DEFAULT 'Unspecified',
  "project_id" TEXT,
  "biometric_id" TEXT,
  "employment_status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "grade" TEXT NOT NULL DEFAULT 'L3',
  "notice_period_days" INTEGER NOT NULL DEFAULT 30,
  "probation_end_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_salary_structures" (
  "id" TEXT PRIMARY KEY,
  "structure_code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "grade" TEXT NOT NULL DEFAULT 'L3',
  "base_monthly_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "hra_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "conveyance_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "medical_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "special_allowance_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "site_allowance_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "ot_rate_per_hour" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pf_applicable" BOOLEAN NOT NULL DEFAULT TRUE,
  "esi_applicable" BOOLEAN NOT NULL DEFAULT FALSE,
  "pt_applicable" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "effective_from" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_payroll_periods" (
  "id" TEXT PRIMARY KEY,
  "period_code" TEXT NOT NULL UNIQUE,
  "month_year" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "total_working_days" INTEGER NOT NULL DEFAULT 30,
  "cutoff_date" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "approved_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Payroll Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Payroll Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_pay_slips" (
  "id" TEXT PRIMARY KEY,
  "slip_number" TEXT NOT NULL UNIQUE,
  "payroll_run_id" TEXT NOT NULL,
  "period_id" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "department" TEXT NOT NULL,
  "designation" TEXT NOT NULL,
  "basic_salary_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "hra_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "da_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "allowances_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overtime_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "overtime_amount_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bonus_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "gross_earnings_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pf_deduction_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "esi_deduction_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "pt_deduction_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tds_deduction_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "loan_emi_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "advance_deduction_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_deductions_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "net_salary_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "payment_mode" TEXT NOT NULL DEFAULT 'WPS_DIRECT_TRANSFER',
  "payment_status" TEXT NOT NULL DEFAULT 'PAID',
  "payment_reference" TEXT,
  "disbursement_date" TEXT,
  "is_hold" BOOLEAN NOT NULL DEFAULT FALSE,
  "hold_reason" TEXT,
  "held_by" TEXT,
  "held_at" TEXT,
  "unheld_reason" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Payroll Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Payroll Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_attendance" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT NOT NULL,
  "employee_code" TEXT NOT NULL,
  "attendance_date" TEXT NOT NULL,
  "shift_id" TEXT,
  "in_time" TEXT,
  "out_time" TEXT,
  "total_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "late_minutes" INTEGER NOT NULL DEFAULT 0,
  "early_exit_minutes" INTEGER NOT NULL DEFAULT 0,
  "overtime_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PRESENT',
  "longitude" DOUBLE PRECISION,
  "device_id" TEXT,
  "action_taken" TEXT,
  "payload_sent" TEXT,
  "raw_response" TEXT,
  "status_code" TEXT,
  "execution_duration_ms" REAL,
  "is_verified" BOOLEAN NOT NULL DEFAULT TRUE,
  "verified_by" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Biometric Engine',
  "updated_by" TEXT NOT NULL DEFAULT 'Biometric Engine',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_shift_master" (
  "id" TEXT PRIMARY KEY,
  "shift_code" TEXT NOT NULL UNIQUE,
  "shift_name" TEXT NOT NULL,
  "start_time" TEXT NOT NULL,
  "break_duration_minutes" INTEGER NOT NULL DEFAULT 60,
  "total_shift_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "is_night_shift" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_overnight" BOOLEAN NOT NULL DEFAULT FALSE,
  "color_tag" TEXT NOT NULL DEFAULT '#3B82F6',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_leave_types" (
  "id" TEXT PRIMARY KEY,
  "type_code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "annual_quota_days" INTEGER NOT NULL DEFAULT 30,
  "is_carry_forward" BOOLEAN NOT NULL DEFAULT TRUE,
  "max_carry_forward_days" INTEGER NOT NULL DEFAULT 15,
  "is_encashable" BOOLEAN NOT NULL DEFAULT TRUE,
  "requires_medical_cert" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_paid" BOOLEAN NOT NULL DEFAULT TRUE,
  "color_code" TEXT NOT NULL DEFAULT '#10B981',
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_leave_requests" (
  "id" TEXT PRIMARY KEY,
  "request_number" TEXT NOT NULL UNIQUE,
  "employee_id" TEXT NOT NULL,
  "leave_type_id" TEXT NOT NULL,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "total_days" DOUBLE PRECISION NOT NULL DEFAULT 1,
  "reason" TEXT NOT NULL,
  "contact_during_leave" TEXT,
  "attachment_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "approval_remarks" TEXT,
  "reviewed_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Employee',
  "updated_by" TEXT NOT NULL DEFAULT 'Employee',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_holidays" (
  "id" TEXT PRIMARY KEY,
  "holiday_name" TEXT NOT NULL,
  "holiday_date" TEXT NOT NULL,
  "day_of_week" TEXT NOT NULL,
  "holiday_type" TEXT NOT NULL DEFAULT 'NATIONAL',
  "applicable_locations" TEXT NOT NULL DEFAULT 'ALL',
  "year" INTEGER NOT NULL DEFAULT 2026,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_loans" (
  "id" TEXT PRIMARY KEY,
  "loan_code" TEXT NOT NULL UNIQUE,
  "employee_id" TEXT NOT NULL,
  "employee_code" TEXT,
  "employee_name" TEXT,
  "loan_type" TEXT NOT NULL DEFAULT 'PERSONAL',
  "interest_rate" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "tenure_months" INTEGER NOT NULL DEFAULT 12,
  "monthly_emi_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "requested_amount_aed" DOUBLE PRECISION DEFAULT 0,
  "opening_balance_aed" DOUBLE PRECISION DEFAULT 0,
  "total_repayable_aed" DOUBLE PRECISION DEFAULT 0,
  "balance_outstanding_aed" DOUBLE PRECISION DEFAULT 0,
  "total_recovered_aed" DOUBLE PRECISION DEFAULT 0,
  "repayment_method" TEXT DEFAULT 'PER_DUTY_DAY',
  "repayment_rate" DOUBLE PRECISION DEFAULT 1000,
  "repayment_frequency" TEXT DEFAULT 'PER_DUTY_DAY',
  "purpose" TEXT,
  "total_repaid_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "outstanding_balance_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "disbursement_date" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "approved_at" TEXT,
  "audit_trail" JSONB,
  "deduction_start_month" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Finance Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_training_programs" (
  "id" TEXT PRIMARY KEY,
  "program_code" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "trainer_name" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'SAFETY_HSE',
  "end_date" TEXT NOT NULL,
  "duration_hours" DOUBLE PRECISION NOT NULL DEFAULT 8,
  "venue_or_link" TEXT NOT NULL DEFAULT 'Main Auditorium / Virtual',
  "max_participants" INTEGER NOT NULL DEFAULT 30,
  "cost_per_head_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'L&D Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'L&D Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_performance_reviews" (
  "id" TEXT PRIMARY KEY,
  "review_code" TEXT NOT NULL UNIQUE,
  "employee_id" TEXT NOT NULL,
  "reviewer_id" TEXT NOT NULL,
  "review_period" TEXT NOT NULL DEFAULT 'ANNUAL_2026',
  "review_year" INTEGER NOT NULL DEFAULT 2026,
  "self_rating" DOUBLE PRECISION NOT NULL DEFAULT 4.2,
  "manager_rating" DOUBLE PRECISION NOT NULL DEFAULT 4.4,
  "committee_rating" DOUBLE PRECISION NOT NULL DEFAULT 4.5,
  "final_score" DOUBLE PRECISION NOT NULL DEFAULT 4.4,
  "performance_tier" TEXT NOT NULL DEFAULT 'EXCEEDS_EXPECTATIONS',
  "development_areas" TEXT,
  "recommended_salary_hike_percent" DOUBLE PRECISION NOT NULL DEFAULT 8.5,
  "recommended_promotion" BOOLEAN NOT NULL DEFAULT FALSE,
  "status" TEXT NOT NULL DEFAULT 'FINALIZED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Reviewer',
  "updated_by" TEXT NOT NULL DEFAULT 'Reviewer',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_recruitment" (
  "id" TEXT PRIMARY KEY,
  "requisition_code" TEXT NOT NULL UNIQUE,
  "position_title" TEXT NOT NULL,
  "department_id" TEXT NOT NULL,
  "vacancies_count" INTEGER NOT NULL DEFAULT 1,
  "experience_years_required" DOUBLE PRECISION NOT NULL DEFAULT 3,
  "min_qualification" TEXT NOT NULL DEFAULT 'Bachelor of Engineering',
  "target_hiring_date" TEXT NOT NULL,
  "salary_budget_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "hiring_manager_id" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'HIGH',
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Talent Acquisition',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Talent Acquisition',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_candidates" (
  "id" TEXT PRIMARY KEY,
  "candidate_code" TEXT NOT NULL UNIQUE,
  "job_opening_id" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "current_company" TEXT,
  "current_designation" TEXT,
  "total_experience_years" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notice_period_days" INTEGER NOT NULL DEFAULT 30,
  "current_ctc_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "expected_ctc_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "resume_url" TEXT,
  "status" TEXT NOT NULL DEFAULT 'APPLIED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Talent Acquisition',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Talent Acquisition',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_hr_notifications" (
  "id" TEXT PRIMARY KEY,
  "notification_type" TEXT NOT NULL DEFAULT 'SYSTEM',
  "message" TEXT NOT NULL,
  "action_url" TEXT,
  "is_read" BOOLEAN NOT NULL DEFAULT FALSE,
  "read_at" TEXT,
  "priority" TEXT NOT NULL DEFAULT 'NORMAL',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR System',
  "updated_by" TEXT NOT NULL DEFAULT 'HR System',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase70_hr_audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "reference_number" TEXT NOT NULL,
  "performed_by" TEXT NOT NULL,
  "details_json" TEXT,
  "timestamp" TEXT NOT NULL,
  "ip_address" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'HR Auditor',
  "updated_by" TEXT NOT NULL DEFAULT 'HR Auditor',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_categories" (
  "id" TEXT PRIMARY KEY,
  "category_code" TEXT NOT NULL UNIQUE,
  "category_name" TEXT NOT NULL,
  "description" TEXT,
  "default_depreciation_years" INTEGER NOT NULL DEFAULT 10,
  "icon" TEXT NOT NULL DEFAULT 'Wrench',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_groups" (
  "id" TEXT PRIMARY KEY,
  "group_code" TEXT NOT NULL UNIQUE,
  "group_name" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "description" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_locations" (
  "id" TEXT PRIMARY KEY,
  "location_code" TEXT NOT NULL UNIQUE,
  "location_name" TEXT NOT NULL,
  "site_name" TEXT NOT NULL DEFAULT 'Main Plant / Central Yard',
  "zone" TEXT,
  "building" TEXT,
  "floor" TEXT,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_master" (
  "id" TEXT PRIMARY KEY,
  "asset_code" TEXT NOT NULL UNIQUE,
  "asset_name" TEXT NOT NULL,
  "category_id" TEXT NOT NULL,
  "group_id" TEXT,
  "location_id" TEXT,
  "parent_asset_id" TEXT,
  "serial_number" TEXT,
  "model_number" TEXT,
  "manufacturer" TEXT,
  "barcode" TEXT,
  "rfid_tag" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPERATIONAL',
  "criticality" TEXT NOT NULL DEFAULT 'MEDIUM',
  "purchase_date" TEXT,
  "purchase_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "current_book_value_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "warranty_expiry_date" TEXT,
  "operating_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "running_meter_reading" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "meter_unit" TEXT NOT NULL DEFAULT 'HOURS',
  "assigned_to_employee_id" TEXT,
  "department" TEXT NOT NULL DEFAULT 'Plant & Machinery',
  "project_id" TEXT,
  "specifications_json" TEXT,
  "photo_url" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_specifications" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "spec_name" TEXT NOT NULL,
  "spec_value" TEXT NOT NULL,
  "unit_of_measure" TEXT,
  "is_critical" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_hierarchy" (
  "id" TEXT PRIMARY KEY,
  "parent_asset_id" TEXT NOT NULL,
  "child_asset_id" TEXT NOT NULL,
  "hierarchy_level" INTEGER NOT NULL DEFAULT 1,
  "relation_type" TEXT NOT NULL DEFAULT 'SUB_ASSET',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_criticality" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL UNIQUE,
  "safety_impact_score" INTEGER NOT NULL DEFAULT 3,
  "environmental_impact_score" INTEGER NOT NULL DEFAULT 3,
  "production_loss_score" INTEGER NOT NULL DEFAULT 3,
  "maintenance_cost_score" INTEGER NOT NULL DEFAULT 3,
  "spare_lead_time_score" INTEGER NOT NULL DEFAULT 3,
  "total_risk_score" INTEGER NOT NULL DEFAULT 15,
  "rcm_category" TEXT NOT NULL DEFAULT 'CLASS_A_CRITICAL',
  "recommendations" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_lifecycle" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "stage" TEXT NOT NULL,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT,
  "expected_useful_life_years" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "accumulated_operating_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_acquisition" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "po_number" TEXT,
  "vendor_name" TEXT NOT NULL,
  "invoice_number" TEXT,
  "purchase_price_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "customs_duty_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "freight_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "installation_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_capitalized_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "delivery_date" TEXT,
  "commissioning_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_depreciation" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "fiscal_year" TEXT NOT NULL,
  "depreciation_method" TEXT NOT NULL DEFAULT 'STRAIGHT_LINE',
  "opening_book_value_aed" DOUBLE PRECISION NOT NULL,
  "depreciation_rate_percent" DOUBLE PRECISION NOT NULL DEFAULT 10,
  "depreciation_amount_aed" DOUBLE PRECISION NOT NULL,
  "closing_book_value_aed" DOUBLE PRECISION NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Finance',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Finance',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_warranty" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "warranty_type" TEXT NOT NULL DEFAULT 'OEM_COMPREHENSIVE',
  "provider_name" TEXT NOT NULL,
  "policy_number" TEXT,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "coverage_details" TEXT,
  "contact_person" TEXT,
  "contact_phone" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_manuals" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "doc_title" TEXT NOT NULL,
  "doc_type" TEXT NOT NULL DEFAULT 'OEM_MANUAL',
  "file_url" TEXT NOT NULL,
  "version" TEXT NOT NULL DEFAULT 'v1.0',
  "file_size_bytes" INTEGER NOT NULL DEFAULT 1024,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_photos" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "photo_url" TEXT NOT NULL,
  "photo_caption" TEXT,
  "photo_type" TEXT NOT NULL DEFAULT 'NAMEPLATE',
  "taken_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'EAM Inspector',
  "updated_by" TEXT NOT NULL DEFAULT 'EAM Inspector',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_preventive_maintenance_plans" (
  "id" TEXT PRIMARY KEY,
  "plan_code" TEXT NOT NULL UNIQUE,
  "plan_title" TEXT NOT NULL,
  "category_id" TEXT,
  "asset_id" TEXT,
  "frequency_type" TEXT NOT NULL DEFAULT 'TIME_BASED',
  "interval_days" INTEGER NOT NULL DEFAULT 30,
  "meter_interval" DOUBLE PRECISION NOT NULL DEFAULT 500,
  "estimated_duration_hours" DOUBLE PRECISION NOT NULL DEFAULT 4,
  "required_crew_count" INTEGER NOT NULL DEFAULT 2,
  "estimated_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 1500,
  "checklist_template_json" TEXT,
  "safety_guidelines" TEXT,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Maintenance Planner',
  "updated_by" TEXT NOT NULL DEFAULT 'Maintenance Planner',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_schedules" (
  "id" TEXT PRIMARY KEY,
  "schedule_code" TEXT NOT NULL UNIQUE,
  "plan_id" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "scheduled_date" TEXT NOT NULL,
  "due_date" TEXT NOT NULL,
  "trigger_source" TEXT NOT NULL DEFAULT 'CALENDAR_CADENCE',
  "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
  "assigned_team" TEXT NOT NULL DEFAULT 'Mechanical Maintenance Crew A',
  "lead_technician_id" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Maintenance Planner',
  "updated_by" TEXT NOT NULL DEFAULT 'Maintenance Planner',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_work_orders" (
  "id" TEXT PRIMARY KEY,
  "work_order_number" TEXT NOT NULL UNIQUE,
  "title" TEXT NOT NULL,
  "work_order_type" TEXT NOT NULL DEFAULT 'PREVENTIVE',
  "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
  "asset_id" TEXT NOT NULL,
  "schedule_id" TEXT,
  "breakdown_id" TEXT,
  "work_order_id" TEXT,
  "status" TEXT NOT NULL DEFAULT 'OPEN',
  "requested_by" TEXT NOT NULL DEFAULT 'Operations Supervisor',
  "assigned_to" TEXT NOT NULL DEFAULT 'Sr. Maintenance Engineer',
  "planned_start_date" TEXT NOT NULL,
  "planned_end_date" TEXT NOT NULL,
  "actual_start_date" TEXT,
  "actual_end_date" TEXT,
  "total_labor_hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_labor_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_parts_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_other_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_cost_aed" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "failure_code" TEXT,
  "resolution_summary" TEXT,
  "is_downtime_caused" BOOLEAN NOT NULL DEFAULT FALSE,
  "downtime_minutes" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Maintenance Admin',
  "updated_by" TEXT NOT NULL DEFAULT 'Maintenance Admin',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_tasks" (
  "id" TEXT PRIMARY KEY,
  "work_order_id" TEXT NOT NULL,
  "task_sequence" INTEGER NOT NULL DEFAULT 1,
  "task_description" TEXT NOT NULL,
  "task_type" TEXT NOT NULL DEFAULT 'INSPECTION_SERVICE',
  "estimated_minutes" INTEGER NOT NULL DEFAULT 60,
  "actual_minutes" INTEGER NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'PENDING',
  "completed_by" TEXT,
  "completed_at" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Maintenance Tech',
  "updated_by" TEXT NOT NULL DEFAULT 'Maintenance Tech',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_checklists" (
  "id" TEXT PRIMARY KEY,
  "work_order_id" TEXT NOT NULL,
  "task_id" TEXT,
  "check_item" TEXT NOT NULL,
  "expected_condition" TEXT NOT NULL,
  "observed_condition" TEXT,
  "is_passed" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_mandatory" BOOLEAN NOT NULL DEFAULT TRUE,
  "checked_by" TEXT,
  "checked_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL DEFAULT 'Health Sentinel',
  "updated_by" TEXT NOT NULL DEFAULT 'Health Sentinel',
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "fleet_vehicles" (
  "id" TEXT PRIMARY KEY,
  "vehicle_number" TEXT NOT NULL,
  "vehicle_type" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "year" INTEGER NOT NULL,
  "chassis_number" TEXT,
  "engine_number" TEXT,
  "fuel_type" TEXT NOT NULL,
  "tank_capacity_liters" DOUBLE PRECISION,
  "current_odometer_km" DOUBLE PRECISION,
  "status" TEXT NOT NULL,
  "assigned_project_id" TEXT,
  "assigned_project_name" TEXT,
  "assigned_site_id" TEXT,
  "assigned_site_name" TEXT,
  "assigned_driver_id" TEXT,
  "assigned_driver_name" TEXT,
  "insurance_policy_number" TEXT,
  "insurance_expiry" TEXT,
  "rc_expiry" TEXT,
  "fitness_expiry" TEXT,
  "pollution_expiry" TEXT,
  "permit_expiry" TEXT,
  "road_tax_expiry" TEXT,
  "documents" JSONB,
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "fleet_drivers" (
  "id" TEXT PRIMARY KEY,
  "driver_name" TEXT NOT NULL,
  "license_number" TEXT NOT NULL,
  "license_category" TEXT NOT NULL,
  "license_expiry" TEXT,
  "medical_expiry" TEXT,
  "assigned_vehicle_id" TEXT,
  "assigned_vehicle_number" TEXT,
  "experience_years" INTEGER,
  "contact_number" TEXT,
  "email" TEXT,
  "emergency_contact_name" TEXT,
  "emergency_contact_relation" TEXT,
  "emergency_contact_phone" TEXT,
  "status" TEXT NOT NULL,
  "documents" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "fleet_equipment" (
  "id" TEXT PRIMARY KEY,
  "equipment_code" TEXT NOT NULL,
  "equipment_name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "manufacturer" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "serial_number" TEXT,
  "purchase_date" TEXT,
  "warranty_expiry" TEXT,
  "current_location" TEXT,
  "assigned_project_id" TEXT,
  "assigned_project_name" TEXT,
  "assigned_site_id" TEXT,
  "assigned_site_name" TEXT,
  "assigned_operator_id" TEXT,
  "assigned_operator_name" TEXT,
  "running_hours" DOUBLE PRECISION,
  "fuel_capacity_liters" DOUBLE PRECISION,
  "status" TEXT NOT NULL,
  "notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "fleet_fuel_logs" (
  "id" TEXT PRIMARY KEY,
  "fuel_log_code" TEXT NOT NULL,
  "asset_type" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "asset_name" TEXT,
  "asset_code" TEXT,
  "quantity_liters" DOUBLE PRECISION NOT NULL,
  "unit_price" DOUBLE PRECISION NOT NULL,
  "total_cost" DOUBLE PRECISION NOT NULL,
  "fuel_station" TEXT,
  "odometer_reading_km" DOUBLE PRECISION,
  "running_hours" DOUBLE PRECISION,
  "mileage_calculated" DOUBLE PRECISION,
  "project_id" TEXT,
  "project_name" TEXT,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "site_id" TEXT,
  "site_name" TEXT,
  "filled_by_id" TEXT,
  "filled_by_name" TEXT,
  "fill_date" TEXT NOT NULL,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "fleet_maintenance" (
  "id" TEXT PRIMARY KEY,
  "maintenance_code" TEXT NOT NULL,
  "asset_type" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "asset_name" TEXT,
  "asset_code" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "maintenance_type" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "service_date" TEXT NOT NULL,
  "completion_date" TEXT,
  "odometer_km" DOUBLE PRECISION,
  "running_hours" DOUBLE PRECISION,
  "cost_amount" DOUBLE PRECISION,
  "vendor_name" TEXT,
  "invoice_number" TEXT,
  "description" TEXT,
  "performed_by" TEXT,
  "status" TEXT NOT NULL,
  "next_service_due_km" DOUBLE PRECISION,
  "next_service_due_date" TEXT,
  "next_service_due_hours" DOUBLE PRECISION,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "fleet_trip_logs" (
  "id" TEXT PRIMARY KEY,
  "trip_code" TEXT NOT NULL,
  "vehicle_id" TEXT NOT NULL,
  "vehicle_number" TEXT,
  "driver_id" TEXT NOT NULL,
  "driver_name" TEXT,
  "origin" TEXT,
  "destination" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "site_id" TEXT,
  "site_name" TEXT,
  "purpose" TEXT,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT,
  "start_odometer_km" DOUBLE PRECISION NOT NULL,
  "end_odometer_km" DOUBLE PRECISION,
  "distance_km" DOUBLE PRECISION,
  "fuel_used_liters" DOUBLE PRECISION,
  "gate_pass_ref" TEXT,
  "notes" TEXT,
  "status" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "fleet_notifications" (
  "id" TEXT PRIMARY KEY,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "urgency" TEXT NOT NULL,
  "asset_id" TEXT,
  "asset_name" TEXT,
  "asset_type" TEXT,
  "due_date" TEXT,
  "days_remaining" INTEGER,
  "read" BOOLEAN,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_employees" (
  "id" TEXT PRIMARY KEY,
  "employee_code" TEXT NOT NULL,
  "photo_url" TEXT,
  "full_name" TEXT NOT NULL,
  "mobile" TEXT,
  "email" TEXT,
  "address" TEXT,
  "emergency_contact" JSONB,
  "date_of_birth" TEXT,
  "joining_date" TEXT,
  "department" TEXT,
  "designation" TEXT,
  "branch" TEXT,
  "role" TEXT,
  "reporting_manager" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "site_assignment" TEXT,
  "employment_type" TEXT,
  "salary_structure" JSONB,
  "status" TEXT,
  "documents" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_attendances" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT NOT NULL,
  "employee_code" TEXT,
  "employee_name" TEXT,
  "department" TEXT,
  "date" TEXT NOT NULL,
  "check_in" TEXT,
  "check_out" TEXT,
  "shift" TEXT,
  "status" TEXT,
  "late_minutes" INTEGER,
  "early_exit_minutes" INTEGER,
  "overtime_hours" DOUBLE PRECISION,
  "working_hours" DOUBLE PRECISION,
  "location_punch_in" TEXT,
  "location_punch_out" TEXT,
  "essl_device_id" TEXT,
  "is_manual_entry" BOOLEAN,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_payrolls" (
  "id" TEXT PRIMARY KEY,
  "payroll_month" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "employee_code" TEXT,
  "employee_name" TEXT,
  "designation" TEXT,
  "department" TEXT,
  "bank_account" TEXT,
  "bank_name" TEXT,
  "days_in_month" INTEGER,
  "days_worked" INTEGER,
  "paid_leaves" INTEGER,
  "unpaid_leaves" INTEGER,
  "overtime_hours" DOUBLE PRECISION,
  "basic_earned_usd" DOUBLE PRECISION,
  "hra_earned_usd" DOUBLE PRECISION,
  "da_earned_usd" DOUBLE PRECISION,
  "allowances_usd" DOUBLE PRECISION,
  "overtime_pay_usd" DOUBLE PRECISION,
  "bonus_usd" DOUBLE PRECISION,
  "gross_salary_usd" DOUBLE PRECISION,
  "pf_deduction_usd" DOUBLE PRECISION,
  "esi_deduction_usd" DOUBLE PRECISION,
  "tax_tds_usd" DOUBLE PRECISION,
  "other_deductions_usd" DOUBLE PRECISION,
  "total_deductions_usd" DOUBLE PRECISION,
  "net_salary_usd" DOUBLE PRECISION,
  "payment_status" TEXT NOT NULL,
  "payment_date" TEXT,
  "utr_reference" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_leave_requests" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT NOT NULL,
  "employee_name" TEXT,
  "leave_category" TEXT NOT NULL,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "total_days" DOUBLE PRECISION NOT NULL,
  "reason" TEXT,
  "status" TEXT NOT NULL,
  "applied_on" TEXT NOT NULL,
  "approved_by" TEXT,
  "manager_remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_leave_balances" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT,
  "balances" JSONB NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_labour_workers" (
  "id" TEXT PRIMARY KEY,
  "worker_code" TEXT NOT NULL,
  "full_name" TEXT NOT NULL,
  "skill_category" TEXT,
  "contractor_name" TEXT,
  "daily_wage_rate_usd" DOUBLE PRECISION,
  "overtime_hourly_rate_usd" DOUBLE PRECISION,
  "assigned_project_id" TEXT,
  "assigned_project_name" TEXT,
  "assigned_site" TEXT,
  "mobile" TEXT,
  "status" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_labour_allocations" (
  "id" TEXT PRIMARY KEY,
  "date" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "wbs_id" TEXT,
  "boq_item_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "site_name" TEXT,
  "contractor_name" TEXT,
  "skilled_workers_count" INTEGER,
  "unskilled_workers_count" INTEGER,
  "regular_hours" DOUBLE PRECISION,
  "overtime_hours" DOUBLE PRECISION,
  "total_labor_cost_usd" DOUBLE PRECISION,
  "supervisor_incharge" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_duty_logs" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT NOT NULL,
  "employee_name" TEXT,
  "date" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "site_name" TEXT,
  "work_description" TEXT,
  "working_hours" DOUBLE PRECISION,
  "equipment_used" JSONB,
  "vehicle_used" JSONB,
  "materials_used" JSONB,
  "remarks" TEXT,
  "photo_url" TEXT,
  "verified_by" TEXT,
  "approved_by" TEXT,
  "status" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_essl_devices" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "device_name" TEXT NOT NULL,
  "site_location" TEXT,
  "ip_address" TEXT,
  "port" INTEGER,
  "status" TEXT,
  "last_sync_time" TEXT,
  "total_logs_today" INTEGER,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_attendance_corrections" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT NOT NULL,
  "employee_name" TEXT,
  "date" TEXT,
  "original_check_in" TEXT,
  "original_check_out" TEXT,
  "requested_check_in" TEXT,
  "requested_check_out" TEXT,
  "reason" TEXT,
  "status" TEXT,
  "applied_on" TEXT,
  "reviewed_by" TEXT,
  "review_remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_notifications" (
  "id" TEXT PRIMARY KEY,
  "title" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "timestamp" TEXT NOT NULL,
  "is_read" BOOLEAN,
  "action_url" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_statutory_rules" (
  "id" TEXT PRIMARY KEY,
  "rule_code" TEXT NOT NULL UNIQUE,
  "jurisdiction" TEXT NOT NULL DEFAULT 'INDIA',
  "description" TEXT,
  "effective_from" TEXT NOT NULL,
  "effective_to" TEXT,
  "parameters" JSONB NOT NULL,
  "is_active" BOOLEAN NOT NULL DEFAULT TRUE,
  "created_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_employee_statutory_profiles" (
  "id" TEXT PRIMARY KEY,
  "employee_id" TEXT NOT NULL UNIQUE,
  "employee_code" TEXT NOT NULL,
  "statutory_jurisdiction" TEXT NOT NULL DEFAULT 'INDIA',
  "uan_number" TEXT,
  "pf_number" TEXT,
  "pf_opt_out" BOOLEAN NOT NULL DEFAULT FALSE,
  "vpf_percentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "esi_number" TEXT,
  "esi_applicable" BOOLEAN NOT NULL DEFAULT TRUE,
  "pan_number" TEXT,
  "tax_regime" TEXT NOT NULL DEFAULT 'NEW_REGIME',
  "gratuity_enrolled" BOOLEAN NOT NULL DEFAULT TRUE,
  "gratuity_accrued_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "bank_account_number" TEXT,
  "bank_ifsc_code" TEXT,
  "bank_name" TEXT,
  "branch_name" TEXT,
  "payment_mode" TEXT NOT NULL DEFAULT 'NEFT_RTGS',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_payroll_runs" (
  "id" TEXT PRIMARY KEY,
  "run_number" TEXT NOT NULL UNIQUE,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "exchange_rate_to_inr" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  "total_employees" INTEGER NOT NULL DEFAULT 0,
  "total_gross_pay" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_deductions" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_net_pay" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_employer_pf" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_employer_esi" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_gratuity_accrual" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_tds" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "total_pt" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "maker_user_name" TEXT,
  "maker_timestamp" TEXT,
  "checker_user_id" TEXT,
  "checker_user_name" TEXT,
  "checker_timestamp" TEXT,
  "checker_remarks" TEXT,
  "is_locked" BOOLEAN NOT NULL DEFAULT FALSE,
  "lock_hash" TEXT,
  "disbursed_at" TEXT,
  "neft_batch_reference" TEXT,
  "audit_trail" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_audit_trail" (
  "id" TEXT PRIMARY KEY,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "user_id" TEXT,
  "user_name" TEXT,
  "user_role" TEXT,
  "details" JSONB,
  "previous_state" JSONB,
  "new_state" JSONB,
  "ip_address" TEXT,
  "timestamp" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "kwa_projects" (
  "id" TEXT PRIMARY KEY,
  "code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "client" TEXT,
  "type" TEXT,
  "location" TEXT,
  "status" TEXT,
  "progress" DOUBLE PRECISION,
  "budget_inr" TEXT,
  "spent_inr" TEXT,
  "start_date" TEXT,
  "target_completion_date" TEXT,
  "pipe_material" TEXT,
  "pipe_diameter_mm" INTEGER,
  "total_length_km" DOUBLE PRECISION,
  "laid_length_km" DOUBLE PRECISION,
  "valve_count_installed" INTEGER,
  "pumps_installed" INTEGER,
  "scada_status" TEXT,
  "civil_progress" DOUBLE PRECISION,
  "mechanical_progress" DOUBLE PRECISION,
  "electrical_progress" DOUBLE PRECISION,
  "testing_progress" DOUBLE PRECISION,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "kwa_pipeline_sections" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "section_name" TEXT NOT NULL,
  "pipe_material" TEXT,
  "pipe_diameter_mm" INTEGER,
  "pipe_class" TEXT,
  "total_length_meters" DOUBLE PRECISION,
  "laid_length_meters" DOUBLE PRECISION,
  "remaining_length_meters" DOUBLE PRECISION,
  "start_chainage" TEXT,
  "end_chainage" TEXT,
  "gps_start_location" TEXT,
  "gps_end_location" TEXT,
  "total_joints" INTEGER,
  "completed_joints" INTEGER,
  "crossing_type" TEXT,
  "status" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "kwa_valves" (
  "id" TEXT PRIMARY KEY,
  "valve_number" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "valve_type" TEXT,
  "size_mm" INTEGER,
  "rating_pn" TEXT,
  "actuator" TEXT,
  "chainage_location" TEXT,
  "gps_coordinates" TEXT,
  "installation_date" TEXT,
  "chamber_built" BOOLEAN,
  "testing_status" TEXT,
  "inspected_by" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "kwa_test_reports" (
  "id" TEXT PRIMARY KEY,
  "test_no" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "test_type" TEXT,
  "chainage_section" TEXT,
  "pipe_diameter_mm" INTEGER,
  "test_pressure_bar" DOUBLE PRECISION,
  "holding_duration_minutes" INTEGER,
  "allowable_drop_bar" DOUBLE PRECISION,
  "actual_drop_bar" DOUBLE PRECISION,
  "test_result" TEXT,
  "kwa_witness_officer" TEXT,
  "test_date" TEXT,
  "certificate_ref" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "kwa_daily_reports" (
  "id" TEXT PRIMARY KEY,
  "dpr_number" TEXT NOT NULL,
  "date" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "site_location" TEXT,
  "weather" TEXT,
  "start_chainage" TEXT,
  "end_chainage" TEXT,
  "work_category" TEXT,
  "work_done_details" TEXT,
  "quantity_laid_meters" DOUBLE PRECISION,
  "joints_completed_count" INTEGER,
  "manpower_count" JSONB,
  "equipment_used" JSONB,
  "vehicles_used" JSONB,
  "materials_consumed" JSONB,
  "photo_urls" JSONB,
  "remarks" TEXT,
  "delay_reason" TEXT,
  "tomorrow_plan" TEXT,
  "prepared_by_name" TEXT,
  "approved_by_name" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "kwa_documents" (
  "id" TEXT PRIMARY KEY,
  "doc_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "revision_no" TEXT,
  "file_type" TEXT,
  "size_bytes" INTEGER,
  "uploaded_by" TEXT,
  "upload_date" TEXT,
  "status" TEXT,
  "download_url" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_vendors" (
  "id" TEXT PRIMARY KEY,
  "vendor_code" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "category" TEXT,
  "gstin" TEXT,
  "pan" TEXT,
  "address" TEXT,
  "city" TEXT,
  "state" TEXT,
  "pincode" TEXT,
  "contact_persons" JSONB,
  "bank_details" JSONB,
  "payment_terms" TEXT,
  "credit_period_days" INTEGER,
  "rating" DOUBLE PRECISION,
  "status" TEXT,
  "documents" JSONB,
  "performance" JSONB,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_rfqs" (
  "id" TEXT PRIMARY KEY,
  "rfq_code" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "invited_vendor_ids" JSONB,
  "invited_vendor_names" JSONB,
  "due_date" TEXT,
  "items" JSONB,
  "status" TEXT,
  "approval_status" TEXT,
  "attachments" JSONB,
  "created_date" TEXT,
  "created_by_name" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_quotations" (
  "id" TEXT PRIMARY KEY,
  "quotation_no" TEXT NOT NULL,
  "rfq_id" TEXT NOT NULL,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT,
  "submitted_date" TEXT,
  "items" JSONB,
  "subtotal_usd" DOUBLE PRECISION,
  "tax_usd" DOUBLE PRECISION,
  "freight_usd" DOUBLE PRECISION,
  "net_total_usd" DOUBLE PRECISION NOT NULL,
  "lead_time_days" INTEGER,
  "warranty_months" INTEGER,
  "delivery_schedule" TEXT,
  "technical_compliance" TEXT,
  "technical_remarks" TEXT,
  "commercial_compliance" TEXT,
  "commercial_remarks" TEXT,
  "is_l1_bidder" BOOLEAN,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_requisitions" (
  "id" TEXT PRIMARY KEY,
  "pr_number" TEXT NOT NULL,
  "project_id" TEXT,
  "project_name" TEXT,
  "site_name" TEXT,
  "requested_by_name" TEXT,
  "department" TEXT,
  "urgency" TEXT,
  "status" TEXT NOT NULL,
  "created_date" TEXT,
  "required_by_date" TEXT,
  "budget_allocated_usd" DOUBLE PRECISION,
  "items" JSONB,
  "remarks" TEXT,
  "verified_by_name" TEXT,
  "approved_by_name" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_purchase_orders" (
  "id" TEXT PRIMARY KEY,
  "po_number" TEXT NOT NULL,
  "pr_id" TEXT,
  "rfq_id" TEXT,
  "vendor_id" TEXT NOT NULL,
  "vendor_name" TEXT,
  "vendor_code" TEXT,
  "vendor_gstin" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "site_address" TEXT,
  "po_date" TEXT,
  "delivery_due_date" TEXT,
  "payment_terms" TEXT,
  "freight_terms" TEXT,
  "subtotal_usd" DOUBLE PRECISION,
  "discount_usd" DOUBLE PRECISION,
  "gst_usd" DOUBLE PRECISION,
  "freight_usd" DOUBLE PRECISION,
  "net_amount_usd" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL,
  "approval_status" TEXT,
  "items" JSONB,
  "terms_and_conditions" TEXT,
  "issued_by_name" TEXT,
  "approved_by_name" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_grns" (
  "id" TEXT PRIMARY KEY,
  "grn_number" TEXT NOT NULL,
  "po_id" TEXT NOT NULL,
  "po_number" TEXT NOT NULL,
  "vendor_id" TEXT,
  "vendor_name" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "warehouse_id" TEXT,
  "warehouse_name" TEXT,
  "received_date" TEXT,
  "challan_no" TEXT,
  "challan_date" TEXT,
  "inspected_by_name" TEXT,
  "quality_status" TEXT,
  "items" JSONB,
  "stock_updated" BOOLEAN,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_work_orders" (
  "id" TEXT PRIMARY KEY,
  "wo_number" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "category" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "contractor_name" TEXT,
  "contractor_code" TEXT,
  "start_date" TEXT,
  "target_completion_date" TEXT,
  "contract_value_usd" DOUBLE PRECISION,
  "revised_value_usd" DOUBLE PRECISION,
  "executed_value_usd" DOUBLE PRECISION,
  "status" TEXT NOT NULL,
  "scope_of_work" TEXT,
  "attachments" JSONB,
  "variations" JSONB,
  "completion_certificate" JSONB,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_boq_items" (
  "id" TEXT PRIMARY KEY,
  "item_code" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "wbs_id" TEXT,
  "cost_code_id" TEXT,
  "cost_code" TEXT,
  "category" TEXT,
  "description" TEXT,
  "unit" TEXT,
  "quantity" DOUBLE PRECISION NOT NULL,
  "rate_usd" DOUBLE PRECISION NOT NULL,
  "sanctioned_amount_usd" DOUBLE PRECISION,
  "executed_quantity" DOUBLE PRECISION,
  "balance_quantity" DOUBLE PRECISION,
  "variation_quantity" DOUBLE PRECISION,
  "running_quantity" DOUBLE PRECISION,
  "executed_amount_usd" DOUBLE PRECISION,
  "progress_percent" DOUBLE PRECISION,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_measurement_entries" (
  "id" TEXT PRIMARY KEY,
  "mb_number" TEXT NOT NULL,
  "entry_date" TEXT,
  "measurement_date" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "boq_item_id" TEXT NOT NULL,
  "boq_item_code" TEXT,
  "boq_description" TEXT,
  "contractor_name" TEXT,
  "chainage_location" TEXT,
  "location_chainage" TEXT,
  "length_meters" DOUBLE PRECISION,
  "breadth_meters" DOUBLE PRECISION,
  "depth_meters" DOUBLE PRECISION,
  "height_meters" DOUBLE PRECISION,
  "calculated_quantity" DOUBLE PRECISION,
  "quantity" DOUBLE PRECISION,
  "unit" TEXT,
  "valuation_usd" DOUBLE PRECISION,
  "status" TEXT NOT NULL,
  "recorded_by_name" TEXT,
  "verified_by_name" TEXT,
  "approved_by_name" TEXT,
  "remarks" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_tenders" (
  "id" TEXT PRIMARY KEY,
  "tender_no" TEXT,
  "tender_number" TEXT,
  "title" TEXT NOT NULL,
  "client_authority" TEXT,
  "authority_name" TEXT,
  "category" TEXT,
  "estimated_value_usd" DOUBLE PRECISION,
  "emd_amount_usd" DOUBLE PRECISION,
  "emd_instrument" TEXT,
  "publish_date" TEXT,
  "submission_due_date" TEXT,
  "eligibility_criteria" TEXT,
  "tender_status" TEXT,
  "status" TEXT,
  "is_awarded" BOOLEAN,
  "technical_bid_submitted" BOOLEAN,
  "financial_bid_submitted" BOOLEAN,
  "quoted_amount_usd" DOUBLE PRECISION,
  "bid_submission" JSONB,
  "award_details" JSONB,
  "tender_documents_url" JSONB,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_cost_controls" (
  "id" TEXT PRIMARY KEY,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "total_budget_usd" DOUBLE PRECISION NOT NULL,
  "purchase_cost_usd" DOUBLE PRECISION,
  "material_cost_usd" DOUBLE PRECISION,
  "labour_cost_usd" DOUBLE PRECISION,
  "equipment_cost_usd" DOUBLE PRECISION,
  "vehicle_cost_usd" DOUBLE PRECISION,
  "running_cost_usd" DOUBLE PRECISION,
  "total_spent_usd" DOUBLE PRECISION,
  "committed_po_usd" DOUBLE PRECISION,
  "remaining_budget_usd" DOUBLE PRECISION,
  "cost_variance_usd" DOUBLE PRECISION,
  "variance_percent" DOUBLE PRECISION,
  "cost_status" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_material_requests" (
  "id" TEXT PRIMARY KEY,
  "request_no" TEXT NOT NULL,
  "request_date" TEXT,
  "requested_by_user_id" TEXT,
  "requested_by_user_name" TEXT,
  "employee_id" TEXT,
  "designation" TEXT,
  "department" TEXT,
  "company" TEXT,
  "branch" TEXT,
  "project_id" TEXT,
  "project_name" TEXT,
  "site_name" TEXT,
  "unloading_point" TEXT,
  "contact_number" TEXT,
  "required_date" TEXT,
  "priority" TEXT,
  "remarks" TEXT,
  "status" TEXT NOT NULL,
  "current_approver_role" TEXT,
  "current_approver_id" TEXT,
  "current_approver_name" TEXT,
  "items" JSONB,
  "approval_history" JSONB,
  "receipts" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase70_employees" (
  "id" TEXT PRIMARY KEY,
  "employee_code" TEXT NOT NULL,
  "first_name" TEXT NOT NULL,
  "last_name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "gender" TEXT NOT NULL,
  "date_of_birth" TEXT NOT NULL,
  "national_id" TEXT,
  "passport_number" TEXT,
  "visa_status" TEXT NOT NULL,
  "joining_date" TEXT NOT NULL,
  "department_id" TEXT NOT NULL,
  "designation_id" TEXT NOT NULL,
  "reporting_manager_id" TEXT,
  "employment_type" TEXT NOT NULL,
  "work_location" TEXT NOT NULL,
  "project_id" TEXT,
  "employment_status" TEXT NOT NULL,
  "biometric_id" TEXT,
  "grade" TEXT NOT NULL,
  "notice_period_days" INTEGER NOT NULL,
  "probation_end_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase70_shifts" (
  "id" TEXT PRIMARY KEY,
  "shift_code" TEXT NOT NULL,
  "shift_name" TEXT NOT NULL,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT NOT NULL,
  "grace_period_minutes" INTEGER NOT NULL,
  "break_duration_minutes" INTEGER NOT NULL,
  "total_shift_hours" DOUBLE PRECISION NOT NULL,
  "is_night_shift" BOOLEAN NOT NULL,
  "is_overnight" BOOLEAN NOT NULL,
  "color_tag" TEXT NOT NULL,
  "is_active" BOOLEAN NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase70_payslips" (
  "id" TEXT PRIMARY KEY,
  "payslip_number" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "payroll_period_id" TEXT NOT NULL,
  "working_days" INTEGER NOT NULL,
  "present_days" DOUBLE PRECISION NOT NULL,
  "loss_of_pay_days" DOUBLE PRECISION NOT NULL,
  "paid_leave_days" DOUBLE PRECISION NOT NULL,
  "overtime_hours" DOUBLE PRECISION NOT NULL,
  "basic_salary_aed" DOUBLE PRECISION NOT NULL,
  "hra_aed" DOUBLE PRECISION NOT NULL,
  "conveyance_aed" DOUBLE PRECISION NOT NULL,
  "medical_aed" DOUBLE PRECISION NOT NULL,
  "special_allowance_aed" DOUBLE PRECISION NOT NULL,
  "site_allowance_aed" DOUBLE PRECISION NOT NULL,
  "ot_amount_aed" DOUBLE PRECISION NOT NULL,
  "bonus_aed" DOUBLE PRECISION NOT NULL,
  "gross_earnings_aed" DOUBLE PRECISION NOT NULL,
  "provident_fund_aed" DOUBLE PRECISION NOT NULL,
  "tax_deduction_aed" DOUBLE PRECISION NOT NULL,
  "loan_emi_aed" DOUBLE PRECISION NOT NULL,
  "advance_recovery_aed" DOUBLE PRECISION NOT NULL,
  "other_deductions_aed" DOUBLE PRECISION NOT NULL,
  "total_deductions_aed" DOUBLE PRECISION NOT NULL,
  "net_payable_aed" DOUBLE PRECISION NOT NULL,
  "payment_mode" TEXT NOT NULL,
  "payment_status" TEXT NOT NULL,
  "disbursement_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase70_leave_applications" (
  "id" TEXT PRIMARY KEY,
  "leave_number" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "leave_type_id" TEXT NOT NULL,
  "start_date" TEXT NOT NULL,
  "end_date" TEXT NOT NULL,
  "total_days" DOUBLE PRECISION NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "approved_by" TEXT,
  "approval_date" TEXT,
  "approval_remarks" TEXT,
  "contact_during_leave" TEXT,
  "attachment_url" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase70_employee_loans" (
  "id" TEXT PRIMARY KEY,
  "loan_code" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "loan_type" TEXT NOT NULL,
  "principal_amount_aed" DOUBLE PRECISION NOT NULL,
  "interest_rate" DOUBLE PRECISION NOT NULL,
  "tenure_months" INTEGER NOT NULL,
  "monthly_emi_aed" DOUBLE PRECISION NOT NULL,
  "total_repayable_aed" DOUBLE PRECISION NOT NULL,
  "balance_outstanding_aed" DOUBLE PRECISION NOT NULL,
  "status" TEXT NOT NULL,
  "disbursement_date" TEXT,
  "deduction_start_month" TEXT,
  "approved_by" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase70_recruitment_requisitions" (
  "id" TEXT PRIMARY KEY,
  "requisition_code" TEXT NOT NULL,
  "position_title" TEXT NOT NULL,
  "department_id" TEXT NOT NULL,
  "vacancies_count" INTEGER NOT NULL,
  "experience_years_required" DOUBLE PRECISION NOT NULL,
  "min_qualification" TEXT NOT NULL,
  "target_hiring_date" TEXT NOT NULL,
  "salary_budget_aed" DOUBLE PRECISION NOT NULL,
  "hiring_manager_id" TEXT,
  "priority" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT NOT NULL,
  "updated_by" TEXT NOT NULL,
  "deleted_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL
);

CREATE TABLE IF NOT EXISTS "procurement_ra_bills" (
  "id" TEXT PRIMARY KEY,
  "bill_number" TEXT NOT NULL,
  "work_order_id" TEXT,
  "work_order_number" TEXT,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT,
  "contractor_name" TEXT,
  "contractor_code" TEXT,
  "bill_date" TEXT,
  "billing_period_start" TEXT,
  "billing_period_end" TEXT,
  "bill_type" TEXT,
  "sequence_number" INTEGER DEFAULT 1,
  "is_final_bill" BOOLEAN DEFAULT FALSE,
  "status" TEXT NOT NULL,
  "items" JSONB,
  "financials" JSONB,
  "contractor_representative" TEXT,
  "qs_verifier" TEXT,
  "site_engineer" TEXT,
  "project_director" TEXT,
  "finance_approver" TEXT,
  "payment_reference_number" TEXT,
  "payment_disbursed_date" TEXT,
  "remarks" TEXT,
  "audit_trail" JSONB,
  "attachments" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT
);

CREATE TABLE IF NOT EXISTS "project_cash_requests" (
  "id" TEXT PRIMARY KEY,
  "request_code" TEXT NOT NULL UNIQUE,
  "project_id" TEXT NOT NULL,
  "project_name" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "employee_code" TEXT,
  "division_id" TEXT,
  "division_name" TEXT,
  "department_id" TEXT,
  "department_name" TEXT,
  "currency" TEXT DEFAULT 'AED',
  "original_amount" DOUBLE PRECISION,
  "exchange_rate" DOUBLE PRECISION DEFAULT 1.0,
  "base_amount" DOUBLE PRECISION,
  "base_currency" TEXT DEFAULT 'AED',
  "amount" DOUBLE PRECISION NOT NULL,
  "approved_amount" DOUBLE PRECISION,
  "disbursed_amount" DOUBLE PRECISION,
  "purpose" TEXT NOT NULL,
  "category" TEXT NOT NULL DEFAULT 'SITE_OPERATIONS',
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "site_incharge_name" TEXT,
  "incharge_remarks" TEXT,
  "project_director_id" TEXT,
  "project_director_name" TEXT,
  "director_remarks" TEXT,
  "finance_approver_id" TEXT,
  "finance_approver_name" TEXT,
  "finance_remarks" TEXT,
  "payment_method" TEXT,
  "disbursed_at" TEXT,
  "settlement_status" TEXT NOT NULL DEFAULT 'PENDING',
  "remaining_balance" DOUBLE PRECISION DEFAULT 0,
  "supporting_documents" JSONB,
  "approval_history" JSONB,
  "audit_trail" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "project_cash_settlements" (
  "id" TEXT PRIMARY KEY,
  "settlement_code" TEXT NOT NULL UNIQUE,
  "cash_request_id" TEXT NOT NULL,
  "project_id" TEXT NOT NULL,
  "employee_id" TEXT NOT NULL,
  "employee_name" TEXT NOT NULL,
  "currency" TEXT DEFAULT 'AED',
  "original_expense_amount" DOUBLE PRECISION,
  "exchange_rate" DOUBLE PRECISION DEFAULT 1.0,
  "base_expense_amount" DOUBLE PRECISION,
  "base_currency" TEXT DEFAULT 'AED',
  "total_expense_amount" DOUBLE PRECISION NOT NULL,
  "unspent_cash_returned" DOUBLE PRECISION NOT NULL DEFAULT 0,
  "status" TEXT NOT NULL DEFAULT 'SUBMITTED',
  "invoices_and_receipts" JSONB,
  "auditor_id" TEXT,
  "auditor_name" TEXT,
  "audit_remarks" TEXT,
  "submitted_at" TEXT NOT NULL,
  "settled_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "hr_biometric_raw_punches" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "biometric_id" TEXT NOT NULL,
  "employee_id" TEXT,
  "employee_code" TEXT,
  "employee_name" TEXT,
  "raw_timestamp" TEXT NOT NULL,
  "punch_type" TEXT NOT NULL DEFAULT 'CHECK_IN',
  "verification_mode" TEXT NOT NULL DEFAULT 'FINGERPRINT',
  "raw_payload" TEXT,
  "source_fingerprint" TEXT,
  "is_processed" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_labor" (
  "id" TEXT PRIMARY KEY,
  "work_order_id" TEXT,
  "technician_id" TEXT,
  "technician_name" TEXT,
  "hours_logged" REAL DEFAULT 0,
  "hourly_rate_aed" REAL DEFAULT 0,
  "total_cost_aed" REAL DEFAULT 0,
  "logged_date" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_spare_parts" (
  "id" TEXT PRIMARY KEY,
  "work_order_id" TEXT,
  "spare_part_id" TEXT,
  "part_number" TEXT,
  "part_name" TEXT,
  "quantity_used" REAL DEFAULT 0,
  "unit_cost_aed" REAL DEFAULT 0,
  "total_cost_aed" REAL DEFAULT 0,
  "warehouse_id" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_history" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "work_order_id" TEXT,
  "reference_number" TEXT,
  "maintenance_type" TEXT,
  "event_type" TEXT,
  "summary" TEXT,
  "action_taken" TEXT,
  "downtime_hours" REAL DEFAULT 0,
  "logged_by" TEXT,
  "event_date" TEXT,
  "completed_date" TEXT,
  "cost_aed" REAL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_breakdown_reports" (
  "id" TEXT PRIMARY KEY,
  "breakdown_number" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "breakdown_date" TEXT,
  "breakdown_time" TEXT,
  "reported_by" TEXT,
  "initial_symptoms" TEXT,
  "severity" TEXT NOT NULL DEFAULT 'CRITICAL_STOPPAGE',
  "suspected_root_cause" TEXT,
  "emergency_work_order_id" TEXT,
  "production_impact" TEXT DEFAULT 'LINE_HALTED',
  "status" TEXT NOT NULL DEFAULT 'REPORTED',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT,
  "updated_by" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_downtime_logs" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "breakdown_id" TEXT,
  "work_order_id" TEXT,
  "start_time" TEXT NOT NULL,
  "end_time" TEXT,
  "duration_minutes" REAL DEFAULT 0,
  "total_downtime_minutes" REAL DEFAULT 0,
  "downtime_category" TEXT,
  "loss_cost_aed" REAL DEFAULT 0,
  "resolved_by" TEXT,
  "reason" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_condition_monitoring" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "sensor_id" TEXT,
  "parameter_name" TEXT NOT NULL,
  "parameter_value" REAL NOT NULL,
  "unit" TEXT NOT NULL,
  "threshold_min" REAL DEFAULT 0,
  "threshold_max" REAL DEFAULT 100,
  "alert_severity" TEXT DEFAULT 'NORMAL',
  "measured_at" TEXT NOT NULL,
  "is_alarm_active" BOOLEAN DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT,
  "updated_by" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_meter_readings" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "meter_type" TEXT NOT NULL,
  "current_reading" REAL NOT NULL,
  "unit" TEXT,
  "recorded_at" TEXT NOT NULL,
  "recorded_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_calibration_records" (
  "id" TEXT PRIMARY KEY,
  "calibration_number" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "instrument_name" TEXT,
  "calibration_agency" TEXT,
  "certificate_number" TEXT,
  "calibrated_date" TEXT,
  "next_due_date" TEXT,
  "standard_used" TEXT,
  "result_status" TEXT DEFAULT 'PASS_WITHIN_TOLERANCE',
  "uncertainty_measurement" TEXT,
  "approved_by" TEXT,
  "certificate_url" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_inspection_records" (
  "id" TEXT PRIMARY KEY,
  "inspection_number" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "inspector_name" TEXT,
  "inspection_type" TEXT DEFAULT 'THIRD_PARTY_STATUTORY',
  "inspection_date" TEXT,
  "compliance_standard" TEXT,
  "overall_rating" TEXT DEFAULT 'SATISFACTORY',
  "observations" TEXT,
  "recommended_actions" TEXT,
  "pass_status" BOOLEAN DEFAULT TRUE,
  "next_inspection_date" TEXT,
  "report_url" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_maintenance_costs" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "cost_period" TEXT,
  "preventive_cost_aed" REAL DEFAULT 0,
  "corrective_cost_aed" REAL DEFAULT 0,
  "spare_parts_cost_aed" REAL DEFAULT 0,
  "external_vendor_cost_aed" REAL DEFAULT 0,
  "total_maintenance_cost_aed" REAL DEFAULT 0,
  "budget_aed" REAL DEFAULT 0,
  "variance_aed" REAL DEFAULT 0,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_disposal" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "disposal_date" TEXT,
  "disposal_method" TEXT,
  "sale_price_aed" REAL DEFAULT 0,
  "scrap_value_aed" REAL DEFAULT 0,
  "approved_by" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase71_asset_audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action_type" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "reference_number" TEXT,
  "performed_by" TEXT,
  "details_json" JSONB,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "created_by" TEXT,
  "updated_by" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_device_types" (
  "id" TEXT PRIMARY KEY,
  "type_code" TEXT NOT NULL,
  "type_name" TEXT NOT NULL,
  "category" TEXT,
  "description" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_devices" (
  "id" TEXT PRIMARY KEY,
  "device_code" TEXT NOT NULL,
  "device_name" TEXT NOT NULL,
  "device_type_id" TEXT,
  "model_id" TEXT,
  "serial_number" TEXT,
  "manufacturer" TEXT,
  "protocol" TEXT,
  "communication_protocol" TEXT,
  "ip_address" TEXT,
  "mac_address" TEXT,
  "firmware_version" TEXT,
  "status" TEXT DEFAULT 'ONLINE',
  "asset_id" TEXT,
  "project_id" TEXT,
  "location" TEXT,
  "installation_date" TEXT,
  "last_heartbeat" TEXT,
  "battery_level" REAL,
  "signal_strength" REAL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_device_models" (
  "id" TEXT PRIMARY KEY,
  "model_code" TEXT NOT NULL,
  "model_name" TEXT NOT NULL,
  "manufacturer" TEXT,
  "supported_protocols" JSONB,
  "specifications" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_device_credentials" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "auth_type" TEXT NOT NULL,
  "api_key_hash" TEXT,
  "certificate_arn" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_gateways" (
  "id" TEXT PRIMARY KEY,
  "gateway_code" TEXT NOT NULL,
  "gateway_name" TEXT NOT NULL,
  "ip_address" TEXT,
  "port" INTEGER,
  "protocol" TEXT,
  "status" TEXT DEFAULT 'ONLINE',
  "connected_devices_count" INTEGER DEFAULT 0,
  "last_ping" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_rtu_units" (
  "id" TEXT PRIMARY KEY,
  "rtu_code" TEXT NOT NULL,
  "rtu_name" TEXT NOT NULL,
  "station_location" TEXT,
  "channel_count" INTEGER DEFAULT 16,
  "communication_medium" TEXT,
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_plc_units" (
  "id" TEXT PRIMARY KEY,
  "plc_code" TEXT NOT NULL,
  "plc_name" TEXT NOT NULL,
  "rack_slot" TEXT,
  "cpu_model" TEXT,
  "ip_address" TEXT,
  "program_checksum" TEXT,
  "status" TEXT DEFAULT 'RUN',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_sensors" (
  "id" TEXT PRIMARY KEY,
  "sensor_code" TEXT NOT NULL,
  "sensor_name" TEXT NOT NULL,
  "sensor_type" TEXT NOT NULL,
  "device_id" TEXT,
  "asset_id" TEXT,
  "unit_of_measure" TEXT,
  "min_range" REAL,
  "max_range" REAL,
  "accuracy" TEXT,
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_telemetry_points" (
  "id" TEXT PRIMARY KEY,
  "point_code" TEXT NOT NULL,
  "point_name" TEXT NOT NULL,
  "device_id" TEXT,
  "sensor_id" TEXT,
  "data_type" TEXT DEFAULT 'FLOAT',
  "engineering_unit" TEXT,
  "current_value" REAL,
  "raw_current_value" REAL,
  "quality" TEXT DEFAULT 'GOOD',
  "data_quality" TEXT,
  "last_updated" TEXT,
  "last_timestamp" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_telemetry_readings" (
  "id" TEXT PRIMARY KEY,
  "point_id" TEXT,
  "sensor_id" TEXT,
  "asset_id" TEXT,
  "raw_val" REAL,
  "eng_val" REAL,
  "unit" TEXT,
  "is_alarm_triggered" BOOLEAN,
  "device_id" TEXT,
  "numeric_value" REAL,
  "string_value" TEXT,
  "boolean_value" BOOLEAN,
  "quality" TEXT DEFAULT 'GOOD',
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_device_status" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "status" TEXT NOT NULL,
  "status_reason" TEXT,
  "changed_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_device_commands" (
  "id" TEXT PRIMARY KEY,
  "command_code" TEXT NOT NULL,
  "device_id" TEXT NOT NULL,
  "asset_id" TEXT,
  "command_type" TEXT NOT NULL,
  "target_register" TEXT,
  "parameter_value" TEXT,
  "timeout_seconds" INTEGER DEFAULT 30,
  "requested_by" TEXT,
  "authorized_by" TEXT,
  "status" TEXT DEFAULT 'PENDING',
  "execution_response" TEXT,
  "created_by" TEXT,
  "updated_by" TEXT,
  "response_payload" JSONB,
  "executed_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_command_logs" (
  "id" TEXT PRIMARY KEY,
  "command_id" TEXT NOT NULL,
  "device_id" TEXT,
  "action_taken" TEXT,
  "payload_sent" TEXT,
  "raw_response" TEXT,
  "status_code" TEXT,
  "execution_duration_ms" REAL,
  "log_message" TEXT,
  "severity" TEXT DEFAULT 'INFO',
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_alarm_rules" (
  "id" TEXT PRIMARY KEY,
  "rule_code" TEXT NOT NULL,
  "rule_name" TEXT NOT NULL,
  "point_id" TEXT,
  "sensor_type" TEXT,
  "condition_type" TEXT,
  "threshold_value" REAL,
  "high_high_limit" REAL,
  "high_limit" REAL,
  "low_limit" REAL,
  "low_low_limit" REAL,
  "deadband" REAL,
  "severity" TEXT DEFAULT 'WARNING',
  "priority" TEXT DEFAULT 'P2',
  "suppression_minutes" INTEGER DEFAULT 15,
  "hysteresis" REAL DEFAULT 0,
  "is_enabled" BOOLEAN DEFAULT TRUE,
  "auto_create_work_order" BOOLEAN DEFAULT FALSE,
  "notification_channel" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_alarms" (
  "id" TEXT PRIMARY KEY,
  "alarm_code" TEXT,
  "alarm_number" TEXT,
  "rule_id" TEXT,
  "point_id" TEXT,
  "device_id" TEXT,
  "sensor_id" TEXT,
  "asset_id" TEXT,
  "alarm_type" TEXT,
  "severity" TEXT NOT NULL,
  "priority" TEXT DEFAULT 'P2',
  "title" TEXT,
  "message" TEXT,
  "alarm_message" TEXT,
  "trigger_value" REAL,
  "threshold_value" REAL,
  "unit" TEXT,
  "triggered_at" TEXT NOT NULL,
  "acknowledged_at" TEXT,
  "acknowledged_by" TEXT,
  "resolved_at" TEXT,
  "resolved_by" TEXT,
  "resolution_notes" TEXT,
  "sla_due_minutes" INTEGER,
  "is_work_order_created" BOOLEAN DEFAULT FALSE,
  "work_order_id" TEXT,
  "status" TEXT DEFAULT 'ACTIVE',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_alarm_acknowledgements" (
  "id" TEXT PRIMARY KEY,
  "alarm_id" TEXT NOT NULL,
  "acknowledged_by" TEXT,
  "user_id" TEXT,
  "user_name" TEXT,
  "ack_time" TEXT,
  "comments" TEXT,
  "notes" TEXT,
  "expected_action" TEXT,
  "action_taken" TEXT,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_alarm_escalations" (
  "id" TEXT PRIMARY KEY,
  "alarm_id" TEXT NOT NULL,
  "escalation_level" INTEGER NOT NULL,
  "escalated_to_role" TEXT,
  "escalated_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_equipment_health" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "overall_health_score" REAL,
  "vibration_health_score" REAL,
  "thermal_health_score" REAL,
  "lubrication_health_score" REAL,
  "electrical_health_score" REAL,
  "health_status" TEXT DEFAULT 'GOOD',
  "assessment_date" TEXT,
  "health_score" REAL,
  "condition_score" REAL,
  "availability_percent" REAL,
  "reliability_percent" REAL,
  "total_running_hours" REAL,
  "active_alarms_count" INTEGER,
  "critical_alarms_count" INTEGER,
  "temperature_status" TEXT,
  "vibration_status" TEXT,
  "pressure_status" TEXT,
  "energy_efficiency_percent" REAL,
  "failure_risk_level" TEXT,
  "last_calculated_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_condition_monitoring" (
  "id" TEXT PRIMARY KEY,
  "asset_id" TEXT NOT NULL,
  "parameter_name" TEXT,
  "value" REAL,
  "status" TEXT,
  "recorded_at" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_predictive_models" (
  "id" TEXT PRIMARY KEY,
  "model_code" TEXT NOT NULL,
  "model_name" TEXT NOT NULL,
  "model_type" TEXT,
  "algorithm" TEXT,
  "target_equipment_type" TEXT,
  "model_provider" TEXT,
  "is_active" BOOLEAN DEFAULT TRUE,
  "last_trained_at" TEXT,
  "target_asset_category" TEXT,
  "accuracy_score" REAL,
  "features_used" JSONB,
  "version" TEXT DEFAULT '1.0.0',
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_predictions" (
  "id" TEXT PRIMARY KEY,
  "model_id" TEXT,
  "asset_id" TEXT NOT NULL,
  "prediction_type" TEXT NOT NULL,
  "predicted_rul_hours" REAL,
  "failure_risk_score" REAL,
  "risk_classification" TEXT,
  "predicted_failure_mode" TEXT,
  "confidence_percent" REAL,
  "recommended_action" TEXT,
  "generated_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_anomalies" (
  "id" TEXT PRIMARY KEY,
  "anomaly_code" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "sensor_id" TEXT,
  "parameter_name" TEXT,
  "anomaly_score" REAL,
  "severity" TEXT DEFAULT 'MEDIUM',
  "observed_value" REAL,
  "expected_value" REAL,
  "unit" TEXT,
  "status" TEXT DEFAULT 'INVESTIGATING',
  "detected_at" TEXT NOT NULL,
  "root_cause_notes" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_energy_readings" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT,
  "asset_id" TEXT,
  "timestamp" TEXT NOT NULL,
  "active_power_kw" REAL,
  "apparent_power_kva" REAL,
  "energy_kwh" REAL,
  "voltage_phase_a" REAL,
  "voltage_phase_b" REAL,
  "voltage_phase_c" REAL,
  "current_phase_a" REAL,
  "current_phase_b" REAL,
  "current_phase_c" REAL,
  "power_factor" REAL,
  "frequency_hz" REAL,
  "specific_energy_kwh_m3" REAL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_flow_readings" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT,
  "asset_id" TEXT,
  "flow_rate_m3h" REAL,
  "totalized_volume_m3" REAL,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_pressure_readings" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT,
  "asset_id" TEXT,
  "pressure_bar" REAL,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_level_readings" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT,
  "asset_id" TEXT,
  "level_meters" REAL,
  "level_percentage" REAL,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_vibration_readings" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT,
  "asset_id" TEXT,
  "overall_vibration_rms_mms" REAL,
  "peak_acceleration_g" REAL,
  "crest_factor" REAL,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_temperature_readings" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT,
  "asset_id" TEXT,
  "temperature_celsius" REAL,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_scada_tags" (
  "id" TEXT PRIMARY KEY,
  "tag_code" TEXT NOT NULL,
  "tag_name" TEXT NOT NULL,
  "device_id" TEXT,
  "sensor_id" TEXT,
  "data_type" TEXT DEFAULT 'FLOAT',
  "engineering_unit" TEXT,
  "high_high_limit" REAL,
  "high_limit" REAL,
  "low_limit" REAL,
  "low_low_limit" REAL,
  "last_value" REAL,
  "last_updated" TEXT,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_scada_tag_history" (
  "id" TEXT PRIMARY KEY,
  "tag_id" TEXT NOT NULL,
  "tag_value" REAL,
  "quality" TEXT DEFAULT 'GOOD',
  "recorded_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_scada_dashboards" (
  "id" TEXT PRIMARY KEY,
  "dashboard_code" TEXT NOT NULL,
  "dashboard_title" TEXT NOT NULL,
  "dashboard_type" TEXT DEFAULT 'WATER_TREATMENT_PLANT',
  "layout_json" JSONB,
  "is_default" BOOLEAN DEFAULT FALSE,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_scada_widgets" (
  "id" TEXT PRIMARY KEY,
  "dashboard_id" TEXT NOT NULL,
  "widget_title" TEXT NOT NULL,
  "widget_type" TEXT NOT NULL,
  "tag_bindings" JSONB,
  "position_config" JSONB,
  "created_at" TEXT NOT NULL,
  "updated_at" TEXT NOT NULL,
  "is_deleted" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "phase72_device_events" (
  "id" TEXT PRIMARY KEY,
  "device_id" TEXT NOT NULL,
  "event_type" TEXT NOT NULL,
  "event_payload" JSONB,
  "event_timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_data_quality_logs" (
  "id" TEXT PRIMARY KEY,
  "point_id" TEXT NOT NULL,
  "issue_type" TEXT NOT NULL,
  "reported_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_communication_logs" (
  "id" TEXT PRIMARY KEY,
  "gateway_id" TEXT,
  "protocol" TEXT,
  "bytes_transferred" INTEGER,
  "packet_loss_percent" REAL,
  "logged_at" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_telemetry_sync_queue" (
  "id" TEXT PRIMARY KEY,
  "payload_json" JSONB NOT NULL,
  "status" TEXT DEFAULT 'PENDING',
  "retry_count" INTEGER DEFAULT 0,
  "created_at" TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "phase72_iot_audit_logs" (
  "id" TEXT PRIMARY KEY,
  "action_type" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "performed_by" TEXT,
  "details_json" JSONB,
  "timestamp" TEXT NOT NULL,
  "created_at" TEXT NOT NULL
);
