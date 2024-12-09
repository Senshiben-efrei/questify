# Questify 🎮

A gamified task management application that turns your daily tasks into epic quests!

## Quick Start 🚀

### Prerequisites

- Docker and Docker Compose installed on your machine
- Git (optional, you can download the files directly)

### Installation

1. Clone this branch:
   \`\`\`bash
   git clone -b composer https://github.com/Senshiben-efrei/Questify.git
   cd Questify
   \`\`\`

2. (Optional) Configure environment variables:
   \`\`\`bash
   cp .env.example .env
   # Edit .env with your preferred settings
   \`\`\`

3. Start the application:
   \`\`\`bash
   docker compose up -d
   \`\`\`

4. Access the application:
   - Frontend: http://localhost:3000
   - API Documentation: http://localhost:8000/docs

## Services 🛠️

The application consists of three main services:

- **Frontend** (React): Runs on port 3000
- **Backend API** (FastAPI): Runs on port 8000
- **Database** (PostgreSQL): Runs on port 5432

## Environment Variables ⚙️

All services have default values, but you can customize them using a \`.env\` file:

### Database Settings
- \`POSTGRES_USER\`: Database username (default: postgres)
- \`POSTGRES_PASSWORD\`: Database password (default: postgres)
- \`POSTGRES_DB\`: Database name (default: questify)

### API Settings
- \`API_PORT\`: API port (default: 8000)
- \`JWT_SECRET\`: Secret key for JWT tokens
- \`JWT_ALGORITHM\`: JWT algorithm (default: HS256)
- \`JWT_EXPIRATION_MINUTES\`: Token expiration time (default: 60)

### Client Settings
- \`CLIENT_PORT\`: Frontend port (default: 3000)
- \`API_URL\`: Backend API URL (default: http://localhost:8000)

## Troubleshooting 🔧

1. If you can't access the services, check if the ports are available:
   \`\`\`bash
   # List all running containers and their ports
   docker compose ps
   \`\`\`

2. View logs for any service:
   \`\`\`bash
   # View logs for a specific service
   docker compose logs [service_name]
   
   # Example for frontend
   docker compose logs client
   \`\`\`

3. Restart services:
   \`\`\`bash
   docker compose restart
   \`\`\`

4. Complete reset:
   \`\`\`bash
   docker compose down -v
   docker compose up -d
   \`\`\`

## Contributing 🤝

This is the deployment branch. For development:

1. Visit the main repository branch: [Questify Main Branch](https://github.com/Senshiben-efrei/Questify)
2. Follow the development setup instructions there

## License 📄

This project is licensed under the MIT License.

## Support 💬

If you encounter any issues:
1. Check the [Issues](https://github.com/Senshiben-efrei/Questify/issues) section
2. Create a new issue if your problem isn't already reported
