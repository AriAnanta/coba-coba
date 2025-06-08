import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  Avatar,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Card,
  CardContent,
  InputAdornment,
  IconButton,
  Chip,
  Stack,
  Fade,
  Grow,
} from "@mui/material";
import {
  Person as PersonIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  VpnKey as VpnKeyIcon,
} from "@mui/icons-material";
import { toast } from "react-toastify";
import {
  GET_CURRENT_USER,
  UPDATE_PROFILE,
  CHANGE_PASSWORD,
} from "../../graphql/userService";

// Tab panel component
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const Profile = () => {
  const [tabValue, setTabValue] = useState(0);
  const [editMode, setEditMode] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState({
    fullName: "",
    email: "",
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Password visibility state
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Query for current user
  const {
    loading: userLoading,
    error: userError,
    data: userData,
    refetch: refetchUser,
  } = useQuery(GET_CURRENT_USER, {
    fetchPolicy: "cache-and-network",
    onCompleted: (data) => {
      if (data && data.currentUser) {
        setProfileData({
          fullName: data.currentUser.fullName || "",
          email: data.currentUser.email || "",
        });
      }
    },
  });

  // Mutation for updating profile
  const [updateProfile, { loading: updateProfileLoading }] = useMutation(
    UPDATE_PROFILE,
    {
      onCompleted: () => {
        toast.success("Profile updated successfully");
        setEditMode(false);
        refetchUser();
      },
      onError: (error) => {
        toast.error(`Failed to update profile: ${error.message}`);
      },
    }
  );

  // Mutation for changing password
  const [changePassword, { loading: changePasswordLoading }] = useMutation(
    CHANGE_PASSWORD,
    {
      onCompleted: () => {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      },
      onError: (error) => {
        toast.error(`Failed to change password: ${error.message}`);
      },
    }
  );

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Handle profile form input changes
  const handleProfileInputChange = (e) => {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  };

  // Handle password form input changes
  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value,
    });
  };

  // Toggle edit mode
  const handleToggleEditMode = () => {
    if (editMode) {
      // Reset form data if canceling edit
      if (userData && userData.currentUser) {
        setProfileData({
          fullName: userData.currentUser.fullName || "",
          email: userData.currentUser.email || "",
        });
      }
    }
    setEditMode(!editMode);
  };

  // Handle update profile
  const handleUpdateProfile = () => {
    updateProfile({
      variables: {
        id: userData.currentUser.id,
        fullName: profileData.fullName || null,
        email: profileData.email || null,
      },
    });
  };

  // Handle change password
  const handleChangePassword = () => {
    // Validate password match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    changePassword({
      variables: {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      },
    });
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userData || !userData.currentUser) return "?";

    const fullName = userData.currentUser.fullName || "";
    if (!fullName) return userData.currentUser.username.charAt(0).toUpperCase();

    const nameParts = fullName.split(" ");
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(
        0
      )}`.toUpperCase();
    } else if (fullName) {
      return fullName.charAt(0).toUpperCase();
    }
    return "?";
  };

  // Get user full name
  const getUserFullName = () => {
    if (!userData || !userData.currentUser) return "User";

    const fullName = userData.currentUser.fullName || "";
    if (!fullName) return userData.currentUser.username;
    return fullName;
  };

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: 1200,
        mx: "auto",
        p: { xs: 2, sm: 3 },
        overflow: "hidden",
      }}
    >
      {/* Loading indicator */}
      {userLoading && !userData && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress size={60} thickness={4} />
        </Box>
      )}

      {/* Error message */}
      {userError && (
        <Fade in={!!userError}>
          <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
            Error loading user profile: {userError.message}
          </Alert>
        </Fade>
      )}

      {userData && userData.currentUser && (
        <Stack spacing={4}>
          {/* Profile header */}
          <Grow in timeout={600}>
            <Paper
              sx={{
                p: { xs: 3, sm: 4 },
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                position: "relative",
                overflow: "hidden",
                width: "100%",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(255,255,255,0.1)",
                  backdropFilter: "blur(10px)",
                },
              }}
            >
              <Grid
                container
                spacing={3}
                alignItems="center"
                sx={{ position: "relative", zIndex: 1 }}
              >
                <Grid item>
                  <Avatar
                    sx={{
                      width: { xs: 80, sm: 100 },
                      height: { xs: 80, sm: 100 },
                      bgcolor: "rgba(255,255,255,0.2)",
                      fontSize: { xs: "2rem", sm: "2.5rem" },
                      fontWeight: 600,
                      border: "4px solid rgba(255,255,255,0.3)",
                      boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
                    }}
                  >
                    {getUserInitials()}
                  </Avatar>
                </Grid>
                <Grid item xs>
                  <Typography
                    variant="h4"
                    component="h1"
                    sx={{
                      fontWeight: 700,
                      mb: 1,
                      fontSize: { xs: "1.75rem", sm: "2.125rem" },
                    }}
                  >
                    {getUserFullName()}
                  </Typography>
                  <Typography variant="h6" sx={{ opacity: 0.9, mb: 2 }}>
                    {userData.currentUser.email}
                  </Typography>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
                    <Chip
                      label={userData.currentUser.role.toUpperCase()}
                      sx={{
                        bgcolor: "rgba(255,255,255,0.2)",
                        color: "white",
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 2 },
                      }}
                    />
                    <Chip
                      label={
                        userData.currentUser.status === "ACTIVE"
                          ? "ACTIVE"
                          : "INACTIVE"
                      }
                      sx={{
                        bgcolor:
                          userData.currentUser.status === "ACTIVE"
                            ? "rgba(34, 197, 94, 0.8)"
                            : "rgba(239, 68, 68, 0.8)",
                        color: "white",
                        fontWeight: 600,
                        "& .MuiChip-label": { px: 2 },
                      }}
                    />
                  </Stack>
                </Grid>
                <Grid item xs={12} sm="auto">
                  <Button
                    variant={editMode ? "outlined" : "contained"}
                    size="large"
                    startIcon={editMode ? <CancelIcon /> : <EditIcon />}
                    onClick={handleToggleEditMode}
                    sx={{
                      bgcolor: editMode
                        ? "transparent"
                        : "rgba(255,255,255,0.2)",
                      color: "white",
                      borderColor: "rgba(255,255,255,0.5)",
                      "&:hover": {
                        bgcolor: editMode
                          ? "rgba(255,255,255,0.1)"
                          : "rgba(255,255,255,0.3)",
                      },
                      px: 3,
                      py: 1.5,
                      width: { xs: "100%", sm: "auto" },
                    }}
                  >
                    {editMode ? "Cancel" : "Edit Profile"}
                  </Button>
                </Grid>
              </Grid>
            </Paper>
          </Grow>

          {/* Profile tabs */}
          <Grow in timeout={800}>
            <Card sx={{ overflow: "visible", width: "100%" }}>
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: "divider",
                  px: 3,
                  pt: 2,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  aria-label="profile tabs"
                  sx={{
                    "& .MuiTab-root": {
                      minHeight: 64,
                      fontWeight: 500,
                      fontSize: "1rem",
                    },
                    "& .MuiTabs-indicator": {
                      height: 3,
                      borderRadius: 2,
                    },
                  }}
                >
                  <Tab
                    label="Profile Information"
                    icon={<PersonIcon />}
                    iconPosition="start"
                    sx={{ mr: 2 }}
                  />
                  <Tab
                    label="Security Settings"
                    icon={<VpnKeyIcon />}
                    iconPosition="start"
                  />
                </Tabs>
              </Box>

              <TabPanel value={tabValue} index={0}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  >
                    Personal Information
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Full Name"
                        name="fullName"
                        value={profileData.fullName}
                        onChange={handleProfileInputChange}
                        disabled={!editMode}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            "&.Mui-disabled": {
                              backgroundColor: "grey.50",
                            },
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Email Address"
                        name="email"
                        type="email"
                        value={profileData.email}
                        onChange={handleProfileInputChange}
                        disabled={!editMode}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "grey.50",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Role"
                        name="role"
                        value={userData.currentUser.role.toUpperCase()}
                        disabled
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <BadgeIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "grey.50",
                          },
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Account Status"
                        name="status"
                        value={
                          userData.currentUser.status === "ACTIVE"
                            ? "Active"
                            : "Inactive"
                        }
                        disabled
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SecurityIcon color="action" />
                            </InputAdornment>
                          ),
                        }}
                        sx={{
                          "& .MuiOutlinedInput-root": {
                            backgroundColor: "grey.50",
                          },
                        }}
                      />
                    </Grid>
                    {editMode && (
                      <Grid item xs={12}>
                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                          <Button
                            variant="contained"
                            size="large"
                            startIcon={<SaveIcon />}
                            onClick={handleUpdateProfile}
                            disabled={updateProfileLoading}
                            sx={{ px: 4 }}
                          >
                            {updateProfileLoading ? (
                              <CircularProgress size={20} color="inherit" />
                            ) : (
                              "Save Changes"
                            )}
                          </Button>
                        </Box>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
              </TabPanel>

              <TabPanel value={tabValue} index={1}>
                <CardContent sx={{ p: 4 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 3,
                      color: "text.primary",
                      fontWeight: 600,
                    }}
                  >
                    Change Password
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Current Password"
                        name="currentPassword"
                        type={showCurrentPassword ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={handlePasswordInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowCurrentPassword(!showCurrentPassword)
                                }
                                edge="end"
                              >
                                {showCurrentPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="New Password"
                        name="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={handlePasswordInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowNewPassword(!showNewPassword)
                                }
                                edge="end"
                              >
                                {showNewPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Confirm New Password"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordInputChange}
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <VpnKeyIcon color="action" />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton
                                onClick={() =>
                                  setShowConfirmPassword(!showConfirmPassword)
                                }
                                edge="end"
                              >
                                {showConfirmPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )}
                              </IconButton>
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <Button
                        variant="contained"
                        size="large"
                        startIcon={<SaveIcon />}
                        onClick={handleChangePassword}
                        disabled={changePasswordLoading}
                        sx={{ px: 4 }}
                      >
                        {changePasswordLoading ? (
                          <CircularProgress size={20} color="inherit" />
                        ) : (
                          "Change Password"
                        )}
                      </Button>
                    </Grid>
                  </Grid>
                </CardContent>
              </TabPanel>
            </Card>
          </Grow>
        </Stack>
      )}
    </Box>
  );
};

export default Profile;
