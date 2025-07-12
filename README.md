# Art CAPTCHA (Experimental)

This is an **experimental project** not intended for production use.  
The goal is to explore the idea of an **art-based CAPTCHA** system.

## ✨ Features

- 🎨 **Custom Image CAPTCHAs**: Upload images and create grid-based verification challenges
- 🎯 **Configurable Accuracy**: Set custom accuracy thresholds (e.g., 80% correct selections required)
- 📐 **Multiple Grid Types**: Support for 3x3, 3x4, 4x3, 4x4, 5x5 grids
- 🌙 **Theme Support**: Light and dark themes for better integration
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile devices
- 🔒 **Secure Verification**: Server-side token validation with expiration
- 🚀 **Easy Integration**: Simple JavaScript widget for any website
- 🛠 **Developer Friendly**: Complete API documentation and examples
- ⚡ **Widget Generator**: Visual tool to generate embed codes
- 📊 **Management Dashboard**: Create, edit, and manage all your CAPTCHAs

## 🚀 Quick Start

### 1. Clone and Install

```bash
git clone https://github.com/juanfran/art-captcha
cd art-captcha
pnpm install
```

### 2. Environment Setup

```bash
cp .env.example .env
```

Configure your environment variables:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/artcaptcha"

# NextAuth Configuration
NEXT_PUBLIC_AUTH_URL="http://localhost:3000"
AUTH_SECRET="your-auth-secret"
AUTH_TRUST_HOST=true

# OAuth Providers
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
```

### 3. Database Setup

Ensure PostgreSQL is running and create your database:

```bash
# Run database migrations
pnpm db:push
```

### 4. Start Development

```bash
pnpm dev
```

Visit [http://localhost:3000](http://localhost:3000) to access the CMS.

## 🎯 How It Works

### 1. Create CAPTCHAs

- Upload an image through the CMS dashboard
- Select grid type (3x3, 4x4, etc.)
- Mark the correct cells that users should select
- Set accuracy requirements (e.g., 80% correct)

### 2. Generate Widget Code

- Use the Widget Generator to create embed code
- Customize theme and size options
- Copy the generated JavaScript snippet

### 3. Embed in Your Website

```html
<!-- Basic Integration -->
<div
  id="captcha"
  data-art-captcha="1"></div>
<script src="https://your-domain.com/api/widget/script?id=1"></script>

<!-- With Custom Callbacks -->
<script>
  ArtCaptcha.init('#captcha', {
    onSuccess: function (token) {
      // CAPTCHA verified successfully
      document.getElementById('captcha-token').value = token;
    },
    onError: function (error) {
      // Verification failed
      console.log('CAPTCHA failed:', error);
    },
  });
</script>
```

### 4. Server-side Validation

```javascript
// Validate the verification token on your server
const response = await fetch('https://your-domain.com/api/widget/validate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    verificationToken: token,
    sessionToken: sessionId,
  }),
});

const result = await response.json();
if (result.valid) {
  // Process form submission
} else {
  // Reject submission
}
```

## 📖 Documentation

- **Widget Generator**: `/widget-generator` - Visual tool to create embed codes
- **Documentation**: `/docs` - Complete developer documentation
- **API Reference**: Detailed endpoints and examples included

## 🔧 API Endpoints

### Public Widget APIs

- `GET /api/widget/captcha/[id]` - Get CAPTCHA data (public)
- `POST /api/widget/verify` - Verify user selections
- `POST /api/widget/validate` - Server-side token validation
- `GET /api/widget/script` - Widget JavaScript code

### Management APIs (Authenticated)

- `GET /api/captchas` - List all CAPTCHAs
- `POST /api/captchas` - Create new CAPTCHA
- `GET /api/captchas/[id]` - Get specific CAPTCHA
- `PUT /api/captchas/[id]` - Update CAPTCHA
- `DELETE /api/captchas/[id]` - Delete CAPTCHA

## 🛡️ Security Features

- **Token Expiration**: Verification tokens expire after 10 minutes
- **Session Validation**: Prevents replay attacks with session tokens
- **Server-side Verification**: Never trust client-side validation alone
- **CORS Support**: Secure cross-origin embedding
- **Rate Limiting**: Built-in protection against abuse

## 🎨 Customization Options

### Themes

- **Light Theme**: Perfect for light-colored websites
- **Dark Theme**: Seamless integration with dark websites

### Sizes

- **Small**: 300px max width
- **Normal**: 400px max width (default)
- **Large**: 500px max width

### Grid Types

- 3x3, 3x4, 4x3, 4x4, 5x5 grids supported
- Easy to extend for custom grid sizes

## 🚀 Production Deployment

1. **Environment Variables**: Update `.env` with production values
2. **Database**: Use a production PostgreSQL instance
3. **HTTPS**: Ensure SSL certificate for secure token transmission
4. **Domain**: Update `NEXTAUTH_URL` to your production domain

## ⚠️ Important Notes

- This is an **experimental project** for educational purposes
- **Test thoroughly** before considering production use
- Always validate CAPTCHAs server-side
- Consider accessibility requirements for your users

## 📄 License

MIT License - see LICENSE.md for details

**Built with**: Next.js 15, React 19, TypeScript, Tailwind CSS, Drizzle ORM, NextAuth.js
