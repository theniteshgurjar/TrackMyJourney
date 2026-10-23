const axios = require('axios');

const BASE_URL = 'https://api.railradar.in/v1';

const getHeaders = () => {
  const key = process.env.RAILRADAR_API_KEY || '';
  return {
    headers: {
      Authorization: `Bearer ${key}`,
      'X-API-Key': key,
      'Content-Type': 'application/json'
    },
    timeout: 10000
  };
};

// 1. SMART JOURNEY PLANNER
const planJourney = async (body) => {
  const res = await axios.post(`${BASE_URL}/journeys/plan`, body, getHeaders());
  return res.data;
};

const journeyOverlay = async (body) => {
  const res = await axios.post(`${BASE_URL}/journeys/overlay`, body, getHeaders());
  return res.data;
};

// 2. TRAINS SCHEDULE & TIMETABLE (GET /v1/trains/{number})
const getTrainSchedule = async (trainNumber, { haltsOnly = false } = {}) => {
  const url = `${BASE_URL}/trains/${trainNumber}${haltsOnly ? '?haltsOnly=true' : ''}`;
  const res = await axios.get(url, getHeaders());
  return res.data;
};

// 3. LIVE TRAIN RUNNING STATUS (GET /v1/trains/{number}/live)
const getLiveRunningStatus = async (trainNumber, options = {}) => {
  const params = new URLSearchParams();
  if (options.date) params.append('date', options.date);
  if (options.authoritative) params.append('authoritative', 'true');
  if (options.haltsOnly) params.append('haltsOnly', 'true');
  if (options.geometry) params.append('geometry', 'true');
  if (options.format) params.append('format', options.format);
  if (options.includeCoordinates) params.append('includeCoordinates', 'true');

  const query = params.toString() ? `?${params.toString()}` : '';
  const url = `${BASE_URL}/trains/${trainNumber}/live${query}`;
  const res = await axios.get(url, getHeaders());
  return res.data;
};

// 4. TRAIN ROUTE GEOMETRY (GIS) (GET /v1/trains/{number}/route)
const getRouteGeometry = async (trainNumber, { format = 'geojson', stops = false } = {}) => {
  const url = `${BASE_URL}/trains/${trainNumber}/route?format=${format}&stops=${stops ? 'true' : 'false'}`;
  const res = await axios.get(url, getHeaders());
  return res.data;
};

// 5. COACH POSITION & LAYOUT (GET /v1/trains/{number}/coaches)
const getCoachPosition = async (trainNumber) => {
  const res = await axios.get(`${BASE_URL}/trains/${trainNumber}/coaches`, getHeaders());
  return res.data;
};

// 6. PLATFORM COACH POSITION (GET /v1/trains/{number}/coaches/{station})
const getPlatformCoachPosition = async (trainNumber, stationCode) => {
  const res = await axios.get(`${BASE_URL}/trains/${trainNumber}/coaches/${stationCode}`, getHeaders());
  return res.data;
};

// 7. TRAIN SEAT AVAILABILITY (GET /v1/trains/{number}/seats)
const getSeatAvailability = async (trainNumber, { source, destination, journeyDate, classCode = '3A', quotaCode = 'GN' } = {}) => {
  const params = new URLSearchParams();
  if (source) params.append('source', source);
  if (destination) params.append('destination', destination);
  if (journeyDate) params.append('journeyDate', journeyDate);
  if (classCode) params.append('classCode', classCode);
  if (quotaCode) params.append('quotaCode', quotaCode);

  const res = await axios.get(`${BASE_URL}/trains/${trainNumber}/seats?${params.toString()}`, getHeaders());
  return res.data;
};

// 8. TRAIN TICKET FARE (GET /v1/trains/{number}/fare)
const getTicketFare = async (trainNumber, { source, destination, journeyDate, classCode = '3A', quotaCode = 'GN' } = {}) => {
  const params = new URLSearchParams();
  if (source) params.append('source', source);
  if (destination) params.append('destination', destination);
  if (journeyDate) params.append('journeyDate', journeyDate);
  if (classCode) params.append('classCode', classCode);
  if (quotaCode) params.append('quotaCode', quotaCode);

  const res = await axios.get(`${BASE_URL}/trains/${trainNumber}/fare?${params.toString()}`, getHeaders());
  return res.data;
};

// 9. TRAINS BETWEEN STATIONS (GET /v1/trains/between/{from}/{to})
const getTrainsBetweenStations = async (from, to, options = {}) => {
  const params = new URLSearchParams();
  if (options.date) params.append('date', options.date);
  if (options.type) params.append('type', options.type);
  if (options.category) params.append('category', options.category);
  if (options.byCity) params.append('byCity', 'true');
  if (options.live) params.append('live', 'true');

  const query = params.toString() ? `?${params.toString()}` : '';
  const url = `${BASE_URL}/trains/between/${from}/${to}${query}`;
  const res = await axios.get(url, getHeaders());
  return res.data;
};

// 10. PNR STATUS, PREDICTION & REFUND
const getPnrStatus = async (pnr) => {
  const res = await axios.get(`${BASE_URL}/pnr/${pnr}`, getHeaders());
  return res.data;
};

const getPnrPrediction = async (pnr) => {
  const res = await axios.get(`${BASE_URL}/pnr/${pnr}/prediction`, getHeaders());
  return res.data;
};

const getPnrRefund = async (pnr) => {
  const res = await axios.get(`${BASE_URL}/pnr/${pnr}/refund`, getHeaders());
  return res.data;
};

// 11. STATIONS TIMETABLE & LIVE BOARDS
const getStationTimetable = async (code, { includeIntermediate = false } = {}) => {
  const url = `${BASE_URL}/stations/${code}/trains${includeIntermediate ? '?includeIntermediate=true' : ''}`;
  const res = await axios.get(url, getHeaders());
  return res.data;
};

const getStationLiveBoard = async (code, { hours = 4, includeIntermediate = false } = {}) => {
  const url = `${BASE_URL}/stations/${code}/live?hours=${hours}${includeIntermediate ? '&includeIntermediate=true' : ''}`;
  const res = await axios.get(url, getHeaders());
  return res.data;
};

// 12. LOOKUP & AUTOCOMPLETE SEARCH
const searchStationsLookup = async (q, limit = 10) => {
  const res = await axios.get(`${BASE_URL}/lookup/search/stations?q=${encodeURIComponent(q)}&limit=${limit}`, getHeaders());
  return res.data;
};

const searchTrainsLookup = async (q, limit = 10) => {
  const res = await axios.get(`${BASE_URL}/lookup/search/trains?q=${encodeURIComponent(q)}&limit=${limit}`, getHeaders());
  return res.data;
};

module.exports = {
  planJourney,
  journeyOverlay,
  getTrainSchedule,
  getLiveRunningStatus,
  getRouteGeometry,
  getCoachPosition,
  getPlatformCoachPosition,
  getSeatAvailability,
  getTicketFare,
  getTrainsBetweenStations,
  getPnrStatus,
  getPnrPrediction,
  getPnrRefund,
  getStationTimetable,
  getStationLiveBoard,
  searchStationsLookup,
  searchTrainsLookup
};
