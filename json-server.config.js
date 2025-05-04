const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const SECRET_KEY = 'your-secret-key'; // Change this to a secure secret key

server.use(middlewares);
server.use(jsonServer.bodyParser);

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: 'No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to filter tasks by user ID
server.get('/tasks', verifyToken, (req, res, next) => {
  const tasks = router.db.get('tasks').value();
  const userTasks = tasks.filter(task => task.userId === req.user.id);
  res.json(userTasks);
});

// Middleware to ensure tasks are created with the correct user ID
server.post('/tasks', verifyToken, (req, res, next) => {
  req.body.userId = req.user.id;
  next();
});

// Middleware to ensure users can only update their own tasks
server.put('/tasks/:id', verifyToken, (req, res, next) => {
  const task = router.db.get('tasks').find({ id: req.params.id }).value();
  if (task && task.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to update this task' });
  }
  next();
});

// Middleware to ensure users can only delete their own tasks
server.delete('/tasks/:id', verifyToken, (req, res, next) => {
  const task = router.db.get('tasks').find({ id: req.params.id }).value();
  if (task && task.userId !== req.user.id) {
    return res.status(403).json({ message: 'Not authorized to delete this task' });
  }
  next();
});

// Custom middleware for user registration
server.post('/auth/register', (req, res) => {
  const { name, email, password } = req.body;
  
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  // Check if user already exists
  const users = router.db.get('users').value();
  const existingUser = users.find(u => u.email === email);
  
  if (existingUser) {
    return res.status(400).json({ message: 'User already exists' });
  }

  // Hash password
  const hashedPassword = bcrypt.hashSync(password, 10);
  
  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password: hashedPassword
  };

  router.db.get('users').push(newUser).write();

  // Generate token
  const token = jwt.sign({ id: newUser.id, email: newUser.email }, SECRET_KEY);
  
  res.json({
    user: { id: newUser.id, name: newUser.name, email: newUser.email },
    token
  });
});

// Custom middleware for user login
server.post('/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const users = router.db.get('users').value();
  const user = users.find(u => u.email === email);
  
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email }, SECRET_KEY);
  
  res.json({
    user: { id: user.id, name: user.name, email: user.email },
    token
  });
});

server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
}); 