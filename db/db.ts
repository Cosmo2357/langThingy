
import Knex from 'knex';
const knexfile = require('./knexfile.js');

const db = Knex(knexfile.development);

export default db;

