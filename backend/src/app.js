const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// In-memory data store with initial sample tasks
let todos = [
  {
    id: '1',
    title: 'Explore the codebase and build plan',
    completed: true,
    category: 'Work',
    priority: 'high',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Create full-stack task manager app',
    completed: false,
    category: 'Personal',
    priority: 'medium',
    createdAt: new Date().toISOString()
  }
];

// Helper to generate unique string ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substring(2, 7);

// GET /api/todos - list todos
app.get('/api/todos', (req, res) => {
  const { status, category, search } = req.query;
  let result = [...todos];

  if (status === 'active') {
    result = result.filter(t => !t.completed);
  } else if (status === 'completed') {
    result = result.filter(t => t.completed);
  }

  if (category) {
    result = result.filter(t => t.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const query = search.toLowerCase();
    result = result.filter(t => t.title.toLowerCase().includes(query));
  }

  res.json(result);
});

// POST /api/todos - create todo
app.post('/api/todos', (req, res) => {
  const { title, category, priority } = req.body;

  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required and must be a non-empty string.' });
  }

  const newTodo = {
    id: generateId(),
    title: title.trim(),
    completed: false,
    category: category ? category.trim() : 'General',
    priority: ['low', 'medium', 'high'].includes(priority) ? priority : 'medium',
    createdAt: new Date().toISOString()
  };

  todos.unshift(newTodo);
  res.status(201).json(newTodo);
});

// PUT /api/todos/:id - update todo
app.put('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found.' });
  }

  const { title, completed, category, priority } = req.body;

  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title must be a non-empty string.' });
    }
    todos[index].title = title.trim();
  }

  if (completed !== undefined) {
    todos[index].completed = Boolean(completed);
  }

  if (category !== undefined) {
    todos[index].category = String(category).trim() || 'General';
  }

  if (priority !== undefined && ['low', 'medium', 'high'].includes(priority)) {
    todos[index].priority = priority;
  }

  res.json(todos[index]);
});

// DELETE /api/todos/completed/clear - clear completed todos
app.delete('/api/todos/completed/clear', (req, res) => {
  const initialCount = todos.length;
  todos = todos.filter(t => !t.completed);
  const deletedCount = initialCount - todos.length;
  res.json({ message: `Cleared ${deletedCount} completed todo(s).`, count: deletedCount });
});

// DELETE /api/todos/:id - delete single todo
app.delete('/api/todos/:id', (req, res) => {
  const { id } = req.params;
  const index = todos.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Todo not found.' });
  }

  const [deletedTodo] = todos.splice(index, 1);
  res.json(deletedTodo);
});

// Reset route for tests/demo
app.post('/api/todos/reset', (req, res) => {
  todos = [];
  res.json({ message: 'Todos reset successfully.' });
});

module.exports = app;
