const express = require('express');
const { PrismaClient } = require('@prisma/client');
const _ = require('lodash/fp');
const {
  query, body, param,
} = require('express-validator');
const createError = require('http-errors');

const asyncHandler = require('../middleware/asyncHandler');
const { accessControl } = require('../middleware/auth');
const { orderBy, result } = require('lodash');


const isPermittedTo = accessControl('omop');
const router = express.Router();
const prisma = new PrismaClient();


router.post(
  '/persons',

  asyncHandler(async (req, res, next) => {
    // #swagger.tags = ['Patients']
    // #swagger.summary = get all patients.
    // #swagger.description = admin and operator roles are allowed and user role is forbidden


    const { currentPage, itemsPerPage, sortBy, sortingOrder } = req.body;

    console.log(currentPage, itemsPerPage, sortBy, sortingOrder);

    const skip = (currentPage - 1) * itemsPerPage; // Calculate skip value
    const take = itemsPerPage; // Number of items per page
    

    const data = await prisma.person.findMany({
      skip,
      take,
      orderBy: {
        [sortBy]: sortingOrder,
      },
    });

    const count = await prisma.person.count();
    // console.log(data);
    res.json({data, count});
  }),
);


router.get('/persons/:id', isPermittedTo('read'),  asyncHandler(async (req, res, next) => {
  // #swagger.tags = ['Patients']
  // #swagger.summary = get one patients.
  // #swagger.description = admin and operator roles are allowed and user role is forbidden
  console.log('ID', req.params.id);
  const data = await prisma.person.findUnique({
    where: {
      person_id: parseInt(req.params.id),
    },
  });
  // console.log(data);
  res.json(data);
}));

// get category details
router.get('/persons/:id/:category/:view', isPermittedTo('read'), asyncHandler(async (req, res, next) => {

  // #swagger.tags = ['Patients']
  // #swagger.summary = get one patients category.
  // #swagger.description = admin and operator roles are allowed and user role is forbidden

  const category = req.params.category;
  const id = parseInt(req.params.id);
  const view = req.params.view;
  let data = {};


  switch (category) {
    case 'Conditions':
      data = await process_conditions(id, view)
      break;

    case 'Vitals':
      data = await process_vitals(id, view)
      break;

    case 'Procedures':
      data = await process_procedures(id, view)
      break;

    case 'Medications':
      data = await process_medications(id, view)
      break;

    case 'Overview':
      data = await getOverview(id, view);
      break;
  }



  res.json(data);

}));

const process_procedures = async (id, view) => {
  let data = {}
  let results = await prisma.procedure_occurrence.findMany({
    where: {
      person_id: id,
    },
    include: {
      concept_procedure_occurrence_procedure_concept_idToconcept: true,
    }
  });

  results.sort((a, b) => new Date(a.procedure_date) - new Date(b.procedure_date));

  for(const result of results) {
    if(view === 'graph') {
      const type = result.concept_procedure_occurrence_procedure_concept_idToconcept.concept_name
      const date = result.procedure_date
      const value = result.procedure_type_concept_id
      const unit = result.procedure_type_concept_id

      if(type in data) {
        data[type]['value'].push(value)
        data[type]['date'].push(date)
      } else {
        data[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: unit
        }
      }
    } else if(view === 'timeline') {
      const type = result.concept_procedure_occurrence_procedure_concept_idToconcept.concept_name
      const startDate = result.procedure_date

      if(type in data) {
        data[type].push({
          label: type,
          startDate: startDate,
        })
      } else {
        data[type] = [{
          label: type,
          startDate: startDate,
        }]
      }
    }
  }

  return data;
}

const process_medications = async (id, view) => {
  let data = {}
  let results = await prisma.drug_exposure.findMany({
    where: {
      person_id: id,
    },
    include: {
      concept_drug_exposure_drug_concept_idToconcept: true,

    }
  });

  results.sort((a, b) => new Date(a.drug_exposure_start_date) - new Date(b.drug_exposure_start_date));

  // console.log('results', results);

  for(const result of results) {

    if(view === 'timeline') {
      const label = result.concept_drug_exposure_drug_concept_idToconcept.concept_name
      const startDate = result.drug_exposure_start_date
      const endDate = result.drug_exposure_end_date

      if(label in data) {
        data[label].push({
          label: label,
          startDate: startDate,
          endDate: endDate,
        })
      } else {
        data[label] = [{
          label: label,
          startDate: startDate,
          endDate: endDate,
        }]
      }
    } else if(view === 'graph') {
      const type = result.concept_drug_exposure_drug_concept_idToconcept.concept_name
      const date = result.drug_exposure_start_date
      const value = result.quantity
      const unit = result.unit_source_value

      if(type in data) {
        data[type]['value'].push(value)
        data[type]['date'].push(date)
      } else {
        data[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: unit
        }
      }
    }
  }

  return data;
}

const process_conditions = async (id, view) => {
  let data = {}
  let results = await prisma.condition_occurrence.findMany({
    where: {
      person_id: id,
    },
    include: {
      concept_condition_occurrence_condition_concept_idToconcept: true,
    }
  });

  results.sort((a, b) => new Date(a.condition_start_date) - new Date(b.condition_start_date));

  // console.log('results', results);


  
  for(const result of results) {
    if(view === 'graph') {
      // console.log('RESULT', result)

      const type = result.concept_condition_occurrence_condition_concept_idToconcept.concept_name
      const date = result.condition_start_date

      // Calculate the difference in milliseconds then convert to days
      let value = getDiffDays(result.condition_start_date, result.condition_end_date);
      

      if(type in data) {
        data[type]['value'].push(value)
        data[type]['date'].push(date)
      } else {
        data[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: 'Days'
        }
      }
    } else if(view === 'timeline') {
      const type = result.concept_condition_occurrence_condition_concept_idToconcept.concept_name
      const startDate = result.condition_start_date
      const endDate = result.condition_end_date

      if(type in data) {
        data[type].push({
          label: type,
          startDate: startDate,
          endDate: endDate,
        })
      } else {
        data[type] = [{
          label: type,
          startDate: startDate,
          endDate: endDate,
        }]
      }
    }
  }

  console.log(data)
  return data
}

const process_vitals = async (id, view) => {
  let data = {}
  let results = await prisma.measurement.findMany({ 
    where: {
      person_id: id,
    },
    include: {
      concept_measurement_measurement_concept_idToconcept: true,
    }
  });


  results.sort((a, b) => new Date(a.measurement_date) - new Date(b.measurement_date));

  console.log('results', results);

  for(const result of results) {
    if(view === 'graph') {
      const type = result.concept_measurement_measurement_concept_idToconcept.concept_name
      const date = result.measurement_date
      const value = result.value_source_value
      const unit = result.unit_source_value

      if(type in data) {
        data[type]['value'].push(value)
        data[type]['date'].push(date)

      } else {
          data[type] = {
            type: type,
            value: [value],
            date: [date],
            unit: unit
        }
      }
    } else if(view === 'timeline') {
      const type = result.concept_measurement_measurement_concept_idToconcept.concept_name
      const startDate = result.measurement_date
      const value = result.value_source_value
      const unit = result.unit_source_value

      if(type in data) {
        data[type].push({
          label: type,
          startDate: startDate,
          value: value,
          unit: unit,
        })
      } else {
        data[type] = [{
          label: type,
          startDate: startDate,
          value: value,
          unit: unit,
        }]
      }
    }
  }

  // console.log(data)

  return data;
}


const getDiffDays = (date1, date2) => {
  // Calculate the difference in milliseconds then convert to days
  let value = new Date(date2).getTime() - new Date(date1).getTime();


  // Ensure the value is positive
  value = Math.abs(value);

  // Convert milliseconds to days
  const millisecondsInADay = 24 * 60 * 60 * 1000;
  value = value / millisecondsInADay;

  return value;
}
   
const getOverview = async (id, view) => {
  let data = {}

  if(view === 'timeline') {
    const conditions = await prisma.condition_occurrence.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_condition_occurrence_condition_concept_idToconcept: true,

      }
    });

    data.condition = []
    for(let condition of conditions) {
      data.condition.push({
      label: condition.concept_condition_occurrence_condition_concept_idToconcept.concept_name,
      startDate: condition.condition_start_date,
        endDate: condition.condition_end_date,
      })
    }

    const vitals = await prisma.measurement.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_measurement_measurement_concept_idToconcept: true,
      }
    });

    data.vital = []
    for(let vital of vitals) {
      data.vital.push({
        label: vital.concept_measurement_measurement_concept_idToconcept.concept_name,
        startDate: vital.measurement_date,
        value: vital.value_source_value,
        unit: vital.unit_source_value,
      })
    }

    const procedures = await prisma.procedure_occurrence.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_procedure_occurrence_procedure_concept_idToconcept: true,
      }
    });


    data.procedure = []
    for(let procedure of procedures) {
      data.procedure.push({
        label: procedure.concept_procedure_occurrence_procedure_concept_idToconcept.concept_name,
        startDate: procedure.procedure_date,
      })
    }

    const medications = await prisma.drug_exposure.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_drug_exposure_drug_concept_idToconcept: true,
      }
    });


    data.medication = []
    for(let medication of medications) {
      data.medication.push({
        label: medication.concept_drug_exposure_drug_concept_idToconcept.concept_name,
        startDate: medication.drug_exposure_start_date,
        endDate: medication.drug_exposure_end_date,
      })
    }
  } else if(view === 'graph') {
    const conditions = await prisma.condition_occurrence.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_condition_occurrence_condition_concept_idToconcept: true,
      }
    });

    data.condition = {}
    for(let condition of conditions) {
      const type = condition.concept_condition_occurrence_condition_concept_idToconcept.concept_name
      const date = condition.condition_start_date
      const value = getDiffDays(condition.condition_start_date, condition.condition_end_date)

      if(type in data.condition) {
        data.condition[type]['value'].push(value)
        data.condition[type]['date'].push(date)
      } else {
        data.condition[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: 'Days'
        }
      }
    }

    const vitals = await prisma.measurement.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_measurement_measurement_concept_idToconcept: true,
      }
    });

    data.vital = {}
    for(let vital of vitals) {
      const type = vital.concept_measurement_measurement_concept_idToconcept.concept_name
      const date = vital.measurement_date
      const value = vital.value_source_value
      const unit = vital.unit_source_value

      if(type in data.vital) {
        data.vital[type]['value'].push(value)
        data.vital[type]['date'].push(date)
      } else {
        data.vital[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: unit
        }
      }
    }

    const procedures = await prisma.procedure_occurrence.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_procedure_occurrence_procedure_concept_idToconcept: true,
      }
    });

    data.procedure = {}
    for(let procedure of procedures) {
      const type = procedure.concept_procedure_occurrence_procedure_concept_idToconcept.concept_name
      const date = procedure.procedure_date
      const value = procedure.procedure_type_concept_id
      const unit = procedure.procedure_type_concept_id

      if(type in data.procedure) {
        data.procedure[type]['value'].push(value)
        data.procedure[type]['date'].push(date)
      } else {
        data.procedure[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: unit
        }
      }
    }

    const medications = await prisma.drug_exposure.findMany({
      where: {
        person_id: parseInt(id),
      },
      include: {
        concept_drug_exposure_drug_concept_idToconcept: true,
      }
    });

    data.medication = {}
    for(let medication of medications) {
      const type = medication.concept_drug_exposure_drug_concept_idToconcept.concept_name
      const date = medication.drug_exposure_start_date
      const value = medication.quantity
      const unit = medication.unit_source_value

      if(type in data.medication) {
        data.medication[type]['value'].push(value)
        data.medication[type]['date'].push(date)
      } else {
        data.medication[type] = {
          type: type,
          value: [value],
          date: [date],
          unit: unit
        }
      }
    }
  }
  return data;
}



module.exports = router;
