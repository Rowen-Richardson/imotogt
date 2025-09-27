-- Migration: Add soft delete columns to vehicles table
ALTER TABLE vehicles
ADD COLUMN is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN deleted_at TIMESTAMP,
ADD COLUMN delete_reason TEXT;

-- Optionally, you can use an ENUM for delete_reason if you want to restrict values:
-- CREATE TYPE delete_reason_enum AS ENUM ('sold', 'no_longer_selling', 'not_interested', 'other');
-- ALTER TABLE vehicles ADD COLUMN delete_reason delete_reason_enum;
