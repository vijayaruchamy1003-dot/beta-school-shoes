-- V7__add_product_badges_and_mrp.sql: Add mrp, is_bestseller, is_new_arrival, and badge_text to products
ALTER TABLE products ADD COLUMN IF NOT EXISTS mrp NUMERIC(10,2);
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_bestseller BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_new_arrival BOOLEAN DEFAULT FALSE;
ALTER TABLE products ADD COLUMN IF NOT EXISTS badge_text VARCHAR(64);
