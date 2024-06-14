FROM openjdk:11

RUN apt-get update && apt-get install -y \
    wget

# Set the working directory
WORKDIR /usr/src/app

# Install Synthea
RUN wget https://github.com/synthetichealth/synthea/releases/download/master-branch-latest/synthea-with-dependencies.jar

# Copy the Synthea properties file
COPY synthea-omop.properties /usr/src/app/synthea-omop.properties

ENV SYNTHEA_SEED=456789
ENV SYNTHEA_SIZE=10
ENV SYNTHEA_DATE=20260318

VOLUME /usr/src/app/output

# Run Synthea
CMD java -jar synthea-with-dependencies.jar -c synthea-omop.properties -s $SYNTHEA_SEED -p $SYNTHEA_SIZE -r $SYNTHEA_DATE


