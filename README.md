# Collections Dashboard

A comprehensive collections management dashboard built with React, TypeScript, Express, and Tailwind CSS. This application provides tools for managing collections, conversations, escalations, and payment plans.

## Features

- **Collections Queue**: Manage and track collection cases
- **Conversations**: Handle customer communications
- **Escalations**: Track and manage escalated cases
- **Payment Plans**: Create and monitor payment arrangements
- **AI Approvals**: Automated approval workflows
- **Real-time Updates**: Live data synchronization

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Radix UI
- **Backend**: Express.js, Node.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **Build Tools**: Vite, ESBuild
- **Deployment**: Railway

## Railway Deployment

### Prerequisites

Before deploying to Railway, ensure you have:

- A [Railway account](https://railway.app) (free tier available)
- A GitHub repository with your code
- A PostgreSQL database (Railway provides this)

### Initial Setup

1. **Connect to Railway**
   - Go to [Railway.app](https://railway.app) and sign in
   - Click "New Project" and select "Deploy from GitHub repo"
   - Choose your Collections Dashboard repository

2. **Configure the Project**
   - Railway will automatically detect this is a Node.js project
   - The `railway.json` configuration file is already set up for optimal deployment

### Environment Variables

Railway will automatically set the `PORT` environment variable. The application is configured to:

- Use `process.env.PORT` for the server port (Railway provides this)
- Default to port 5000 if no PORT is specified
- Bind to IPv6 addresses for Railway compatibility

**Required Environment Variables:**
- `PORT` - Automatically set by Railway
- `NODE_ENV` - Set to "production" in Railway

**Optional Environment Variables:**
You can add these in Railway's environment variables section if needed:
- Database connection strings
- API keys
- Session secrets
- Any other configuration your application requires

### Deployment Process

1. **Automatic Deployment**
   - Railway will automatically build and deploy your application when you push to the main branch
   - The build process runs: `npm run build`
   - The start command is: `npm run start`

2. **Build Configuration**
   - **Build Command**: `npm run build`
   - **Start Command**: `npm run start`
   - **Health Check**: `/health` endpoint
   - **Health Check Timeout**: 100ms
   - **Restart Policy**: On failure (max 10 retries)

3. **Database Setup**
   - Add a PostgreSQL database service in Railway
   - Railway will provide connection details automatically
   - Run database migrations if needed using Railway's CLI or dashboard

### Verification

After deployment, verify your application is working:

1. **Health Check**
   - Visit `https://your-app-name.railway.app/health`
   - Should return a 200 status with health information

2. **Application Access**
   - Your app will be available at `https://your-app-name.railway.app`
   - The frontend and backend are served from the same domain

3. **Logs Monitoring**
   - Check Railway's dashboard for deployment logs
   - Monitor application logs for any errors

### Railway CLI (Optional)

For advanced users, you can use the Railway CLI:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Link to your project
railway link

# Deploy manually
railway up

# View logs
railway logs

# Open in browser
railway open
```

### Troubleshooting

**Common Issues:**

1. **Build Failures**
   - Check that all dependencies are in `package.json`
   - Ensure TypeScript compilation passes locally
   - Verify build command works: `npm run build`

2. **Runtime Errors**
   - Check Railway logs for specific error messages
   - Verify environment variables are set correctly
   - Ensure database connection is working

3. **Health Check Failures**
   - Verify the `/health` endpoint is accessible
   - Check that the server starts successfully
   - Review application logs for startup errors

4. **Port Binding Issues**
   - The application is configured to use `process.env.PORT`
   - Railway automatically provides the PORT environment variable
   - No manual port configuration needed

**Getting Help:**
- Check Railway's [documentation](https://docs.railway.app)
- Review application logs in Railway dashboard
- Ensure all environment variables are properly configured

### Development

For local development:

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start
```

## Project Structure

```
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # UI components
│   │   ├── pages/         # Page components
│   │   └── hooks/         # Custom React hooks
├── server/                # Express backend
│   ├── index.ts          # Main server file
│   ├── routes.ts         # API routes
│   └── storage.ts        # Data storage
├── shared/               # Shared types and schemas
├── railway.json          # Railway deployment config
└── package.json          # Dependencies and scripts
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
