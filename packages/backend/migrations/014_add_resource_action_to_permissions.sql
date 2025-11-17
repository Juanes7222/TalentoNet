-- Add resource and action columns to permissions table
ALTER TABLE permissions 
ADD COLUMN IF NOT EXISTS resource VARCHAR(255),
ADD COLUMN IF NOT EXISTS action VARCHAR(255);

-- Update existing permissions with resource and action extracted from name
-- Format: resource.action (e.g., users.read -> resource: users, action: read)
UPDATE permissions 
SET 
    resource = SPLIT_PART(name, '.', 1),
    action = SPLIT_PART(name, '.', 2)
WHERE name LIKE '%.%';

-- For permissions without dots, use the name as resource
UPDATE permissions 
SET 
    resource = name,
    action = 'manage'
WHERE name NOT LIKE '%.%' AND resource IS NULL;
