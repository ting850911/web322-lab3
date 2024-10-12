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
* Published URL: _____https://web322-lab3.pages.dev/__________________________
*
********************************************************************************/
const express = require('express');
const path = require('path');
const app = express();

const HTTP_PORT = process.env.PORT || 8080;

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/home.html'));
});

app.get('/about', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/about.html'));
});

app.get('/solutions/projects', (req, res) => {
  const sector = req.query.sector;
  if (sector) {
    // Replace with actual logic to fetch projects by sector
    res.json({ message: `Projects for sector: ${sector}` });
  } else {
    // Replace with actual logic to fetch all projects
    res.json({ message: 'All projects' });
  }
});

app.get('/solutions/projects/:id', (req, res) => {
  const projectId = req.params.id;
  // Replace with actual logic to fetch project by id
  const project = { id: projectId, name: `Project ${projectId}` }; // Example project data
  if (project) {
    res.json(project);
  } else {
    res.status(404).json({ error: 'Project not found' });
  }
});

// Custom 404 page
app.use((req, res) => {
  res.status(404).sendFile(path.join(__dirname, '/views/404.html'));
});

app.listen(HTTP_PORT, () => {
  console.log(`server listening on: ${HTTP_PORT}`);
});
