/********************************************************************************
 * WEB322 – Assignment 03
 *
 * I declare that this assignment is my own work in accordance with Seneca's
 * Academic Integrity Policy:
 *
 * https://www.senecacollege.ca/about/policies/academic-integrity-policy.html
 *
 * Name: Nina Wang________ Student ID: 148817232_________ Date: _2024/10/09_____
 *
 * Published URL: _____https://web322-lab3.vercel.app/__________________________
 *
 ********************************************************************************/
const express = require('express');
const path = require('path');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');

const projectData = require('./modules/projects');
projectData
  .initialize()
  .then(() => {
    app.listen(8000, () => {
      console.log('Server is running on port 8000');
    });
  })
  .catch((err) => {
    console.error('Failed to initialize project data', err);
  });

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/solutions/projects', (req, res) => {
  const sector = req.query.sector;
  if (sector) {
    projectData
      .getProjectsBySector(sector)
      .then((projects) => res.json(projects))
      .catch((err) => res.status(404).sendFile(path.join(__dirname, 'views', '404.html')));
  } else {
    projectData
      .getAllProjects()
      .then((projects) => res.json(projects))
      .catch((err) => res.status(404).sendFile(path.join(__dirname, 'views', '404.html')));
  }
});

app.get('/solutions/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  projectData
    .getProjectById(projectId)
    .then((project) => res.json(project))
    .catch((err) => res.status(404).sendFile(path.join(__dirname, 'views', '404.html')));
});

// Custom 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});

app.listen(HTTP_PORT, () => {
  console.log(`server listening on: ${HTTP_PORT}`);
});
