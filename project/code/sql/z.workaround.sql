-- WARNING: This is a workaround to a Ontop optimization deficiency. It is not
-- actually strictly correct to do this.

-- Ontop seems to not be able to do some necessary foreign key constraint based
-- optimizations if the foreign key column is nullable. While the results are
-- still correct, the execution is 50-100x slower. To avoid this issue in the
-- application I decided to drop the 6 infrastructure lines that are missing
-- the municipality and make the foreign key column NOT NULL:

DELETE FROM infrastructureline WHERE istat_code IS NULL;

ALTER TABLE infrastructureline 
ALTER COLUMN istat_code SET NOT NULL;
