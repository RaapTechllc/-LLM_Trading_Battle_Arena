-- Add isFavorite column to cards table
ALTER TABLE cards ADD COLUMN isFavorite BOOLEAN DEFAULT FALSE;
