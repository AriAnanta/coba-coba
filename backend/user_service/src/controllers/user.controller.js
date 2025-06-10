/**
 * User Controller
 * 
 * Handles user management operations
 */
const bcrypt = require('bcrypt');
const { User } = require('../models');

/**
 * Get all users
 */
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    return res.status(200).json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get user by ID
 */
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    return res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Create new user
 */
exports.createUser = async (req, res) => {
  try {
    const { username, email, password, fullName, role } = req.body;
    
    // Check if username or email already exists
    const existingUser = await User.findOne({
      where: {
        [User.sequelize.Sequelize.Op.or]: [
          { username },
          { email }
        ]
      }
    });
    
    if (existingUser) {
      return res.status(400).json({ message: 'Username or email already exists' });
    }
    
    // Hash password
    const password_hash = await User.hashPassword(password);
    
    // Create user
    const newUser = await User.create({
      username,
      email,
      password_hash,
      full_name: fullName,
      role: role || 'operator'
    });
    
    return res.status(201).json({
      message: 'User created successfully',
      user: newUser.toSafeObject()
    });
  } catch (error) {
    console.error('Error creating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Update user
 */
exports.updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const { username, email, password, fullName, role, isActive } = req.body;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if updating to an existing username or email
    if (username || email) {
      const existingUser = await User.findOne({
        where: {
          id: { [User.sequelize.Sequelize.Op.ne]: userId },
          [User.sequelize.Sequelize.Op.or]: [
            ...(username ? [{ username }] : []),
            ...(email ? [{ email }] : [])
          ]
        }
      });
      
      if (existingUser) {
        return res.status(400).json({ message: 'Username or email already exists' });
      }
    }
    
    // Update fields
    const updateData = {};
    if (username) updateData.username = username;
    if (email) updateData.email = email;
    if (fullName) updateData.full_name = fullName;
    if (role) updateData.role = role;
    if (isActive !== undefined) updateData.is_active = isActive;
    
    // Hash password if provided
    if (password) {
      updateData.password_hash = await User.hashPassword(password);
    }
    
    // Update user
    await user.update(updateData);
    
    return res.status(200).json({
      message: 'User updated successfully',
      user: user.toSafeObject()
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Delete user
 */
exports.deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Find user
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Delete user
    await user.destroy();
    
    return res.status(200).json({
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
};
