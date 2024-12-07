const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const userSchema = new mongoose.Schema({
  userName: { type: String, unique: true },
  password: String,
  email: String,
  loginHistory: [
    {
      dateTime: String,
      userAgent: String,
    }
  ]
});

let User;

function initialize() {
  return new Promise((resolve, reject) => {
    let db = mongoose.createConnection(process.env.MONGODB);
    db.on('error', err => {
      reject(err);
    });
    db.once('open', () => {
      User = db.model("users", userSchema);
      resolve();
    });
  });
}

function registerUser(userData) {
  return new Promise((resolve, reject) => {
    if (userData.password !== userData.password2) {
      reject("Passwords do not match");
    } else {
      bcrypt.hash(userData.password, 10)
        .then(hash => {
          userData.password = hash;
          let newUser = new User(userData);
          
          newUser.save()
            .then(() => {
              resolve();
            })
            .catch(err => {
              if (err.code === 11000) {
                reject("User Name already taken");
              } else {
                reject("There was an error creating the user: " + err);
              }
            });
        })
        .catch(err => {
          reject("There was an error encrypting the password");
        });
    }
  });
}

function checkUser(userData) {
  return new Promise((resolve, reject) => {
    User.findOne({ userName: userData.userName })
      .exec()
      .then(user => {
        if (!user) {
          reject(`Unable to find user: ${userData.userName}`);
        } else {
          bcrypt.compare(userData.password, user.password)
            .then(result => {
              if (!result) {
                reject(`Incorrect Password for user: ${userData.userName}`);
              } else {
                // ensures the most recent login is always at the front
                const date = new Date();
                const formattedDate = `${date.toLocaleDateString('fr-CA')} - ${date.toTimeString()}`;
                user.loginHistory.unshift({
                  dateTime: formattedDate,
                  userAgent: userData.userAgent
                });

                User.updateOne(
                  { userName: user.userName },
                  { $set: { loginHistory: user.loginHistory } }
                )
                  .exec()
                  .then(() => {
                    resolve(user);
                  })
                  .catch(err => {
                    reject("There was an error verifying the user: " + err);
                  });
              }
            })
            .catch(err => {
              reject("There was an error verifying the password");
            });
        }
      })
      .catch(err => {
        reject("There was an error finding the user: " + err);
      });
  });
}

module.exports = {
  initialize,
  registerUser,
  checkUser
};
