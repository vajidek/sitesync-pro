CREATE TABLE "audit_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text,
	"user_email" text,
	"user_role" text,
	"action" text NOT NULL,
	"module" text NOT NULL,
	"details" text NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_actions" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"action_type" text NOT NULL,
	"template_id" text,
	"config_json" jsonb NOT NULL,
	"sequence_order" integer DEFAULT 1 NOT NULL,
	"retry_limit" integer DEFAULT 3 NOT NULL,
	"delay_seconds" integer DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"action_id" text,
	"event_source" text NOT NULL,
	"trigger_type" text NOT NULL,
	"status" text NOT NULL,
	"payload_json" jsonb,
	"result_json" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"executed_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "automation_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"event_source" text NOT NULL,
	"trigger_type" text NOT NULL,
	"conditions_json" jsonb NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"execution_order" integer DEFAULT 1 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"escalation_enabled" boolean DEFAULT false NOT NULL,
	"escalation_policy_json" jsonb,
	"created_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "automation_rules_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "branches" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"company_id" text NOT NULL,
	"address" text,
	"phone" text,
	"email" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text
);
--> statement-breakpoint
CREATE TABLE "business_units" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"company_id" text NOT NULL,
	"head_employee_id" text,
	"head_employee_name" text,
	"description" text,
	"remarks" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "business_units_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "companies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"tax_id" text,
	"email" text,
	"phone" text,
	"website" text,
	"address" text,
	"logo_url" text,
	"currency" text DEFAULT 'USD' NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contract_types" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "contract_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "contractors" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" text,
	"address" text,
	"tax_id" text,
	"trade_license" text,
	"category" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cost_centers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"division_id" text,
	"department_id" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "cost_centers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "customers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" text,
	"address" text,
	"tax_id" text,
	"credit_limit" double precision DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_progress" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"site_id" text NOT NULL,
	"date" text NOT NULL,
	"work_category" text NOT NULL,
	"description" text NOT NULL,
	"completion_percentage" double precision NOT NULL,
	"remarks" text,
	"photos" jsonb,
	"documents" jsonb,
	"created_by_id" text NOT NULL,
	"created_by_name" text,
	"verified_by_id" text,
	"verified_by_name" text,
	"approved_by_id" text,
	"approved_by_name" text,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_favorites" (
	"id" text PRIMARY KEY NOT NULL,
	"dashboard_id" text NOT NULL,
	"user_id" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_layouts" (
	"id" text PRIMARY KEY NOT NULL,
	"dashboard_id" text NOT NULL,
	"layout_name" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"layout_json" jsonb NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widget_registry" (
	"id" text PRIMARY KEY NOT NULL,
	"module_code" text NOT NULL,
	"title" text NOT NULL,
	"widget_type" text NOT NULL,
	"config_json" jsonb,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboard_widgets" (
	"id" text PRIMARY KEY NOT NULL,
	"dashboard_id" text NOT NULL,
	"title" text NOT NULL,
	"widget_type" text NOT NULL,
	"report_id" text,
	"data_source" text DEFAULT 'PROJECTS' NOT NULL,
	"chart_type" text,
	"config_json" jsonb NOT NULL,
	"position_json" jsonb NOT NULL,
	"refresh_interval_sec" integer DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "dashboards" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"dashboard_type" text DEFAULT 'EXECUTIVE' NOT NULL,
	"scope_type" text DEFAULT 'GLOBAL' NOT NULL,
	"scope_id" text,
	"is_default" boolean DEFAULT false NOT NULL,
	"is_system" boolean DEFAULT false NOT NULL,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"layout_config_json" jsonb,
	"created_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "dashboards_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "departments" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"branch_id" text,
	"parent_id" text,
	"type" text DEFAULT 'DEPARTMENT' NOT NULL,
	"head_employee_id" text,
	"head_employee_name" text,
	"color" text,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "designations" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"department_id" text,
	"grade_level" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "disciplines" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "disciplines_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "divisions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"branch_id" text,
	"region_id" text,
	"head_employee_id" text,
	"head_employee_name" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "divisions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "documents" (
	"id" text PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" double precision NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"uploaded_by_id" text,
	"notes" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_grades" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"rank" integer NOT NULL,
	"salary_range_min" double precision DEFAULT 0 NOT NULL,
	"salary_range_max" double precision DEFAULT 0 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "employee_grades_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" text PRIMARY KEY NOT NULL,
	"employee_code" text NOT NULL,
	"name" text NOT NULL,
	"photo_url" text,
	"phone" text NOT NULL,
	"email" text NOT NULL,
	"address" text,
	"emergency_contact" text,
	"date_of_joining" text NOT NULL,
	"department_id" text,
	"designation_id" text,
	"reporting_manager_id" text,
	"status" text NOT NULL,
	"base_salary" double precision NOT NULL,
	"hourly_rate" double precision NOT NULL,
	"passport_number" text,
	"national_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employment_types" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "employment_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "equipments" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"serial_number" text,
	"model_number" text,
	"status" text NOT NULL,
	"hourly_cost" double precision NOT NULL,
	"current_project_id" text,
	"site_id" text,
	"operator_id" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "feature_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"module_code" text NOT NULL,
	"feature_code" text NOT NULL,
	"visibility_state" text DEFAULT 'EDITABLE' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "features" (
	"id" text PRIMARY KEY NOT NULL,
	"sub_module_id" text NOT NULL,
	"feature_code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"required_permission" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "field_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"module_code" text NOT NULL,
	"entity_name" text NOT NULL,
	"field_name" text NOT NULL,
	"visibility" text DEFAULT 'VISIBLE' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_fields" (
	"id" text PRIMARY KEY NOT NULL,
	"form_version_id" text NOT NULL,
	"form_id" text NOT NULL,
	"field_key" text NOT NULL,
	"label" text NOT NULL,
	"field_type" text NOT NULL,
	"is_required" boolean DEFAULT false NOT NULL,
	"is_read_only" boolean DEFAULT false NOT NULL,
	"is_hidden" boolean DEFAULT false NOT NULL,
	"display_order" integer DEFAULT 0 NOT NULL,
	"width" text DEFAULT '100%' NOT NULL,
	"options_json" jsonb,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submission_history" (
	"id" text PRIMARY KEY NOT NULL,
	"submission_id" text NOT NULL,
	"previous_state" text,
	"new_state" text NOT NULL,
	"action_taken" text NOT NULL,
	"performed_by_user_id" text NOT NULL,
	"performed_by_user_name" text NOT NULL,
	"comments" text,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_submissions" (
	"id" text PRIMARY KEY NOT NULL,
	"form_id" text NOT NULL,
	"form_version_id" text NOT NULL,
	"submission_number" text NOT NULL,
	"module_code" text NOT NULL,
	"project_id" text,
	"department_id" text,
	"workflow_code" text,
	"workflow_state" text DEFAULT 'DRAFT' NOT NULL,
	"data_json" jsonb NOT NULL,
	"attachments_json" jsonb,
	"submitted_by_user_id" text NOT NULL,
	"submitted_by_user_name" text NOT NULL,
	"submitted_by_user_role" text NOT NULL,
	"status" text DEFAULT 'SUBMITTED' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "form_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"form_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"change_log" text,
	"fields_json" jsonb NOT NULL,
	"published_at" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "forms" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"module_code" text DEFAULT 'PROJECTS' NOT NULL,
	"scope_type" text DEFAULT 'GLOBAL' NOT NULL,
	"scope_id" text,
	"workflow_code" text,
	"status" text DEFAULT 'DRAFT' NOT NULL,
	"active_version" integer DEFAULT 1 NOT NULL,
	"category" text DEFAULT 'INSPECTION' NOT NULL,
	"is_template" boolean DEFAULT false NOT NULL,
	"created_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "forms_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "integration_configs" (
	"id" text PRIMARY KEY NOT NULL,
	"connector_id" text NOT NULL,
	"config_key" text NOT NULL,
	"config_value" text,
	"is_secret" boolean DEFAULT false NOT NULL,
	"updated_by" text,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_connectors" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text NOT NULL,
	"version" text DEFAULT '1.0.0' NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'HEALTHY' NOT NULL,
	"auth_type" text DEFAULT 'API_KEY' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "integration_connectors_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "integration_health" (
	"id" text PRIMARY KEY NOT NULL,
	"connector_id" text NOT NULL,
	"status" text NOT NULL,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"last_ping_at" text NOT NULL,
	"details_json" jsonb
);
--> statement-breakpoint
CREATE TABLE "integration_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"job_code" text NOT NULL,
	"connector_id" text NOT NULL,
	"job_type" text NOT NULL,
	"schedule_cron" text,
	"status" text DEFAULT 'PENDING' NOT NULL,
	"conflict_resolution" text DEFAULT 'OVERWRITE_TARGET' NOT NULL,
	"records_processed" integer DEFAULT 0 NOT NULL,
	"records_failed" integer DEFAULT 0 NOT NULL,
	"last_run_at" text,
	"next_run_at" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "integration_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"connector_id" text NOT NULL,
	"job_id" text,
	"direction" text DEFAULT 'OUTBOUND' NOT NULL,
	"endpoint" text,
	"http_status" integer,
	"latency_ms" integer DEFAULT 0 NOT NULL,
	"status" text NOT NULL,
	"request_payload_json" jsonb,
	"response_payload_json" jsonb,
	"error_message" text,
	"retry_count" integer DEFAULT 0 NOT NULL,
	"executed_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "login_history" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"username" text NOT NULL,
	"user_email" text,
	"login_date" text NOT NULL,
	"login_time" text NOT NULL,
	"logout_time" text,
	"session_duration" integer,
	"browser" text,
	"device" text,
	"ip_address" text,
	"status" text NOT NULL,
	"failure_reason" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "material_units" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "materials" (
	"id" text PRIMARY KEY NOT NULL,
	"item_code" text NOT NULL,
	"name" text NOT NULL,
	"category_id" text NOT NULL,
	"sub_category" text,
	"specification" text,
	"brand" text,
	"model" text,
	"manufacturer" text,
	"unit_id" text NOT NULL,
	"hsn_code" text,
	"gst_percentage" double precision,
	"barcode" text,
	"qr_code" text,
	"image_url" text,
	"description" text,
	"min_stock" double precision NOT NULL,
	"max_stock" double precision NOT NULL,
	"reorder_level" double precision NOT NULL,
	"opening_stock" double precision NOT NULL,
	"current_stock" double precision NOT NULL,
	"reserved_stock" double precision NOT NULL,
	"unit_price" double precision NOT NULL,
	"status" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_assignments" (
	"id" text PRIMARY KEY NOT NULL,
	"module_code" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"config_json" jsonb,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "module_visibility_rules" (
	"id" text PRIMARY KEY NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"target_type" text NOT NULL,
	"target_id" text NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "modules" (
	"id" text PRIMARY KEY NOT NULL,
	"module_code" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'CORE',
	"icon" text DEFAULT 'Package',
	"color" text DEFAULT '#3b82f6',
	"display_order" integer DEFAULT 0 NOT NULL,
	"parent_id" text,
	"description" text,
	"route_path" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "modules_module_code_unique" UNIQUE("module_code")
);
--> statement-breakpoint
CREATE TABLE "notification_templates" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"channel" text DEFAULT 'IN_APP' NOT NULL,
	"event_source" text DEFAULT 'PROJECTS' NOT NULL,
	"subject_template" text,
	"body_template" text NOT NULL,
	"variables_json" jsonb,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "notification_templates_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"recipient_user_id" text NOT NULL,
	"template_id" text,
	"title" text NOT NULL,
	"message" text NOT NULL,
	"channel" text DEFAULT 'IN_APP' NOT NULL,
	"event_source" text DEFAULT 'PROJECTS' NOT NULL,
	"priority" text DEFAULT 'NORMAL' NOT NULL,
	"is_read" boolean DEFAULT false NOT NULL,
	"read_at" text,
	"action_url" text,
	"metadata_json" jsonb,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "org_units" (
	"id" text PRIMARY KEY NOT NULL,
	"unit_code" text NOT NULL,
	"name" text NOT NULL,
	"unit_type" text NOT NULL,
	"parent_id" text,
	"company_id" text,
	"branch_id" text,
	"head_employee_id" text,
	"head_employee_name" text,
	"color" text,
	"icon" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission_attributes" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"attribute_key" text NOT NULL,
	"operator" text DEFAULT 'EQUALS' NOT NULL,
	"attribute_value" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permission_policies" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"effect" text DEFAULT 'ALLOW' NOT NULL,
	"priority" integer DEFAULT 100 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "permission_policies_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "permission_scopes" (
	"id" text PRIMARY KEY NOT NULL,
	"policy_id" text NOT NULL,
	"scope_type" text DEFAULT 'GLOBAL' NOT NULL,
	"module_code" text NOT NULL,
	"feature_code" text DEFAULT '*' NOT NULL,
	"actions_json" jsonb NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"module" text NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "profit_centers" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"business_unit_id" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "profit_centers_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "project_activities" (
	"id" text PRIMARY KEY NOT NULL,
	"work_package_id" text NOT NULL,
	"project_id" text NOT NULL,
	"department_id" text,
	"activity_code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"sequence_order" integer DEFAULT 0 NOT NULL,
	"assigned_to_id" text,
	"assigned_to_name" text,
	"start_date" text,
	"target_date" text,
	"actual_completion_date" text,
	"progress_percentage" double precision DEFAULT 0 NOT NULL,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_categories" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "project_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "project_departments" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"department_id" text NOT NULL,
	"department_name" text,
	"role" text DEFAULT 'LEAD' NOT NULL,
	"allocated_budget" double precision DEFAULT 0 NOT NULL,
	"discipline" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_documents" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"site_id" text,
	"document_category" text NOT NULL,
	"title" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text NOT NULL,
	"file_size" double precision NOT NULL,
	"version" text NOT NULL,
	"notes" text,
	"uploaded_by_id" text,
	"uploaded_by_name" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_members" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"employee_id" text NOT NULL,
	"employee_name" text,
	"role" text NOT NULL,
	"joining_date" text NOT NULL,
	"leaving_date" text,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_milestones" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"title" text NOT NULL,
	"target_date" text NOT NULL,
	"actual_date" text,
	"status" text NOT NULL,
	"delay_days" integer DEFAULT 0 NOT NULL,
	"description" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "project_settings" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"enabled_departments" jsonb,
	"enabled_modules" jsonb,
	"enabled_work_package_types" jsonb,
	"approval_workflow" jsonb,
	"project_calendar" jsonb,
	"project_statuses" jsonb,
	"project_number_format" text,
	"document_number_format" text,
	"updated_at" text NOT NULL,
	CONSTRAINT "project_settings_project_id_unique" UNIQUE("project_id")
);
--> statement-breakpoint
CREATE TABLE "project_types" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category_id" text,
	"category_name" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "project_types_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "project_work_packages" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"package_code" text NOT NULL,
	"title" text NOT NULL,
	"department_id" text,
	"work_package_type_id" text,
	"work_package_type_name" text,
	"discipline" text,
	"assigned_team_id" text,
	"lead_employee_id" text,
	"lead_employee_name" text,
	"budget" double precision DEFAULT 0 NOT NULL,
	"start_date" text,
	"target_date" text,
	"actual_completion_date" text,
	"progress_percentage" double precision DEFAULT 0,
	"display_order" integer DEFAULT 0,
	"status" text DEFAULT 'PLANNED' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	"deleted_at" text
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" text PRIMARY KEY NOT NULL,
	"project_code" text NOT NULL,
	"project_name" text NOT NULL,
	"short_name" text,
	"project_category_id" text,
	"project_category" text,
	"project_type_id" text,
	"project_type" text,
	"client_id" text,
	"client_name" text,
	"consultant_id" text,
	"consultant_name" text,
	"funding_agency_id" text,
	"funding_agency_name" text,
	"contract_number" text,
	"work_order_number" text,
	"tender_number" text,
	"agreement_number" text,
	"company_id" text,
	"business_unit_id" text,
	"region_id" text,
	"branch_id" text,
	"division_id" text,
	"parent_project_id" text,
	"customer_id" text,
	"customer_name" text,
	"location" text NOT NULL,
	"state" text,
	"district" text,
	"taluk" text,
	"village" text,
	"latitude" double precision,
	"longitude" double precision,
	"start_date" text NOT NULL,
	"target_completion_date" text NOT NULL,
	"scheduled_completion_date" text,
	"actual_completion_date" text,
	"status" text NOT NULL,
	"priority" text NOT NULL,
	"budget" double precision NOT NULL,
	"contract_value" double precision,
	"revised_contract_value" double precision,
	"currency" text DEFAULT 'AED',
	"actual_spent" double precision,
	"progress_percentage" double precision,
	"project_manager_id" text,
	"project_incharge_id" text,
	"project_supervisor_id" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_orders" (
	"id" text PRIMARY KEY NOT NULL,
	"po_number" text NOT NULL,
	"vendor_id" text NOT NULL,
	"vendor_name" text NOT NULL,
	"requisition_id" text,
	"project_id" text,
	"project_name" text,
	"po_date" text NOT NULL,
	"expected_delivery_date" text NOT NULL,
	"total_amount" double precision NOT NULL,
	"payment_terms" text,
	"quotation_ref" text,
	"status" text NOT NULL,
	"payment_status" text NOT NULL,
	"delivery_status" text NOT NULL,
	"notes" text,
	"created_by_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "purchase_requests" (
	"id" text PRIMARY KEY NOT NULL,
	"requisition_code" text NOT NULL,
	"project_id" text NOT NULL,
	"project_name" text NOT NULL,
	"site_id" text,
	"site_name" text,
	"material_id" text NOT NULL,
	"material_name" text NOT NULL,
	"quantity" double precision NOT NULL,
	"unit" text NOT NULL,
	"priority" text NOT NULL,
	"required_date" text NOT NULL,
	"requested_by_id" text NOT NULL,
	"requested_by_name" text NOT NULL,
	"verified_by_id" text,
	"verified_by_name" text,
	"approved_by_id" text,
	"approved_by_name" text,
	"status" text NOT NULL,
	"remarks" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "refresh_tokens" (
	"id" text PRIMARY KEY NOT NULL,
	"token" text NOT NULL,
	"user_id" text NOT NULL,
	"device" text,
	"ip_address" text,
	"is_revoked" boolean DEFAULT false NOT NULL,
	"expires_at" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"business_unit_id" text NOT NULL,
	"state" text,
	"country" text DEFAULT 'UAE' NOT NULL,
	"head_employee_id" text,
	"head_employee_name" text,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "regions_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "report_execution_logs" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"executed_by_user_id" text NOT NULL,
	"executed_by_user_name" text NOT NULL,
	"execution_time_ms" integer DEFAULT 120 NOT NULL,
	"row_count" integer DEFAULT 0 NOT NULL,
	"exported_format" text,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "report_schedules" (
	"id" text PRIMARY KEY NOT NULL,
	"report_id" text NOT NULL,
	"cron_expression" text DEFAULT '0 8 * * *' NOT NULL,
	"recipient_emails_json" jsonb NOT NULL,
	"export_format" text DEFAULT 'PDF' NOT NULL,
	"last_run_at" text,
	"next_run_at" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reporting_levels" (
	"id" text PRIMARY KEY NOT NULL,
	"level_rank" integer NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "reporting_levels_level_rank_unique" UNIQUE("level_rank")
);
--> statement-breakpoint
CREATE TABLE "reports" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"data_source" text DEFAULT 'PROJECTS' NOT NULL,
	"report_type" text DEFAULT 'TABULAR' NOT NULL,
	"columns_json" jsonb NOT NULL,
	"filters_json" jsonb,
	"chart_config_json" jsonb,
	"is_favorite" boolean DEFAULT false NOT NULL,
	"is_scheduled" boolean DEFAULT false NOT NULL,
	"schedule_frequency" text,
	"created_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "reports_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "role_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"role_id" text NOT NULL,
	"permission_id" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "roles" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_jobs" (
	"id" text PRIMARY KEY NOT NULL,
	"rule_id" text NOT NULL,
	"job_name" text NOT NULL,
	"schedule_type" text DEFAULT 'CRON' NOT NULL,
	"cron_expression" text,
	"next_run_at" text NOT NULL,
	"last_run_at" text,
	"status" text DEFAULT 'ACTIVE' NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sites" (
	"id" text PRIMARY KEY NOT NULL,
	"site_code" text NOT NULL,
	"site_name" text NOT NULL,
	"project_id" text NOT NULL,
	"address" text NOT NULL,
	"latitude" double precision,
	"longitude" double precision,
	"google_map_url" text,
	"site_engineer_id" text,
	"supervisor_id" text,
	"incharge_id" text,
	"status" text NOT NULL,
	"progress_percentage" double precision,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "skills" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"category" text DEFAULT 'TECHNICAL' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "skills_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "stock_transactions" (
	"id" text PRIMARY KEY NOT NULL,
	"transaction_code" text NOT NULL,
	"transaction_type" text NOT NULL,
	"material_id" text NOT NULL,
	"material_name" text NOT NULL,
	"material_code" text NOT NULL,
	"warehouse_id" text NOT NULL,
	"warehouse_name" text NOT NULL,
	"target_warehouse_id" text,
	"target_warehouse_name" text,
	"quantity" double precision NOT NULL,
	"unit_price" double precision NOT NULL,
	"total_value" double precision NOT NULL,
	"project_id" text,
	"project_name" text,
	"wbs_id" text,
	"boq_item_id" text,
	"cost_code_id" text,
	"cost_code" text,
	"site_id" text,
	"site_name" text,
	"work_category" text,
	"issued_by_id" text,
	"issued_by_name" text,
	"received_by_id" text,
	"received_by_name" text,
	"supervisor_id" text,
	"supervisor_name" text,
	"reference_doc" text,
	"notes" text,
	"status" text NOT NULL,
	"approved_by_id" text,
	"approved_by_name" text,
	"transaction_date" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stock_verifications" (
	"id" text PRIMARY KEY NOT NULL,
	"verification_code" text NOT NULL,
	"warehouse_id" text NOT NULL,
	"warehouse_name" text NOT NULL,
	"material_id" text NOT NULL,
	"material_name" text NOT NULL,
	"system_stock" double precision NOT NULL,
	"physical_stock" double precision NOT NULL,
	"discrepancy" double precision NOT NULL,
	"reason" text,
	"verified_by_id" text NOT NULL,
	"verified_by_name" text NOT NULL,
	"status" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "stocks" (
	"id" text PRIMARY KEY NOT NULL,
	"warehouse_id" text NOT NULL,
	"material_id" text NOT NULL,
	"quantity" double precision NOT NULL,
	"reserved_quantity" double precision DEFAULT 0 NOT NULL,
	"batch_number" text,
	"rack_location" text,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_modules" (
	"id" text PRIMARY KEY NOT NULL,
	"module_id" text NOT NULL,
	"sub_module_code" text NOT NULL,
	"name" text NOT NULL,
	"icon" text DEFAULT 'Layers',
	"display_order" integer DEFAULT 0 NOT NULL,
	"route_path" text,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "task_comments" (
	"id" text PRIMARY KEY NOT NULL,
	"task_id" text NOT NULL,
	"user_id" text NOT NULL,
	"user_name" text NOT NULL,
	"comment" text NOT NULL,
	"attachment_url" text,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" text PRIMARY KEY NOT NULL,
	"project_id" text NOT NULL,
	"site_id" text,
	"work_package_id" text,
	"activity_id" text,
	"department_id" text,
	"title" text NOT NULL,
	"description" text,
	"assigned_to_id" text,
	"assigned_to_name" text,
	"priority" text NOT NULL,
	"due_date" text NOT NULL,
	"status" text NOT NULL,
	"milestone_id" text,
	"attachments" jsonb,
	"checklist" jsonb,
	"progress_percentage" double precision DEFAULT 0,
	"verified_by_id" text,
	"verified_by_name" text,
	"approved_by_id" text,
	"approved_by_name" text,
	"created_by_id" text NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "trades" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"discipline" text DEFAULT 'CIVIL' NOT NULL,
	"description" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "trades_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "user_effective_permissions" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"policy_id" text NOT NULL,
	"is_granted" boolean DEFAULT true NOT NULL,
	"granted_by" text DEFAULT 'SYSTEM' NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"uid" text,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"department" text NOT NULL,
	"avatar_url" text,
	"role_id" text NOT NULL,
	"employee_id" text,
	"assigned_project_id" text,
	"assigned_project_name" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_email_verified" boolean DEFAULT false NOT NULL,
	"last_login_at" text,
	"failed_login_attempts" integer DEFAULT 0 NOT NULL,
	"locked_until" text,
	"created_by" text,
	"updated_by" text,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" text PRIMARY KEY NOT NULL,
	"vehicle_number" text NOT NULL,
	"vehicle_type" text NOT NULL,
	"fuel_type" text NOT NULL,
	"current_odometer" double precision NOT NULL,
	"insurance_policy" text,
	"insurance_expiry" text,
	"rc_number" text,
	"fitness_expiry" text,
	"assigned_driver_id" text,
	"status" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "vendors" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"contact_person" text,
	"email" text,
	"phone" text,
	"address" text,
	"tax_id" text,
	"rating" double precision DEFAULT 0 NOT NULL,
	"payment_terms" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "warehouses" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"type" text NOT NULL,
	"location" text NOT NULL,
	"site_id" text,
	"manager_id" text,
	"manager_name" text,
	"capacity" double precision,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "work_package_types" (
	"id" text PRIMARY KEY NOT NULL,
	"type_code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"display_order" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_approvers" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"state_code" text NOT NULL,
	"approval_order" integer DEFAULT 1 NOT NULL,
	"approver_type" text NOT NULL,
	"approver_target" text NOT NULL,
	"is_parallel" boolean DEFAULT false NOT NULL,
	"min_approval_count" integer DEFAULT 1 NOT NULL,
	"escalation_hours" integer DEFAULT 48,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_conditions" (
	"id" text PRIMARY KEY NOT NULL,
	"transition_id" text NOT NULL,
	"field" text NOT NULL,
	"operator" text NOT NULL,
	"value" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_history" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_code" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text NOT NULL,
	"from_state" text NOT NULL,
	"to_state" text NOT NULL,
	"action_taken" text NOT NULL,
	"performed_by_user_id" text NOT NULL,
	"performed_by_user_name" text NOT NULL,
	"performed_by_user_role" text NOT NULL,
	"department" text,
	"comments" text,
	"approval_remarks" text,
	"attachments_json" jsonb,
	"digital_signature" text,
	"timestamp" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"transition_id" text NOT NULL,
	"channel" text NOT NULL,
	"template_text" text NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_states" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"state_code" text NOT NULL,
	"name" text NOT NULL,
	"type" text DEFAULT 'INTERMEDIATE',
	"color" text DEFAULT '#3b82f6',
	"display_order" integer DEFAULT 0 NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_transitions" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"version_number" integer DEFAULT 1 NOT NULL,
	"from_state_code" text NOT NULL,
	"to_state_code" text NOT NULL,
	"action_label" text NOT NULL,
	"required_role" text,
	"requires_comments" boolean DEFAULT false NOT NULL,
	"requires_signature" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflow_versions" (
	"id" text PRIMARY KEY NOT NULL,
	"workflow_id" text NOT NULL,
	"version_number" integer NOT NULL,
	"description" text,
	"is_published" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "workflows" (
	"id" text PRIMARY KEY NOT NULL,
	"code" text NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"category" text DEFAULT 'GENERAL',
	"module_code" text NOT NULL,
	"company_id" text,
	"branch_id" text,
	"department_id" text,
	"project_id" text,
	"active_version" integer DEFAULT 1 NOT NULL,
	"is_enabled" boolean DEFAULT true NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL,
	"created_at" text NOT NULL,
	"updated_at" text NOT NULL,
	CONSTRAINT "workflows_code_unique" UNIQUE("code")
);
