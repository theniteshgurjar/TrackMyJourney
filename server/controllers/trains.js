const railwayService = require('../services/railwayService');
const fs = require('fs');
const path = require('path');

let stationsData = [];
let trainsData = [];

try {
  const parsedStations = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/stations.json'), 'utf-8'));
  const rawStations = parsedStations.data || parsedStations.stations || [];
  stationsData = rawStations.map(s => ({
    code: s.code || s.Code || '',
    name: s.name || s.Name || '',
    city: s.city || s.City || '',
    state: s.state || s.State || ''
  }));

  const parsedTrains = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/trains.json'), 'utf-8'));
  trainsData = parsedTrains.data || parsedTrains.trains || [];
} catch(err) {
  console.log('Failed to load stations or trains data', err);
}

// @desc    Get all stations
// @route   GET /api/trains/stations
// @access  Public
exports.getStations = (req, res) => {
  const stations = railwayService.getStations();
  res.status(200).json({ success: true, data: stations });
};

// @desc    Search stations by name or code
// @route   GET /api/trains/search-stations
// @access  Public
exports.searchStations = (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  if (!query) return res.status(200).json({ success: true, data: stationsData.slice(0, 10) });

  const results = stationsData.filter(s => 
    s.name.toLowerCase().includes(query) || 
    s.code.toLowerCase().includes(query) || 
    s.city.toLowerCase().includes(query)
  ).slice(0, 10);
  
  res.status(200).json({ success: true, data: results });
};

// @desc    Search trains by name or number
// @route   GET /api/trains/search-trains
// @access  Public
exports.searchTrainsByQuery = (req, res) => {
  const query = req.query.q?.toLowerCase() || '';
  if (!query) return res.status(200).json({ success: true, data: trainsData.slice(0, 10) });

  const results = trainsData.filter(t => 
    t.name.toLowerCase().includes(query) || 
    t.number.includes(query)
  ).slice(0, 10);
  
  res.status(200).json({ success: true, data: results });
};

// @desc    Search trains between stations
// @route   GET /api/trains/search
// @access  Public
exports.searchTrains = async (req, res, next) => {
  try {
    const { source, destination } = req.query;

    if (!source || !destination) {
      return res.status(400).json({ success: false, error: 'Please provide source and destination' });
    }

    const trains = await railwayService.searchTrains(source, destination);
    res.status(200).json({ success: true, data: trains });
  } catch (err) {
    next(err);
  }
};

// @desc    Get train details
// @route   GET /api/trains/:trainNumber
// @access  Public
exports.getTrainDetails = async (req, res, next) => {
  try {
    const train = await railwayService.getTrainByNumber(req.params.trainNumber);
    
    if (!train) {
      return res.status(404).json({ success: false, error: 'Train not found' });
    }

    res.status(200).json({ success: true, data: train });
  } catch (err) {
    next(err);
  }
};

// @desc    Get live train status
// @route   GET /api/trains/live/:trainNumber
// @access  Public
exports.getLiveStatus = async (req, res, next) => {
  try {
    const { date } = req.query;
    const status = await railwayService.getLiveStatus(req.params.trainNumber, date);

    if (!status) {
      return res.status(404).json({ success: false, error: 'Live status not found' });
    }

    res.status(200).json({ success: true, data: status });
  } catch (err) {
    next(err);
  }
};

// @desc    Get train schedule
// @route   GET /api/trains/schedule/:trainNumber
// @access  Public
exports.getTrainSchedule = async (req, res, next) => {
  try {
    const schedule = await railwayService.getSchedule(req.params.trainNumber);

    if (!schedule) {
      return res.status(404).json({ success: false, error: 'Schedule not found' });
    }

    res.status(200).json({ success: true, data: schedule });
  } catch (err) {
    next(err);
  }
};

// @desc    Get station board
// @route   GET /api/trains/station/:stationCode
// @access  Public
exports.getStationBoard = async (req, res, next) => {
  try {
    const board = await railwayService.getStationBoard(req.params.stationCode);

    if (!board) {
      return res.status(404).json({ success: false, error: 'Station board not found' });
    }

    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};

// @desc    Get train route geometry
// @route   GET /api/trains/route/:trainNumber
// @access  Public
exports.getRouteGeometry = async (req, res, next) => {
  try {
    const route = await railwayService.getRouteGeometry(req.params.trainNumber);

    if (!route) {
      return res.status(404).json({ success: false, error: 'Route geometry not found' });
    }

    res.status(200).json({ success: true, data: route });
  } catch (err) {
    next(err);
  }
};

// @desc    Get station live board
// @route   GET /api/trains/station/:stationCode/live
// @access  Public
exports.getStationLiveBoard = async (req, res, next) => {
  try {
    const board = await railwayService.getStationLiveBoard(req.params.stationCode);

    if (!board) {
      return res.status(404).json({ success: false, error: 'Live board not found' });
    }

    res.status(200).json({ success: true, data: board });
  } catch (err) {
    next(err);
  }
};
