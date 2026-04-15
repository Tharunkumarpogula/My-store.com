import { app } from '../backend/src/server';
import { connectToDatabase } from '../backend/src/db';

export const config = {
  runtime: 'nodejs20.x',
};

export default async function handler(req: any, res: any) {
  await connectToDatabase();
  return app(req, res);
}
