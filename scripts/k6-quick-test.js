import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate, Trend } from 'k6/metrics';

const BASE_URL = 'https://my-project-five-kohl-94.vercel.app';
const apiResponseTime = new Trend('api_response_time');
const pageLoadTime = new Trend('page_load_time');
const errorRate = new Rate('errors');

export const options = {
  stages: [
    { duration: '15s', target: 5 },
    { duration: '30s', target: 10 },
    { duration: '15s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<3000'],
    errors: ['rate<0.05'],
  },
};

export default function () {
  const params = { redirects: 0 };

  // Home page
  const homeRes = http.get(`${BASE_URL}/`, params);
  const homeOk = check(homeRes, {
    'home: 200': (r) => r.status === 200,
    'home: has content': (r) => r.body && r.body.length > 500,
  });
  errorRate.add(!homeOk);
  pageLoadTime.add(homeRes.timings.duration);

  // Services API
  const svcRes = http.get(`${BASE_URL}/api/services?active=true`);
  const svcOk = check(svcRes, {
    'services: 200': (r) => r.status === 200,
    'services: has data': (r) => {
      try { return JSON.parse(r.body).services.length > 0; } catch { return false; }
    },
  });
  errorRate.add(!svcOk);
  apiResponseTime.add(svcRes.timings.duration);

  // Products API
  const prodRes = http.get(`${BASE_URL}/api/products?active=true&page=1&limit=9`);
  const prodOk = check(prodRes, {
    'products: 200': (r) => r.status === 200,
    'products: has pagination': (r) => {
      try { return JSON.parse(r.body).pagination !== undefined; } catch { return false; }
    },
  });
  errorRate.add(!prodOk);
  apiResponseTime.add(prodRes.timings.duration);

  // Discounts API
  const discRes = http.get(`${BASE_URL}/api/discounts`);
  const discOk = check(discRes, {
    'discounts: 200': (r) => r.status === 200,
    'discounts: has data': (r) => {
      try { return JSON.parse(r.body).discount !== undefined; } catch { return false; }
    },
  });
  errorRate.add(!discOk);
  apiResponseTime.add(discRes.timings.duration);

  // Concurrent batch (simulate full page load)
  const batch = http.batch([
    ['GET', `${BASE_URL}/api/services?active=true`],
    ['GET', `${BASE_URL}/api/products?active=true&page=1&limit=9`],
    ['GET', `${BASE_URL}/api/discounts`],
    ['GET', `${BASE_URL}/api/site-settings`],
    ['GET', `${BASE_URL}/api/categories`],
  ]);
  batch.forEach(r => {
    apiResponseTime.add(r.timings.duration);
    errorRate.add(r.status !== 200);
  });

  sleep(1);
}
