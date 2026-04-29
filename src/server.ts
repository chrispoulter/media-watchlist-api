import './lib/sentry.js';
import app from './index.js';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';

app.listen(config.PORT, () => {
    logger.info(
        { port: config.PORT, url: `http://localhost:${config.PORT}` },
        'Server started'
    );
});
