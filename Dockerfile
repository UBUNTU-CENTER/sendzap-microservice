FROM node:20-slim

WORKDIR /app

# Install dependencies needed for some native modules if any (baileys might need some)
# RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./

RUN npm install --production

COPY . .

# Ensure sessions directory exists
RUN mkdir -p sessions

EXPOSE 3000

CMD ["node", "--max-old-space-size=128", "index.js"]
