import express from 'express';
import auth from '../middleware/auth.js';
import Todo from '../models/Todo.js';

const router = express.Router();

// @route   POST api/todos
// @desc    Create a task
router.post('/', auth, async (req, res) => {
  const { text, category, dueDate, priority, description } = req.body;

  try {
    const newTodo = new Todo({
      text,
      category,
      dueDate,
      priority,
      description,
      user: req.user.id // Taken from the auth middleware token
    });

    const todo = await newTodo.save();
    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/todos
// @desc    Get all tasks for the logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const todos = await Todo.find({ user: req.user.id }).sort({ dueDate: 1 });
    res.json(todos);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/todos/:id
// @desc    Update a task (Edit, Complete, or Archive)
router.put('/:id', auth, async (req, res) => {
  const { text, category, dueDate, priority, description, completed, archived } = req.body;

  // Build updated fields object
  const todoFields = {};
  if (text) todoFields.text = text;
  if (category) todoFields.category = category;
  if (dueDate) todoFields.dueDate = dueDate;
  if (priority) todoFields.priority = priority;
  if (description !== undefined) todoFields.description = description;
  if (completed !== undefined) todoFields.completed = completed;
  if (archived !== undefined) todoFields.archived = archived;

  try {
    let todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ msg: 'Task not found' });

    // Ensure user owns the task
    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    todo = await Todo.findByIdAndUpdate(
      req.params.id,
      { $set: todoFields },
      { new: true }
    );

    res.json(todo);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/todos/:id
// @desc    Delete a task
router.delete('/:id', auth, async (req, res) => {
  try {
    const todo = await Todo.findById(req.params.id);
    if (!todo) return res.status(404).json({ msg: 'Task not found' });

    if (todo.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Todo.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;