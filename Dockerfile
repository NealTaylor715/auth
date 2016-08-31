FROM node
RUN mkdir -p /usr/src/auth
WORKDIR /usr/src/auth
COPY package.json /usr/src/auth
RUN npm install
COPY . /usr/src/auth
EXPOSE 6969
CMD [ "npm", "start" ]