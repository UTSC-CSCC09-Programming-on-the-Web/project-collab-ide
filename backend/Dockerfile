FROM node:20
WORKDIR /app

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-psycopg2

COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start"]