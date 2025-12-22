import express from 'express';
const router = express.Router();
import auth from '../middleware/auth.js';
import Category from '../models/Categories.js';

router.get('/', auth, async (req, res) => {
  try {
    let categories = await Category.find({ user: req.user.id }).sort({ name: 1 });
    
    // If no categories exist, create defaults
    if (categories.length === 0) {
      const defaults = [
        { name: 'general', color: '#6366f1', user: req.user.id },
        { name: 'design', color: '#f97316', user: req.user.id },
        { name: 'dev', color: '#10b981', user: req.user.id }
      ];
      categories = await Category.insertMany(defaults);
    }
    
    res.json(categories);
  } catch (err) {
    console.error("GET /api/categories error:", err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

// @route   POST /api/categories
// @desc    Create a new category
// @access  Private
router.post('/', auth, async (req, res) => {
  try {
    const { name, color } = req.body;
    
    if (!name || !name.trim()) {
      return res.status(400).json({ msg: "Category name is required" });
    }
    
    const newCategory = new Category({
      name: name.toLowerCase().trim(),
      color: color || '#6366f1',
      user: req.user.id
    });
    
    const category = await newCategory.save();
    res.json(category);
  } catch (err) {
    console.error("POST /api/categories error:", err.message);
    
    // Handle duplicate category error
    if (err.code === 11000) {
      return res.status(400).json({ msg: "Category already exists" });
    }
    
    res.status(500).json({ msg: "Server Error", error: err.message });
  }
});

// @route   DELETE /api/categories/:id
// @desc    Delete a category
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    console.log("DELETE request for category ID:", req.params.id);
    
    // Find the category by ID
    const category = await Category.findById(req.params.id);

    if (!category) {
      console.log("Category not found:", req.params.id);
      return res.status(404).json({ msg: 'Category not found' });
    }

    // Verify ownership
    if (category.user.toString() !== req.user.id) {
      console.log("Unauthorized delete attempt");
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await category.deleteOne();
    console.log("Category deleted successfully:", req.params.id);
    res.json({ msg: 'Category removed', id: req.params.id });
  } catch (err) {
    console.error("DELETE /api/categories/:id error:", err.message);
    res.status(500).json({ msg: 'Server Error', error: err.message });
  }
});

export default router;