# API Versioning Strategy

## Overview

Our API uses a versioning strategy to ensure backward compatibility while allowing for future improvements. We use URL-based versioning, where the version is specified in the URL path.

## Current Versions

- V1: `/api/v1`
- V2: `/api/v2` (Latest)

## Versioning Rules

1. Major versions (v1, v2, etc.) are used for breaking changes or significant feature additions.
2. Minor updates and non-breaking changes are made within a major version.
3. Each major version is supported for at least 12 months after a new major version is released.
4. Deprecation notices are provided at least 6 months before a version is sunset.

## Headers

The following headers are included in API responses:

- `X-API-Version`: The version of the API being used.
- `X-API-Deprecated`: Boolean indicating if the version is deprecated.
- `X-API-Expiration-Date`: (If applicable) The date when the version will be sunset.
- `X-API-Latest-Version`: (If not using the latest version) The current latest API version.

## Deprecation Process

1. When a new major version is released, the previous version enters a deprecation phase.
2. During the deprecation phase, the previous version continues to function but includes deprecation warnings.
3. After the deprecation period (minimum 6 months), the old version may be removed.

## Best Practices for API Consumers

1. Always specify the API version in your requests.
2. Check the `X-API-Deprecated` and `X-API-Expiration-Date` headers to stay informed about version status.
3. Plan to migrate to newer versions well before the expiration date of your current version.
4. Subscribe to our developer newsletter for updates on new versions and deprecations.

## Version Changelog

### V2 (Current)
- Added advanced analytics endpoints
- Improved error responses
- Enhanced security features

### V1
- Initial release
- Basic functionality for games, tournaments, payments, and user management

## Support

For any questions or issues related to API versions, please contact our developer support team at api-support@pllay.com.