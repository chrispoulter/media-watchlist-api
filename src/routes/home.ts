import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod';
import z from 'zod';

const plugin: FastifyPluginAsyncZod = async (fastify) => {
    fastify.get(
        '/',
        {
            schema: {
                response: {
                    200: z.object({
                        message: z.string(),
                    }),
                },
            },
        },
        async function () {
            return { message: 'Welcome to the official fastify demo!' };
        }
    );
};

export default plugin;
