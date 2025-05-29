import { ApolloServer } from '@apollo/server';
import { expressMiddleware } from '@apollo/server/express4';
import { typeDefs } from './schema';
import { resolvers } from './resolvers';
import express from 'express';
import cors from 'cors';
import { json } from 'body-parser';

export async function startApolloServer() {
    const app = express();

    const server = new ApolloServer({
        typeDefs,
        resolvers,
    });

    await server.start();

    app.use(
        '/graphql',
        cors<cors.CorsRequest>(),
        json(),
        expressMiddleware(server)
    );

    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
        console.log(`🚀 Apollo Server ready at http://localhost:${PORT}/graphql`);
    });
}
