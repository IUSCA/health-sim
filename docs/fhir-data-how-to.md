# FHIR

## Data Retrieval

To retrieve data from a fhir server we use our api.  You must first have the following dependencies installed:

```bash
npm install fhirclient fhirpath
```

Once installed you can instantiate a client in your api.

```javascript
const smart = require('fhirclient');
const getClient = (req, res) => smart(req, res).client('https://r4.smarthealthit.org');
```

You can change which server you connect to by changing the parameter passed to the client.  


Then in your function you can get data by making a api call using the client.  This is RESTful like server, but you're better off using the client specifically for retrieving FHIR data.

```javascript
const client = getClient(req, res);

const results = await client.request(`/Patient`);
```


## Parse Data

FHIR has complex and deeply nested data structure that vary from version to version.  Because of this we use fhirpath to parse our data once it has been retrieved.

First we must require the dependencies.

```javascript
const fhirpath = require('fhirpath');
const fhirpath_r4_model = require('fhirpath/fhir-context/r4');

```

Fhirpath will evaluate and give back the requested fields for the entry you feed it.  This is done on a per field basis with its evaluate command.  So to use an example for a single entry here is how you would retrieve specific data from a Patient entry:


```javascript

const result = await client.request(`/Patient?patient=1`);

const name = fhirpath.evaluate(
  result.resource, // A single entry
  'Patient.name.given.first() + \' \' + Patient.name.family.first()', // Field
  null, // I don't know what this is
  fhirpath_r4_model, // which fhir_model you're retrieving your data from
);

const address = fhirpath.evalutate(
  result.resource,
  'Patient.address.line.first() + \', \' + Patient.address.city + \', \' + Patient.address.state + \' \' + Patient.address.postalCode',
  null,
  fhirpath_r4_model
)

const phone = fhirpath.evalutate(
  result.resource,
  'Patient.telecom.where(system = \'phone\').value',
  null,
  fhirpath_r4_model
)
```

After this the data is mostly normalized and you have stripped out all of the fields you no longer need, but he protocol returns the singular data points in the 0 position of an array making the calls to retrieve it needlessly verbose.  To overcome this I recommend further normalizing the data into a more traditional JSON format and removing the single array data points.

I've done so using this convenience function:

```javascript
onst normalizeFhirData = (data) => {

  let normalizedData = []

  for(let entry of data) {
    let normalizedEntry = {}
    for(const field in entry) {
      normalizedEntry[field] = entry[field][0] ? entry[field][0] : ''
    }
    normalizedData.push(normalizedEntry)
  }

  return normalizedData

}

```

This will work for multiple entries.  


## Advanced Fetching from FHIR

Many of the advanced features that fhir supports must be implemented within it's URL to call the data.  

### Sorting

Sorting using fhir is possible, but limited. Sorting will only work on values that are a number or a string.  Dates or other types will not sort.  Also sorting only works on fields with an upper level name, but not a deeply nested one. 

For instance this will not be sortable:

```javascript
Patient.name.given.first()
```

But this will:

```javascript
Patient.gender
```

The values that do work will be referenced in the URL just as its name:

```javascript
let url = '/Patients&_sort=gender'
```

This will sort the results in descending order.  To do ascending order you will feed it the same information but with a -

```javascript
let url = '/Patients&_sort=-gender'
```

### Pagination

To paginate you feed it the _getpagesoffset and _count values where the count is equal to the number you take and _getpagesoffset is the number of results that you skip.

```javascript
let url = `/Patients&_getpagesoffset=100&_count=10`
```

### Filter

To filter a particular field you can do use the following pattern:

```javascript
&name:contains=Mou
```

The field follows the same limitations sort particular fields does so: it must be a top level keyword and can only be a string or number.  

Here is a full example:

```javascript
let url = `/Patients&name:contains=Mou`
```

### Include

To include related data you can add that to the URL:

```javascript
let url = `/Observation?_include=Observation:patient`
```