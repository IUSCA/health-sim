# Use the official R image from the Docker Hub
FROM r-base:4.3.3 
# This version is needed for system level dependencies - 

# Set the working directory
WORKDIR /usr/src/app

RUN apt-get update && apt-get install -y \
    libcurl4-openssl-dev \
    libssl-dev \
    libxml2-dev \
    libgit2-dev \
    pandoc \
    r-cran-rjava \
    libfreetype6-dev \
    libharfbuzz-dev \
    libfribidi-dev \
    libfontconfig1-dev \
    libpng-dev \
    libtiff5-dev \
    libjpeg-dev \
    default-jdk \
    wget

# Install any necessary R packages
RUN R -e "install.packages(c('rJava', 'pkgdown', 'remotes', 'devtools', 'SqlRender', 'DatabaseConnector'), repos='http://cran.rstudio.com/')"

# # Install GitHub packages using remotes
RUN R -e "remotes::install_github('OHDSI/ETL-Synthea')"

# Set the working directory
WORKDIR /usr/src/app/src/

# Copy your R script into the container
COPY src/ /usr/src/app/src/

# Copy postgresql jar file
RUN cd driver/ && wget https://jdbc.postgresql.org/download/postgresql-42.7.3.jar

VOLUME /usr/src/app/src/output

# Run your R script
# CMD ["tail", "-f", "/dev/null"]
CMD ["Rscript", "convert.R"]