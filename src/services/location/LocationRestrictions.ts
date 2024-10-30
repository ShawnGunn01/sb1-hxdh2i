import { State, Country, Region } from './types';

export class LocationRestrictions {
  private readonly allowedStates = new Set([
    'AL', 'AK', 'AZ', 'CA', 'CO', 'FL', 'GA', 'HI', 'ID', 'IL', 'IA', 'KS', 'KY',
    'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY',
    'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'TN', 'TX', 'UT', 'VA', 'VT',
    'WA', 'WV', 'WI', 'WY', 'DC', 'PR'
  ]);

  private readonly cashDisabledStates = new Set([
    'AR', 'CT', 'DE', 'LA', 'SD'
  ]);

  private readonly cardGameDisabledStates = new Set([
    'ME', 'IN'
  ]);

  private readonly dominoesDisabledStates = new Set([
    'NJ'
  ]);

  private readonly cashDisabledCountries = new Set([
    'AF', 'BY', 'BE', 'BA', 'BG', 'CD', 'CI', 'HR', 'CU', 'CY', 'CZ', 'EG', 'EE',
    'FR', 'GF', 'PF', 'TF', 'GR', 'HU', 'ID', 'IR', 'IQ', 'IT', 'JP', 'XK', 'LV',
    'LT', 'MY', 'MT', 'ME', 'MM', 'NG', 'KP', 'MK', 'PK', 'CN', 'PL', 'PT', 'RO',
    'RU', 'RS', 'SK', 'SI', 'SD', 'SY', 'TR', 'UA', 'VN', 'YU', 'ZW'
  ]);

  private readonly restrictedIndianStates = new Set([
    'Andhra Pradesh', 'Arunachal Pradesh', 'Kerala', 'Nagaland', 'Odisha',
    'Sikkim', 'Tamil Nadu', 'Telangana'
  ]);

  isStateAllowed(stateCode: string): boolean {
    return this.allowedStates.has(stateCode);
  }

  isCashEnabled(country: string, state: string, gameType?: string): boolean {
    // Check country-level restrictions
    if (this.cashDisabledCountries.has(country)) {
      return false;
    }

    // Special handling for India
    if (country === 'IN' && this.restrictedIndianStates.has(state)) {
      return false;
    }

    // Check state-level restrictions
    if (this.cashDisabledStates.has(state)) {
      return false;
    }

    // Check game-specific restrictions
    if (gameType) {
      if (gameType === 'card' && this.cardGameDisabledStates.has(state)) {
        return false;
      }
      if (gameType === 'dominoes' && this.dominoesDisabledStates.has(state)) {
        return false;
      }
    }

    return true;
  }

  isVirtualCurrencyAllowed(): boolean {
    // Virtual currency tournaments are available globally
    return true;
  }

  getRegionRestrictions(country: string, state: string): Region {
    return {
      cashEnabled: this.isCashEnabled(country, state),
      cardGamesEnabled: !this.cardGameDisabledStates.has(state),
      dominoesEnabled: !this.dominoesDisabledStates.has(state),
      virtualCurrencyEnabled: true
    };
  }
}

export const locationRestrictions = new LocationRestrictions();