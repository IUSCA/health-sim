const express = require('express');
const { PrismaClient } = require('@prisma/client');
const _ = require('lodash/fp');
const {
  query, body, param,
} = require('express-validator');
const createError = require('http-errors');

const asyncHandler = require('../middleware/asyncHandler');
const { accessControl } = require('../middleware/auth');


const isPermittedTo = accessControl('patients');
const router = express.Router();
const prisma = new PrismaClient();


router.get(
  '/all',

  asyncHandler(async (req, res, next) => {
    // #swagger.tags = ['Patients']
    // #swagger.summary = get all patients.
    // #swagger.description = admin and operator roles are allowed and user role is forbidden

    console.log("called get all patients")
    const patients = await prisma.person.findMany({});
    console.log(patients);
    res.json(patients);
  }),
);


module.exports = router;
