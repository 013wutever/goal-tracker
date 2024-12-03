// src/services/googleSheets.js

const googleSheetsService = {
  async addGoalEntry({ userEmail, title, category, priority, description, deadline, steps, reminderFrequency, status }) {
    try {
      console.log('Adding goal entry:', { userEmail, title, category, priority, description, deadline });
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addEntry',
          data: {
            userEmail,
            title,
            category,
            priority,
            description,
            deadline,
            steps: Array.isArray(steps) ? steps.filter(Boolean) : [],
            reminderFrequency,
            status
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const result = await response.json();
      console.log('Add goal result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add goal');
      }
      
      return result;
    } catch (error) {
      console.error('Error adding goal entry:', error);
      return { success: false, error: error.message };
    }
  },

  async getGoals(userEmail, timeRange) {
    try {
      console.log('Getting goals for:', userEmail);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getGoals',
          data: { 
            userEmail,
            timeRange
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Goals result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch goals');
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting goals:', error);
      return { success: false, error: error.message };
    }
  },

  async getGoalsStats(userEmail, timeFilter = 'week') {
    try {
      console.log('Getting goals stats:', userEmail, timeFilter);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'getGoalsStats',
          data: { 
            userEmail,
            timeFilter 
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Get stats result:', result);

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch stats');
      }

      return { success: true, data: result.data };
    } catch (error) {
      console.error('Error getting stats:', error);
      return { success: false, error: error.message };
    }
  },

  async updateGoal(goalId, updatedData) {
    try {
      console.log('Updating goal:', goalId);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'updateGoal',
          data: {
            goalId,
            ...updatedData
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Update goal result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to update goal');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating goal:', error);
      return { success: false, error: error.message };
    }
  },

  async deleteGoal(goalId) {
    try {
      console.log('Deleting goal:', goalId);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'deleteGoal',
          data: {
            goalId
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Delete goal result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to delete goal');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error deleting goal:', error);
      return { success: false, error: error.message };
    }
  },

  async verifyUser(email, hashedPassword) {
    try {
      console.log('Verifying user:', email);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'verifyUser',
          data: {
            email,
            hashedPassword
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Verify user result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Invalid credentials');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error verifying user:', error);
      return { success: false, error: error.message };
    }
  },

  async addUser(email, hashedPassword) {
    try {
      console.log('Adding user:', email);
      const response = await fetch('/api/sheets', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'addUser',
          data: {
            email,
            hashedPassword
          }
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Add user result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to add user');
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error adding user:', error);
      return { success: false, error: error.message };
    }
  }
};

export default googleSheetsService;
