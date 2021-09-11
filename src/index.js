const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;
  const existingUser = users.find(user => user.username = username);

  if (!existingUser) {
    return response.status(404).json({ error: "User does not exists." });
  }

  request.user = existingUser;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;
  const userAlreadyExists = users.some(user => user.username === username);

  if (userAlreadyExists) {
    return response.status(400).json({ error: "Username already exists." })
  }

  const newUser = {
    name,
    username,
    id: uuidv4(),
    todos: [],
  };

  users.push(newUser);

  return response.status(201).json(newUser);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const newTodo = {
    title,
    deadline: deadline,
    done: false,
    id: uuidv4(),
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).json(newTodo);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const updateTodo = user.todos.find(todo => todo.id === id);

  if (!updateTodo) {
    return response.status(404).json({ error: "Todo does not exist." });
  }

  updateTodo.title = title;
  updateTodo.deadline = deadline;

  return response.status(201).json(updateTodo);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const updateTodo = user.todos.find(todo => todo.id === id);

  if (!updateTodo) {
    return response.status(404).json({ error: "Todo does not exist." });
  }

  updateTodo.done = true;

  return response.status(201).json(updateTodo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const { id } = request.params;
  const deleteTodo = user.todos.find(todo => todo.id === id);

  if (!deleteTodo) {
    return response.status(404).json({ error: "Todo does not exist." });
  }

  user.todos = user.todos.filter(user => user.username !== user.username);

  return response.status(204).json(user.todos);
});

module.exports = app;