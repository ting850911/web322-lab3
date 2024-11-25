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
app.set('view engine', 'pug');

// Middleware to add timestamp to every render
app.use((req, res, next) => {
  res.locals.timestamp = Date.now();
  next();
});

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
  res.render('home', { currentPage: '/' });
});

app.get('/about', (req, res) => {
  res.render('about', { currentPage: '/about' });
});

app.get('/solutions/projects', (req, res) => {
  const sector = req.query.sector;
  
  if (sector) {
    projectData
      .getProjectsBySector(sector)
      .then((projects) => res.render('projects', { 
        projects, 
        currentPage: '/solutions/projects',
        selectedSector: sector,
        sectors: res.locals.sectors 
      }))
      .catch((err) => res.status(404).render('404', { 
        currentPage: '',
        sectors: res.locals.sectors 
      }));
  } else {
    projectData
      .getAllProjects()
      .then((projects) => res.render('projects', { 
        projects, 
        currentPage: '/solutions/projects',
        sectors: res.locals.sectors 
      }))
      .catch((err) => res.status(404).render('404', { 
        currentPage: '',
        sectors: res.locals.sectors 
      }));
  }
});

app.get('/solutions/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  projectData
    .getProjectById(projectId)
    .then((project) => res.render('projectDetails', { project, currentPage: '/solutions/projects' }))
    .catch((err) => res.status(404).render('404', { currentPage: '' }));
});

app.get('/solutions/addProject', (req, res) => {
  projectData
    .getAllSectors()
    .then((sectors) => {
      res.render('addProject', {
        sectors: sectors,
        currentPage: '/solutions/addProject',
      });
    })
    .catch((err) => {
      res.render('500', {
        message: `An error occurred: ${err}`,
        currentPage: '',
      });
    });
});

app.post('/solutions/addProject', (req, res) => {
  projectData
    .addProject(req.body)
    .then(() => {
      res.redirect('/solutions/projects');
    })
    .catch((err) => {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
        currentPage: '',
      });
    });
});

app.get('/solutions/editProject/:id', (req, res) => {
  Promise.all([projectData.getProjectById(req.params.id), projectData.getAllSectors()])
    .then(([project, sectors]) => {
      res.render('editProject', {
        project: project,
        sectors: sectors,
        currentPage: '',
      });
    })
    .catch((err) => {
      res.status(404).render('404', {
        message: err,
        currentPage: '',
      });
    });
});

app.post('/solutions/editProject', (req, res) => {
  projectData
    .editProject(req.body.id, req.body)
    .then(() => {
      res.redirect('/solutions/projects');
    })
    .catch((err) => {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
        currentPage: '',
      });
    });
});

app.get('/solutions/deleteProject/:id', (req, res) => {
  projectData
    .deleteProject(req.params.id)
    .then(() => {
      res.redirect('/solutions/projects');
    })
    .catch((err) => {
      res.render('500', {
        message: `I'm sorry, but we have encountered the following error: ${err}`,
        currentPage: '',
      });
    });
});

// Custom 404 page
app.use((req, res) => {
  res.status(404).render('404', { currentPage: '' });
});

app.use((req, res) => {
  res.status(500).render('500', { currentPage: '' });
});

app.listen(HTTP_PORT, () => {
  console.log(`server listening on: ${HTTP_PORT}`);
});
