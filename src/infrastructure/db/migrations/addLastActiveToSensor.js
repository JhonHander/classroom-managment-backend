import { DataTypes } from 'sequelize';

async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('Sensor', 'last_active', {
    type: DataTypes.DATE,
    allowNull: true
  });
}

async function down(queryInterface, Sequelize) {
  await queryInterface.removeColumn('Sensor', 'last_active');
}

export { up, down };
