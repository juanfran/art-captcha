# Art CAPTCHA (Experimental)

This is an **experimental project** not intended for production use.  
The goal is to explore the idea of an **art-based CAPTCHA** system.

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/juanfran/art-captcha
cd art-captcha
```

### 2. Install dependencies

This project uses [pnpm](https://pnpm.io/). If you don't have it installed:

```bash
npm install -g pnpm
```

Then install project dependencies:

```bash
pnpm install
```

### 3. Environment variables

You need to create a `.env` file based on the `.env.example` file.

```bash
cp .env.example .env
```

Fill in the required environment variables:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

DATABASE_URL=your-database-url

AUTH_SECRET=your-auth-secret
AUTH_TRUST_HOST=true
```

### 4. Requirements

- **PostgreSQL** must be installed and running.
- Node.js version **24.4.0** is required.

### 5. Start the development server

```bash
pnpm dev
```

Visit the app at [http://localhost:3000](http://localhost:3000)

---

## ⚠️ Disclaimer

This is a prototype built for experimentation purposes only.
Do **not** use in production environments.

---

## License

MIT
