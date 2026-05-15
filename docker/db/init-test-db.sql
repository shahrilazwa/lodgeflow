-- Create the test database for PHPUnit/Pest tests
-- This runs automatically when the PostgreSQL container is first initialized.
CREATE DATABASE lodgeflow_test;
GRANT ALL PRIVILEGES ON DATABASE lodgeflow_test TO lodgeflow;
