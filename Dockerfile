FROM node:18

WORKDIR /app

COPY package.json /app
COPY . /app

RUN ls

RUN npm install
CMD [ "node", "tempVCs.js" ]
