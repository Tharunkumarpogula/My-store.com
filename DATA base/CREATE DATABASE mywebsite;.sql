-- PostgreSQL bootstrap (run in psql as a superuser / admin)
-- Creates the database used by the Node/Sequelize project in ./my-website-database

CREATE DATABASE mywebsite;

-- Optional: create a dedicated DB user (uncomment and adjust)
-- CREATE USER mywebsite_user WITH PASSWORD 'change_me';
-- GRANT ALL PRIVILEGES ON DATABASE mywebsite TO mywebsite_user;
