export const API_VERSIONS = {
  V1: 'v1',
  V2: 'v2',
};

export const LATEST_VERSION = API_VERSIONS.V2;

export const isVersionDeprecated = (version: string): boolean => {
  // Add logic here to determine if a version is deprecated
  return version === API_VERSIONS.V1;
};

export const getVersionExpirationDate = (version: string): Date | null => {
  if (version === API_VERSIONS.V1) {
    return new Date('2024-12-31'); // Example: V1 will be deprecated by the end of 2024
  }
  return null;
};