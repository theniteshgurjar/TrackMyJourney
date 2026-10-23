const railradar = require('../services/railradarService');

const handleApiError = (err, res, next) => {
  if (err.response) {
    return res.status(err.response.status).json(err.response.data || {
      success: false,
      error: { message: err.message }
    });
  }
  next(err);
};

// Helper: Smartly resolve station name or input to an official station code
const resolveStationCode = async (input) => {
  if (!input) return '';
  const trimmed = String(input).trim();
  
  // 1. Check if input contains code in parens like "New Delhi (NDLS)"
  const parenMatch = trimmed.match(/\(([A-Za-z0-9]{2,6})\)/);
  if (parenMatch) {
    return parenMatch[1].toUpperCase();
  }

  // 2. If it's already an uppercase 2-5 letter station code (like NDLS, BCT, HWH, MAS)
  if (/^[A-Za-z]{2,5}$/.test(trimmed) && trimmed === trimmed.toUpperCase()) {
    return trimmed;
  }

  // 3. Otherwise (contains spaces, lowercase, full station name like "New Delhi", "mumbai central")
  try {
    const lookup = await railradar.searchStationsLookup(trimmed, 1);
    if (lookup?.data && lookup.data.length > 0) {
      return lookup.data[0].code.toUpperCase();
    }
  } catch (err) {
    console.warn(`Could not resolve station name "${trimmed}":`, err.message);
  }

  return trimmed.toUpperCase();
};

// Helper: Smartly resolve train name or input to an official train number
const resolveTrainNumber = async (input) => {
  if (!input) return '';
  const trimmed = String(input).trim();

  // 1. If it has a train number pattern like "(#12951)" or "#12951" or "(12951)"
  const numMatch = trimmed.match(/[#(]?(\d{4,5})[)]?/);
  if (numMatch && /^\d{4,5}$/.test(trimmed)) {
    return trimmed;
  }
  if (numMatch && numMatch[1]) {
    return numMatch[1];
  }

  // 2. If it's pure 4-5 digits
  if (/^\d{4,5}$/.test(trimmed)) {
    return trimmed;
  }

  // 3. Otherwise lookup by train name (e.g. "Rajdhani", "Vande Bharat")
  try {
    const lookup = await railradar.searchTrainsLookup(trimmed, 1);
    if (lookup?.data && lookup.data.length > 0) {
      return lookup.data[0].number;
    }
  } catch (err) {
    console.warn(`Could not resolve train name "${trimmed}":`, err.message);
  }

  return trimmed;
};

// Format duration in minutes to string "Xh Ym"
const formatDuration = (min) => {
  if (typeof min !== 'number' || isNaN(min)) return min || '--';
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}h ${m}m`;
};

// Journeys
exports.planJourney = async (req, res, next) => {
  try {
    const result = await railradar.planJourney(req.body);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

exports.journeyOverlay = async (req, res, next) => {
  try {
    const result = await railradar.journeyOverlay(req.body);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Trains between stations
exports.getTrainsBetween = async (req, res, next) => {
  try {
    const rawFrom = req.params.from || req.query.from || req.query.source;
    const rawTo = req.params.to || req.query.to || req.query.destination;

    if (!rawFrom || !rawTo) {
      return res.status(400).json({ success: false, error: { message: 'Source (from) and Destination (to) are required' } });
    }

    const from = await resolveStationCode(rawFrom);
    const to = await resolveStationCode(rawTo);

    const result = await railradar.getTrainsBetweenStations(from, to, req.query);

    // Normalize train items so both frontend structures (direct fields & nested fields) work seamlessly
    if (result?.data?.trains && Array.isArray(result.data.trains)) {
      result.data.trains = result.data.trains.map(item => {
        const trainInfo = item.train || {};
        const fromInfo = item.from || {};
        const toInfo = item.to || {};

        return {
          ...item,
          trainNumber: trainInfo.number || item.trainNumber || item.number,
          trainName: trainInfo.name || item.trainName || item.name,
          type: trainInfo.type || item.type,
          runningDays: trainInfo.runDays || item.runningDays || [],
          departure: fromInfo.departure || item.departure || '--:--',
          arrival: toInfo.arrival || item.arrival || '--:--',
          source: fromInfo.code || from,
          sourceName: fromInfo.name || result.data.from?.name || from,
          destination: toInfo.code || to,
          destName: toInfo.name || result.data.to?.name || to,
          duration: typeof item.duration === 'number' ? formatDuration(item.duration) : (item.duration || '--'),
          distance: item.distance ? `${String(item.distance).replace(/\s*km/gi, '')} km` : ''
        };
      });
    }

    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Train Schedule
exports.getTrainSchedule = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const haltsOnly = req.query.haltsOnly === 'true';
    const result = await railradar.getTrainSchedule(resolvedNumber, { haltsOnly });
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Train Live Status
exports.getLiveStatus = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const result = await railradar.getLiveRunningStatus(resolvedNumber, req.query);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Train Route Geometry
exports.getRouteGeometry = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const format = req.query.format || 'geojson';
    const stops = req.query.stops === 'true';
    const result = await railradar.getRouteGeometry(resolvedNumber, { format, stops });
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Coaches
exports.getCoachPosition = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const result = await railradar.getCoachPosition(resolvedNumber);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

exports.getPlatformCoachPosition = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const resolvedStation = await resolveStationCode(req.params.station);
    const result = await railradar.getPlatformCoachPosition(resolvedNumber, resolvedStation);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Seats
exports.getSeatAvailability = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const query = { ...req.query };

    if (!query.journeyDate && !query.date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.journeyDate = tomorrow.toISOString().split('T')[0];
    }

    if (query.source) query.source = await resolveStationCode(query.source);
    if (query.destination) query.destination = await resolveStationCode(query.destination);

    if (!query.source || !query.destination) {
      try {
        const trainData = await railradar.getTrainSchedule(resolvedNumber);
        if (trainData?.data?.train) {
          if (!query.source) query.source = trainData.data.train.source?.code;
          if (!query.destination) query.destination = trainData.data.train.destination?.code;
        }
      } catch (e) {}
    }

    const result = await railradar.getSeatAvailability(resolvedNumber, query);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Fare
exports.getTicketFare = async (req, res, next) => {
  try {
    const resolvedNumber = await resolveTrainNumber(req.params.number);
    const query = { ...req.query };

    if (!query.journeyDate && !query.date) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      query.journeyDate = tomorrow.toISOString().split('T')[0];
    }

    if (query.source) query.source = await resolveStationCode(query.source);
    if (query.destination) query.destination = await resolveStationCode(query.destination);

    if (!query.source || !query.destination) {
      try {
        const trainData = await railradar.getTrainSchedule(resolvedNumber);
        if (trainData?.data?.train) {
          if (!query.source) query.source = trainData.data.train.source?.code;
          if (!query.destination) query.destination = trainData.data.train.destination?.code;
        }
      } catch (e) {}
    }

    const result = await railradar.getTicketFare(resolvedNumber, query);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// PNR
exports.getPnrStatus = async (req, res, next) => {
  try {
    const { pnr } = req.params;
    const result = await railradar.getPnrStatus(pnr);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

exports.getPnrPrediction = async (req, res, next) => {
  try {
    const { pnr } = req.params;
    const result = await railradar.getPnrPrediction(pnr);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

exports.getPnrRefund = async (req, res, next) => {
  try {
    const { pnr } = req.params;
    const result = await railradar.getPnrRefund(pnr);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Stations
exports.getStationTimetable = async (req, res, next) => {
  try {
    const resolvedCode = await resolveStationCode(req.params.code);
    const includeIntermediate = req.query.includeIntermediate === 'true';
    const result = await railradar.getStationTimetable(resolvedCode, { includeIntermediate });

    // Normalize timetable trains for frontend
    if (result?.data?.trains && Array.isArray(result.data.trains)) {
      result.data.trains = result.data.trains.map(item => {
        const trainInfo = item.train || {};
        const stopInfo = item.stop || {};
        const src = trainInfo.source;
        const dst = trainInfo.destination;

        return {
          ...item,
          trainNumber: trainInfo.number || item.trainNumber,
          trainName: trainInfo.name || item.trainName,
          type: trainInfo.type || item.type,
          source: (typeof src === 'object' ? src?.name || src?.code : src) || item.source || 'Origin',
          destination: (typeof dst === 'object' ? dst?.name || dst?.code : dst) || item.destination || 'Destination',
          arrival: stopInfo.arrival || item.arrival,
          departure: stopInfo.departure || item.departure,
          stopType: stopInfo.stopType || (stopInfo.sequence === 1 ? 'origin' : 'halt')
        };
      });
    }

    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

exports.getStationLiveBoard = async (req, res, next) => {
  try {
    const resolvedCode = await resolveStationCode(req.params.code);
    const hours = req.query.hours || 4;
    const includeIntermediate = req.query.includeIntermediate === 'true';
    const result = await railradar.getStationLiveBoard(resolvedCode, { hours, includeIntermediate });

    // Normalize liveboard trains for frontend
    if (result?.data?.trains && Array.isArray(result.data.trains)) {
      result.data.trains = result.data.trains.map(item => {
        const trainInfo = item.train || {};
        const stopInfo = item.stop || {};
        const liveInfo = item.live || {};
        const src = trainInfo.source;
        const dst = trainInfo.destination;

        return {
          ...item,
          trainNumber: trainInfo.number || item.trainNumber,
          trainName: trainInfo.name || item.trainName,
          type: trainInfo.type || item.type,
          source: (typeof src === 'object' ? src?.name || src?.code : src) || item.source || 'Origin',
          destination: (typeof dst === 'object' ? dst?.name || dst?.code : dst) || item.destination || 'Destination',
          scheduledDeparture: stopInfo.departure || item.scheduledDeparture,
          scheduledArrival: stopInfo.arrival || item.scheduledArrival,
          platform: stopInfo.platform || liveInfo.platform || item.platform,
          delayMinutes: liveInfo.delayMinutes ?? (item.delayMinutes || 0),
          expectedDepartureTime: liveInfo.expectedDepartureTime || item.expectedDepartureTime,
          expectedArrivalTime: liveInfo.expectedArrivalTime || item.expectedArrivalTime
        };
      });
    }

    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

// Lookups
exports.searchStations = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const limit = req.query.limit || 10;
    const result = await railradar.searchStationsLookup(q, limit);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};

exports.searchTrains = async (req, res, next) => {
  try {
    const q = req.query.q || '';
    const limit = req.query.limit || 10;
    const result = await railradar.searchTrainsLookup(q, limit);
    res.status(200).json(result);
  } catch (err) { handleApiError(err, res, next); }
};
