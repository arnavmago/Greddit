FROM node:18.14.2

# Install Dependencies
COPY package*.json ./

RUN npm install --f

# Copy app source code
COPY . .

EXPOSE 8080
# Exports

CMD ["npm","start"]