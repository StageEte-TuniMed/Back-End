FROM node:20-alpine
WORKDIR /app
COPY . /app
RUN npm install --legacy-peer-deps
RUN mkdir -p public/uploads
EXPOSE 3001
CMD ["npm", "start"]
