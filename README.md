# Node Logger
Logging service for node based micro-services

## Setup

To install this package run this command in the console of any node service: 

`npm i @kudosinc/node_logger`

## Requirements
- ExpressJs installed in case you want to use the server logger
- Node version > 10.12.0 (tested on this version)

## Usage
To configure express to use the server logger require the `serverLogger` and use it as a function with express instance.

```javascript
const logger = require('@kudosinc/node_logger');
const app = express();
logger.applyMiddleware(app);
```

To get user and organization information, please use the following commands when the user and organization information is available.

```javascript
app.set('user_id', user_id);
app.set('organization_id', organization_id);
```

To use this logger with Apollo GraphQL server, add the following line in the configuration of the server. To set this bit with `ApolloServer`, make following changes in the `context` block.

```javascript
context: async ({ req }) => {
  const token = req.headers.authorization.replace('Bearer ', '');
  const user = jsonwebtoken.verify(token, serverConfig.jwtKey);
  if (!user) {
    throw new AuthenticationError('Invalid authentication token');
  }
  app.set('user_id', user.id);
  app.set('organization_id', user.org_id);
},
```

```javascript
extensions: [() => logger.graphqlExtension()],
```

The final configuration might look something like this (copied from spaces)

```javascript
const server = new ApolloServer({
  schema,
  context: async ({ req }) => {
    if (!user) {
      throw new AuthenticationError('Invalid authentication token');
    }
  },
  playground: false,
  debug: process.env.KUDOS_LOG_LEVEL === 'debug',
  extensions: [() => logger.graphqlExtension()],
});
```

You can use the `log` to log errors or any other logs if you want to log errors some where in the code. Different type of methods supported by this logger are: `log.error`, `log.debug`, `log.info` depending on your requirements.

To use the logger else where you can just include the `log` from the node_logger package and use it with the same methods; `log.error`, `log.debug` etc.

```javascript
const logger = require('@kudosinc/node_logger');
log.debug('some task complete!');
```

## Showing server version in logs

To show server versions in the logs, this change is required, preferrably in the `bin/www`, where server starts

```javascript
const packageJson = require('../package.json');

process.env.APP_VERSION = packageJson.version;
```
