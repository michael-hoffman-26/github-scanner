import express from 'express'

import { validateRequest } from '../validator/validator';
import { getRepoValidator } from './validators';
import { dataRepository } from "../services/dataRepository";


const router = express.Router();

// TODO add support for pagination
router.get('/repos',
    async (req, res, next) => {
        const data = await dataRepository.getAll()

        res.send(data)
    }
);

router.get('/repos/:id',
    getRepoValidator,
    validateRequest,
    (req, res, next) => {

    }
);

export default router;
