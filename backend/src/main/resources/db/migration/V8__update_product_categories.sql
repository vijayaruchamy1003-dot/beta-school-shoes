-- V8__update_product_categories.sql: Migrate legacy categories to BOYS, GIRLS, MEN, WOMEN, SCHOOL_SHOES
-- and add database-backed image persistence columns so uploaded product images never disappear.

UPDATE products SET category = 'BOYS' WHERE category = 'BOYS_FORMAL';
UPDATE products SET category = 'GIRLS' WHERE category = 'GIRLS_FORMAL';
UPDATE products SET category = 'SCHOOL_SHOES' WHERE category IN ('SPORTS_PT', 'JUNIOR_VELCRO');

ALTER TABLE product_images ADD COLUMN IF NOT EXISTS content_type VARCHAR(128);
ALTER TABLE product_images ADD COLUMN IF NOT EXISTS image_data_base64 TEXT;
