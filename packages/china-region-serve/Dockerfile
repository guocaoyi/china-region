FROM node:14-alpine

WORKDIR /app

# copy files and install dependencies
COPY . ./
RUN yarn

EXPOSE 4000

# have to add node environment production after install
# due to this causing yarn to stop installing dev dependencies
# which are actually needed to get this environment up and running
ENV NODE_ENV=production
CMD ["yarn", "run:docker"]
