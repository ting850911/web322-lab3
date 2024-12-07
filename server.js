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
const authData = require('./modules/auth-service');
const projectData = require('./modules/projects');
const clientSessions = require('client-sessions');
const express = require('express');
const path = require('path');
const app = express();
const HTTP_PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'pug');

// Middleware to add timestamp to every render
app.use((req, res, next) => {
  res.locals.timestamp = Date.now();
  next();
});

// Set up client-sessions middleware
app.use(clientSessions({
  cookieName: "session",
  secret: "o6LjQ5EVNC28ZgK64hDELM18ScpFQr",
  duration: 2 * 60 * 1000,
  activeDuration: 1000 * 60
}));

// Middleware to make session data available to templates
app.use((req, res, next) => {
  res.locals.session = req.session;
  next();
});

// Helper middleware function to check if user is logged in
function ensureLogin(req, res, next) {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    next();
  }
}

projectData
  .initialize()
  .then(authData.initialize)
  .then(() => {
    app.listen(HTTP_PORT, () => {
      console.log(`Server is running on port ${HTTP_PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to initialize server:', err);
  });

app.get('/', (req, res) => {
  projectData.getAllProjects()
    .then((projects) => {
      const featuredProjects = projects.slice(0, 3);
      res.render('home', {
        projects: featuredProjects,
        currentPage: '/',
      });
    })
    .catch((err) => {
      res.status(404).render('404', {
        message: "Sorry, we couldn't find the project you're looking for. Please try again.",
        currentPage: '',
      });
    });
});

app.get('/about', (req, res) => {
  res.render('about', { currentPage: '/about' });
});

app.get('/solutions/projects', (req, res) => {
  const sector = req.query.sector;

  Promise.all([
    sector ? projectData.getProjectsBySector(sector) : projectData.getAllProjects(),
    projectData.getAllSectors(),
  ])
    .then(([projects, sectors]) => {
      res.render('projects', {
        projects: projects,
        sectors: sectors,
        currentPage: '/solutions/projects',
        selectedSector: sector,
      });
    })
    .catch((err) => {
      res.status(404).render('404', {
        message: "Sorry, we couldn't find the project you're looking for. Please try again.",
        currentPage: '',
        sectors: [],
      });
    });
});

app.get('/solutions/projects/:id', (req, res) => {
  const projectId = parseInt(req.params.id, 10);
  projectData
    .getProjectById(projectId)
    .then((project) => res.render('projectDetails', { project, currentPage: '/solutions/projects' }))
    .catch((err) => res.status(404).render('404', { currentPage: '' }));
});

app.get('/solutions/addProject', ensureLogin, (req, res) => {
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

app.post('/solutions/addProject', ensureLogin, (req, res) => {
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

app.get('/solutions/editProject/:id', ensureLogin, (req, res) => {
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
        message: "Sorry, we couldn't find the project you're looking for. Please try again.",
        currentPage: '',
      });
    });
});

app.post('/solutions/editProject', ensureLogin, (req, res) => {
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

app.get('/solutions/deleteProject/:id', ensureLogin, (req, res) => {
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

app.get('/login', (req, res) => {
  res.render('login', {
    errorMessage: '',
    userName: ''
  });
});

app.post('/login', (req, res) => {
  req.body.userAgent = req.get('User-Agent');
  
  authData.checkUser(req.body).then((user) => {
    req.session.user = {
      userName: user.userName,
      email: user.email,
      loginHistory: user.loginHistory
    }
    res.redirect('/solutions/projects');
  }).catch((err) => {
    res.render('login', {
      errorMessage: err,
      userName: req.body.userName
    });
  });
});

app.get('/register', (req, res) => {
  res.render('register', {
    errorMessage: '',
    successMessage: '',
    userName: ''
  });
});

app.post('/register', (req, res) => {
  authData.registerUser(req.body).then(() => {
    res.render('register', {
      errorMessage: '',
      successMessage: 'User created',
      userName: ''
    });
  }).catch((err) => {
    res.render('register', {
      errorMessage: err,
      successMessage: '',
      userName: req.body.userName
    });
  });
});

app.get('/logout', (req, res) => {
  req.session.reset();
  res.redirect('/');
});

app.get('/userHistory', ensureLogin, (req, res) => {
  res.render('userHistory');
});

app.use((req, res) => {
  res.status(404).render('404', { currentPage: '' });
});

app.use((req, res) => {
  res.status(500).render('500', { currentPage: '' });
});