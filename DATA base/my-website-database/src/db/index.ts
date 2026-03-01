import { Sequelize } from 'sequelize';
import config from '../config';

const sequelize =
  config.db.dialect === 'sqlite'
    ? new Sequelize({
        dialect: 'sqlite',
        storage: config.db.sqliteStorage,
        logging: false,
        define: {
          underscored: true,
          timestamps: true,
        },
      })
    : new Sequelize(config.db.database, config.db.username, config.db.password, {
        host: config.db.host,
        port: config.db.port,
        dialect: 'postgres',
        logging: false,
        define: {
          underscored: true,
          timestamps: true,
        },
      });

const connectToDatabase = async () => {
  await sequelize.authenticate();
};

export { sequelize, connectToDatabase };