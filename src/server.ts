import app from './index.js';
import { config } from './lib/config.js';
import { logger } from './lib/logger.js';

app.listen(config.PORT, () => {
    logger.info(
        { port: config.PORT, local: `http://localhost:${config.PORT}` },
        'Server started'
    );
});
