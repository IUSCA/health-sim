const express = require('express');
const smart = require('fhirclient');
const config = require('config');

// https://github.com/hl7/fhirpath.js/
const fhirpath = require('fhirpath');
const fhirpath_r4_model = require('fhirpath/fhir-context/r4');

const { accessControl } = require('../middleware/auth');
const asyncHandler = require('../middleware/asyncHandler');
const { isArray } = require('lodash');

const isPermittedTo = accessControl('fhir');
const router = express.Router();

const getClient = (req, res) => 
smart(req, res).client(config.get('fhir_server'));
// smart(req, res).client('https://r4.smarthealthit.org');

// Mapping the FHIR data to the table columns
const mapData = {
  Patients: {
    resourceType: 'Patient',
    fields: {
      id: 'Patient.id',
      name: 'Patient.name.given.first() + \' \' + Patient.name.family.first()',
      address: 'Patient.address.line.first() + \', \' + Patient.address.city + \', \' + Patient.address.state + \' \' + Patient.address.postalCode',
      telecom: 'Patient.telecom.where(system = \'phone\').value',
      gender: 'Patient.gender',
      birthDate: 'Patient.birthDate',
      race: 'Patient.extension.where(url = \'http://hl7.org/fhir/us/core/StructureDefinition/us-core-race\').extension.where(url = \'ombCategory\').valueCoding.display',
      ethnicity: 'Patient.extension.where(url = \'http://hl7.org/fhir/us/core/StructureDefinition/us-core-ethnicity\').extension.where(url = \'ombCategory\').valueCoding.display',
    },
  },
  Notes: {
    resourceType: 'DocumentReference',
    fields: {
     author: 'DocumentReference.author.display',
      date: 'DocumentReference.date',
      type: 'DocumentReference.type.text',
      status: 'DocumentReference.status',
    },
  },
  Diagnostics: {
    resourceType: 'DiagnosticReport',
    fields: {
      id: 'DiagnosticReport.id',
      type: 'DiagnosticReport.code.text',
      orderedBy: 'DiagnosticReport.requester.display',
      fullReport: 'DiagnosticReport.presentedForm',
      date: 'DiagnosticReport.issued',
    },
  },
  Labs: {
    resourceType: 'Observation',
    fields: {
      id: 'Observation.id',
      type: 'Observation.code.coding.display',
      value: 'Observation.valueQuantity.value',
      unit: 'Observation.valueQuantity.unit',
      date: 'Observation.effectiveDateTime',
    },
  },
  Vitals: {
    resourceType: 'Observation',
    fields: {
      id: 'Observation.id',
      type: 'Observation.code.coding.display',
      value: 'Observation.valueQuantity.value',
      unit: 'Observation.valueQuantity.unit',
      date: 'Observation.effectiveDateTime',
    },
  },
  Medications: {
    resourceType: 'MedicationRequest',
    fields: {
      id: 'MedicationRequest.id',
      provider: 'MedicationRequest.requester.display',
      
      type: 'MedicationRequest.medicationCodeableConcept.text',
      frequency: 'MedicationRequest.dosageInstruction',
      date: 'MedicationRequest.authoredOn',

    },
  },
};

const labCategories = {
  'Cardiac Profile': ['Troponin', 'CK-MB', 'Myoglobin', 'BNP', 'NT-proBNP', 'poc-cTn', 'hs-cTn'],
  'Basic Serum': ['Glucose', 'Urea', 'Creatinine', 'Sodium', 'Potassium', 'Chloride', 'Bicarbonate', 'Calcium', 'Phosphate', 'Magnesium'],
  'Blood': ['Hemoglobin', 'Hematocrit', 'RBC', 'WBC', 'Platelets', 'MCV', 'MCH', 'MCHC', 'RDW', 'MPV', 'Neutrophils', 'Lymphocytes', 'Monocytes', 'Eosinophils', 'Basophils', 'Magnesium'],
  'Other': ['HDL', 'LDL', 'Triglycerides', 'Lactate', 'TC' ]
}
// Get all the categories
router.get('/categories', isPermittedTo('read'), asyncHandler(async (req, res, next) => {
  res.json(Object.keys(mapData));
}));

// Get the fields for a particular resource
router.get('/:resourceType/fields', isPermittedTo('read'), asyncHandler(async (req, res, next) => {
  res.json(Object.keys(mapData[req.params.resourceType].fields));
}));

// Get details for one particular resource
router.get('/:resourceType/:id', isPermittedTo('read'), asyncHandler(async (req, res, next) => {
  const client = getClient(req, res);

  const { resourceType, id } = req.params;

  const results = await client.request(`/${mapData[resourceType].resourceType}/${id}`);

  const data = getFieldsForEntry(
    { resource: results },
    resourceType,
    Object.keys(mapData[resourceType].fields),
  );

  res.json(data);
}));


router.get('/patients/:id/overview', isPermittedTo('read'), asyncHandler(async (req, res, next) => {

  const client = getClient(req, res);

  const {  id } = req.params;

  let urls = []
  urls.push(`/Condition?patient=${id}`)
  urls.push(`/Observation?patient=${id}`)
  urls.push(`/MedicationRequest?patient=${id}`)
  urls.push(`/DiagnosticReport?patient=${id}`)

  const results = await Promise.all(urls.map(url => client.request(url)))


  const parseData = {
    conditions: results[0].entry,
    observations: results[1].entry,
    medications: results[2].entry,
    diagnostics: results[3].entry
  }


  let data = {}

  data.condition = []
  for(let condition of parseData.conditions) {
    data.condition.push({
      label: condition.resource.code.text,
      startDate: condition.resource.assertedDate,
      endDate: condition.resource.abatementDateTime
    })
  }

  data.observation = []
  for(let observation of parseData.observations) {
    data.observation.push({
      label: observation.resource.code.text,
      startDate: observation.resource.effectiveDateTime,

    })
  }

  data.medication = []
  for(let medication of parseData.medications) {
    data.medication.push({
      label: medication.resource.medicationCodeableConcept.text,
      startDate: medication.resource.authoredOn,
      endDate: medication.resource.meta.lastUpdated,
    })
  }

  data.diagnostic = []
  for(let diagnostic of parseData.diagnostics) {
    data.diagnostic.push({
      label: diagnostic.resource.code.text,
      startDate: diagnostic.resource.issued,
    })
  }

  console.log('data', data)

  res.json(data)

}));

// Get all the resources for a particular patient
router.post('/patients/:id/:resourceType/', isPermittedTo('read'), asyncHandler(async (req, res, next) => {
  const client = getClient(req, res);

  console.log('req.body', req.body)
  const { resourceType, id } = req.params;
  const { options } = req.body;

  // const fields = Object.keys(mapData[resourceType].fields);

  const { count, sort, getpagesoffset, search } = processOptions(options, resourceType);


    // Add count to FHIR URL
    let requestURL = `/${mapData[resourceType].resourceType}?patient=${id}&_count=${count}&_getpagesoffset=${getpagesoffset}`;



    if(resourceType === 'Vitals' ) {
      requestURL += '&category:coding:code=vital-signs';
   } else if(resourceType === 'Labs'){
    requestURL += '&category:coding:code=laboratory';
   } else if(resourceType === 'Diagnostics'){
    requestURL += '&_include=DiagnosticReport:subject';
   }

    requestURL += sort;
    requestURL += search;

    console.log(`Request URL: ${requestURL}`)
    const results = await client.request(requestURL);

   
  let data = process_data(results, resourceType)

  if(resourceType === 'Vitals') {
    data = processVitals(data.data)
  } else if(resourceType === 'Labs') {
    data = create_lab_data(labCategories, data.data)
  } else if(resourceType === 'Diagnostics') {
    data = data.data.map((entry) => getFieldsForEntry(entry, 'Diagnostics', Object.keys(mapData['Diagnostics'].fields)))
  }

  res.json(data);
}));

router.post('/patients', isPermittedTo('read'), asyncHandler(async (req, res, next) => {

  const { options, resourceType } = req.body;

  const client = getClient(req, res);
  let requestURL = `/Patient?_count=10000`;

  const results = await client.request(requestURL);

  const fhir_data = results.entry.map((entry) => getFieldsForEntry(entry, 'Patients', Object.keys(mapData[resourceType].fields)));

  const data = normalizeFhirData(fhir_data)

  // sort the data by the options
  if(options.sortBy === 'age') {
    data.sort((a, b) => {
      if(options.sortingOrder === 'asc') {
        console.log('a', new Date(a.birthDate), 'b', new Date(b.birthDate))
        return new Date(a.birthDate) > new Date(b.birthDate) ? 1 : -1
      }
      return new Date(a.birthDate) < new Date(b.birthDate) ? 1 : -1
    })
  } else if(options.sortBy !== 'NONE') {
    data.sort((a, b) => {
      if(options.sortingOrder === 'asc') {
        return a[options.sortBy] > b[options.sortBy] ? 1 : -1
      } else {
        return a[options.sortBy] < b[options.sortBy] ? 1 : -1
      }
    })
  }  


  console.log(data)

  res.json({data, total: data.length});
  




}));

// [
// {
//   id: [ '115' ],
//   name: [ 'Alphonse92 Berge125' ],
//   address: [ '400 Maggio Mission, Lynn, Massachusetts 01940' ],
//   telecom: [ '555-548-3442' ],
//   gender: [ 'male' ],
//   birthDate: [ '1916-05-03' ],
//   race: [ 'White' ],
//   ethnicity: [ 'Not Hispanic or Latino' ]
// },
// ]
const normalizeFhirData = (data) => {

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

// Search for a particular resource
router.post(
  '/search',
  isPermittedTo('read'),
  asyncHandler(async (req, res, next) => {
    const client = getClient(req, res);

    const { resourceType, fields, options } = req.body;


    const { count,  getpagesoffset, sort } = processOptions(options);

    // Add count to FHIR URL
    let requestURL = `/${mapData[resourceType].resourceType}?_count=${count}&_getpagesoffset=${getpagesoffset}${sort}`;

    // Create a fuzzy search string
    let search = '';
    // Fuzzy search string
    if (options !== undefined && 'search' in options && options.search !== '') {
      // eslint-disable-next-line no-restricted-syntax
      for (const field of fields) {
        // name:contains=Mou
        search += `&${field.toLowerCase()}:contains=${options.search}`;
      }
    }

    if(resourceType === 'Vitals' ) {
      requestURL += '&category:coding:code=vital-signs';
   } else if(resourceType === 'Labs'){
    requestURL += '&category:coding:code=laboratory';
   } else if(resourceType === 'Diagnostics'){
    requestURL += '&_include=DiagnosticReport:subject';
   }


    requestURL += search;

    console.log(`Request URL: ${requestURL}`)
    const results = await client.request(requestURL);

    const data = {
      data: results.entry.map((entry) => getFieldsForEntry(entry, resourceType, fields)),
      fields,
      count: results.total,
    };

    
   

    res.json(data);
  }),
);

const getFieldsForEntry = (entry, resourceType, fields) => fields.reduce((acc, field) => {
  if (resourceType in mapData && field in mapData[resourceType].fields) {
    acc[field] = getFhirData(entry, mapData[resourceType].fields[field]);
  }
  return acc;
}, {});

const getFhirData = (entry, expression) => fhirpath.evaluate(
  entry.resource,
  expression,
  null,
  fhirpath_r4_model,
);

const processOptions = (options, resourceType) => {
  console.log('options', options)
  // Set count and sort according to options given to route
  const count = (options !== undefined && 'numPerPage' in options) ? options.numPerPage : 10;

  let sort = '';
  if (options !== undefined && 'sortBy' in options && options.sortBy !== 'NONE') {
      sort = (options !== undefined && 'sortingOrder' in options && options.sortingOrder === 'asc') ? `&_sort=-${options.sortBy}` : `&_sort=${options.sortBy}`;
  }

  const getpagesoffset = (options !== undefined && 'page' in options) ? ((options.page - 1) * count) : 0;

  // Create a fuzzy search string
  let search = '';
  // Fuzzy search string
  if (options !== undefined && 'search' in options && options.search !== '') {
    console.log('searching', options.search)
    // eslint-disable-next-line no-restricted-syntax
    const fields = Object.values(mapData[resourceType].fields);

    for (let field of fields) {
      field = field.replace(`${mapData[resourceType].resourceType}.`, "")
      field = field.replace('.', ':')
      console.log('field', field)
      // name:contains=Mou
      search += `&${field}:contains=${options.search}`;
    }
  }

  return { count, sort, getpagesoffset, search };
}

const process_data = (results, resourceType) => {

  // console.log('results', results)

  let data = results.entry.map((entry) => getFieldsForEntry(
    entry,
    resourceType,
    Object.keys(mapData[resourceType].fields),
  ));

  // console.log('data', data, resourceType)

  if(resourceType === 'Labs') {
 
    data = create_lab_data(labCategories, data)

  }




  return {
    data: data,
    total: results.total,
  };
}

const create_lab_data = (labCategories, data) => {

  let labData = {}

  

  for(const category of Object.keys(labCategories)) {

    for(const type of labCategories[category]){
      // Create date ranges for the lab categories of recent, 1 week, 1 month, 3 months, 6 months, 1 year
      labData[category] = labData[category] || {}
      labData[category][type] = {

          recent: [],
          week: [],
          month: [],
          sixMonths: [],
          year: [],
          older: []
        
      }
    }
    
  }

  for(let entry of data){
    for(const category in labCategories){

      let entryType = getFhirEntry(entry.type)

      let type = ''

      // Check if the type of the lab is in the category
      if(labCategories[category].some(word => {
          type = word
          return entryType.includes(word)}
        )) {

        console.log(type, entryType, entry.value)
        let entryDate = new Date(getFhirEntry(entry.date))
        let entryValue = getFhirEntry(entry.value).toFixed(2)

        // Check if the date is within the last week, month, 6 months, 1 year, or older
        if(entryDate > new Date(new Date().setDate(new Date().getDate() - 7))) {
          console.log('entry', entry)
          labData[category][type]['week'].push(entryValue)
        } else if(entryDate > new Date(new Date().setDate(new Date().getDate() - 30))) {
          labData[category][type]['month'].push(entryValue)
        } else if(entryDate > new Date(new Date().setDate(new Date().getDate() - 90))) {
          labData[category][type]['threeMonths'].push(entryValue)
        } else if(entryDate > new Date(new Date().setDate(new Date().getDate() - 180))) {
          labData[category][type]['sixMonths'].push(entryValue)
        } else if(entryDate > new Date(new Date().setDate(new Date().getDate() - 365))) {
          labData[category][type]['year'].push(entryValue)
        } else if(entryDate < new Date(new Date().setDate(new Date().getDate() - 365))) {
          labData[category][type]['older'].push(entryValue)
        } else {
          labData[category][type]['recent'].push(entryValue)
        }
      }
    }
  }


  return labData;

}



const processVitals = (data) => {


  let vitals = {}


  for(let entry of data){
    if(entry.type[0] in vitals) {
      console.log("ENTRY", vitals[entry.type[0]])
      vitals[entry.type[0]]['date'].push(entry.date[0])
      vitals[entry.type[0]]['value'].push(entry.value[0])
    } else {
      console.log("FIRST ENTRY", entry.type[0])
      vitals[entry.type[0]] = {
        type: entry.type[0],
        value: [entry.value[0]],
        unit: entry.unit[0],
        date: [entry.date[0]]
      }
    }
  }
  console.log('vitals', vitals)
  return vitals 
}


const getFhirEntry = (entry) => {
  if(isArray(entry)){
    return entry[0]
  } else {
    return entry
  }
}


module.exports = router;
