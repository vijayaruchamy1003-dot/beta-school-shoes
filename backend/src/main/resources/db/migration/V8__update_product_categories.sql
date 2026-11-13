-- V8__update_product_categories.sql: Migrate legacy categories to BOYS, GIRLS, MEN, WOMEN, SCHOOL_SHOES

UPDATE products SET category = 'BOYS' WHERE category = 'BOYS_FORMAL';
UPDATE products SET category = 'GIRLS' WHERE category = 'GIRLS_FORMAL';
UPDATE products SET category = 'SCHOOL_SHOES' WHERE category IN ('SPORTS_PT', 'JUNIOR_VELCRO');
