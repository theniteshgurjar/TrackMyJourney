const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/railradarController');

// Smart Journey Planner
router.post('/journeys/plan', ctrl.planJourney);
router.post('/journeys/overlay', ctrl.journeyOverlay);

// Trains Between Stations
router.get('/trains/between/:from/:to', ctrl.getTrainsBetween);
router.get('/trains/search', ctrl.getTrainsBetween); // Backward compatibility

// Train Details & Timetable
router.get('/trains/:number/live', ctrl.getLiveStatus);
router.get('/trains/live/:number', ctrl.getLiveStatus); // Backward compatibility
router.get('/trains/:number/schedule', ctrl.getTrainSchedule);
router.get('/trains/schedule/:number', ctrl.getTrainSchedule); // Backward compatibility
router.get('/trains/:number/route', ctrl.getRouteGeometry);
router.get('/trains/route/:number', ctrl.getRouteGeometry); // Backward compatibility
router.get('/trains/:number/coaches/:station', ctrl.getPlatformCoachPosition);
router.get('/trains/:number/coaches', ctrl.getCoachPosition);
router.get('/trains/:number/seats', ctrl.getSeatAvailability);
router.get('/trains/:number/fare', ctrl.getTicketFare);
router.get('/trains/:number', ctrl.getTrainSchedule); // Base schedule

// PNR Status, Prediction & Refund
router.get('/pnr/:pnr/prediction', ctrl.getPnrPrediction);
router.get('/pnr/:pnr/refund', ctrl.getPnrRefund);
router.get('/pnr/:pnr', ctrl.getPnrStatus);

// Stations
router.get('/stations/:code/live', ctrl.getStationLiveBoard);
router.get('/stations/:code/trains', ctrl.getStationTimetable);
router.get('/trains/station/:code/live', ctrl.getStationLiveBoard); // Backward compatibility
router.get('/trains/station/:code', ctrl.getStationTimetable); // Backward compatibility

// Lookup Autocomplete
router.get('/lookup/search/stations', ctrl.searchStations);
router.get('/lookup/search/trains', ctrl.searchTrains);
router.get('/trains/search-stations', ctrl.searchStations); // Backward compatibility
router.get('/trains/search-trains', ctrl.searchTrains); // Backward compatibility
router.get('/trains/stations', ctrl.searchStations); // Backward compatibility

module.exports = router;
