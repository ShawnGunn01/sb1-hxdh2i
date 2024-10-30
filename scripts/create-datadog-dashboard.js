const https = require('https');

const API_KEY = process.env.DD_API_KEY;
const APP_KEY = process.env.DD_APP_KEY;

const dashboardData = {
  title: 'PLLAY Enterprise Dashboard',
  description: 'Real-time metrics for PLLAY Enterprise',
  widgets: [
    {
      definition: {
        type: 'timeseries',
        requests: [
          {
            q: 'avg:pllay.request_duration{*}',
            display_type: 'line'
          }
        ],
        title: 'Average Request Duration'
      }
    },
    {
      definition: {
        type: 'toplist',
        requests: [
          {
            q: 'sum:pllay.request_count{*} by {status}.as_count()'
          }
        ],
        title: 'Request Count by Status'
      }
    },
    {
      definition: {
        type: 'query_value',
        requests: [
          {
            q: 'avg:pllay.active_users{*}'
          }
        ],
        title: 'Active Users'
      }
    },
    {
      definition: {
        type: 'timeseries',
        requests: [
          {
            q: 'avg:pllay.tournament_participants{*}',
            display_type: 'line'
          }
        ],
        title: 'Average Tournament Participants'
      }
    }
  ],
  layout_type: 'ordered'
};

const options = {
  hostname: 'api.datadoghq.com',
  port: 443,
  path: '/api/v1/dashboard',
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
    console.log('Dashboard created successfully');
    console.log(JSON.parse(data));
  });
});

req.on('error', (error) => {
  console.error('Error creating dashboard:', error);
});

req.write(JSON.stringify(dashboardData));
req.end();