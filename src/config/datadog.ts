import tracer from 'dd-trace';
import { datadogLogs } from '@datadog/browser-logs';

// Initialize the Datadog tracer
tracer.init({
  service: 'pllay-enterprise',
  env: process.env.NODE_ENV,
  version: process.env.npm_package_version,
  logInjection: true,
});

// Initialize Datadog logs
datadogLogs.init({
  clientToken: process.env.DATADOG_CLIENT_TOKEN,
  site: 'datadoghq.com',
  forwardErrorsToLogs: true,
  sampleRate: 100,
});

export { tracer, datadogLogs };