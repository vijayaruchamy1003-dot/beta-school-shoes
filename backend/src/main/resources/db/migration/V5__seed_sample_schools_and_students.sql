-- V5__seed_sample_schools_and_students.sql: Seed sample schools, students, and visit orders

INSERT INTO schools (id, name, code, address, contact_person, phone, email, is_active)
VALUES
('31111111-1111-1111-1111-111111111101', 'St. Xavier''s International Academy', 'SCH-XAV-01', '12 Residency Road, Central Ward, Bengaluru 560025', 'Fr. Thomas Matthew', '+91 80 2233 4455', 'admin@stxaviers-academy.edu.in', TRUE),
('31111111-1111-1111-1111-111111111102', 'Delhi Public Model School', 'SCH-DPS-02', 'Sector 4, Institutional Area, Bengaluru 560034', 'Dr. Sunita Deshmukh', '+91 80 4455 6677', 'principal@dpsmodelschool.edu.in', TRUE)
ON CONFLICT (code) DO NOTHING;

-- Students for St. Xavier's
INSERT INTO students (id, school_id, admission_number, first_name, last_name, grade_class, section, parent_name, parent_phone, parent_email, gender, is_active)
VALUES
('41111111-1111-1111-1111-111111111101', '31111111-1111-1111-1111-111111111101', 'ADM-2026-001', 'Aarav', 'Sharma', 'Class 5', 'A', 'Rajesh Sharma', '+91 98450 11111', 'rajesh.sharma@example.com', 'MALE', TRUE),
('41111111-1111-1111-1111-111111111102', '31111111-1111-1111-1111-111111111102', 'ADM-2026-002', 'Ananya', 'Iyer', 'Class 5', 'A', 'Karthik Iyer', '+91 98450 22222', 'karthik.iyer@example.com', 'FEMALE', TRUE),
('41111111-1111-1111-1111-111111111103', '31111111-1111-1111-1111-111111111101', 'ADM-2026-003', 'Rohan', 'Verma', 'Class 6', 'B', 'Deepak Verma', '+91 98450 33333', 'deepak.verma@example.com', 'MALE', TRUE),
('41111111-1111-1111-1111-111111111104', '31111111-1111-1111-1111-111111111101', 'ADM-2026-004', 'Diya', 'Nair', 'Class 6', 'B', 'Prakash Nair', '+91 98450 44444', 'prakash.nair@example.com', 'FEMALE', TRUE),
('41111111-1111-1111-1111-111111111105', '31111111-1111-1111-1111-111111111101', 'ADM-2026-005', 'Kabir', 'Reddy', 'Class 7', 'A', 'Suresh Reddy', '+91 98450 55555', 'suresh.reddy@example.com', 'MALE', TRUE)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- Students for DPS
INSERT INTO students (id, school_id, admission_number, first_name, last_name, grade_class, section, parent_name, parent_phone, parent_email, gender, is_active)
VALUES
('41111111-1111-1111-1111-111111111201', '31111111-1111-1111-1111-111111111102', 'DPS-2026-101', 'Vikram', 'Mehta', 'Class 8', 'C', 'Alok Mehta', '+91 98450 66666', 'alok.mehta@example.com', 'MALE', TRUE),
('41111111-1111-1111-1111-111111111202', '31111111-1111-1111-1111-111111111102', 'DPS-2026-102', 'Ishita', 'Sen', 'Class 8', 'C', 'Debashis Sen', '+91 98450 77777', 'debashis.sen@example.com', 'FEMALE', TRUE)
ON CONFLICT (school_id, admission_number) DO NOTHING;

-- School Visit Orders (St. Xavier's)
INSERT INTO student_orders (id, school_id, student_id, order_number, order_type, status, stock_policy, total_quantity, estimated_total_amount, notes)
VALUES
('51111111-1111-1111-1111-111111111101', '31111111-1111-1111-1111-111111111101', '41111111-1111-1111-1111-111111111101', 'VISIT-XAV-2026-001', 'SCHOOL_VISIT', 'CONFIRMED', 'BOOKING_ONLY', 6, 3240.00, 'Campus fitment drive - Semester 1 requirements'),
('51111111-1111-1111-1111-111111111102', '31111111-1111-1111-1111-111111111101', '41111111-1111-1111-1111-111111111102', 'VISIT-XAV-2026-002', 'SCHOOL_VISIT', 'CONFIRMED', 'BOOKING_ONLY', 5, 2750.00, 'Girls uniform set and PT kit'),
('51111111-1111-1111-1111-111111111103', '31111111-1111-1111-1111-111111111101', '41111111-1111-1111-1111-111111111103', 'VISIT-XAV-2026-003', 'SCHOOL_VISIT', 'DRAFT', 'BOOKING_ONLY', 4, 2190.00, 'Draft fitment waiting parent confirmation on size')
ON CONFLICT (order_number) DO NOTHING;

-- Order items across all 7 required product categories: shoes, shirts, pants, shorts, tshirts, socks, bags
INSERT INTO student_order_items (id, order_id, category, product_name, size_label, quantity, unit_price, subtotal, item_notes)
VALUES
-- Order 1 items (Aarav Sharma)
('61111111-1111-1111-1111-111111111101', '51111111-1111-1111-1111-111111111101', 'SHOES', 'BETA Classic Oxford Lace-Up', 'UK 3', 1, 749.00, 749.00, 'Formal school shoe'),
('61111111-1111-1111-1111-111111111102', '51111111-1111-1111-1111-111111111101', 'SHIRTS', 'White Half Sleeve Uniform Shirt', 'Size 30', 2, 450.00, 900.00, 'Standard monogram pocket'),
('61111111-1111-1111-1111-111111111103', '51111111-1111-1111-1111-111111111101', 'PANTS', 'Navy Formal Uniform Trousers', 'Size 28', 1, 650.00, 650.00, 'Pleated waist'),
('61111111-1111-1111-1111-111111111104', '51111111-1111-1111-1111-111111111101', 'SOCKS', 'Navy Knee-Length Uniform Socks (2 Pairs)', 'Medium', 1, 199.00, 199.00, 'Cotton blend'),
('61111111-1111-1111-1111-111111111105', '51111111-1111-1111-1111-111111111101', 'BAGS', 'Ergonomic Institutional Backpack', 'Standard 24L', 1, 742.00, 742.00, 'Reflective safety strip'),

-- Order 2 items (Ananya Iyer)
('61111111-1111-1111-1111-111111111201', '51111111-1111-1111-1111-111111111102', 'SHOES', 'BETA Mary Jane Single-Strap', 'UK 2', 1, 749.00, 749.00, 'Buckle formal shoe'),
('61111111-1111-1111-1111-111111111202', '51111111-1111-1111-1111-111111111102', 'TSHIRTS', 'House Sports Dry-Fit T-Shirt (Red House)', 'Size 30', 1, 450.00, 450.00, 'Sports team uniform'),
('61111111-1111-1111-1111-111111111203', '51111111-1111-1111-1111-111111111102', 'SHORTS', 'White PT Sports Shorts', 'Size 26', 1, 450.00, 450.00, 'Drawstring elastic waist'),
('61111111-1111-1111-1111-111111111204', '51111111-1111-1111-1111-111111111102', 'SHOES', 'BETA PT-Pro All-White Canvas Trainer', 'UK 2', 1, 599.00, 599.00, 'PT canvas trainer'),
('61111111-1111-1111-1111-111111111205', '51111111-1111-1111-1111-111111111102', 'BAGS', 'Ergonomic Institutional Backpack', 'Standard 24L', 1, 502.00, 502.00, 'Dual water bottle holder'),

-- Order 3 items (Rohan Verma - Draft)
('61111111-1111-1111-1111-111111111301', '51111111-1111-1111-1111-111111111103', 'SHOES', 'BETA Executive Derby Lace-Up', 'UK 4', 1, 899.00, 899.00, 'Derby formal shoe'),
('61111111-1111-1111-1111-111111111302', '51111111-1111-1111-1111-111111111103', 'SHIRTS', 'White Half Sleeve Uniform Shirt', 'Size 32', 2, 450.00, 900.00, 'School badge pocket'),
('61111111-1111-1111-1111-111111111303', '51111111-1111-1111-1111-111111111103', 'SOCKS', 'Navy Knee-Length Uniform Socks (2 Pairs)', 'Large', 1, 391.00, 391.00, 'Antimicrobial yarn')
ON CONFLICT (id) DO NOTHING;
