import http from 'k6/http';
import { check, sleep, group } from 'k6';
import { Rate, Trend } from 'k6/metrics';

// ============================================================
// K6 Stress Test — Beauty Clinic Reservation System
// Target: https://my-project-five-kohl-94.vercel.app
// ============================================================

const BASE_URL = __ENV.BASE_URL || 'https://my-project-five-kohl-94.vercel.app';

// Custom metrics
const apiResponseTime = new Trend('api_response_time', true);
const pageLoadTime = new Trend('page_load_time', true);
const errorRate = new Rate('errors');

// ============================================================
// Test Stages — progressively increase load
// ============================================================
export const options = {
  stages: [
    // Warmup: 5 users for 30s
    { duration: '30s', target: 5 },
    // Ramp up: 5 → 20 users over 1m
    { duration: '1m', target: 20 },
    // Hold: 20 users for 2m
    { duration: '2m', target: 20 },
    // Spike: 20 → 50 users over 30s
    { duration: '30s', target: 50 },
    // Hold spike: 50 users for 1m
    { duration: '1m', target: 50 },
    // Ramp down: 50 → 0 over 30s
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    // Page loads should be under 3s
    http_req_duration: ['p(95)<3000', 'p(99)<5000'],
    // Error rate should be under 5%
    errors: ['rate<0.05'],
    // API responses should be under 1s
    api_response_time: ['p(95)<1000', 'p(99)<2000'],
    // Page loads should be under 2.5s
    page_load_time: ['p(95)<2500'],
  },
};

// ============================================================
// Setup — runs once before all tests
// ============================================================
export function setup() {
  console.log(`🚀 Starting stress test against: ${BASE_URL}`);
  console.log(`📊 Test duration: ~5.5 minutes`);
  console.log(`👥 Peak concurrent users: 50`);
  return { baseUrl: BASE_URL };
}

// ============================================================
// Main test — runs for each virtual user
// ============================================================
export default function (data) {
  const { baseUrl } = data;

  // -------------------------------------------------------
  // Test 1: Home Page Load
  // -------------------------------------------------------
  group('Home Page', () => {
    const res = http.get(`${baseUrl}/`);
    const success = check(res, {
      'home: status 200': (r) => r.status === 200,
      'home: has content': (r) => r.body && r.body.length > 1000,
      'home: has title': (r) => r.body && r.body.includes('Glow & Smooth'),
    });
    errorRate.add(!success);
    pageLoadTime.add(res.timings.duration);
    sleep(1);
  });

  // -------------------------------------------------------
  // Test 2: Services API
  // -------------------------------------------------------
  group('Services API', () => {
    const res = http.get(`${baseUrl}/api/services?active=true`);
    const success = check(res, {
      'services: status 200': (r) => r.status === 200,
      'services: has JSON': (r) => {
        try { return JSON.parse(r.body).services !== undefined; }
        catch { return false; }
      },
      'services: has items': (r) => {
        try { return JSON.parse(r.body).services.length > 0; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.5);
  });

  // -------------------------------------------------------
  // Test 3: Products API (with server-side pagination)
  // -------------------------------------------------------
  group('Products API', () => {
    const res = http.get(`${baseUrl}/api/products?active=true&page=1&limit=9`);
    const success = check(res, {
      'products: status 200': (r) => r.status === 200,
      'products: has pagination': (r) => {
        try { return JSON.parse(r.body).pagination !== undefined; }
        catch { return false; }
      },
      'products: has items': (r) => {
        try { return JSON.parse(r.body).products.length > 0; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.5);
  });

  // -------------------------------------------------------
  // Test 4: Categories API
  // -------------------------------------------------------
  group('Categories API', () => {
    const res = http.get(`${baseUrl}/api/categories`);
    const success = check(res, {
      'categories: status 200': (r) => r.status === 200,
      'categories: has JSON': (r) => {
        try { return JSON.parse(r.body).categories !== undefined; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.3);
  });

  // -------------------------------------------------------
  // Test 5: Service Categories API
  // -------------------------------------------------------
  group('Service Categories API', () => {
    const res = http.get(`${baseUrl}/api/service-categories`);
    const success = check(res, {
      'service-cats: status 200': (r) => r.status === 200,
      'service-cats: has JSON': (r) => {
        try { return JSON.parse(r.body).categories !== undefined; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.3);
  });

  // -------------------------------------------------------
  // Test 6: Discounts API
  // -------------------------------------------------------
  group('Discounts API', () => {
    const res = http.get(`${baseUrl}/api/discounts`);
    const success = check(res, {
      'discounts: status 200': (r) => r.status === 200,
      'discounts: has JSON': (r) => {
        try { return JSON.parse(r.body).discount !== undefined; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.3);
  });

  // -------------------------------------------------------
  // Test 7: Site Settings API
  // -------------------------------------------------------
  group('Site Settings API', () => {
    const res = http.get(`${baseUrl}/api/site-settings`);
    const success = check(res, {
      'settings: status 200': (r) => r.status === 200,
      'settings: has JSON': (r) => {
        try { return JSON.parse(r.body).settings !== undefined; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.3);
  });

  // -------------------------------------------------------
  // Test 8: Auth Login API
  // -------------------------------------------------------
  group('Auth Login API', () => {
    const payload = JSON.stringify({
      email: 'admin@glowsmooth.clinic',
      password: 'admin123',
    });
    const params = {
      headers: { 'Content-Type': 'application/json' },
    };
    const res = http.post(`${baseUrl}/api/auth/login`, payload, params);
    const success = check(res, {
      'login: status 200': (r) => r.status === 200,
      'login: has admin': (r) => {
        try { return JSON.parse(r.body).admin !== undefined; }
        catch { return false; }
      },
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(0.5);
  });

  // -------------------------------------------------------
  // Test 9: Concurrent API calls (simulate page load)
  // -------------------------------------------------------
  group('Concurrent Page Load', () => {
    const responses = http.batch([
      ['GET', `${baseUrl}/api/services?active=true`, null, {}],
      ['GET', `${baseUrl}/api/products?active=true&page=1&limit=9`, null, {}],
      ['GET', `${baseUrl}/api/discounts`, null, {}],
      ['GET', `${baseUrl}/api/site-settings`, null, {}],
      ['GET', `${baseUrl}/api/categories`, null, {}],
    ]);

    const allSuccess = responses.every((r) => r.status === 200);
    errorRate.add(!allSuccess);
    responses.forEach((r) => apiResponseTime.add(r.timings.duration));
    sleep(1);
  });

  // -------------------------------------------------------
  // Test 10: Contact form submission
  // -------------------------------------------------------
  group('Contact Form', () => {
    const payload = JSON.stringify({
      name: 'K6 Test User',
      email: 'k6@test.com',
      phone: '+1 (555) 000-0000',
      message: 'This is a stress test message from K6.',
    });
    const params = {
      headers: { 'Content-Type': 'application/json' },
    };
    const res = http.post(`${baseUrl}/api/contact`, payload, params);
    const success = check(res, {
      'contact: status 200 or 201': (r) => r.status === 200 || r.status === 201,
    });
    errorRate.add(!success);
    apiResponseTime.add(res.timings.duration);
    sleep(1);
  });
}

// ============================================================
// Teardown — runs once after all tests
// ============================================================
export function teardown(data) {
  console.log(`✅ Stress test complete!`);
  console.log(`📊 Check the summary below for performance metrics.`);
}
