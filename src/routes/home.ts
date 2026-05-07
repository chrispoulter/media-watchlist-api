import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';

const plugin: FastifyPluginAsyncZod = async (fastify) => {
    fastify.get('/', async function () {
        return { message: 'Welcome to the Media Watchlist API!' };
    });
};

export default plugin;
