FROM node:18

WORKDIR /app

COPY package.json /app

COPY . .

RUN npm install
CMD [ "node", "tempVCs.js" ]
