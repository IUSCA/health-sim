# Creating synthetic OMOP Data

For synthetic data creation we use synthea: https://github.com/synthetichealth/synthea which we load into our postgres database using: https://github.com/OHDSI/ETL-Synthea an Rscript.


## Generate the data

Bring up all the containers using the docker-compose.yml by invoking

```bash
docker compose up -d
```

Then get a bash shell running for your synthea container:

```bash
docker compose exec synthea bash
```

Finally generate the synthetic data using the command from the Dockerfile as below:

```bash
java -jar synthea-with-dependencies.jar -c synthea-omop.properties -s $SYNTHEA_SEED -p $SYNTHEA_SIZE -r $SYNTHEA_DATE
```

You can change any of the environment variables to a different seed, size, or date by altering the docker compose or just by using the value you want instead of the environment variables.

## Load the data into postgres

Download the vocabulary files from Athena: http://athena.ohdsi.org/vocabulary/list. You'll need to make sure these files are unzipped and available as CSVs.  Copy the files to: health-sim/omop/src/vocab/csv

You'll need to establish an empty database with 2 schemas: cdm & native.  cdm will hold the OMOP CDM v5.4 tables and native will hold the native Synthea data.

Then get a bash shell running for your omop container:

```bash
docker compose exec omop bash
```

Load all the data from the CSVs into postgres from within the omop container:

```bash
Rscript convert.R
```