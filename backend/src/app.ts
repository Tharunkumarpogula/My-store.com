import config from './config';
import { connectToDatabase } from './db';

const main = async () => {
  try {
    await connectToDatabase();
    console.log('Database connection OK');
    console.log(`DB: ${config.db.dialect}://${config.db.host}:${config.db.port}/${config.db.database}`);
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exitCode = 1;
  }
};

void main();