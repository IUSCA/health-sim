######################################
## Synthea OMOP Builder code to run ##
######################################

library("ETLSyntheaBuilder")
library("SqlRender")
library("DatabaseConnector")

# DB Config
database_name = Sys.getenv("POSTGRES_DB")
database_host = Sys.getenv("POSTGRES_HOST")

# Base Path Config
base_path = "/usr/src/app/src/"

print(paste0(base_path, "driver"))

# Create a connection to the database
connectionDetails <- DatabaseConnector::createConnectionDetails(
  dbms     = "postgresql",
  server   = paste0(database_host, "/", database_name),
  user     = Sys.getenv("POSTGRES_USER"),
  password = Sys.getenv("POSTGRES_PASSWORD"),
  port     = 5432, 
  pathToDriver = paste0(base_path,"driver")
)

# Create a v5.4 CDM and a v2.7.0 synthea database, in specified locations using specified files.
# Update accordingly.

cdmVersion        <- "5.4"
cdmDatabaseSchema <- "cdm"
syntheaSchema     <- "native"
syntheaFileLoc    <- paste0(base_path, "synthea/output/csv")
vocabFileLoc      <- paste0(base_path, "vocab/csv")
syntheaVersion    <- "2.7.0"

# Create CDM tables
ETLSyntheaBuilder::CreateCDMTables(connectionDetails,cdmDatabaseSchema,cdmVersion)
# Create synthea tables
ETLSyntheaBuilder::CreateSyntheaTables(connectionDetails,syntheaSchema, syntheaVersion)
# Populate synthea tables
ETLSyntheaBuilder::LoadSyntheaTables(connectionDetails,syntheaSchema,syntheaFileLoc)
# Populate vocabulary tables
ETLSyntheaBuilder::LoadVocabFromCsv(connectionDetails,cdmDatabaseSchema,vocabFileLoc)
# Create intermediate vocabulary mapping and visit rollup tables
ETLSyntheaBuilder::CreateMapAndRollupTables(connectionDetails, cdmDatabaseSchema,syntheaSchema,cdmVersion,syntheaVersion)
## Optional Step to create extra indices
ETLSyntheaBuilder::CreateExtraIndices(connectionDetails,cdmDatabaseSchema,syntheaSchema,syntheaVersion)
# Populate event tables
ETLSyntheaBuilder::LoadEventTables(connectionDetails,cdmDatabaseSchema,syntheaSchema,cdmVersion,syntheaVersion)