FROM --platform=linux/amd64 node:20 AS builder

WORKDIR /app
COPY . .
RUN npm install && npm run build


FROM --platform=linux/amd64 nginx:alpine

WORKDIR /usr/share/nginx/html
RUN rm -rf ./*
COPY --from=builder /app/build .
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx/nginx.conf /etc/nginx/conf.d

EXPOSE 80
ENTRYPOINT ["nginx", "-g", "daemon off;"]