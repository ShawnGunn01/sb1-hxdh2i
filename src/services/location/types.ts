export interface State {
  code: string;
  name: string;
}

export interface Country {
  code: string;
  name: string;
}

export interface Region {
  cashEnabled: boolean;
  cardGamesEnabled: boolean;
  dominoesEnabled: boolean;
  virtualCurrencyEnabled: boolean;
}

export interface LocationContext {
  country: Country;
  state: State;
  geofences: Array<{
    tag: string;
    description: string;
  }>;
}

export interface VerificationResult {
  allowed: boolean;
  message: string;
  context?: LocationContext;
  restrictions?: Region;
}

export interface LocationCoordinates {
  latitude: number;
  longitude: number;
}