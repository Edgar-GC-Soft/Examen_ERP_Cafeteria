const dashboardService = require('../services/dashboard.service');

async function obtenerResumen(req, res) {
    res.json(await dashboardService.obtenerResumen());
}

module.exports = { obtenerResumen };
