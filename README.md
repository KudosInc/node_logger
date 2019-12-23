# Node Logger
Logging service for node based micro-services

## Setup

To install this package run this command in the console of any node service: 

`npm i node_logger@git+https://git@github.com/KudosInc/node_logger.git`

## Requirements
- ExpressJs installed in case you want to use the server logger
- Node version > 10.12.0 (tested on this version)

## Usage
To configure express to use the server logger require the `serverLogger` and use it as a function with express instance.
```javascript
const logger = require('@kudosinc/node_logger');
const app = express();
logger.actAsExpressMiddleWare(app);
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
process.env.APP_VERSION = packageJson.version;
```
