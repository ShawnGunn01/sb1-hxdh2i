const https = require('https');

const API_KEY = process.env.DD_API_KEY;
const APP_KEY = process.env.DD_APP_KEY;

const monitors = [
  {
    name: 'High Response Time',
    type: 'metric alert',
    query: 'avg(last_5m):avg:pllay.request_duration{*} > 1000',
    message: 'Average response time is above 1 second for the last 5 minutes. @slack-pllay-alerts',
    options: {
      thresholds: { critical: 1000, warning: 500 },
      notify_no_data: false,
      include_tags: true
    }
  },
  {
    name: 'High Error Rate',
    type: 'metric alert',
    query: 'sum(last_5m):sum:pllay.request_count{status:5xx}.as_count() / sum:pllay.request_count{*}.as_count() * 100 > 5',
    message: 'Error rate is above 5% for the last 5 minutes. @slack-pllay-alerts',
    options: {
      thresholds: { critical: 5, warning: 3 },
      notify_no_data: false,
      include_tags: true
    }
  },
  {
    name: 'Low Active Users',
    type: 'metric alert',
    query: 'avg(last_15m):avg:pllay.active_users{*} < 100',
    message: 'Active users have dropped below 100 for the last 15 minutes. @slack-pllay-alerts',
    options: {
      thresholds: { critical: 100, warning: 200 },
      notify_no_data: false,
      include_tags: true
    }
  }
];

monitors.forEach(monitor => {
  const options = {
    hostname: 'api.datadoghq.com',
    port: 443,
    path: '/api/v1/monitor',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'DD-API-KEY': API_KEY,
      'DD-APPLICATION-KEY': APP_KEY
    }
  };

  const req = https.request(options, (res) => {
    let data = '';

    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      console.log(`Monitor "${monitor.name}" created successfully`);
      console.log(JSON.parse(data));
    });
  });

  req.on('error', (error) => {
    console.error(`Error creating monitor "${monitor.name}":`, error);
  });

  req.write(JSON.stringify(monitor));
  req.end();
});