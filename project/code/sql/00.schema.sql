-- This file contains the schema for the PostgreSQL database. The database will
-- be filled from the other SQL files that are generated from the raw datasets
-- using a Python script.

-- We use PostGIS for easier handling of spatial data types.
CREATE EXTENSION IF NOT EXISTS postgis;

-- ===================
-- Municipality Tables
-- ===================

CREATE TABLE District (
    code INTEGER PRIMARY KEY,
    name_it VARCHAR(32) NOT NULL UNIQUE,
    name_de VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE Municipality (
    istat_code INTEGER PRIMARY KEY,
    name_it VARCHAR(32) NOT NULL UNIQUE,
    name_de VARCHAR(32) NOT NULL UNIQUE,
    name_ld VARCHAR(32),
    zip_code INTEGER NOT NULL,
    distr_code INTEGER NOT NULL,
    geom GEOMETRY NOT NULL,
    FOREIGN KEY (distr_code) REFERENCES District(code)
);

-- =====================
-- Infrastructure Tables
-- =====================

CREATE TABLE InfrastructureType (
    code INTEGER PRIMARY KEY,
    name_it VARCHAR(48) NOT NULL UNIQUE,
    name_de VARCHAR(48) NOT NULL UNIQUE
);

CREATE TABLE InfrastructureLine (
    code INTEGER PRIMARY KEY,
    type_code INTEGER NOT NULL,
    istat_code INTEGER,
    geom GEOMETRY NOT NULL,
    FOREIGN KEY (type_code) REFERENCES InfrastructureType(code),
    FOREIGN KEY (istat_code) REFERENCES Municipality(istat_code)
);

CREATE TABLE InfrastructureNode (
    code INTEGER PRIMARY KEY,
    type_code INTEGER NOT NULL,
    istat_code INTEGER NOT NULL,
    geom GEOMETRY NOT NULL,
    FOREIGN KEY (type_code) REFERENCES InfrastructureType(code),
    FOREIGN KEY (istat_code) REFERENCES Municipality(istat_code)
);

-- ==================
-- Hazard Area Tables
-- ==================

CREATE TABLE HazardProcess (
    code CHAR(2) PRIMARY KEY,
    name_it VARCHAR(32) NOT NULL UNIQUE,
    name_de VARCHAR(32) NOT NULL UNIQUE
);

CREATE TABLE DangerLevel (
    code INTEGER PRIMARY KEY,
    name_it VARCHAR(64) NOT NULL UNIQUE,
    name_de VARCHAR(64) NOT NULL UNIQUE
);

CREATE TABLE LandslideHazard (
    code INTEGER PRIMARY KEY,
    danger_code INTEGER NOT NULL,
    process_code CHAR(2) NOT NULL,
    istat_code INTEGER NOT NULL,
    geom GEOMETRY NOT NULL,
    FOREIGN KEY (danger_code) REFERENCES DangerLevel(code),
    FOREIGN KEY (process_code) REFERENCES HazardProcess(code),
    FOREIGN KEY (istat_code) REFERENCES Municipality(istat_code)
);

CREATE TABLE AvalancheHazard (
    code INTEGER PRIMARY KEY,
    danger_code INTEGER NOT NULL,
    process_code CHAR(2) NOT NULL,
    istat_code INTEGER NOT NULL,
    geom GEOMETRY NOT NULL,
    FOREIGN KEY (danger_code) REFERENCES DangerLevel(code),
    FOREIGN KEY (process_code) REFERENCES HazardProcess(code),
    FOREIGN KEY (istat_code) REFERENCES Municipality(istat_code)
);

-- Spatial indexes for performance on all geometry attributes.
CREATE INDEX idx_municipality_geom ON Municipality USING GIST (geom);
CREATE INDEX idx_infra_line_geom ON InfrastructureLine USING GIST (geom);
CREATE INDEX idx_infra_node_geom ON InfrastructureNode USING GIST (geom);
CREATE INDEX idx_landslide_geom ON LandslideHazard USING GIST (geom);
CREATE INDEX idx_avalanche_geom ON AvalancheHazard USING GIST (geom);

