import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  scenarios: {
    storm: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '10s', target: 1000 },
        { duration: '10s', target: 1000 },
        { duration: '10s', target: 0 },
      ],
    },
    wave: {
      executor: 'ramping-vus',
      startVUs: 0,
      stages: [
        { duration: '2m', target: 500 },
        { duration: '30s', target: 500 },
        { duration: '30s', target: 0 },
      ],
    },
    mixed: {
      executor: 'constant-vus',
      vus: 50,
      duration: '2m',
    },
  },
};

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function() {
  if (Math.random() < 0.8) {
    const payload = JSON.stringify({
      user_id: randomInt(1, 2),
      amount: Math.random() * 100,
      description: 'k6 test'
    });
    
    const res = http.post('http://localhost:8081/api/orders', payload, {
      headers: { 'Content-Type': 'application/json' }
    });
    
    check(res, {
      'order created': (r) => r.status === 200 || r.status === 201
    });
  } else {
    const res = http.get('http://localhost:8081/api/orders');
    check(res, {
      'list ok': (r) => r.status === 200
    });
  }
  
  sleep(0.05);
}
