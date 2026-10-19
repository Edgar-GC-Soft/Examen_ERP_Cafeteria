const express = require('express');
const router = express.Router();
const dashboardService = require('../services/dashboard.service');

router.get('/', async (req, res) => {
    res.json(await dashboardService.obtenerResumen());
});

module.exports = router;
