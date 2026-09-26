{
  "name": "webora-backend",
  "version": "1.0.0",
  "description": "Backend WEBORA — sauvegarde des sites et génération à partir des modèles",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "db:init": "psql \"$DATABASE_URL\" -f schema.sql"
  },
  "dependencies": {
    "express": "^4.19.2",
    "pg": "^8.11.5",
    "dotenv": "^16.4.5"
  }
}
