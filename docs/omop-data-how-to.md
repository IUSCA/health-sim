# OMOP

OMOP is a standard for keeping data in a relational database.  A useful entity relationship diagram can be found here:

https://ohdsi.github.io/CommonDataModel/cdm54erd.html

## Data Retrieval

For many of our projects we use Prisma.  Here is a basic data retrieval example using the Person table where the core of the Patient or Participant information is housed.


```javascript
const data = await prisma.person.findMany();
```

## Parsing Data

The data in OMOP format is spread out through many tables.  To gather comprehensive information about a particular area you will need to do multiple joins or includes depending on the data you need.

Here is an example getting all of the Conditions for a Person:

```javascript
const results = await prisma.condition_occurrence.findMany({
        where: {
          person_id: 1,
        },
        include: {
          concept_condition_occurrence_condition_concept_idToconcept: true,
        }
      });
```

So this will get a single user with a specific id here it is 1.  And it will include the Concept table.  The concept table is like the definitions for all the metadata in each table.  You can think of the concept table like the glossary of relevant terms.  

Here the include concept_condition_occurrence_condition_concept_idToconcept is a dynamically generated name made from introspecting a live production OMOP database. It is difficult to read so I recommend using the id in the relation as a means to figure out what concept terms you need.

