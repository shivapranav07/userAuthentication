const express = require("express");
const router = express.Router();
const zod = require("zod");
const { User } = require("../db");
const { JWT_SECRET } = require("../config");
const jwt = require("jsonwebtoken");



 
 
 // Store active users and their timeouts
const activeUsers = {};

// Function to perform logout actions
const performLogout = (token) => {
  // Perform logout actions, such as destroying the session or clearing authentication token
  console.log(`User with token ${token} logged out due to inactivity`);
  delete activeUsers[token];
};

// Middleware to track user's last activity and logout if inactive for 1 minute
router.use((req, res, next) => {
  const token = req.headers.authorization;

  // Record user's last activity
  activeUsers[token] = Date.now();

  next();
});

// Global timer to check for user inactivity and perform logout actions
setInterval(() => {
  const currentTime = Date.now();
  for (const token in activeUsers) {
    const lastActivityTime = activeUsers[token];
    // Define your inactivity threshold (e.g., 1 minute in milliseconds)
    const inactivityThreshold = 60000; // 1 minute in milliseconds
    if (currentTime - lastActivityTime > inactivityThreshold) {
      performLogout(token);
    }
  }
}, 60000); // Check every 10 seconds





// zod validation for signup
const signupBody = zod.object({
  username: zod.string(),
  password: zod.string(),
  firstName: zod.string(),
  lastName: zod.string(),
});

router.post("/signup", async function(req, res) {
  const { success } = signupBody.safeParse(req.body);

  if (!success) {
    return res.status(411).json({
      message: "Email already taken/incorrect inputs"
    });
  }

  const existingUser = await User.findOne({
    username: req.body.username
  });

  if (existingUser) {
    return res.status(411).json({
      message: "Email already taken"
    });
  }

  const user = await User.create({
    username: req.body.username,
    password: req.body.password,
    firstName: req.body.firstName,
    lastName: req.body.lastName,
  });

  const userId = user._id;
  
   

  const token = jwt.sign({
    userId
  }, JWT_SECRET);

  res.json({
    message: "User created successfully",
    token: token
  });
});

const signinBody = zod.object({
  username: zod.string(),
  password: zod.string()
});

router.post("/signin", async function(req, res) {
  const { success } = signinBody.safeParse(req.body);
  if (!success) {
    return res.status(411).json({
      message: "incorrect inputs"
    });
  }

  const user = await User.findOne({
    username: req.body.username,
    password: req.body.password
  });
  if (user) {
    const token = jwt.sign({
      userid: user._id
    }, JWT_SECRET);
    res.json({
      token: token
    });
    return;
  }

  res.status(411).json({
    message: "Error while logging in"
  });
});


router.post('/logout', (req, res) => {
  req.session.destroy();
  res.json({ message: 'Logout successful' });
});



router.get('/check_login', (req, res) => {
  const token = req.headers.authorization;
  if (token) {
      jwt.verify(token, JWT_SECRET, (err, decoded) => {
          if (err) {
              // Invalid token or expired
              return res.status(401).json({ logged_in: false });
          } else {
              // Token is valid
              return res.json({ logged_in: true });
          }
      });
  } else {
      // No token provided
      res.status(401).json({ logged_in: false });
  }
});

module.exports = router;
