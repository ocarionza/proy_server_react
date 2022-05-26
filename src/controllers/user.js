const bcrypt = require("bcrypt-nodejs");
const User = require("../models/user");
const jwt = require("../services/jwt")

function signUp(req, res) {
  const user = new User();
  const { email, password, repeatPassword } = req.body;
  user.email = email;
  /* Por default almacenamos el rol y si es un usuario activo o no */
  user.role = "admin";
  user.active = true;
  /* Si no existe una de las dos password */
  if (!password || !repeatPassword) {
    res.status(404).send({ message: "Passwords are required" });
  } else {
    if (password !== repeatPassword) {
      res.status(404).send({ message: "Passwords do not match" });
    } else {
      bcrypt.hash(password, null, null, function (err, hash) {
        /* No funciono la encriptación */
        if (err) {
          res.status(500).send({ message: "Failed to encrypt password." });
        } else {
          user.password = hash;
          user.save((err, userStored) => {
            if (err) {
              res.status(500).send({ message: "User already exists." });
            } else {
              if (!userStored) {
                res.status(404).send({ message: "Error creating user." });
              } else {
                res.status(200).send({ user: userStored });
              }
            }
          });
        }
      });
    }
  }
}

const signIn = (req, res) => {
  console.log("Correct login");
  const params = req.body;
  const email = params.email.toLowerCase();
  const password = params.password;
  User.findOne({ email }, (err, userStored) => {
    if (err) {
      res.status(500).send({ message: "Server error" });
    } else {
      if (!userStored) {
        res.status(404).send({ message: "User not found." });
      } else {
        bcrypt.compare(password, userStored.password, (err, check) => {
          if (err) {
            res.status(500).send({ message: "Server error" });
          } else if (!check) {
            res.status(404).send({ message: "Password is incorrect." });
          } else {
            if (!userStored.active) {
              res
                .status(200)
                .send({ code: 200, message: "The user has not been activated." });
            } else {
              res.status(200).send({
                accessToken: jwt.createAccessWithToken(userStored),
                refreshToken: jwt.createRefreshToken(userStored),
              });
            }
          }
        });
      }
    }
  });
};

module.exports = { signUp, signIn };
