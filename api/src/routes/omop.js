const express = require('express');
const { PrismaClient } = require('@prisma/client');
const _ = require('lodash/fp');
const {
  query, body, param,
} = require('express-validator');
const createError = require('http-errors');

const asyncHandler = require('../middleware/asyncHandler');
const { accessControl } = require('../middleware/auth');


const isPermittedTo = accessControl('omop');
const router = express.Router();
const prisma = new PrismaClient();


router.get(
  '/persons',

  asyncHandler(async (req, res, next) => {
    // #swagger.tags = ['Patients']
    // #swagger.summary = get all patients.
    // #swagger.description = admin and operator roles are allowed and user role is forbidden
    const data = await prisma.person.findMany({});
    // console.log(data);
    res.json(data);
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
  console.log(data);
  res.json(data);
}));
   
router.get('/persons/:id/overview', isPermittedTo('read'), asyncHandler(async (req, res, next) => {

  // #swagger.tags = ['Patients']
  // #swagger.summary = get one patients overview.
  // #swagger.description = admin and operator roles are allowed and user role is forbidden

  console.log('ID', req.params.id);
  const conditions = await prisma.condition_occurrence.findMany({
    where: {
      person_id: parseInt(req.params.id),
    },
    include: {
      concept_condition_occurrence_condition_concept_idToconcept: true,

    }
  });


  console.log('CONDITIONS', conditions[0]);

  let data = {}

  data.condition = []
  for(let condition of conditions) {
    data.condition.push({
     label: condition.concept_condition_occurrence_condition_concept_idToconcept.concept_name,
     startDate: condition.condition_start_date,
      endDate: condition.condition_end_date,
    })
  }


  const observations = await prisma.observation.findMany({
    where: {
      person_id: parseInt(req.params.id),
    },
    // include: {
    //   concept_observation_observation_concept_idToconcept: true,
    // }
  });

  console.log('OBSERVATIONS', observations[0]);

  data.observation = []
  for(let observation of observations) {
    data.observation.push({
      label: observation.observation_concept_id,
      startDate: observation.observation_date,
      value: observation.value_as_number,
    })
  }

  const procedures = await prisma.procedure_occurrence.findMany({
    where: {
      person_id: parseInt(req.params.id),
    },
    include: {
      concept_procedure_occurrence_procedure_concept_idToconcept: true,
    }
  });

  console.log('PROCEDURES', procedures[0]);

  data.procedure = []
  for(let procedure of procedures) {
    data.procedure.push({
      label: procedure.concept_procedure_occurrence_procedure_concept_idToconcept.concept_name,
      startDate: procedure.procedure_date,
    })
  }

  console.log(data);
  res.json(data);

}));

module.exports = router;
