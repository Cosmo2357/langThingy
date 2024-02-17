import express, { Request, Response } from 'express';
import multer, { Multer } from 'multer';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';


  const examplePost = async (req: Request, res: Response) => {
console.log('createEntranceData');
    const data = {
      message : 'hello world'
    }

    try {
      res.status(201).json({ data });
    } catch (error) {
      console.error(error);
      res.status(500).send({ error: 'Internal server error' });
    }
  };
  


export { examplePost };
