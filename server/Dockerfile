FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json* ./
COPY server/package.json ./server/package.json
COPY client/package.json ./client/package.json
COPY shared/package.json ./shared/package.json

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "run", "start", "--workspace", "server"]
