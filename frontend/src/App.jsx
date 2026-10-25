import React, { useState, useEffect } from 'react';
import { Plus, Trash2, CheckCircle2, ListTodo, Search, Filter } from 'lucide-react';

const API_BASE = '/api/todos';

export default function App() {
  const [todos, setTodos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Form state
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('General');
  const [priority, setPriority] = useState('medium');

  // Filter & Search state
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch todos from Express backend API
  const fetchTodos = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (selectedCategory !== 'all') params.append('category', selectedCategory);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await fetch(`${API_BASE}?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to fetch tasks');
      const data = await res.json();
      setTodos(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodos();
  }, [statusFilter, selectedCategory, searchQuery]);

  // Create Todo
  const handleAddTodo = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      const res = await fetch(API_BASE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, category, priority })
      });
      if (!res.ok) throw new Error('Failed to add task');
      setTitle('');
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Toggle Todo Completion
  const handleToggleTodo = async (todo) => {
    try {
      const res = await fetch(`${API_BASE}/${todo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !todo.completed })
      });
      if (!res.ok) throw new Error('Failed to update task');
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Delete Single Todo
  const handleDeleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to delete task');
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  // Clear Completed
  const handleClearCompleted = async () => {
    try {
      const res = await fetch(`${API_BASE}/completed/clear`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error('Failed to clear completed tasks');
      fetchTodos();
    } catch (err) {
      setError(err.message);
    }
  };

  const activeCount = todos.filter(t => !t.completed).length;
  const categories = ['all', ...new Set(todos.map(t => t.category))];

  return (
    <div className="app-container">
      <header className="header">
        <h1><ListTodo size={32} color="#4f46e5" /> TaskFlow App</h1>
        <p>A clean, efficient full-stack task management application</p>
      </header>

      {/* New Todo Form */}
      <form className="form-card" onSubmit={handleAddTodo}>
        <div className="form-row">
          <input
            type="text"
            className="input-title"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={!title.trim()}>
            <Plus size={18} /> Add Task
          </button>
        </div>
        <div className="form-row">
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="General">General</option>
            <option value="Work">Work</option>
            <option value="Personal">Personal</option>
            <option value="Shopping">Shopping</option>
          </select>

          <select value={priority} onChange={(e) => setPriority(e.target.value)}>
            <option value="low">Low Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="high">High Priority</option>
          </select>
        </div>
      </form>

      {/* Filters and Search Bar */}
      <div className="filters-bar">
        <div className="filter-tabs">
          <button
            className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-tab ${statusFilter === 'active' ? 'active' : ''}`}
            onClick={() => setStatusFilter('active')}
          >
            Active
          </button>
          <button
            className={`filter-tab ${statusFilter === 'completed' ? 'active' : ''}`}
            onClick={() => setStatusFilter('completed')}
          >
            Completed
          </button>
        </div>

        <div className="search-category-group">
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '160px' }}
          />
        </div>
      </div>

      {error && <div style={{ color: 'var(--danger)', marginBottom: '16px' }}>Error: {error}</div>}

      {/* Todo List */}
      {loading ? (
        <div className="empty-state">Loading tasks...</div>
      ) : todos.length === 0 ? (
        <div className="empty-state">No tasks found. Add a new task above!</div>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
              <div className="todo-left">
                <input
                  type="checkbox"
                  className="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo)}
                />
                <div className="todo-content">
                  <span className="todo-title">{todo.title}</span>
                  <div className="todo-meta">
                    <span className="badge badge-category">{todo.category}</span>
                    <span className={`badge priority-${todo.priority}`}>{todo.priority}</span>
                  </div>
                </div>
              </div>
              <div className="todo-actions">
                <button className="btn-icon" onClick={() => handleDeleteTodo(todo.id)} title="Delete Task">
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Footer Summary */}
      <div className="footer-summary">
        <span>{activeCount} {activeCount === 1 ? 'item' : 'items'} left</span>
        {todos.some(t => t.completed) && (
          <button className="btn-clear" onClick={handleClearCompleted}>
            Clear Completed
          </button>
        )}
      </div>
    </div>
  );
}
