-- =============================================================
-- CMG Camp Manager - PostgreSQL Schema
-- =============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================
-- 1. CAMPS
--    Root entity. All other tables reference this via camp_id.
-- =============================================================
CREATE TABLE camps (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         VARCHAR(150)  NOT NULL,
  location     TEXT          NOT NULL,
  capacity     INT           NOT NULL CHECK (capacity > 0),
  status       VARCHAR(20)   NOT NULL DEFAULT 'active'
                             CHECK (status IN ('active', 'inactive', 'maintenance')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 2. USERS
--    Application users (admins, supervisors, security guards).
--    camp_id is nullable for super_admins who manage all camps.
-- =============================================================
CREATE TABLE users (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id      UUID          REFERENCES camps(id) ON DELETE SET NULL,
  email        VARCHAR(255)  NOT NULL UNIQUE,
  full_name    VARCHAR(150)  NOT NULL,
  role         VARCHAR(30)   NOT NULL DEFAULT 'security'
                             CHECK (role IN ('super_admin', 'camp_admin', 'supervisor', 'security')),
  is_active    BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 3. SUBCONTRACTORS
--    Companies that supply workers to a camp.
-- =============================================================
CREATE TABLE subcontractors (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id       UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  name          VARCHAR(200)  NOT NULL,
  contact_name  VARCHAR(150),
  contact_phone VARCHAR(30),
  contact_email VARCHAR(255),
  is_active     BOOLEAN       NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 4. ROOMS
--    Physical rooms within a camp, organised by zone/building.
-- =============================================================
CREATE TABLE rooms (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id      UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  room_number  VARCHAR(20)   NOT NULL,
  zone         VARCHAR(100),
  building     VARCHAR(100),
  capacity     INT           NOT NULL CHECK (capacity >= 0),
  status       VARCHAR(20)   NOT NULL DEFAULT 'empty'
                             CHECK (status IN ('empty', 'partial', 'full', 'maintenance')),
  created_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  UNIQUE (camp_id, room_number)
);

-- =============================================================
-- 5. WORKERS
--    Registered workers/labourers staying at a camp.
-- =============================================================
CREATE TABLE workers (
  id                 UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id            UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  subcontractor_id   UUID          REFERENCES subcontractors(id) ON DELETE SET NULL,
  room_id            UUID          REFERENCES rooms(id) ON DELETE SET NULL,

  -- Identity
  first_name         VARCHAR(100)  NOT NULL,
  last_name          VARCHAR(100)  NOT NULL,
  document_type      VARCHAR(20)   NOT NULL
                                   CHECK (document_type IN ('national_id', 'passport', 'work_permit')),
  document_number    VARCHAR(60)   NOT NULL,
  photo_url          TEXT,

  -- Personal
  gender             VARCHAR(10)   CHECK (gender IN ('male', 'female', 'other')),
  nationality        VARCHAR(80),
  phone              VARCHAR(30),
  date_of_birth      DATE,

  -- Employment
  job_role           VARCHAR(100),
  qr_code            TEXT          UNIQUE,
  is_active          BOOLEAN       NOT NULL DEFAULT TRUE,

  registered_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  created_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ   NOT NULL DEFAULT NOW(),

  UNIQUE (camp_id, document_type, document_number)
);

-- =============================================================
-- 6. DEPENDENTS
--    Family members or dependents linked to a registered worker.
-- =============================================================
CREATE TABLE dependents (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id          UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  worker_id        UUID          NOT NULL REFERENCES workers(id) ON DELETE CASCADE,

  full_name        VARCHAR(150)  NOT NULL,
  relationship     VARCHAR(50),
  document_type    VARCHAR(20)   CHECK (document_type IN ('national_id', 'passport', 'other')),
  document_number  VARCHAR(60),
  phone            VARCHAR(30),
  date_of_birth    DATE,
  photo_url        TEXT,

  created_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 7. ACCESS_LOGS
--    Every gate scan event (entry or exit) for workers.
-- =============================================================
CREATE TABLE access_logs (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id      UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  worker_id    UUID          REFERENCES workers(id) ON DELETE SET NULL,
  scanned_by   UUID          REFERENCES users(id) ON DELETE SET NULL,

  direction    VARCHAR(3)    NOT NULL CHECK (direction IN ('in', 'out')),
  scanned_at   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  gate         VARCHAR(80),
  notes        TEXT
);

-- =============================================================
-- 8. VISITORS
--    Temporary visitors checked in/out by security guards.
-- =============================================================
CREATE TABLE visitors (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id              UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  visiting_worker_id   UUID          REFERENCES workers(id) ON DELETE SET NULL,
  checked_in_by        UUID          REFERENCES users(id) ON DELETE SET NULL,
  checked_out_by       UUID          REFERENCES users(id) ON DELETE SET NULL,

  full_name            VARCHAR(150)  NOT NULL,
  phone                VARCHAR(30),
  purpose              VARCHAR(150),
  visiting_room        VARCHAR(20),

  time_in              TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  time_out             TIMESTAMPTZ,
  is_active            BOOLEAN       NOT NULL DEFAULT TRUE,

  created_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- INDEXES
-- =============================================================

CREATE INDEX idx_camps_status              ON camps(status);

CREATE INDEX idx_users_camp_id             ON users(camp_id);
CREATE INDEX idx_users_role                ON users(role);

CREATE INDEX idx_subcontractors_camp_id    ON subcontractors(camp_id);

CREATE INDEX idx_rooms_camp_id             ON rooms(camp_id);
CREATE INDEX idx_rooms_status              ON rooms(status);
CREATE INDEX idx_rooms_zone                ON rooms(camp_id, zone);

CREATE INDEX idx_workers_camp_id           ON workers(camp_id);
CREATE INDEX idx_workers_subcontractor     ON workers(subcontractor_id);
CREATE INDEX idx_workers_room_id           ON workers(room_id);
CREATE INDEX idx_workers_qr_code           ON workers(qr_code);
CREATE INDEX idx_workers_is_active         ON workers(camp_id, is_active);

CREATE INDEX idx_dependents_camp_id        ON dependents(camp_id);
CREATE INDEX idx_dependents_worker_id      ON dependents(worker_id);

CREATE INDEX idx_access_logs_camp_id       ON access_logs(camp_id);
CREATE INDEX idx_access_logs_worker_id     ON access_logs(worker_id);
CREATE INDEX idx_access_logs_scanned_at    ON access_logs(camp_id, scanned_at DESC);
CREATE INDEX idx_access_logs_direction     ON access_logs(camp_id, direction, scanned_at DESC);

CREATE INDEX idx_visitors_camp_id          ON visitors(camp_id);
CREATE INDEX idx_visitors_worker_id        ON visitors(visiting_worker_id);
CREATE INDEX idx_visitors_is_active        ON visitors(camp_id, is_active);
CREATE INDEX idx_visitors_time_in          ON visitors(camp_id, time_in DESC);

-- =============================================================
-- TRIGGER FUNCTION — auto-update updated_at on row change
-- =============================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_camps_updated_at
  BEFORE UPDATE ON camps
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subcontractors_updated_at
  BEFORE UPDATE ON subcontractors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_rooms_updated_at
  BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_workers_updated_at
  BEFORE UPDATE ON workers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_dependents_updated_at
  BEFORE UPDATE ON dependents
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_visitors_updated_at
  BEFORE UPDATE ON visitors
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
--    Enable RLS on all camp-scoped tables so Supabase policies
--    can restrict data access per authenticated user/camp.
-- =============================================================

ALTER TABLE camps          ENABLE ROW LEVEL SECURITY;
ALTER TABLE users          ENABLE ROW LEVEL SECURITY;
ALTER TABLE subcontractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms          ENABLE ROW LEVEL SECURITY;
ALTER TABLE workers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE dependents     ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitors       ENABLE ROW LEVEL SECURITY;

-- Example policy: users can only read rows belonging to their camp.
-- Replace auth.jwt() claims with your actual Supabase auth setup.
--
-- CREATE POLICY "camp_isolation" ON workers
--   FOR ALL
--   USING (camp_id = (auth.jwt() ->> 'camp_id')::UUID);

-- =============================================================
-- ██████╗ ██╗██╗     ██╗     ██╗███╗   ██╗ ██████╗
-- ██╔══██╗██║██║     ██║     ██║████╗  ██║██╔════╝
-- ██████╔╝██║██║     ██║     ██║██╔██╗ ██║██║  ███╗
-- ██╔══██╗██║██║     ██║     ██║██║╚██╗██║██║   ██║
-- ██████╔╝██║███████╗███████╗██║██║ ╚████║╚██████╔╝
-- ╚═════╝ ╚═╝╚══════╝╚══════╝╚═╝╚═╝  ╚═══╝ ╚═════╝
-- CMG Camp Billing — Schema Extension
-- Appended to the shared CMG Camp Manager database.
-- =============================================================

-- =============================================================
-- 9. INSPECTION_LOGS  (owned by CMG Camp Hygiene Inspection)
--    Defined here so the billing system can JOIN against it.
--    If the Hygiene app already created this table, skip this
--    block (it is included for reference / cross-app clarity).
-- =============================================================
CREATE TABLE IF NOT EXISTS inspection_logs (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id         UUID          NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  room_id         UUID          NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  inspected_by    UUID          REFERENCES users(id) ON DELETE SET NULL,

  inspected_at    TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  result          VARCHAR(10)   NOT NULL CHECK (result IN ('passed', 'failed', 'warning')),
  notes           TEXT,
  photo_urls      TEXT[],       -- array of storage URLs

  created_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- =============================================================
-- 10. BILLING_RATES
--     Per-camp configurable rates for rent, water, electricity,
--     and the penalty amount charged per failed inspection.
--     Only one active rate row per camp at any time.
-- =============================================================
CREATE TABLE billing_rates (
  id                    UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id               UUID           NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

  -- Room rent
  rent_per_person       NUMERIC(10,2)  NOT NULL DEFAULT 0   CHECK (rent_per_person >= 0),

  -- Utilities
  water_rate_per_unit   NUMERIC(10,4)  NOT NULL DEFAULT 0   CHECK (water_rate_per_unit >= 0),
  electricity_rate_per_unit NUMERIC(10,4) NOT NULL DEFAULT 0 CHECK (electricity_rate_per_unit >= 0),

  -- Hygiene penalty
  penalty_per_failed_inspection NUMERIC(10,2) NOT NULL DEFAULT 0
                                              CHECK (penalty_per_failed_inspection >= 0),

  -- Validity window (NULL end_date = currently active)
  effective_from        DATE           NOT NULL DEFAULT CURRENT_DATE,
  effective_to          DATE,

  notes                 TEXT,
  created_by            UUID           REFERENCES users(id) ON DELETE SET NULL,
  created_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- =============================================================
-- 11. METER_READINGS
--     Monthly water & electricity meter readings per room.
--     Usage = current_reading - previous_reading (auto-calc).
--     One record per room per billing_month.
-- =============================================================
CREATE TABLE meter_readings (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id             UUID           NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  room_id             UUID           NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  recorded_by         UUID           REFERENCES users(id) ON DELETE SET NULL,

  -- Billing period (stored as first day of the month, e.g. 2025-03-01)
  billing_month       DATE           NOT NULL,

  -- Water meter
  water_prev_unit     NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (water_prev_unit >= 0),
  water_curr_unit     NUMERIC(12,2)  NOT NULL           CHECK (water_curr_unit >= 0),
  water_usage         NUMERIC(12,2)  GENERATED ALWAYS AS (water_curr_unit - water_prev_unit) STORED,
  water_rate          NUMERIC(10,4)  NOT NULL DEFAULT 0,
  water_cost          NUMERIC(12,2)  GENERATED ALWAYS AS (
                        GREATEST(water_curr_unit - water_prev_unit, 0) * water_rate
                      ) STORED,

  -- Electricity meter
  elec_prev_unit      NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (elec_prev_unit >= 0),
  elec_curr_unit      NUMERIC(12,2)  NOT NULL           CHECK (elec_curr_unit >= 0),
  elec_usage          NUMERIC(12,2)  GENERATED ALWAYS AS (elec_curr_unit - elec_prev_unit) STORED,
  elec_rate           NUMERIC(10,4)  NOT NULL DEFAULT 0,
  elec_cost           NUMERIC(12,2)  GENERATED ALWAYS AS (
                        GREATEST(elec_curr_unit - elec_prev_unit, 0) * elec_rate
                      ) STORED,

  notes               TEXT,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  UNIQUE (room_id, billing_month),
  CHECK (water_curr_unit >= water_prev_unit),
  CHECK (elec_curr_unit  >= elec_prev_unit)
);

-- =============================================================
-- 12. INVOICES
--     One invoice per room per billing month.
--     Totals are computed from line items (see table 13).
--     A DB trigger keeps total_amount in sync.
-- =============================================================
CREATE TABLE invoices (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  camp_id             UUID           NOT NULL REFERENCES camps(id) ON DELETE CASCADE,
  room_id             UUID           NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  meter_reading_id    UUID           REFERENCES meter_readings(id) ON DELETE SET NULL,

  billing_month       DATE           NOT NULL,   -- first day of month
  invoice_number      VARCHAR(30)    NOT NULL UNIQUE,  -- e.g. INV-2025-03-A101
  issued_at           TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  due_date            DATE           NOT NULL,

  -- Denormalised totals (kept in sync by trigger)
  rent_amount         NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (rent_amount >= 0),
  water_amount        NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (water_amount >= 0),
  elec_amount         NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (elec_amount >= 0),
  penalty_amount      NUMERIC(12,2)  NOT NULL DEFAULT 0 CHECK (penalty_amount >= 0),
  total_amount        NUMERIC(12,2)  GENERATED ALWAYS AS (
                        rent_amount + water_amount + elec_amount + penalty_amount
                      ) STORED,

  status              VARCHAR(10)    NOT NULL DEFAULT 'unpaid'
                                     CHECK (status IN ('unpaid', 'paid', 'overdue', 'void')),
  paid_at             TIMESTAMPTZ,
  paid_by             UUID           REFERENCES users(id) ON DELETE SET NULL,
  payment_method      VARCHAR(50),   -- 'cash', 'bank_transfer', etc.
  payment_reference   VARCHAR(100),

  notes               TEXT,
  created_by          UUID           REFERENCES users(id) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ    NOT NULL DEFAULT NOW(),

  UNIQUE (room_id, billing_month)
);

-- =============================================================
-- 13. INVOICE_LINE_ITEMS
--     Itemised breakdown inside each invoice.
--     Types: 'rent' | 'water' | 'electricity' | 'penalty' | 'other'
-- =============================================================
CREATE TABLE invoice_line_items (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id      UUID           NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
  camp_id         UUID           NOT NULL REFERENCES camps(id) ON DELETE CASCADE,

  line_type       VARCHAR(20)    NOT NULL
                                 CHECK (line_type IN ('rent', 'water', 'electricity', 'penalty', 'other')),
  description     TEXT           NOT NULL,

  -- For utility lines
  unit_count      NUMERIC(12,2),    -- units consumed
  unit_rate       NUMERIC(10,4),    -- rate per unit

  amount          NUMERIC(12,2)  NOT NULL CHECK (amount >= 0),

  -- For penalty lines — reference the triggering inspection
  inspection_log_id UUID         REFERENCES inspection_logs(id) ON DELETE SET NULL,

  sort_order      SMALLINT       NOT NULL DEFAULT 0,
  created_at      TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- =============================================================
-- BILLING INDEXES
-- =============================================================

CREATE INDEX idx_inspection_logs_camp_id    ON inspection_logs(camp_id);
CREATE INDEX idx_inspection_logs_room_id    ON inspection_logs(room_id);
CREATE INDEX idx_inspection_logs_result     ON inspection_logs(camp_id, result, inspected_at DESC);

CREATE INDEX idx_billing_rates_camp_id      ON billing_rates(camp_id);
CREATE INDEX idx_billing_rates_effective    ON billing_rates(camp_id, effective_from DESC);

CREATE INDEX idx_meter_readings_camp_id     ON meter_readings(camp_id);
CREATE INDEX idx_meter_readings_room_month  ON meter_readings(room_id, billing_month DESC);
CREATE INDEX idx_meter_readings_month       ON meter_readings(camp_id, billing_month DESC);

CREATE INDEX idx_invoices_camp_id           ON invoices(camp_id);
CREATE INDEX idx_invoices_room_id           ON invoices(room_id);
CREATE INDEX idx_invoices_billing_month     ON invoices(camp_id, billing_month DESC);
CREATE INDEX idx_invoices_status            ON invoices(camp_id, status);
CREATE INDEX idx_invoices_due_date          ON invoices(camp_id, due_date);

CREATE INDEX idx_line_items_invoice_id      ON invoice_line_items(invoice_id);
CREATE INDEX idx_line_items_type            ON invoice_line_items(invoice_id, line_type);

-- =============================================================
-- BILLING TRIGGERS — updated_at
-- =============================================================

CREATE TRIGGER trg_inspection_logs_updated_at
  BEFORE UPDATE ON inspection_logs
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_billing_rates_updated_at
  BEFORE UPDATE ON billing_rates
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_meter_readings_updated_at
  BEFORE UPDATE ON meter_readings
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_invoices_updated_at
  BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================
-- BILLING — ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE inspection_logs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE billing_rates      ENABLE ROW LEVEL SECURITY;
ALTER TABLE meter_readings     ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- =============================================================
-- HELPER VIEW: monthly_billing_summary
--   Joins rooms → meter_readings → invoices for a quick
--   per-room, per-month overview used by the billing dashboard.
-- =============================================================
CREATE OR REPLACE VIEW monthly_billing_summary AS
SELECT
  i.camp_id,
  i.billing_month,
  r.room_number,
  r.zone,
  r.building,
  -- Count occupants
  (SELECT COUNT(*) FROM workers w WHERE w.room_id = r.id AND w.is_active = TRUE) AS occupant_count,
  -- Meter data
  mr.water_prev_unit,
  mr.water_curr_unit,
  mr.water_usage,
  mr.water_cost,
  mr.elec_prev_unit,
  mr.elec_curr_unit,
  mr.elec_usage,
  mr.elec_cost,
  -- Invoice totals
  i.invoice_number,
  i.rent_amount,
  i.water_amount,
  i.elec_amount,
  i.penalty_amount,
  i.total_amount,
  i.status            AS payment_status,
  i.due_date,
  i.paid_at
FROM invoices i
JOIN rooms          r   ON r.id  = i.room_id
LEFT JOIN meter_readings mr ON mr.id = i.meter_reading_id;
