const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'phase40-ultra-secure-jwt-secret-key-super-random-construction-erp-2025';
const token = jwt.sign({
  userId: 'usr-admin-001',
  email: 'admin@sitesyncpro.com',
  name: 'Abdul Vajid EK',
  role: 'ADMIN',
  permissions: ['*']
}, secret, { expiresIn: '1h' });

const endpoints = [
  { method: 'GET', url: 'http://localhost:3000/api/health' },
  { method: 'GET', url: 'http://localhost:3000/api/iot/stats' },
  { method: 'GET', url: 'http://localhost:3000/api/scada/stats' },
  { method: 'GET', url: 'http://localhost:3000/api/devices' },
  { method: 'GET', url: 'http://localhost:3000/api/gateways' },
  { method: 'GET', url: 'http://localhost:3000/api/rtu' },
  { method: 'GET', url: 'http://localhost:3000/api/plc' },
  { method: 'GET', url: 'http://localhost:3000/api/sensors' },
  { method: 'GET', url: 'http://localhost:3000/api/telemetry/latest' },
  { method: 'GET', url: 'http://localhost:3000/api/alarms' },
  { method: 'GET', url: 'http://localhost:3000/api/equipment-health' },
  { method: 'GET', url: 'http://localhost:3000/api/predictive-maintenance' },
  { method: 'GET', url: 'http://localhost:3000/api/energy' },
  { 
    method: 'POST', 
    url: 'http://localhost:3000/api/telemetry',
    body: {
      deviceId: 'dev_pump_01',
      sensorId: 'sns_press_01',
      timestamp: new Date().toISOString(),
      rawVal: 8.52,
      engVal: 8.52,
      unit: 'bar',
      quality: 'SIMULATED'
    }
  }
];

async function runTests() {
  console.log('==================================================');
  console.log('STARTING PHASE 72 API RUNTIME TEST');
  console.log('==================================================');
  
  for (const ep of endpoints) {
    try {
      const opts = {
        method: ep.method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        }
      };
      if (ep.body) opts.body = JSON.stringify(ep.body);
      const res = await fetch(ep.url, opts);
      const data = await res.json();
      console.log(`METHOD: ${ep.method}`);
      console.log(`ENDPOINT: ${ep.url.replace('http://localhost:3000', '')}`);
      console.log(`HTTP STATUS: ${res.status}`);
      console.log(`RESULT: ${res.ok ? 'SUCCESS' : 'FAILED'}`);
      if (!res.ok && data.message) {
        console.log(`ERROR MESSAGE: ${data.message}`);
      } else if (res.ok) {
        const preview = typeof data.data === 'object' ? (Array.isArray(data.data) ? `Array with ${data.data.length} records` : JSON.stringify(data.data)) : (data.status || 'OK');
        console.log(`DATA PREVIEW: ${preview.slice(0, 150)}`);
      }
      console.log('--------------------------------------------------');
    } catch (e) {
      console.log(`METHOD: ${ep.method}`);
      console.log(`ENDPOINT: ${ep.url.replace('http://localhost:3000', '')}`);
      console.log(`HTTP STATUS: NETWORK/CLIENT ERROR`);
      console.log(`RESULT: FAILED`);
      console.log(`ERROR MESSAGE: ${e.message}`);
      console.log('--------------------------------------------------');
    }
  }
}

runTests();
