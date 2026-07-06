const express = require('express');
const { 
  getStations,
  searchStations,
  searchTrainsByQuery,
  searchTrains, 
  getTrainDetails, 
  getLiveStatus, 
  getTrainSchedule,
  getStationBoard,
  getRouteGeometry,
  getStationLiveBoard
} = require('../controllers/trains');

const router = express.Router();

router.get('/stations', getStations);
router.get('/search-stations', searchStations);
router.get('/search-trains', searchTrainsByQuery);
router.get('/search', searchTrains);
router.get('/station/:stationCode', getStationBoard);
router.get('/station/:stationCode/live', getStationLiveBoard);
router.get('/route/:trainNumber', getRouteGeometry);
router.get('/:trainNumber', getTrainDetails);
router.get('/live/:trainNumber', getLiveStatus);
router.get('/schedule/:trainNumber', getTrainSchedule);

module.exports = router;
