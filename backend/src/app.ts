import express from "express";

/**
 * Express app factory.
 *
 * Runtime entrypoint is `server.ts`.
 * This file exists so `tsc` builds cleanly and the app can be imported for tests.
 */
const app = express();

export default app;
