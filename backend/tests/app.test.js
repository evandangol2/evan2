const test = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const app = require('../src/app');

test('Backend API Endpoints', async (t) => {
  // Reset initial state
  await request(app).post('/api/todos/reset');

  await t.test('GET /api/todos returns empty array initially', async () => {
    const res = await request(app).get('/api/todos');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, []);
  });

  await t.test('POST /api/todos creates a new todo', async () => {
    const newTodo = { title: 'Test Task', category: 'Work', priority: 'high' };
    const res = await request(app).post('/api/todos').send(newTodo);
    assert.equal(res.status, 201);
    assert.equal(res.body.title, 'Test Task');
    assert.equal(res.body.category, 'Work');
    assert.equal(res.body.priority, 'high');
    assert.equal(res.body.completed, false);
    assert.ok(res.body.id);
  });

  await t.test('POST /api/todos rejects empty title', async () => {
    const res = await request(app).post('/api/todos').send({ title: '   ' });
    assert.equal(res.status, 400);
    assert.ok(res.body.error);
  });

  let createdId;
  await t.test('GET /api/todos lists added todo', async () => {
    const res = await request(app).get('/api/todos');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);
    createdId = res.body[0].id;
  });

  await t.test('PUT /api/todos/:id updates todo status and title', async () => {
    const res = await request(app)
      .put(`/api/todos/${createdId}`)
      .send({ completed: true, title: 'Updated Test Task' });
    assert.equal(res.status, 200);
    assert.equal(res.body.completed, true);
    assert.equal(res.body.title, 'Updated Test Task');
  });

  await t.test('GET /api/todos?status=completed filters completed todos', async () => {
    const res = await request(app).get('/api/todos?status=completed');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 1);

    const activeRes = await request(app).get('/api/todos?status=active');
    assert.equal(activeRes.status, 200);
    assert.equal(activeRes.body.length, 0);
  });

  await t.test('DELETE /api/todos/:id deletes a todo', async () => {
    const res = await request(app).delete(`/api/todos/${createdId}`);
    assert.equal(res.status, 200);
    assert.equal(res.body.id, createdId);

    const checkRes = await request(app).get('/api/todos');
    assert.equal(checkRes.body.length, 0);
  });
});
