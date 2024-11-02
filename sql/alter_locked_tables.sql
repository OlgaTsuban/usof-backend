USE usof;

ALTER TABLE posts ADD COLUMN locked BOOLEAN DEFAULT false;
ALTER TABLE comments ADD COLUMN locked BOOLEAN DEFAULT false;

-- add rate
ALTER TABLE comments ADD COLUMN rating INT DEFAULT 0;
