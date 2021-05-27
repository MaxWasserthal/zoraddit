import 'reflect-metadata';
import { COOKIE_NAME, __prod__ } from "./constants";
import "dotenv-safe/config";
import express from 'express';
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from 'type-graphql';
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from './resolvers/user';
import { createConnection } from "typeorm";
import path from 'path';
import Redis from 'ioredis';
import session from 'express-session';
import cors from 'cors';
import { Post } from './entities/Post';
import { User } from './entities/User';
import { Upvote } from './entities/Upvote';
import { createUserLoader } from './utils/createUserLoader';
import { createUpvoteLoader } from './utils/createUpvoteLoader';

const main = async () => {

    const conn = await createConnection({
        type: 'postgres',
        url: process.env.REACT_APP_DATABASE_URL,
        logging: true,
        migrations: [path.join(__dirname, "./migrations/*")],
        entities: [Post, User, Upvote]
    })

    await conn.runMigrations();

    const app = express();

    const RedisStore = require('connect-redis')(session)
    const redis = new Redis(process.env.REACT_APP_REDIS_URL);
    app.set("trust proxy", 1);
    app.use(cors({
        origin: process.env.REACT_APP_CORS_ORIGIN,
        credentials: true,
    }))
    app.use(
      session({
        name: COOKIE_NAME,
        store: new RedisStore({ 
            client: redis,
            disableTouch: true,
        }),
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10,
            httpOnly: true,
            sameSite: 'lax',
            secure: __prod__,
        },
        saveUninitialized: false,
        secret: process.env.REACT_APP_SESSION_SECRET,
        resave: false,
      })
    );

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false,
        }),
        context: ({req, res}) => ({
            req,
            res,
            redis,
            userLoader: createUserLoader(),
            upvoteLoader: createUpvoteLoader(),
        }),
    });

    apolloServer.applyMiddleware(
        {
            app,
            cors: false,
        },
    );

    app.listen(parseInt(process.env.REACT_APP_PORT), () => {
        console.log("Started express-Server");
    });
}

main().catch((err) => {
    console.error(err);
});