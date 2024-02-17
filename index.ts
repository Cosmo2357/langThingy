import express, { NextFunction, Request, Response } from 'express';

import cookieParser from 'cookie-parser';
import cors from 'cors';
import * as dotenv from 'dotenv';
import fs from 'fs';
import http from 'http';
import { HttpError } from './src/helper/HttpError';
import * as Router from './src/router'

dotenv.config();

const app: express.Express = express()

const server: http.Server = http.createServer(app);

const port = process.env.PORT || 8080
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

app.use(cors({
  origin: frontendUrl,
  credentials: true
}))
app.use(cookieParser());
app.use(express.json())

const v1 = "/api/v1"

app.post(`/`, (req, res) => {
  res.send('Server is running!')
})


app.use(`${v1}/`,/* middleware */Router.mainRoutes);

// Error Handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof HttpError) {
    console.log(err.message);
    res.status(err.statusCode).send(err.message);
  } else {
    res.status(500).send('Internal Server Error');
  }
});


server.listen(port, () => {
  console.log(`Server listening on port ${port}`)
})