/**
 * User Model
 *
 * Defines the User entity for authentication and authorization
 */
const { DataTypes, Model } = require("sequelize");
const bcrypt = require("bcrypt");
const sequelize = require("../config/database");

class User extends Model {
  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  async verifyPassword(password) {
    return await bcrypt.compare(password, this.password_hash);
  }

  // Instance method to get user without password
  toSafeObject() {
    const {
      password_hash,
      is_active,
      created_at,
      updated_at,
      last_login,
      full_name,
      ...safeUser
    } = this.toJSON();

    console.log(
      `Debug: toSafeObject - is_active from DB: ${is_active}, type: ${typeof is_active}`
    );

    return {
      ...safeUser,
      fullName: full_name,
      status: is_active === true ? "ACTIVE" : "INACTIVE",
      createdAt: created_at,
      updatedAt: updated_at,
      lastLogin: last_login,
    };
  }
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    full_name: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM(
        "admin",
        "manager",
        "operator",
        "customer",
        "supervisor"
      ),
      defaultValue: "operator",
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "users",
    timestamps: true,
    underscored: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
    scopes: {
      withoutPassword: {
        attributes: { exclude: ["password_hash"] },
      },
      withPassword: {
        attributes: { include: ["password_hash"] },
      },
    },
    defaultScope: {
      attributes: { exclude: ["password_hash"] },
    },
  }
);

module.exports = User;
