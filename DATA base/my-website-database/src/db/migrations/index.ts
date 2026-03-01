import { connectToDatabase, sequelize } from '..';
import { initModels } from '../models';

const main = async () => {
    try {
        await connectToDatabase();
        initModels(sequelize);

        // Creates missing tables/indexes based on model definitions.
        // For production-grade versioned migrations you’d normally use sequelize-cli,
        // but this is a solid “from scratch” bootstrap.
        await sequelize.sync();

        console.log('Migrations applied successfully.');
    } catch (error) {
        console.error('Migration failed:', error);
        process.exitCode = 1;
    } finally {
        await sequelize.close();
    }
};

void main();