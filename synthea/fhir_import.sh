#!/bin/bash

base_dir=/usr/src/app/
output_dir=${base_dir}output/

echo "Config set to:"
echo "SYNTHEA_PROPERTIES: $SYNTHEA_PROPERTIES"
echo "SYNTHEA_SEED: $SYNTHEA_SEED"
echo "SYNTHEA_SIZE: $SYNTHEA_SIZE"
echo "SYNTHEA_DATE: $SYNTHEA_DATE"
echo "FHIR_URL: $FHIR_URL"


echo "Removing old output..."
rm -rf ${output_dir}*

if [ ! -f ${base_dir}synthea-with-dependencies.jar ]; then
  # wget https://github.com/synthetichealth/synthea/releases/download/master-branch-latest/synthea-with-dependencies.jar
  wget https://github.com/synthetichealth/synthea/releases/download/v3.0.0/synthea-with-dependencies.jar
fi


echo "Generating data..."
java -jar synthea-with-dependencies.jar --exporter.fhir_stu3.export true --exporter.fhir.transaction_bundle true --exporter.practitioner.fhir_stu3.export true --exporter.hospital.fhir_stu3.export true --exporter.years_of_history 30 -s $SYNTHEA_SEED -p 120 -r $SYNTHEA_DATE


echo "Uploading data to FHIR server..."
# Iterate through the files in the output/fhir directory and upload them to the FHIR server
for file in ${output_dir}fhir_stu3/hospitalInformation*; do
    echo "Uploading $file"
    curl $FHIR_URL -X POST -d @$file -H "Content-Type: application/fhir+json"
done

for file in ${output_dir}fhir_stu3/practitionerInformation*; do
    echo "Uploading $file"
    curl $FHIR_URL -X POST -d @$file -H "Content-Type: application/fhir+json"
done

for file in ${output_dir}fhir_stu3/*.json; do
  # If the file doesn't start with either then it should be a patient record
  if [[ $file != *"hospitalInformation"* ]] && [[ $file != *"practitionerInformation"* ]]; then
    echo "Uploading $file"
    curl $FHIR_URL -X POST -d @$file -H "Content-Type: application/fhir+json"
  fi
  
done