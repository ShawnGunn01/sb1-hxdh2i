import axios from 'axios';
import logger from '../utils/logger';

const ADMIN_API_URL = process.env.ADMIN_API_URL || 'http://localhost:3001/api/admin';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

export async function performComplianceCheck() {
  try {
    logger.info('Starting scheduled compliance check');

    // Fetch current compliance settings
    const settingsResponse = await axios.get(`${ADMIN_API_URL}/compliance-settings`, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });

    // Fetch latest regulations (this would be an API call to a regulatory body or a manual update process)
    const regulationsResponse = await axios.get('https://api.regulatorybody.com/latest-regulations');

    // Compare current settings with latest regulations
    const comparisonResult = compareComplianceSettings(settingsResponse.data, regulationsResponse.data);

    if (comparisonResult.needsUpdate) {
      logger.warn('Compliance settings need update', { updates: comparisonResult.updates });

      // Send notification to admin
      await sendComplianceUpdateNotification(comparisonResult.updates);

      // Automatically update settings
      await updateComplianceSettings(comparisonResult.updatedSettings);
    } else {
      logger.info('Compliance settings are up to date');
    }

  } catch (error) {
    logger.error('Error during scheduled compliance check', { error });
  }
}

function compareComplianceSettings(currentSettings: any, latestRegulations: any) {
  const updates = [];
  const updatedSettings = { ...currentSettings };

  // Compare minimum age
  if (currentSettings.minAge < latestRegulations.minAge) {
    updates.push(`Update minimum age from ${currentSettings.minAge} to ${latestRegulations.minAge}`);
    updatedSettings.minAge = latestRegulations.minAge;
  }

  // Compare maximum wager limits
  ['maxDailyWager', 'maxWeeklyWager', 'maxMonthlyWager'].forEach(limit => {
    if (currentSettings[limit] > latestRegulations[limit]) {
      updates.push(`Reduce ${limit} from ${currentSettings[limit]} to ${latestRegulations[limit]}`);
      updatedSettings[limit] = latestRegulations[limit];
    }
  });

  // Compare KYC requirements
  const newKycRequirements = latestRegulations.kycRequirements.filter(
    (req: string) => !currentSettings.kycRequirements.includes(req)
  );
  if (newKycRequirements.length > 0) {
    updates.push(`Add new KYC requirements: ${newKycRequirements.join(', ')}`);
    updatedSettings.kycRequirements = [...currentSettings.kycRequirements, ...newKycRequirements];
  }

  // Compare restricted countries
  const newRestrictedCountries = latestRegulations.restrictedCountries.filter(
    (country: string) => !currentSettings.restrictedCountries.includes(country)
  );
  if (newRestrictedCountries.length > 0) {
    updates.push(`Add new restricted countries: ${newRestrictedCountries.join(', ')}`);
    updatedSettings.restrictedCountries = [...currentSettings.restrictedCountries, ...newRestrictedCountries];
  }

  return {
    needsUpdate: updates.length > 0,
    updates,
    updatedSettings
  };
}

async function sendComplianceUpdateNotification(updates: string[]) {
  // Implement notification logic (e.g., email, Slack message)
  logger.info('Sending compliance update notification', { updates });
  // TODO: Implement actual notification sending logic
}

async function updateComplianceSettings(newSettings: any) {
  try {
    await axios.put(`${ADMIN_API_URL}/compliance-settings`, newSettings, {
      headers: { Authorization: `Bearer ${ADMIN_TOKEN}` }
    });
    logger.info('Compliance settings automatically updated');
  } catch (error) {
    logger.error('Failed to automatically update compliance settings', { error });
  }
}