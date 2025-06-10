-- Initialization script for EventPlatform PostgreSQL Database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist
SELECT 'CREATE DATABASE eventplatform'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'eventplatform')\gexec

-- Connect to the database
\c eventplatform;

-- Create extensions that might be useful
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Set timezone
SET timezone = 'America/Sao_Paulo';

-- Create a comment on the database
COMMENT ON DATABASE eventplatform IS 'EventPlatform - Sistema de Gerenciamento de Eventos'; 