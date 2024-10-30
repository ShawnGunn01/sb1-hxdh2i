# PLLAY Enterprise Solution - API Documentation

## Base URL
`https://api.pllay.com/v1`

## Authentication
All API requests must include a valid JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Error Responses
All error responses follow this format:
```json
{
  "status": "error",
  "message": "Error description"
}
```

## Endpoints

### Authentication

#### POST /auth/register
Register a new user.

Request body:
```json
{
  "name": "string",
  "email": "string",
  "password": "string"
}
```

Response:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### POST /auth/login
Log in a user.

Request body:
```json
{
  "email": "string",
  "password": "string",
  "twoFactorToken": "string (optional)"
}
```

Response:
```json
{
  "token": "string",
  "user": {
    "id": "string",
    "name": "string",
    "email": "string",
    "role": "string"
  }
}
```

#### POST /auth/two-factor/setup
Set up two-factor authentication.

Response:
```json
{
  "secret": "string",
  "otpauthUrl": "string"
}
```

#### POST /auth/two-factor/verify
Verify two-factor authentication.

Request body:
```json
{
  "token": "string"
}
```

Response:
```json
{
  "message": "2FA verified and enabled successfully."
}
```

### User Management

#### GET /users/profile
Get the current user's profile.

Response:
```json
{
  "id": "string",
  "name": "string",
  "email": "string",
  "username": "string",
  "role": "string",
  "kycStatus": "string"
}
```

#### PUT /users/profile
Update the current user's profile.

Request body:
```json
{
  "name": "string",
  "username": "string"
}
```

Response:
```json
{
  "message": "Profile updated successfully"
}
```

### Game Management

#### GET /games
Get a list of games.

Query parameters:
- page (optional): int
- limit (optional): int
- search (optional): string

Response:
```json
{
  "games": [
    {
      "id": "string",
      "name": "string",
      "description": "string",
      "apiEndpoint": "string",
      "status": "string",
      "popularity": "number"
    }
  ],
  "totalPages": "number",
  "currentPage": "number"
}
```

#### POST /games
Create a new game.

Request body:
```json
{
  "name": "string",
  "description": "string",
  "apiEndpoint": "string"
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "apiEndpoint": "string",
  "status": "string",
  "popularity": "number"
}
```

#### GET /games/:id
Get a specific game.

Response:
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "apiEndpoint": "string",
  "status": "string",
  "popularity": "number"
}
```

#### PUT /games/:id
Update a game.

Request body:
```json
{
  "name": "string",
  "description": "string",
  "apiEndpoint": "string",
  "status": "string"
}
```

Response:
```json
{
  "message": "Game updated successfully"
}
```

#### DELETE /games/:id
Delete a game.

Response:
```json
{
  "message": "Game deleted successfully"
}
```

#### POST /games/:id/start-session
Start a game session.

Response:
```json
{
  "sessionId": "string"
}
```

#### POST /games/:id/end-session
End a game session.

Request body:
```json
{
  "sessionId": "string",
  "score": "number"
}
```

Response:
```json
{
  "message": "Game session ended successfully"
}
```

### Tournament Management

#### GET /tournaments
Get a list of tournaments.

Query parameters:
- page (optional): int
- limit (optional): int
- search (optional): string
- startDate (optional): date
- endDate (optional): date

Response:
```json
{
  "tournaments": [
    {
      "id": "string",
      "name": "string",
      "startDate": "date",
      "endDate": "date",
      "status": "string",
      "participants": "number",
      "prize": "number"
    }
  ],
  "totalPages": "number",
  "currentPage": "number"
}
```

#### POST /tournaments
Create a new tournament.

Request body:
```json
{
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "maxParticipants": "number",
  "entryFee": "number",
  "prize": "number"
}
```

Response:
```json
{
  "id": "string",
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "maxParticipants": "number",
  "entryFee": "number",
  "prize": "number",
  "status": "string"
}
```

#### GET /tournaments/:id
Get a specific tournament.

Response:
```json
{
  "id": "string",
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "maxParticipants": "number",
  "entryFee": "number",
  "prize": "number",
  "status": "string",
  "participants": [
    {
      "userId": "string",
      "username": "string"
    }
  ]
}
```

#### PUT /tournaments/:id
Update a tournament.

Request body:
```json
{
  "name": "string",
  "startDate": "date",
  "endDate": "date",
  "maxParticipants": "number",
  "entryFee": "number",
  "prize": "number",
  "status": "string"
}
```

Response:
```json
{
  "message": "Tournament updated successfully"
}
```

#### DELETE /tournaments/:id
Delete a tournament.

Response:
```json
{
  "message": "Tournament deleted successfully"
}
```

#### POST /tournaments/:id/join
Join a tournament.

Response:
```json
{
  "message": "Successfully joined the tournament"
}
```

#### POST /tournaments/:id/leave
Leave a tournament.

Response:
```json
{
  "message": "Successfully left the tournament"
}
```

### Payment System

#### GET /payments/wallet
Get wallet balance.

Response:
```json
{
  "currency": "number",
  "tokens": "number"
}
```

#### POST /payments/deposit
Make a deposit.

Request body:
```json
{
  "amount": "number",
  "processor": "string",
  "token": "string"
}
```

Response:
```json
{
  "message": "Deposit successful"
}
```

#### POST /payments/withdraw
Request a withdrawal.

Request body:
```json
{
  "amount": "number",
  "method": "string"
}
```

Response:
```json
{
  "message": "Withdrawal request submitted successfully"
}
```

#### GET /payments/transactions
Get transaction history.

Query parameters:
- page (optional): int

Response:
```json
{
  "transactions": [
    {
      "id": "string",
      "type": "string",
      "amount": "number",
      "status": "string",
      "createdAt": "date"
    }
  ],
  "currentPage": "number",
  "totalPages": "number"
}
```

#### POST /payments/convert-to-tokens
Convert currency to tokens.

Request body:
```json
{
  "amount": "number"
}
```

Response:
```json
{
  "message": "Conversion successful",
  "tokenAmount": "number"
}
```

#### POST /payments/convert-to-currency
Convert tokens to currency.

Request body:
```json
{
  "tokenAmount": "number"
}
```

Response:
```json
{
  "message": "Conversion successful",
  "currencyAmount": "number"
}
```

### Notifications

#### GET /notifications
Get user notifications.

Query parameters:
- page (optional): int
- limit (optional): int

Response:
```json
{
  "notifications": [
    {
      "id": "string",
      "type": "string",
      "message": "string",
      "read": "boolean",
      "createdAt": "date"
    }
  ],
  "currentPage": "number",
  "totalPages": "number",
  "totalNotifications": "number"
}
```

#### PUT /notifications/:id/read
Mark a notification as read.

Response:
```json
{
  "message": "Notification marked as read"
}
```

#### PUT /notifications/read-all
Mark all notifications as read.

Response:
```json
{
  "message": "All notifications marked as read"
}
```

#### DELETE /notifications/:id
Delete a notification.

Response:
```json
{
  "message": "Notification deleted successfully"
}
```

### Reports

#### GET /reports
Get report data.

Query parameters:
- startDate: date
- endDate: date
- game (optional): string
- type: string

Response:
```json
{
  "userGrowth": [
    {
      "date": "string",
      "count": "number"
    }
  ],
  "revenueByGame": [
    {
      "game": "string",
      "revenue": "number"
    }
  ],
  "tournamentParticipation": [
    {
      "tournament": "string",
      "participants": "number"
    }
  ],
  "dailyActiveUsers": [
    {
      "date": "string",
      "count": "number"
    }
  ],
  "wagerDistribution": [
    {
      "amount": "string",
      "count": "number"
    }
  ]
}
```

#### GET /reports/download
Download a report in CSV format.

Query parameters:
- startDate: date
- endDate: date
- game (optional): string
- type: string

Response: CSV file

## WebSocket Events

### Client to Server

- `createWager`: Create a new wager
- `acceptWager`: Accept a wager
- `completeWager`: Complete a wager
- `cancelWager`: Cancel a wager

### Server to Client

- `newWagerRequest`: Notification of a new wager request
- `wagerAccepted`: Notification that a wager has been accepted
- `wagerCompleted`: Notification that a wager has been completed
- `wagerCancelled`: Notification that a wager has been cancelled
- `newNotification`: Notification of a new system notification