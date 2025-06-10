import { createContext, useState, useContext, useEffect } from "react";

// Create Auth Context
const AuthContext = createContext();

// User service URL
const USER_SERVICE_URL = "http://localhost:5006";

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  console.log("AuthContext: Initial loading state from useState:", loading);

  // Check if user is authenticated on component mount
  useEffect(() => {
    console.log(
      "AuthContext: useEffect triggered. Current loading state:",
      loading
    );
    const token = localStorage.getItem("token");
    if (token) {
      console.log(
        "AuthContext: Token found, setting isAuthenticated to true and fetching profile."
      );
      setIsAuthenticated(true);
      fetchUserProfile(token);
    } else {
      console.log("AuthContext: No token found, setting loading to false.");
      setLoading(false); // Set loading to false immediately if no token is found
    }
  }, []);

  // Fetch user profile with token
  const fetchUserProfile = async (token) => {
    try {
      // Use GraphQL query instead of REST API
      const { apolloClient } = await import("../graphql/client");
      const { GET_CURRENT_USER } = await import("../graphql/userService"); // Corrected to use GET_CURRENT_USER

      const result = await apolloClient.query({
        query: GET_CURRENT_USER,
        context: {
          headers: {
            Authorization: `Bearer \${token}`,
          },
        },
      });

      const { data } = result;

      if (!data || !data.currentUser) {
        throw new Error("Failed to fetch user profile: No data returned");
      }

      setCurrentUser(data.currentUser);
    } catch (error) {
      console.error("Error fetching user profile:", error);
      logout();
    } finally {
      setLoading(false);
      console.log(
        "AuthContext: fetchUserProfile finished, setting loading to false."
      );
    }
  };

  // Register function
  const register = async ({ username, email, password, fullName, role }) => {
    try {
      // Use GraphQL mutation instead of REST API
      const { apolloClient } = await import("../graphql/client");
      const { REGISTER } = await import("../graphql/userService");

      const result = await apolloClient.mutate({
        mutation: REGISTER,
        variables: { username, email, password, fullName, role },
      });

      const { data } = result;

      if (!data || !data.register) {
        throw new Error("Registration failed: No data returned");
      }

      const { token, user } = data.register;

      // Store token and update state
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      return { success: false, error: error.message };
    }
  };

  // Login function
  const login = async (username, password) => {
    try {
      // Use GraphQL mutation instead of REST API
      const { apolloClient } = await import("../graphql/client");
      const { LOGIN } = await import("../graphql/userService");

      const result = await apolloClient.mutate({
        mutation: LOGIN,
        variables: { username, password },
      });

      const { data } = result;

      if (!data || !data.login) {
        throw new Error("Login failed: No data returned");
      }

      const { token, user } = data.login;

      // Store token and update state
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setCurrentUser(user);
      setIsAuthenticated(true);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, error: error.message };
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  // Context value
  const value = {
    currentUser,
    isAuthenticated,
    loading,
    register,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for using auth context
export const useAuth = () => {
  return useContext(AuthContext);
};

export default AuthContext;
