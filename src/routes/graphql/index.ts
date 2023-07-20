import { FastifyPluginAsyncTypebox } from '@fastify/type-provider-typebox';
import { createGqlResponseSchema, gqlResponseSchema, graphQlSchema } from './schemas.js';
import { graphql } from 'graphql';
import { resolvers } from './resolvers.js';

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.route({
    url: '/',
    method: 'POST',
    schema: {
      ...createGqlResponseSchema,
      response: {
        200: gqlResponseSchema,
      },
    },
    async handler(req, reply) {
      const { query, variables } = req.body;

      const result = await graphql({
        schema: graphQlSchema,
        source: String(query),
        variableValues: variables,
        rootValue: resolvers,
        contextValue: { prisma: fastify.prisma },
      });

      return reply.send(result);
    },
  });
};

export default plugin;
