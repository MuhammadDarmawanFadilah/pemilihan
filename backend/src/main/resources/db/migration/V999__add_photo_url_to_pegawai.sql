-- Add photo_url column to pegawai table
ALTER TABLE pegawai ADD COLUMN photo_url VARCHAR(500);

-- Add comment to the column
COMMENT ON COLUMN pegawai.photo_url IS 'URL or file path for pegawai profile photo';
