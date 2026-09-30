# Banking System

A full-stack banking application built on the MERN stack. Account balances are never stored as a mutable number: they are derived in real time from an immutable double-entry ledger, and every fund transfer runs inside an ACID-compliant database transaction.

**Live demo:** [banking-system-bice.vercel.app](https://banking-system-bice.vercel.app)

## Highlights

- **Double-entry ledger**: every transaction writes immutable `CREDIT` and `DEBIT` entries. Balances are computed on demand with MongoDB aggregation pipelines, so the ledger is the single source of truth.
- **Atomic fund transfers**: transfers use MongoDB multi-document transactions, so a debit and its matching credit either both commit or both roll back.
- **Idempotent transfers**: each transfer carries an idempotency key, so retries or double-clicks can never move money twice.
- **Secure authentication**: passwords hashed with bcrypt, sessions carried in HTTP-only cookies, JWT-based auth, and a TTL-indexed token blacklist that invalidates tokens on logout.
- **Email notifications**: templated HTML alerts for registration, login, and transactions, sent through Nodemailer with Gmail OAuth2.

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | React |
| Backend | Node.js, Express |
| Database | MongoDB (aggregation pipelines, multi-document transactions) |
| Auth | JWT, bcrypt, HTTP-only cookies |
| Email | Nodemailer, Gmail OAuth2 |
| Deployment | Vercel |

## How It Works

### Ledger-based balances

Instead of updating a `balance` field, each transfer appends two ledger entries:

1. a `DEBIT` entry against the sender's account
2. a `CREDIT` entry against the receiver's account

An account's balance is the sum of its credits minus the sum of its debits, calculated with an aggregation pipeline. Because entries are immutable, there is a complete and auditable history of every movement of funds.

### Transfer flow

1. The client sends a transfer request with an idempotency key.
2. The server checks whether that key has already been processed and returns the original result if so.
3. Inside a MongoDB transaction, it validates the sender's derived balance and writes the debit and credit entries.
4. The transaction commits (or aborts entirely on any failure).
5. An email notification is sent to the user.

### Authentication flow

1. On login, the server verifies the bcrypt hash and issues a JWT in an HTTP-only cookie.
2. Protected routes verify the token and check it against the blacklist.
3. On logout, the token is added to a blacklist collection with a TTL index, so entries expire automatically once the token would have expired anyway.

## Project Structure

```
BankingSystem/
├── api/          # Vercel serverless entry
├── frontend/     # React client
├── src/          # Backend source (routes, controllers, models, services)
├── server.js     # Express server entry point
├── vercel.json   # Vercel deployment config
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- A MongoDB deployment that supports transactions (MongoDB Atlas or a local replica set)
- A Google Cloud project with Gmail API OAuth2 credentials

### Installation

```bash
# Clone the repository
git clone https://github.com/Alok14x14/BankingSystem.git
cd BankingSystem

# Install backend dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..
```

### Environment Variables

Create a `.env` file in the project root:

```env
PORT=3000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret

# Gmail OAuth2 (Nodemailer)
EMAIL_USER=your_gmail_address
CLIENT_ID=your_google_client_id
CLIENT_SECRET=your_google_client_secret
REFRESH_TOKEN=your_google_refresh_token
```

### Run Locally

```bash
# Start the backend
npm start

# In a second terminal, start the frontend
cd frontend
npm start
```

## Security Notes

- Passwords are never stored in plain text.
- Tokens live in HTTP-only cookies, so client-side JavaScript cannot read them.
- Logged-out tokens are rejected through the blacklist until they expire.
- Idempotency keys protect against duplicate transfers from retries.

## Author

**Alok**, B.Tech ECE, NIT Patna
GitHub: [@Alok14x14](https://github.com/Alok14x14)
