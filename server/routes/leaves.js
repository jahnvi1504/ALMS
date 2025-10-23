const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const LeaveRequest = require('../models/LeaveRequest');
const Holiday = require('../models/Holiday');
const User = require('../models/User');

// @route   POST /api/leaves
// @desc    Create a leave request
// @access  Private (Employee)
router.post('/', [
  auth,
  body('startDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('Start date must be in YYYY-MM-DD format'),
  body('endDate')
    .matches(/^\d{4}-\d{2}-\d{2}$/)
    .withMessage('End date must be in YYYY-MM-DD format'),
  body('leaveType').isIn(['annual', 'sick', 'casual']).withMessage('Invalid leave type'),
  body('reason').notEmpty().withMessage('Reason is required'),
  body('totalDays').isInt({ min: 1 }).withMessage('Total days must be a positive number')
], async (req, res) => {
  // Check if user is an employee
  if (req.user.role !== 'employee') {
    return res.status(403).json({ message: 'Only employees can create leave requests' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { startDate, endDate, leaveType, reason, totalDays } = req.body;
    
    // Check if dates are valid
    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return res.status(400).json({ message: 'End date must be after start date' });
    }

    // Check for holidays
    const holidays = await Holiday.find({
      date: {
        $gte: start,
        $lte: end
      }
    });

    if (holidays.length > 0) {
      return res.status(400).json({
        message: 'Leave request overlaps with holidays',
        holidays
      });
    }

    // Check leave balance
    const user = await User.findById(req.user._id);
    if (user.leaveBalance[leaveType] < totalDays) {
      return res.status(400).json({ 
        message: `Insufficient ${leaveType} leave balance. You have ${user.leaveBalance[leaveType]} days remaining.` 
      });
    }

    // Create leave request
    const leaveRequest = new LeaveRequest({
      employee: req.user._id,
      startDate,
      endDate,
      leaveType,
      reason,
      totalDays,
      department: user.department
    });

    await leaveRequest.save();

    res.json(leaveRequest);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while creating leave request' });
  }
});

// @route   GET /api/leaves
// @desc    Get all leave requests (filtered by role)
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    let leaves;
    
    if (req.user.role === 'admin') {
      // Admin can see all leaves
      leaves = await LeaveRequest.find()
        .populate('employee', 'name email')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    } else if (req.user.role === 'manager') {
      // Manager can see department leaves
      leaves = await LeaveRequest.find({ department: req.user.department })
        .populate('employee', 'name email')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    } else {
      // Employee can see their own leaves
      leaves = await LeaveRequest.find({ employee: req.user._id })
        .populate('employee', 'name email')
        .populate('manager', 'name email')
        .sort({ createdAt: -1 });
    }

    res.json(leaves);
  } catch (err) {
    console.error('Get leaves error:', err);
    res.status(500).json({ message: 'Server error while fetching leaves' });
  }
});

// @route   GET /api/leaves/department
// @desc    Get all leave requests for a department
// @access  Private (Manager)
router.get('/department', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can view department leaves' });
    }

    const leaves = await LeaveRequest.find({ department: req.user.department })
      .populate('employee', 'name email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Server error while fetching department leaves' });
  }
});

// @route   PATCH /api/leaves/:id
// @desc    Update leave request status
// @access  Private (Manager)
router.patch('/:id', [
  auth,
  body('status').isIn(['approved', 'rejected']).withMessage('Invalid status'),
  body('managerNote').optional()
], async (req, res) => {
  if (req.user.role !== 'manager') {
    return res.status(403).json({ message: 'Only managers can update leave requests' });
  }

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { status, managerNote } = req.body;
    const leaveRequest = await LeaveRequest.findById(req.params.id)
      .populate('employee', 'name email department position joiningDate');

    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Check if manager is from same department
    if (leaveRequest.department !== req.user.department) {
      return res.status(403).json({ message: 'Not authorized to update this leave request' });
    }

    // Check if leave request is already processed
    if (leaveRequest.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    // Update leave balance if approved
    if (status === 'approved') {
      const employee = await User.findById(leaveRequest.employee._id);
      if (!employee) {
        return res.status(404).json({ message: 'Employee not found' });
      }

      // Check if employee has enough leave balance
      if (employee.leaveBalance[leaveRequest.leaveType] < leaveRequest.totalDays) {
        return res.status(400).json({ 
          message: `Insufficient ${leaveRequest.leaveType} leave balance. Employee has ${employee.leaveBalance[leaveRequest.leaveType]} days remaining.` 
        });
      }

      // Update only the leave balance using findOneAndUpdate
      await User.findOneAndUpdate(
        { _id: leaveRequest.employee._id },
        { 
          $set: { 
            [`leaveBalance.${leaveRequest.leaveType}`]: employee.leaveBalance[leaveRequest.leaveType] - leaveRequest.totalDays 
          } 
        },
        { new: true }
      );
    }

    // Update leave request using findOneAndUpdate
    const updatedLeaveRequest = await LeaveRequest.findOneAndUpdate(
      { _id: req.params.id },
      { 
        $set: { 
          status,
          manager: req.user._id,
          ...(managerNote && { managerNote })
        }
      },
      { 
        new: true,
        populate: [
          { path: 'employee', select: 'name email' },
          { path: 'manager', select: 'name email' }
        ]
      }
    );

    if (!updatedLeaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    // Get all managers in the department
    const managers = await User.find({ 
      role: 'manager', 
      department: updatedLeaveRequest.department 
    }).select('_id');

    // Emit notification to employee
    const io = req.app.get('io');
    if (io) {
      // Emit leave status update event
      io.emit('leaveStatusUpdated', {
        employeeId: updatedLeaveRequest.employee._id.toString(),
        employeeName: updatedLeaveRequest.employee.name,
        department: updatedLeaveRequest.department,
        status,
        managers: managers.map(m => m._id.toString()),
        leaveRequest: {
          id: updatedLeaveRequest._id,
          status,
          startDate: updatedLeaveRequest.startDate,
          endDate: updatedLeaveRequest.endDate,
          leaveType: updatedLeaveRequest.leaveType,
          managerNote
        }
      });
    }

    res.json(updatedLeaveRequest);
  } catch (err) {
    console.error('Update leave request error:', err);
    res.status(500).json({ message: 'Server error while updating leave request' });
  }
});

// @route   GET /api/leaves/team
// @desc    Get all leave requests for manager's team
// @access  Private (Manager)
router.get('/team', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Only managers can view team leaves' });
    }

    const leaves = await LeaveRequest.find({ department: req.user.department })
      .populate('employee', 'name email')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 });
    res.json(leaves);
  } catch (err) {
    console.error('Get team leaves error:', err);
    res.status(500).json({ message: 'Server error while fetching team leaves' });
  }
});

// Get leaves for logged-in user
router.get('/my-leaves', auth, async (req, res) => {
  try {
    const leaves = await LeaveRequest.find({ employee: req.user._id })
      .populate('employee', 'name email department')
      .sort({ createdAt: -1 });
    
    res.json(leaves);
  } catch (error) {
    console.error('Error fetching user leaves:', error);
    res.status(500).json({ message: 'Error fetching leaves' });
  }
});

// Manager-specific statistics
router.get('/manager/stats', auth, async (req, res) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ message: 'Not authorized to view manager statistics' });
    }

    // Department leave statistics
    const departmentStats = await LeaveRequest.aggregate([
      {
        $match: { department: req.user.department }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Recent leave requests in department
    const recentRequests = await LeaveRequest.find({ 
      department: req.user.department 
    })
    .populate('employee', 'name email')
    .sort({ createdAt: -1 })
    .limit(10);

    // Monthly department trends
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const monthlyDeptTrends = await LeaveRequest.aggregate([
      {
        $match: {
          department: req.user.department,
          createdAt: { $gte: threeMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      departmentStats,
      recentRequests,
      monthlyDeptTrends,
      department: req.user.department
    });
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    res.status(500).json({ message: 'Error fetching manager statistics' });
  }
});

// Employee-specific statistics
router.get('/employee/stats', auth, async (req, res) => {
  try {
    // Employee's leave history
    const leaveHistory = await LeaveRequest.find({ employee: req.user._id })
      .sort({ createdAt: -1 });

    // Leave status distribution for employee
    const leaveStatusStats = await LeaveRequest.aggregate([
      {
        $match: { employee: req.user._id }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Leave type distribution for employee
    const leaveTypeStats = await LeaveRequest.aggregate([
      {
        $match: { employee: req.user._id }
      },
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly leave trends for employee (last 12 months)
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);
    
    const monthlyTrends = await LeaveRequest.aggregate([
      {
        $match: {
          employee: req.user._id,
          createdAt: { $gte: twelveMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({
      leaveHistory,
      leaveStatusStats,
      leaveTypeStats,
      monthlyTrends
    });
  } catch (error) {
    console.error('Error fetching employee stats:', error);
    res.status(500).json({ message: 'Error fetching employee statistics' });
  }
});

module.exports = router; 