import { google } from 'googleapis';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Validate environment variables
    if (!process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL || 
        !process.env.REACT_APP_GOOGLE_PRIVATE_KEY || 
        !process.env.REACT_APP_GOOGLE_SHEETS_ID) {
      throw new Error('Missing required environment variables');
    }

    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.REACT_APP_GOOGLE_SERVICE_ACCOUNT_EMAIL,
        private_key: process.env.REACT_APP_GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        project_id: "goal-tracker-app"
      },
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const { action, data } = req.body;

    console.log('API Request:', { action, data }); // Debug log

    switch (action) {
      case 'addEntry': {
        // Validate required fields
        if (!data.userEmail || !data.title || !data.category || !data.priority) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields'
          });
        }

        const timestamp = new Date().toISOString();
        const uniqueId = `GT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

        const response = await sheets.spreadsheets.values.append({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'GoalData!A2:K',
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          resource: {
            values: [[
              timestamp,
              data.userEmail,
              uniqueId,
              data.title,
              data.category,
              data.priority,
              data.description || '',
              data.deadline || '',
              JSON.stringify(data.steps || []),
              data.reminderFrequency || 'none',
              data.status || 'notStarted'
            ]]
          }
        });

        console.log('Goal added:', response.data);
        return res.status(200).json({ 
          success: true, 
          data: { id: uniqueId, timestamp }
        });
      }

      case 'getGoals': {
        console.log('Fetching goals for:', data.userEmail);

        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'GoalData!A2:K'
        });

        let goals = (response.data.values || []).map(row => ({
          timestamp: row[0],
          userEmail: row[1],
          id: row[2],
          title: row[3],
          category: row[4],
          priority: row[5],
          description: row[6],
          deadline: row[7],
          steps: JSON.parse(row[8] || '[]'),
          reminderFrequency: row[9],
          status: row[10]
        }));

        // Filter by user
        goals = goals.filter(goal => goal.userEmail === data.userEmail);

        // Apply time range filter if provided
        if (data.timeRange) {
          const startDate = new Date(data.timeRange.start);
          const endDate = new Date(data.timeRange.end);
          goals = goals.filter(goal => {
            const goalDate = new Date(goal.timestamp);
            return goalDate >= startDate && goalDate <= endDate;
          });
        }

        return res.status(200).json({
          success: true,
          data: goals
        });
      }

      case 'getGoalsStats': {
        const response = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'GoalData!A2:K'
        });

        let goals = (response.data.values || [])
          .map(row => ({
            timestamp: row[0],
            userEmail: row[1],
            id: row[2],
            title: row[3],
            category: row[4],
            priority: row[5],
            deadline: row[7],
            status: row[10]
          }))
          .filter(goal => goal.userEmail === data.userEmail);

        // Apply time filter
        const now = new Date();
        if (data.timeFilter !== 'all') {
          let cutoffDate = new Date();
          switch (data.timeFilter) {
            case 'week':
              cutoffDate.setDate(now.getDate() - 7);
              break;
            case 'month':
              cutoffDate.setMonth(now.getMonth() - 1);
              break;
            case 'year':
              cutoffDate.setFullYear(now.getFullYear() - 1);
              break;
          }
          goals = goals.filter(goal => new Date(goal.timestamp) >= cutoffDate);
        }

        // Calculate stats
        const stats = {
          totalGoals: goals.length,
          completedGoals: goals.filter(goal => goal.status === 'completed').length,
          statusDistribution: calculateStatusDistribution(goals),
          categoryBreakdown: calculateCategoryBreakdown(goals),
          priorityDistribution: calculatePriorityDistribution(goals),
          upcomingDeadlines: getUpcomingDeadlines(goals)
        };

        return res.status(200).json({
          success: true,
          data: stats
        });
      }

      case 'updateGoal': {
        const { goalId, ...updateData } = data;
        if (!goalId) {
          return res.status(400).json({
            success: false,
            error: 'Missing goal ID'
          });
        }

        // Find the row with the goal
        const findResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'GoalData!A2:K'
        });

        const rows = findResponse.data.values || [];
        const rowIndex = rows.findIndex(row => row[2] === goalId);

        if (rowIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Goal not found'
          });
        }

        // Update the row
        const range = `GoalData!A${rowIndex + 2}:K${rowIndex + 2}`;
        const currentRow = rows[rowIndex];
        const updatedRow = [
          currentRow[0], // timestamp
          currentRow[1], // userEmail
          goalId,
          updateData.title || currentRow[3],
          updateData.category || currentRow[4],
          updateData.priority || currentRow[5],
          updateData.description || currentRow[6],
          updateData.deadline || currentRow[7],
          updateData.steps ? JSON.stringify(updateData.steps) : currentRow[8],
          updateData.reminderFrequency || currentRow[9],
          updateData.status || currentRow[10]
        ];

        await sheets.spreadsheets.values.update({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range,
          valueInputOption: 'USER_ENTERED',
          resource: { values: [updatedRow] }
        });

        return res.status(200).json({ success: true });
      }

      case 'deleteGoal': {
        const { goalId } = data;
        if (!goalId) {
          return res.status(400).json({
            success: false,
            error: 'Missing goal ID'
          });
        }

        // Find the row with the goal
        const findResponse = await sheets.spreadsheets.values.get({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range: 'GoalData!A2:K'
        });

        const rows = findResponse.data.values || [];
        const rowIndex = rows.findIndex(row => row[2] === goalId);

        if (rowIndex === -1) {
          return res.status(404).json({
            success: false,
            error: 'Goal not found'
          });
        }

        // Delete the row
        const range = `GoalData!A${rowIndex + 2}:K${rowIndex + 2}`;
        await sheets.spreadsheets.values.clear({
          spreadsheetId: process.env.REACT_APP_GOOGLE_SHEETS_ID,
          range
        });

        return res.status(200).json({ success: true });
      }

      case 'verifyUser':
      case 'addUser': {
        // Handle user authentication similar to the mood tracker
        // Implement as needed based on your authentication requirements
        return res.status(200).json({ success: true });
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({
      success: false,
      error: error.message || 'Internal server error'
    });
  }
}

// Helper functions for statistics calculations
function calculateStatusDistribution(goals) {
  const total = goals.length;
  const statusCounts = goals.reduce((acc, goal) => {
    acc[goal.status] = (acc[goal.status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(statusCounts).map(([status, count]) => ({
    id: status,
    name: status,
    value: Math.round((count / total) * 100)
  }));
}

function calculateCategoryBreakdown(goals) {
  const total = goals.length;
  const categoryCounts = goals.reduce((acc, goal) => {
    acc[goal.category] = (acc[goal.category] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(categoryCounts).map(([category, count]) => ({
    id: category,
    name: category,
    value: Math.round((count / total) * 100)
  }));
}

function calculatePriorityDistribution(goals) {
  const total = goals.length;
  const priorityCounts = goals.reduce((acc, goal) => {
    acc[goal.priority] = (acc[goal.priority] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(priorityCounts).map(([priority, count]) => ({
    id: priority,
    name: priority,
    value: Math.round((count / total) * 100)
  }));
}

function getUpcomingDeadlines(goals) {
  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(now.getDate() + 30);

  return goals
    .filter(goal => {
      const deadline = new Date(goal.deadline);
      return deadline >= now && deadline <= thirtyDaysFromNow;
    })
    .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
}
