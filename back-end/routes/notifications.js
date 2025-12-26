import express from 'express';
import auth from '../middleware/auth.js';
import Notification from '../models/Notification.js';

const router = express.Router();

// @route   GET api/notifications
// @desc    Get all notifications for logged-in user
router.get('/', auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ 
      user: req.user.id 
    })
    .populate('taskId', 'text dueDate priority')
    .sort({ createdAt: -1 });
    
    res.json(notifications);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/:id/read
// @desc    Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    let notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    // Ensure user owns the notification
    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    notification.isRead = true;
    await notification.save();

    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/notifications/mark-all-read
// @desc    Mark all notifications as read
router.put('/mark-all-read', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.id, isRead: false },
      { isRead: true }
    );

    res.json({ msg: 'All notifications marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/notifications/:id
// @desc    Delete a notification
router.delete('/:id', auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: 'Notification not found' });
    }

    if (notification.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Notification.findByIdAndDelete(req.params.id);
    res.json({ msg: 'Notification removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

export default router;