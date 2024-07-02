# Creating synthetic FHIR Data

For synthetic data creation we use synthea: https://github.com/synthetichealth/synthea which we load into our HAPI fhir server (https://hub.docker.com/r/conceptant/hapi-fhir/) using a bash script.


## Generate the data

Annoyingly you'll need to make sure the fhir directory has very open permissions.  This is NOT production ready:

```bash
chmod -R 0777 fhir/
```

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
./fhir_import.sh
```

You can change any of the environment variables to a different seed, size, or date by altering the docker compose.


## HAPI Fhir Server

You can access the web ui for the HAPI fhir server at: http://localhost:8080/