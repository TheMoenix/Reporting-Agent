FROM --platform=linux/amd64 node:20-alpine as builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM --platform=linux/amd64 node:20-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/node_modules ./node_modules

EXPOSE 4000

CMD ["node", "dist/main"]
