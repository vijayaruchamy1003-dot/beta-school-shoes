-- V6__add_size_price.sql: Add optional size-specific price override to product_sizes
ALTER TABLE product_sizes ADD COLUMN IF NOT EXISTS price NUMERIC(10,2);
