const express = require('express');
const router = express.Router();
const { protect, isAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
const User = require('../models/User');
const Leave = require('../models/Leave');
const Holiday = require('../models/Holiday');
const Department = require('../models/Department');
const LeaveRequest = require('../models/LeaveRequest');

// Apply authentication and admin middleware to all routes
router.use(protect);
router.use(isAdmin);

// User management routes
router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);

// Holiday management routes
router.get('/holidays', adminController.getAllHolidays);
router.post('/holidays', adminController.createHoliday);
router.put('/holidays/:id', adminController.updateHoliday);
router.delete('/holidays/:id', adminController.deleteHoliday);

// Dashboard statistics
router.get('/dashboard', async (req, res) => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();

    // Get user role distribution
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get pending leave requests
    const pendingRequests = await LeaveRequest.countDocuments({ status: 'pending' });

    // Get unique departments count from users
    const uniqueDepartments = await User.distinct('department');
    const departments = uniqueDepartments.filter(dept => dept).length;

    // Get holidays this month
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    const holidaysThisMonth = await Holiday.countDocuments({
      date: {
        $gte: firstDayOfMonth,
        $lte: lastDayOfMonth
      }
    });

    // Format user roles data
    const formattedUserRoles = {
      employee: 0,
      manager: 0,
      admin: 0
    };

    userRoles.forEach(role => {
      formattedUserRoles[role._id] = role.count;
    });

    res.json({
      totalUsers,
      pendingRequests,
      departments,
      holidaysThisMonth,
      userRoles: formattedUserRoles
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Error fetching dashboard statistics' });
  }
});

router.get('/stats', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalLeaves = await LeaveRequest.countDocuments();
    const pendingLeaves = await LeaveRequest.countDocuments({ status: 'pending' });
    const approvedLeaves = await LeaveRequest.countDocuments({ status: 'approved' });
    const rejectedLeaves = await LeaveRequest.countDocuments({ status: 'rejected' });
    const totalHolidays = await Holiday.countDocuments();

    res.json({
      totalUsers,
      totalLeaves,
      pendingLeaves,
      approvedLeaves,
      rejectedLeaves,
      totalHolidays,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Enhanced statistics for visualizations
router.get('/stats/detailed', async (req, res) => {
  try {
    // Leave status distribution
    const leaveStatusStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Leave type distribution
    const leaveTypeStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$leaveType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Department-wise leave statistics
    const departmentStats = await LeaveRequest.aggregate([
      {
        $group: {
          _id: '$department',
          totalRequests: { $sum: 1 },
          approvedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          pendingRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          rejectedRequests: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      }
    ]);

    // Monthly leave trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyTrends = await LeaveRequest.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          approved: {
            $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
          },
          rejected: {
            $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
          }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    // User role distribution with department
    const userRoleDeptStats = await User.aggregate([
      {
        $group: {
          _id: {
            role: '$role',
            department: '$department'
          },
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      leaveStatusStats,
      leaveTypeStats,
      departmentStats,
      monthlyTrends,
      userRoleDeptStats
    });
  } catch (error) {
    console.error('Error fetching detailed stats:', error);
    res.status(500).json({ message: 'Error fetching detailed statistics' });
  }
});

// Manager-specific statistics
router.get('/manager/stats', async (req, res) => {
  try {
    const managerId = req.user._id;
    
    // Get manager's department
    const manager = await User.findById(managerId);
    if (!manager) {
      return res.status(404).json({ message: 'Manager not found' });
    }

    // Department leave statistics
    const departmentStats = await LeaveRequest.aggregate([
      {
        $match: { department: manager.department }
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
      department: manager.department 
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
          department: manager.department,
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
      department: manager.department
    });
  } catch (error) {
    console.error('Error fetching manager stats:', error);
    res.status(500).json({ message: 'Error fetching manager statistics' });
  }
});

// Employee-specific statistics
router.get('/employee/stats', async (req, res) => {
  try {
    const employeeId = req.user._id;
    
    // Employee's leave history
    const leaveHistory = await LeaveRequest.find({ employee: employeeId })
      .sort({ createdAt: -1 });

    // Leave status distribution for employee
    const leaveStatusStats = await LeaveRequest.aggregate([
      {
        $match: { employee: employeeId }
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
        $match: { employee: employeeId }
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
          employee: employeeId,
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