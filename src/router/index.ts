// routes/userRoutes.js
import express from 'express';
import * as mainController from '../controllers';

const mainRoutes = express.Router();

mainRoutes.post('/example', mainController.examplePost);
mainRoutes.get('/example', mainController.examplePost);


export { mainRoutes }
