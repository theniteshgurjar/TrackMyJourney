const axios = require('axios');

const BASE_URL = 'https://api.railradar.in/v1';

const getHeaders = () => ({
  headers: {
    Authorization: `Bearer ${process.env.RAILRADAR_API_KEY}`
  }
});

// Since the RailRadar API might not have a simple "get all stations" endpoint,
// you may still need a local list or use their specific endpoint if available.
const stations = [
  { code: 'NDLS', name: 'New Delhi', city: 'New Delhi', state: 'Delhi' },
  { code: 'HWH', name: 'Howrah Junction', city: 'Kolkata', state: 'West Bengal' },
  { code: 'CSMT', name: 'Chhatrapati Shivaji Maharaj Terminus', city: 'Mumbai', state: 'Maharashtra' },
  { code: 'MAS', name: 'Chennai Central', city: 'Chennai', state: 'Tamil Nadu' },
  { code: 'BNC', name: 'Bengaluru Cantt', city: 'Bengaluru', state: 'Karnataka' },
  { code: 'LKO', name: 'Lucknow Charbagh', city: 'Lucknow', state: 'Uttar Pradesh' },
  { code: 'ALD', name: 'Allahabad Junction', city: 'Allahabad', state: 'Uttar Pradesh' }
];

const getStations = () => stations;

const searchTrains = async (source, destination) => {
  try {
    const response = await axios.get(`${BASE_URL}/trains/between/${source}/${destination}`, getHeaders());
    const apiData = response.data.data?.trains || [];
    
    return apiData.map(t => ({
      trainNumber: t.train?.number || 'N/A',
      trainName: t.train?.name || 'Unknown',
      source: t.from?.code || source,
      destination: t.to?.code || destination,
      departure: t.from?.departure || 'N/A',
      arrival: t.to?.arrival || 'N/A',
      duration: t.duration ? `${Math.floor(t.duration/60)}h ${t.duration%60}m` : 'N/A',
      distance: t.distance ? `${t.distance} km` : 'N/A',
      runningDays: t.train?.runDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    }));
  } catch (error) {
    console.error('Error fetching trains:', error.response?.data || error.message);
    throw new Error('Failed to fetch trains from RailRadar API');
  }
};

const getTrainByNumber = async (trainNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/trains/${trainNumber}`, getHeaders());
    const t = response.data.data?.train || {};
    
    return {
      trainNumber: t.number || trainNumber,
      trainName: t.name || 'Unknown',
      source: t.source?.code || 'N/A',
      destination: t.destination?.code || 'N/A',
      departure: 'N/A', // Usually in the route array, keeping N/A for summary
      arrival: 'N/A',
      duration: t.duration ? `${Math.floor(t.duration/60)}h ${t.duration%60}m` : 'N/A',
      distance: t.distance ? `${t.distance} km` : 'N/A',
      runningDays: t.runDays || ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    };
  } catch (error) {
    console.error('Error fetching train details:', error.response?.data || error.message);
    throw new Error('Failed to fetch train details from RailRadar API');
  }
};

const getLiveStatus = async (trainNumber, date) => {
  try {
    const url = date ? `${BASE_URL}/trains/${trainNumber}/live?date=${date}` : `${BASE_URL}/trains/${trainNumber}/live`;
    const response = await axios.get(url, getHeaders());
    const status = response.data.data || {};
    
    // Find the next upcoming station in the route to get expected arrival
    const nextRoute = status.route?.find(r => r.status === 'upcoming');
    const expectedArrival = nextRoute?.actualArrival || nextRoute?.scheduledArrival || 'N/A';

    let locationText = status.currentLocation?.stationCode || 'N/A';
    if (status.currentLocation?.status) {
      locationText = `${status.currentLocation.status.charAt(0).toUpperCase() + status.currentLocation.status.slice(1)} ${locationText}`;
    }

    return {
      trainNumber,
      trainName: status.trainName || status.train?.name || 'N/A',
      currentLocation: locationText,
      delay: status.delayMinutes ? `${status.delayMinutes} mins` : 'On time',
      expectedArrival: expectedArrival !== 'N/A' ? new Date(expectedArrival).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false}) : 'N/A',
      currentStation: status.previousHalt?.stationName || status.currentLocation?.stationCode || 'N/A',
      nextStation: status.nextHalt?.stationName || 'N/A',
      updatedAt: status.lastUpdatedAt || new Date().toISOString(),
      route: status.route || []
    };
  } catch (error) {
    console.error('Error fetching live status:', error.response?.data || error.message);
    throw new Error('Failed to fetch live status from RailRadar API');
  }
};

const getSchedule = async (trainNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/trains/${trainNumber}`, getHeaders());
    const scheduleData = response.data.data?.route || [];
    
    return scheduleData.map(stop => ({
      station: stop.station?.code || stop.station?.name || 'Unknown',
      arrival: stop.arrival || 'Source',
      departure: stop.departure || 'Destination',
      distance: stop.distance || 0,
      day: stop.day || 1,
      halt: stop.halt || 0
    }));
  } catch (error) {
    console.error('Error fetching schedule:', error.response?.data || error.message);
    throw new Error('Failed to fetch schedule from RailRadar API');
  }
};

const getStationBoard = async (stationCode) => {
  try {
    const response = await axios.get(`${BASE_URL}/stations/${stationCode}/trains`, getHeaders());
    const data = response.data.data || {};
    const trains = data.trains || [];
    
    return {
      station: data.station || { code: stationCode },
      trains: trains.map(t => ({
        trainNumber: t.train?.number || 'N/A',
        trainName: t.train?.name || 'Unknown',
        source: t.train?.source?.code || 'N/A',
        destination: t.train?.destination?.code || 'N/A',
        arrival: t.stop?.arrival || 'N/A',
        departure: t.stop?.departure || 'N/A',
        stopType: t.stop?.stopType || 'halt',
        runningDays: t.train?.runDays || []
      }))
    };
  } catch (error) {
    console.error('Error fetching station board:', error.response?.data || error.message);
    throw new Error('Failed to fetch station board from RailRadar API');
  }
};

const getRouteGeometry = async (trainNumber) => {
  try {
    const response = await axios.get(`${BASE_URL}/trains/${trainNumber}/route`, getHeaders());
    const data = response.data.data || {};
    
    return {
      trainNumber: data.trainNumber || trainNumber,
      geojson: data.geojson || null,
      stops: data.stops || []
    };
  } catch (error) {
    console.error('Error fetching route geometry:', error.response?.data || error.message);
    throw new Error('Failed to fetch route geometry from RailRadar API');
  }
};

const getStationLiveBoard = async (stationCode) => {
  try {
    const response = await axios.get(`${BASE_URL}/stations/${stationCode}/live`, getHeaders());
    const data = response.data.data || {};
    const trains = data.trains || [];
    
    return {
      station: data.station || { code: stationCode },
      window: data.window || {},
      trains: trains.map(t => ({
        trainNumber: t.train?.number || 'N/A',
        trainName: t.train?.name || 'Unknown',
        source: t.train?.source || 'N/A',
        destination: t.train?.destination || 'N/A',
        scheduledArrival: t.stop?.arrival || 'N/A',
        scheduledDeparture: t.stop?.departure || 'N/A',
        platform: t.live?.platform || '-',
        delayMinutes: t.live?.delayMinutes || 0,
        expectedDepartureTime: t.live?.expectedDepartureTime || null,
        type: t.live?.type || 'at-station'
      }))
    };
  } catch (error) {
    console.error('Error fetching station live board:', error.response?.data || error.message);
    throw new Error('Failed to fetch station live board from RailRadar API');
  }
};

module.exports = {
  getStations,
  searchTrains,
  getTrainByNumber,
  getLiveStatus,
  getSchedule,
  getStationBoard,
  getRouteGeometry,
  getStationLiveBoard
};
