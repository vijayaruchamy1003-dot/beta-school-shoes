-- V4__school_student_orders.sql: Schema for School Management and Student Orders

CREATE TABLE IF NOT EXISTS schools (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(64) UNIQUE NOT NULL,
    address TEXT NOT NULL,
    contact_person VARCHAR(128) NOT NULL,
    phone VARCHAR(32) NOT NULL,
    email VARCHAR(128) NOT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_schools_code ON schools(code);
CREATE INDEX IF NOT EXISTS idx_schools_active ON schools(is_active);

CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    admission_number VARCHAR(64) NOT NULL,
    first_name VARCHAR(64) NOT NULL,
    last_name VARCHAR(64) NOT NULL,
    grade_class VARCHAR(32) NOT NULL,
    section VARCHAR(16),
    parent_name VARCHAR(128),
    parent_phone VARCHAR(32),
    parent_email VARCHAR(128),
    gender VARCHAR(16),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_school_student_admission UNIQUE (school_id, admission_number)
);

CREATE INDEX IF NOT EXISTS idx_students_school ON students(school_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(school_id, grade_class, section);

CREATE TABLE IF NOT EXISTS student_orders (
    id UUID PRIMARY KEY,
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    order_type VARCHAR(32) NOT NULL DEFAULT 'SCHOOL_VISIT',
    status VARCHAR(32) NOT NULL DEFAULT 'DRAFT',
    stock_policy VARCHAR(32) NOT NULL DEFAULT 'BOOKING_ONLY',
    created_by_admin_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_quantity INT NOT NULL DEFAULT 0,
    estimated_total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_orders_school ON student_orders(school_id);
CREATE INDEX IF NOT EXISTS idx_student_orders_student ON student_orders(student_id);
CREATE INDEX IF NOT EXISTS idx_student_orders_status ON student_orders(status);

CREATE TABLE IF NOT EXISTS student_order_items (
    id UUID PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES student_orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_size_id UUID REFERENCES product_sizes(id) ON DELETE SET NULL,
    category VARCHAR(32) NOT NULL,
    product_name VARCHAR(255) NOT NULL,
    size_label VARCHAR(32) NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    item_notes TEXT,
    stock_reserved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_student_order_items_order ON student_order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_student_order_items_category ON student_order_items(category);
