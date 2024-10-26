-- Create the db
-- DROP DATABASE usof;
CREATE DATABASE usof;

USE usof;

-- Create the user with all privileges on the new db
CREATE USER 'olgatsybanusof'@'localhost' IDENTIFIED BY 'securepass';

-- Grant all privileges 
GRANT ALL ON usof.* TO 'olgatsybanusof'@'localhost';