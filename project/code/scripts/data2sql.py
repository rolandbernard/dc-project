#!/bin/bash
# This is a data transformation script to extract from the raw dataset files the
# relations in the designed relational schema. This script generates one SQL file
# for each relations in the schema. Each file contains a single SQL insert statement
# with all of the tuples to be inserted. Expected to be run in the `code` directory.

import math

import pandas as pd

# First, we load all of the raw datasets.
df_line = pd.read_csv("../data/bz_infrastructure_line.csv.gz")
df_node = pd.read_csv("../data/bz_infrastructure_node.csv.gz")
df_landslide = pd.read_csv("../data/bz_hazard_landslide.csv.gz")
df_avalanche = pd.read_csv("../data/bz_hazard_avalanche.csv.gz")
df_municipality = pd.read_csv("../data/bz_admin_municipality.csv.gz")

# The final output tuples are accumulated into the following variables. One for
# each of the relations in the developed schema. Some data transformations are
# applied before adding into the below lists.
district = []
municipality = []
infra_type = []
infra_line = []
infra_node = []
hazard_process = []
danger_level = []
landslide = []
avalanche = []

# Generate from `df_line`.
for row in df_line.itertuples():
    infra_type.append((int(row.code), row.bez_i, row.bez_d))  # type: ignore
    infra_line.append((
        int(row.objectid), int(row.code),  # type: ignore
        None if math.isnan(row.istat_code)  # type: ignore
        else int(row.istat_code),  # type: ignore
        row.geom))

# Generate from `df_node`.
for row in df_node.itertuples():
    infra_type.append((int(row.code), row.bez_i, row.bez_d))  # type: ignore
    infra_node.append((
        int(row.objectid), int(row.code), int(row.istat_code), row.geom))  # type: ignore

# Generate from `df_landslide`.
for row in df_landslide.itertuples():
    danger_level.append((
        int(row.code) % 100, row.pericolo[8:], row.gefahr[17:]))  # type: ignore
    if isinstance(row.processo, str):
        hazard_process.append((
            row.id_process, row.processo, row.prozess))  # type: ignore
    elif row.id_process == "SD":
        hazard_process.append(("SD", "Altro", "Sonstiges"))
    landslide.append((
        int(row.objectid), int(row.code) % 100, row.id_process, int(row.istat_code), row.geom))  # type: ignore

# Generate from `df_avalanche`.
for row in df_avalanche.itertuples():
    danger_level.append((
        int(row.code) % 100, row.pericolo[10:], row.gefahr[9:]))  # type: ignore
    hazard_process.append((
        row.id_process, row.processo, row.prozess))  # type: ignore
    avalanche.append((
        int(row.objectid), int(row.code) % 100, row.id_process, int(row.istat_code), row.geom))  # type: ignore

# Generate from `df_municipality`.
for row in df_municipality.itertuples():
    district.append((
        int(row.distr_code), row.distr_it, row.distr_de))  # type: ignore
    municipality.append((
        int(row.istat_code), row.name_it, row.name_de, row.name_ld,  # type: ignore
        int(row.zip_code), int(row.distr_code), row.geom))  # type: ignore


# Write out the SQL files for each of the relations.
def write_rows(rows: list[tuple], f):
    rows = sorted(set(rows))
    first = True
    for row in rows:
        if not first:
            f.write(",\n")
        first = False
        f.write("    (")
        first2 = True
        for attr in row:
            if not first2:
                f.write(", ")
            first2 = False
            if attr is None or (isinstance(attr, float) and math.isnan(attr)):
                f.write("NULL")
            elif isinstance(attr, str):
                f.write("'")
                f.write(attr.replace("'", "''"))
                f.write("'")
            else:
                f.write(str(attr))
        f.write(")")


with open("sql/01.district.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO District (code, name_it, name_de)\n")
    f.write("VALUES\n")
    write_rows(district, f)
    f.write(";\n")

with open("sql/02.municipality.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO Municipality (istat_code, name_it, name_de, name_ld, zip_code, distr_code, geom)\n")
    f.write("VALUES\n")
    write_rows(municipality, f)
    f.write(";\n")

with open("sql/03.infrastructuretype.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO InfrastructureType (code, name_it, name_de)\n")
    f.write("VALUES\n")
    write_rows(infra_type, f)
    f.write(";\n")

with open("sql/04.infrastructureline.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write(
        "INSERT INTO InfrastructureLine (code, type_code, istat_code, geom)\n")
    f.write("VALUES\n")
    write_rows(infra_line, f)
    f.write(";\n")

with open("sql/05.infrastructurenode.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO InfrastructureNode (code, type_code, istat_code, geom)\n")
    f.write("VALUES\n")
    write_rows(infra_node, f)
    f.write(";\n")

with open("sql/06.hazardprocess.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO HazardProcess (code, name_it, name_de)\n")
    f.write("VALUES\n")
    write_rows(hazard_process, f)
    f.write(";\n")

with open("sql/07.dangerlevel.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO DangerLevel (code, name_it, name_de)\n")
    f.write("VALUES\n")
    write_rows(danger_level, f)
    f.write(";\n")

with open("sql/08.landslidehazard.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO LandslideHazard (code, danger_code, process_code, istat_code, geom)\n")
    f.write("VALUES\n")
    write_rows(landslide, f)
    f.write(";\n")

with open("sql/09.avalanchehazard.sql", "w") as f:
    f.write("-- This file has been automatically generated.\n")
    f.write("INSERT INTO AvalancheHazard (code, danger_code, process_code, istat_code, geom)\n")
    f.write("VALUES\n")
    write_rows(avalanche, f)
    f.write(";\n")
