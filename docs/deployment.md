# Deployment Notes

## Local Development

1. Install dependencies from the repo root with `npm install`
2. Copy `.env.example` to `.env`
3. Start MongoDB with `docker compose up -d`
4. Run both apps with `npm run dev:all`
5. Validate the repo before shipping with `npm run verify`

## Environment Variables

- `CLIENT_URL`
- `SERVER_URL`
- `PORT`
- `MONGODB_URI`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `OPENAI_API_KEY`
- `OPENAI_MODEL`

If `OPENAI_API_KEY` is missing, the app still works with fallback food analysis and fallback assistant responses.

## Full-Stack Containers

Run the whole stack in containers:

```bash
docker compose --profile fullstack up --build
```

This starts:

- MongoDB on `27017`
- Express API on `5000`
- frontend on `8080`

## Backend Container

Build:

```bash
docker build -f server/Dockerfile -t fitness-server .
```

Run:

```bash
docker run --env-file .env -p 5000:5000 fitness-server
```

## Frontend Container

Build:

```bash
docker build -f client/Dockerfile -t fitness-client .
```

Run:

```bash
docker run -p 8080:80 fitness-client
```

## Suggested Production Stack

- Frontend: Vercel, Netlify, or an Nginx container
- Backend: Render, Railway, Fly.io, AWS ECS, or a Node container behind Nginx
- Database: MongoDB Atlas
- File storage: move from local uploads to S3 or Cloudinary for production

## Scaling Notes

- Local disk uploads are good for development only. Replace with object storage in production.
- JWT refresh token persistence is already in MongoDB, which is safe for multi-instance backend deployment.
- Progress endpoints aggregate from meals and goals now; if traffic grows, add precomputed daily summaries.
- GitHub Actions CI now runs lint, tests, and the frontend build automatically on pushes and pull requests.
