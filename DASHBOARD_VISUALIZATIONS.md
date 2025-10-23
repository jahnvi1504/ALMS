# Dashboard Visualizations & Statistics

This document describes the enhanced dashboard visualizations and statistics features added to the Online Leave Management System.

## Overview

The system now includes comprehensive visualizations and statistics for all user roles (Employee, Manager, and Admin) to provide better insights into leave management data.

## Features Added

### 1. Employee Dashboard Enhancements

#### Statistics Cards
- **Total Requests**: Shows the total number of leave requests made by the employee
- **Approved**: Number of approved leave requests
- **Pending**: Number of pending leave requests
- **Rejected**: Number of rejected leave requests

#### Visualizations
- **Leave Request Trends**: Line chart showing monthly leave request patterns over the last 12 months
- **Request Status Distribution**: Doughnut chart showing the distribution of approved, pending, and rejected requests
- **Leave Type Distribution**: Doughnut chart showing the distribution of annual, sick, and casual leave types
- **Recent Leave History**: List of the 5 most recent leave requests with status indicators

#### Leave Balance Cards
- Enhanced leave balance cards with progress bars showing remaining days
- Visual indicators for annual, sick, and casual leave types

### 2. Manager Dashboard Enhancements

#### Statistics Cards
- **Total Requests**: Total leave requests in the manager's department
- **Approved**: Number of approved requests in the department
- **Pending**: Number of pending requests in the department
- **Rejected**: Number of rejected requests in the department

#### Visualizations
- **Department Leave Trends**: Line chart showing monthly leave request trends for the department over the last 3 months
- **Request Status Distribution**: Doughnut chart showing the distribution of request statuses in the department
- **Recent Department Requests**: List of recent leave requests from department employees
- **Department Overview**: Key metrics including approval rate and pending rate

#### Pending Requests Section
- Enhanced pending requests display with employee details
- Quick review buttons for each request

### 3. Admin Dashboard Enhancements

#### Statistics Cards
- **Total Employees**: Total number of users in the system
- **Pending Requests**: Total pending requests across all departments
- **Departments**: Number of unique departments
- **Holidays This Month**: Number of holidays in the current month

#### Visualizations
- **Organization Leave Trends**: Line chart showing monthly leave request trends across the entire organization over the last 6 months
- **Overall Leave Status Distribution**: Doughnut chart showing the distribution of all leave request statuses
- **Leave Type Distribution**: Doughnut chart showing the distribution of leave types across the organization
- **Department-wise Statistics**: Bar chart comparing leave statistics across different departments

#### User Role Distribution
- Enhanced user role distribution cards with icons
- System overview section with key metrics

## Technical Implementation

### Backend API Endpoints

#### Admin Statistics
- `GET /api/admin/dashboard` - Basic dashboard statistics
- `GET /api/admin/stats/detailed` - Detailed statistics for visualizations

#### Manager Statistics
- `GET /api/leaves/manager/stats` - Manager-specific department statistics

#### Employee Statistics
- `GET /api/leaves/employee/stats` - Employee-specific statistics

### Frontend Components

#### Chart Components (`client/src/components/charts/DashboardCharts.tsx`)
- **LineChart**: For trend visualization
- **BarChart**: For comparison charts
- **DoughnutChart**: For distribution charts
- **Utility Functions**: Data formatting functions for different chart types

#### Service Layer (`client/src/services/statisticsService.ts`)
- Centralized service for fetching statistics data
- Error handling and authentication token management

### Data Aggregation

The system uses MongoDB aggregation pipelines to efficiently calculate:
- Monthly trends and patterns
- Status distributions
- Department-wise statistics
- User role distributions
- Leave type distributions

## Chart Types Used

1. **Line Charts**: For time-series data and trends
2. **Doughnut Charts**: For distribution and percentage data
3. **Bar Charts**: For comparison across categories
4. **Progress Bars**: For leave balance visualization

## Color Scheme

- **Blue**: Primary actions and total counts
- **Green**: Approved requests and positive metrics
- **Orange**: Pending requests and warnings
- **Red**: Rejected requests and negative metrics
- **Purple**: Admin-specific metrics

## Responsive Design

All visualizations are responsive and work well on:
- Desktop screens (large charts)
- Tablet screens (medium charts)
- Mobile screens (compact charts)

## Performance Considerations

- Charts are loaded asynchronously
- Data is cached to reduce API calls
- Lazy loading for better performance
- Error boundaries for graceful error handling

## Future Enhancements

Potential future improvements:
1. Export functionality for charts and reports
2. Interactive filters for date ranges
3. Real-time updates using WebSocket connections
4. Drill-down capabilities for detailed analysis
5. Custom dashboard layouts
6. Scheduled reports and notifications

## Usage

Users can access these visualizations by:
1. Logging into the system
2. Navigating to their respective dashboard
3. Viewing the statistics cards and charts
4. Interacting with the visualizations for better insights

The visualizations provide actionable insights for:
- **Employees**: Understanding their leave patterns and approval rates
- **Managers**: Monitoring department leave trends and managing workload
- **Admins**: Overseeing organizational leave patterns and system usage
