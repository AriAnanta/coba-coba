/**
 * GraphQL Resolvers for User Service
 */
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Define resolvers
const resolvers = {
  // Queries
  users: async (args, context) => {
    try {
      // Check authorization (should be admin)
      if (!context.user || context.user.role !== "admin") {
        throw new Error("Not authorized");
      }

      return await User.findAll();
    } catch (error) {
      console.error("GraphQL users query error:", error);
      throw error;
    }
  },

  user: async ({ id }, context) => {
    try {
      // Check authorization (should be admin or self)
      if (
        !context.user ||
        (context.user.role !== "admin" && context.user.id != id)
      ) {
        throw new Error("Not authorized");
      }

      return await User.findByPk(id);
    } catch (error) {
      console.error("GraphQL user query error:", error);
      throw error;
    }
  },

  currentUser: async (args, context) => {
    try {
      if (!context.user) {
        throw new Error("Not authenticated");
      }

      const user = await User.findByPk(context.user.id);

      if (!user) {
        throw new Error("User not found");
      }

      return user.toSafeObject();
    } catch (error) {
      console.error("GraphQL currentUser query error:", error);
      throw error;
    }
  },

  // Mutations
  login: async ({ username, password }) => {
    try {
      // Find user
      const user = await User.scope("withPassword").findOne({
        where: { username, is_active: true },
      });

      if (!user) {
        throw new Error("Invalid credentials");
      }

      // Verify password
      const isMatch = await bcrypt.compare(password, user.password_hash);
      if (!isMatch) {
        throw new Error("Invalid credentials");
      }

      // Generate JWT token
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRATION || "24h" }
      );

      // Update last login
      await user.update({ last_login: new Date() });

      return {
        token,
        user: user.toSafeObject(),
      };
    } catch (error) {
      console.error("GraphQL login mutation error:", error);
      throw error;
    }
  },

  register: async ({ username, email, password, fullName, role }, context) => {
    try {
      // Check if role other than operator is being set (requires admin)
      if (
        role &&
        role !== "operator" &&
        (!context.user || context.user.role !== "admin")
      ) {
        throw new Error("Not authorized to set this role");
      }

      // Check if username or email already exists
      const existingUser = await User.findOne({
        where: {
          [User.sequelize.Sequelize.Op.or]: [{ username }, { email }],
        },
      });

      if (existingUser) {
        throw new Error("Username or email already exists");
      }

      // Hash password
      const password_hash = await User.hashPassword(password);

      // Create user
      const newUser = await User.create({
        username,
        email,
        password_hash,
        full_name: fullName,
        role:
          context.user && context.user.role === "admin"
            ? role || "operator"
            : "operator",
      });

      // Generate JWT token for the new user
      const token = jwt.sign(
        {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          role: newUser.role,
        },
        process.env.JWT_SECRET || "your-secret-key-here-change-in-production",
        { expiresIn: process.env.JWT_EXPIRATION || "24h" }
      );

      return {
        token,
        user: newUser.toSafeObject(),
      };
    } catch (error) {
      console.error("GraphQL register mutation error:", error);
      throw error;
    }
  },

  updateUser: async (
    { id, username, email, password, fullName, role, status },
    context
  ) => {
    try {
      // Check authorization (should be admin or self)
      if (
        !context.user ||
        (context.user.role !== "admin" && context.user.id != id)
      ) {
        throw new Error("Not authorized");
      }

      // Only admin can change roles or active status
      if ((role || status !== undefined) && context.user.role !== "admin") {
        throw new Error("Not authorized to change role or active status");
      }

      // Find user
      const user = await User.findByPk(id);

      if (!user) {
        throw new Error("User not found");
      }

      // Check if updating to an existing username or email
      if (username || email) {
        const existingUser = await User.findOne({
          where: {
            id: { [User.sequelize.Sequelize.Op.ne]: id },
            [User.sequelize.Sequelize.Op.or]: [
              ...(username ? [{ username }] : []),
              ...(email ? [{ email }] : []),
            ],
          },
        });

        if (existingUser) {
          throw new Error("Username or email already exists");
        }
      }

      // Update fields
      const updateData = {};
      if (username) updateData.username = username;
      if (email) updateData.email = email;
      if (fullName) updateData.full_name = fullName;
      if (role && context.user.role === "admin") updateData.role = role;
      if (status !== undefined && context.user.role === "admin") {
        updateData.is_active = status === "ACTIVE";
      }

      // Hash password if provided
      if (password) {
        updateData.password_hash = await User.hashPassword(password);
      }

      // Update user
      await user.update(updateData);

      return user.toSafeObject();
    } catch (error) {
      console.error("GraphQL updateUser mutation error:", error);
      throw error;
    }
  },

  verifyToken: async ({ token }) => {
    try {
      if (!token) {
        return { valid: false, message: "Token is required" };
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user data
      const user = await User.findByPk(decoded.id);

      if (!user || !user.is_active) {
        return { valid: false, message: "User not found or inactive" };
      }

      return {
        valid: true,
        user: user.toSafeObject(),
      };
    } catch (error) {
      return {
        valid: false,
        message: "Invalid token",
      };
    }
  },
};

module.exports = resolvers;
