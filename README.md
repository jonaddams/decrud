# Document Engine CRUD Application

A full-featured document management application demonstrating the capabilities of Nutrient Document Engine. This example showcases document upload, viewing, management, and authentication features in a modern Next.js application.

## Features

- **Document Management**: Upload, view, and manage PDF documents
- **Authentication**: Secure Google OAuth authentication with role-based access control
- **Document Viewer**: Embedded Nutrient Viewer with full document interaction capabilities
- **Responsive Design**: Mobile-first design that works on all devices
- **Dark/Light Theme**: User preference-based theming with system preference detection
- **Search & Filter**: Find documents quickly with search and filter capabilities
- **Large File Support**: Upload documents up to 250MB with progress tracking

## Technology Stack

- **Framework**: Next.js 15 with App Router and React Server Components
- **Language**: TypeScript with strict mode
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with Google OAuth
- **Document Engine**: Nutrient Document Engine
- **Document Viewer**: Nutrient Viewer (CDN)
- **Styling**: Tailwind CSS v4
- **Linting**: Biome

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js 18+ and pnpm
- PostgreSQL database
- [Nutrient Document Engine](https://www.nutrient.io/products/document-engine/) (running on localhost:8585 or configured URL)
- Google OAuth credentials (for authentication)

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```bash
# Document Engine Configuration
DOCUMENT_ENGINE_BASE_URL=http://localhost:8585
DOCUMENT_ENGINE_API_KEY=your_document_engine_api_key
DOCUMENT_ENGINE_PRIVATE_KEY_PATH=./certificates/document-engine-private-key.pem

# Public environment variable for client-side Document Engine URL
NEXT_PUBLIC_DOCUMENT_ENGINE_BASE_URL=http://localhost:8585

# NextAuth.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here

# OAuth Providers (Google)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/your_database

# Nutrient Viewer CDN Configuration
NUTRIENT_VIEWER_VERSION=1.10.0
```

See `.env` for placeholder values and descriptions.

## Getting Started

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Set Up Database

```bash
# Generate Prisma client
pnpm prisma generate

# Run database migrations
pnpm prisma migrate dev

# (Optional) Seed database with sample data
pnpm prisma db seed
```

### 3. Set Up Document Engine JWT Signing

Generate a private key for signing Document Engine JWTs:

```bash
mkdir -p certificates
openssl genpkey -algorithm RSA -out certificates/document-engine-private-key.pem -pkeyopt rsa_keygen_bits:2048
```

Upload the corresponding public key to your Document Engine configuration.

### 4. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
2. Create OAuth 2.0 credentials
3. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
4. Copy Client ID and Client Secret to `.env.local`

### 5. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Project Structure

```
app/
├── api/              # API routes
│   ├── auth/         # NextAuth.js authentication
│   └── documents/    # Document CRUD operations
├── dashboard/        # Main application dashboard
├── documents/        # Document viewer page
└── layout.tsx        # Root layout with theme provider

components/
├── providers/        # React context providers
├── document-list.tsx # Document list component
├── document-viewer.tsx # Document viewer component
└── theme-toggle.tsx  # Theme switching component

lib/
├── auth.ts           # Authentication utilities
├── document-engine.ts # Document Engine API client
└── prisma.ts         # Prisma database client

prisma/
└── schema.prisma     # Database schema
```

## Key Features

### Authentication

- Google OAuth integration via NextAuth.js
- Role-based access control (ADMIN, USER)
- Admin users can view the system as regular users for testing

### Document Upload

- Drag-and-drop interface
- Progress tracking for large files
- Support for files up to 250MB
- Automatic upload to Document Engine

### Document Viewer

- Full-featured Nutrient Viewer integration
- JWT-based authentication
- Responsive full-viewport viewing
- Mobile-optimized controls

### Theme System

- Dark and light themes
- Automatic system preference detection
- Persistent user preference storage
- Smooth transitions between themes

## Development

### Code Quality

This project uses Biome for linting and formatting:

```bash
# Check for linting errors
pnpm biome check

# Auto-fix linting errors
pnpm biome check --write

# Format code
pnpm biome format --write
```

### Database Management

```bash
# Create a new migration
pnpm prisma migrate dev --name your_migration_name

# Reset database (WARNING: deletes all data)
pnpm prisma migrate reset

# Open Prisma Studio (database GUI)
pnpm prisma studio
```

## Deployment

### Environment Configuration

Ensure all environment variables are configured in your deployment environment:

1. Set up PostgreSQL database
2. Configure Document Engine URL and API keys
3. Generate and configure JWT signing keys
4. Set up Google OAuth credentials with production redirect URI
5. Set `NEXTAUTH_SECRET` to a secure random value
6. Set `NEXTAUTH_URL` to your production URL

### Build and Deploy

```bash
# Build for production
pnpm build

# Start production server
pnpm start
```

The application can be deployed to any platform that supports Next.js:
- Vercel (recommended)
- AWS
- Google Cloud Platform
- Docker containers

## License

This is an example application provided by Nutrient for demonstration purposes.

## Support

For issues or questions about this example application, please contact Nutrient support or refer to the [Nutrient Documentation](https://www.nutrient.io/guides/).

For Nutrient Document Engine documentation and API reference, visit [Nutrient Document Engine Docs](https://www.nutrient.io/guides/document-engine/).
