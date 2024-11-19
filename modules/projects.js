require('dotenv').config();
require('pg');
const Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.PGDATABASE, process.env.PGUSER, process.env.PGPASSWORD, {
  host: process.env.PGHOST,
  dialect: 'postgres',
  port: 5432,
  dialectOptions: {
    ssl: { rejectUnauthorized: false },
  },
});

const Sector = sequelize.define(
  'Sector',
  {
    sector_name: Sequelize.STRING,
  },
  { timestamps: false }
);

const Project = sequelize.define(
  'Project',
  {
    title: Sequelize.STRING,
    feature_img_url: Sequelize.STRING,
    summary_short: Sequelize.TEXT,
    intro_short: Sequelize.TEXT,
    impact: Sequelize.TEXT,
    original_source_url: Sequelize.STRING,
  },
  { timestamps: false }
);

Project.belongsTo(Sector, { foreignKey: 'sector_id' });

function initialize() {
  return sequelize
    .sync()
    .then(() => Promise.resolve())
    .catch((err) => Promise.reject(`Failed to initialize: ${err.message}`));
}

function getAllProjects() {
  return Project.findAll({ attributes: ['Sector'] })
    .then((projects) => Promise.resolve(projects))
    .catch((err) => Promise.reject(`Failed to fetch projects: ${err.message}`));
}

function getProjectById(projectId) {
  return Project.findAll({
    include: [
      {
        model: Sector,
        required: true,
      },
    ],
    where: { id: projectId },
  })
    .then((projects) => {
      if (projects.length > 0) {
        return Promise.resolve(projects[0]);
      }
      return Promise.reject(`Unable to find requested project with ID: ${projectId}`);
    })
    .catch((err) => Promise.reject(`Failed to fetch project: ${err.message}`));
}

function getProjectsBySector(sector) {
  return Project.findAll({
    include: [
      {
        model: Sector,
        where: {
          sector_name: {
            [Sequelize.Op.iLike]: `%${sector}%`,
          },
        },
      },
    ],
  })
    .then((projects) => {
      if (projects.length > 0) {
        return Promise.resolve(projects);
      } else {
        return Promise.reject(`No projects found in sector: ${sector}`);
      }
    })
    .catch((err) => Promise.reject(`Failed to fetch projects: ${err.message}`));
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };