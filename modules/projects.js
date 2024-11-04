const projectData = require('../data/projectData');
const sectorData = require('../data/sectorData');

let projects = [];

function initialize() {
  return new Promise((resolve, reject) => {
    try {
      projectData.forEach((el) => {
        const sectorMatch = sectorData.find((e) => e.id === el['sector_id']);
        if (sectorMatch) {
          el['sector'] = sectorMatch.sector_name;
          projects.push(el);
        }
      });
      resolve();  // Successfully initialized
    } catch (err) {
      reject("Failed to initialize project data");
    }
  });
}

function getAllProjects() {
  return new Promise((resolve, reject) => {
    if (projects.length > 0) {
      resolve(projects);
    } else {
      reject("No projects available");
    }
  });
}

function getProjectById(projectId) {
  return new Promise((resolve, reject) => {
    const project = projects.find((el) => el.id === projectId);
    if (project) {
      resolve(project);
    } else {
      reject(`Project with ID: ${projectId} not found`);
    }
  });
}

function getProjectsBySector(sector) {
  return new Promise((resolve, reject) => {
    const sectorProjects = projects.filter((el) => el.sector.toLowerCase().includes(sector.toLowerCase()));
    if (sectorProjects.length > 0) {
      resolve(sectorProjects);
    } else {
      reject(`No projects found in sector: ${sector}`);
    }
  });
}

module.exports = { initialize, getAllProjects, getProjectById, getProjectsBySector };