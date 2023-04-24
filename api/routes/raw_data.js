const express = require('express');
const { PrismaClient } = require('@prisma/client');
const createError = require('http-errors');
const { query, param } = require('express-validator');
const _ = require('lodash/fp');

const asyncHandler = require('../middleware/asyncHandler');
const { validate } = require('../middleware/validators');
const batchService = require('../services/batch');

const router = express.Router();
const prisma = new PrismaClient();

router.get(
  '/',
  validate([
    query('only_deleted').toBoolean().default(false),
  ]),
  asyncHandler(async (req, res, next) => {
    // #swagger.tags = ['Batches']
    const objs = await prisma.raw_data.findMany({
      where: {
        batch: {
          ...(req.query.only_deleted ? { is_deleted: true } : {}),
        },
      },
      include: {
        batch: {
          include: {
            ...batchService.include_workflows,
            ...batchService.include_states,
          },
        },
      },
    });
    res.json(objs);
  }),
);

router.get(
  '/:id',
  validate([
    param('id').isInt().toInt(),
    query('workflows').toBoolean().default(false),
  ]),
  asyncHandler(async (req, res, next) => {
    // #swagger.tags = ['Batches']
    // only select path and md5 columns from the checksum table if checksums is true
    const _batch = await batchService.get_batch({
      raw_data_id: req.params.id,
      workflows: req.query.workflows,
    });
    if (_batch) {
      // eslint-disable-next-line no-unused-vars
      const { raw_data, data_product, ...batch } = _batch;
      res.json({
        ..._.omit(['batch_id'])(raw_data),
        batch,
      });
    } else {
      next(createError(404));
    }
  }),
);

router.get('/:id');

module.exports = router;
