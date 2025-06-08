import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
  Collapse,
  useTheme,
  useMediaQuery,
  Chip,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  Factory as FactoryIcon,
  Schedule as ScheduleIcon,
  Settings as SettingsIcon,
  Inventory as InventoryIcon,
  Feedback as FeedbackIcon,
  People as PeopleIcon,
  Person as PersonIcon,
  Logout as LogoutIcon,
  ExpandLess,
  ExpandMore,
  Assignment as AssignmentIcon,
  Build as BuildIcon,
} from "@mui/icons-material";
import { useAuth } from "../contexts/AuthContext";

const drawerWidth = 280;

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [expandedSections, setExpandedSections] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
    handleProfileMenuClose();
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const toggleSection = (sectionName) => {
    setExpandedSections((prev) => ({
      ...prev,
      [sectionName]: !prev[sectionName],
    }));
  };

  const menuSections = [
    {
      title: "Overview",
      items: [
        {
          text: "Dashboard",
          icon: <DashboardIcon />,
          path: "/",
        },
      ],
    },
    {
      title: "User Management",
      items: [
        user?.role === "admin" && {
          text: "User Service",
          icon: <PeopleIcon />,
          children: [
            { text: "User Management", icon: <PeopleIcon />, path: "/users" },
          ],
        },
        {
          text: "My Profile",
          icon: <PersonIcon />,
          path: "/profile",
        },
      ].filter(Boolean),
    },
    {
      title: "Production",
      items: [
        {
          text: "Production Management",
          icon: <FactoryIcon />,
          children: [
            {
              text: "Production Requests",
              icon: <AssignmentIcon />,
              path: "/production-requests",
            },
            {
              text: "Production Batches",
              icon: <FactoryIcon />,
              path: "/production-batches",
            },
          ],
        },
        {
          text: "Production Planning",
          icon: <ScheduleIcon />,
          children: [
            {
              text: "Production Plans",
              icon: <ScheduleIcon />,
              path: "/production-plans",
            },
          ],
        },
      ],
    },
    {
      title: "Operations",
      items: [
        {
          text: "Machine Queue",
          icon: <SettingsIcon />,
          children: [
            { text: "Machines", icon: <BuildIcon />, path: "/machines" },
            {
              text: "Queue Management",
              icon: <SettingsIcon />,
              path: "/queue",
            },
          ],
        },
        {
          text: "Material Inventory",
          icon: <InventoryIcon />,
          children: [
            { text: "Materials", icon: <InventoryIcon />, path: "/materials" },
            { text: "Suppliers", icon: <PeopleIcon />, path: "/suppliers" },
            {
              text: "Transactions",
              icon: <AssignmentIcon />,
              path: "/transactions",
            },
          ],
        },
      ],
    },
    {
      title: "Quality & Feedback",
      items: [
        {
          text: "Production Feedback",
          icon: <FeedbackIcon />,
          children: [
            {
              text: "Feedback List",
              icon: <FeedbackIcon />,
              path: "/feedback",
            },
            {
              text: "Quality Checks",
              icon: <AssignmentIcon />,
              path: "/quality-checks",
            },
          ],
        },
      ],
    },
  ];

  const drawer = (
    <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      {/* Header */}
      <Box
        sx={{
          p: 3,
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          color: "white",
          position: "relative",
          overflow: "hidden",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
          },
        }}
      >
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Manufacturing
          </Typography>
          <Typography variant="body2" sx={{ opacity: 0.9 }}>
            On-Demand System
          </Typography>
        </Box>
      </Box>

      {/* Navigation */}
      <Box sx={{ flexGrow: 1, overflow: "auto", py: 1 }}>
        {menuSections.map((section, sectionIndex) => (
          <Box key={section.title} sx={{ mb: 2 }}>
            {/* Section Header */}
            <Box sx={{ px: 3, py: 1 }}>
              <Typography
                variant="overline"
                sx={{
                  fontSize: "0.75rem",
                  fontWeight: 600,
                  color: "text.secondary",
                  letterSpacing: "0.5px",
                }}
              >
                {section.title}
              </Typography>
            </Box>

            {/* Section Items */}
            <List sx={{ px: 2 }}>
              {section.items.map((item) => (
                <Box key={item.text}>
                  {item.children ? (
                    <>
                      <ListItem disablePadding sx={{ mb: 0.5 }}>
                        <ListItemButton
                          onClick={() => toggleSection(item.text)}
                          sx={{
                            borderRadius: 2,
                            minHeight: 48,
                            transition: "all 0.2s ease-in-out",
                            "&:hover": {
                              backgroundColor: "primary.light",
                              color: "white",
                              transform: "translateX(4px)",
                            },
                          }}
                        >
                          <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                            {item.icon}
                          </ListItemIcon>
                          <ListItemText
                            primary={item.text}
                            primaryTypographyProps={{
                              fontSize: "0.875rem",
                              fontWeight: 500,
                            }}
                          />
                          {expandedSections[item.text] ? (
                            <ExpandLess />
                          ) : (
                            <ExpandMore />
                          )}
                        </ListItemButton>
                      </ListItem>

                      <Collapse
                        in={expandedSections[item.text]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <List component="div" disablePadding sx={{ ml: 1 }}>
                          {item.children.map((child) => (
                            <ListItem
                              key={child.text}
                              disablePadding
                              sx={{ mb: 0.5 }}
                            >
                              <ListItemButton
                                onClick={() => handleNavigate(child.path)}
                                selected={location.pathname === child.path}
                                sx={{
                                  pl: 3,
                                  borderRadius: 2,
                                  minHeight: 44,
                                  transition: "all 0.2s ease-in-out",
                                  "&:hover": {
                                    backgroundColor: "primary.light",
                                    color: "white",
                                    transform: "translateX(4px)",
                                  },
                                  "&.Mui-selected": {
                                    backgroundColor: "primary.main",
                                    color: "white",
                                    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                                    "&:hover": {
                                      backgroundColor: "primary.dark",
                                    },
                                  },
                                }}
                              >
                                <ListItemIcon
                                  sx={{ color: "inherit", minWidth: 36 }}
                                >
                                  {child.icon}
                                </ListItemIcon>
                                <ListItemText
                                  primary={child.text}
                                  primaryTypographyProps={{
                                    fontSize: "0.8rem",
                                    fontWeight: 400,
                                  }}
                                />
                                {location.pathname === child.path && (
                                  <Chip
                                    size="small"
                                    sx={{
                                      height: 6,
                                      width: 6,
                                      backgroundColor: "white",
                                      borderRadius: "50%",
                                      "& .MuiChip-label": { display: "none" },
                                    }}
                                  />
                                )}
                              </ListItemButton>
                            </ListItem>
                          ))}
                        </List>
                      </Collapse>
                    </>
                  ) : (
                    <ListItem disablePadding sx={{ mb: 0.5 }}>
                      <ListItemButton
                        onClick={() => handleNavigate(item.path)}
                        selected={location.pathname === item.path}
                        sx={{
                          borderRadius: 2,
                          minHeight: 48,
                          transition: "all 0.2s ease-in-out",
                          "&:hover": {
                            backgroundColor: "primary.light",
                            color: "white",
                            transform: "translateX(4px)",
                          },
                          "&.Mui-selected": {
                            backgroundColor: "primary.main",
                            color: "white",
                            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                            "&:hover": {
                              backgroundColor: "primary.dark",
                            },
                          },
                        }}
                      >
                        <ListItemIcon sx={{ color: "inherit", minWidth: 40 }}>
                          {item.icon}
                        </ListItemIcon>
                        <ListItemText
                          primary={item.text}
                          primaryTypographyProps={{
                            fontSize: "0.875rem",
                            fontWeight: 500,
                          }}
                        />
                        {location.pathname === item.path && (
                          <Chip
                            size="small"
                            sx={{
                              height: 6,
                              width: 6,
                              backgroundColor: "white",
                              borderRadius: "50%",
                              "& .MuiChip-label": { display: "none" },
                            }}
                          />
                        )}
                      </ListItemButton>
                    </ListItem>
                  )}
                </Box>
              ))}
            </List>

            {/* Section Divider */}
            {sectionIndex < menuSections.length - 1 && (
              <Divider sx={{ mx: 2, opacity: 0.3 }} />
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        sx={{
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          ml: { lg: `${drawerWidth}px` },
          backgroundColor: "white",
          color: "text.primary",
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
          borderBottom: "1px solid",
          borderBottomColor: "divider",
        }}
      >
        <Toolbar sx={{ minHeight: "64px !important" }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { lg: "none" } }}
          >
            <MenuIcon />
          </IconButton>

          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ flexGrow: 1, fontWeight: 600 }}
          >
            On-Demand Manufacturing System
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Typography
              variant="body2"
              sx={{
                display: { xs: "none", sm: "block" },
                color: "text.secondary",
              }}
            >
              Welcome, {user?.username || "User"}
            </Typography>
            <IconButton
              onClick={handleProfileMenuOpen}
              sx={{
                p: 0,
                "&:hover": {
                  "& .MuiAvatar-root": {
                    transform: "scale(1.1)",
                  },
                },
              }}
            >
              <Avatar
                sx={{
                  bgcolor: "primary.main",
                  transition: "transform 0.2s ease-in-out",
                  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
                }}
              >
                {user?.username?.charAt(0).toUpperCase() || "U"}
              </Avatar>
            </IconButton>
          </Box>

          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            onClick={handleProfileMenuClose}
            sx={{
              "& .MuiPaper-root": {
                borderRadius: 2,
                minWidth: 180,
                boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
              },
            }}
          >
            <MenuItem onClick={() => handleNavigate("/profile")}>
              <PersonIcon sx={{ mr: 2, color: "primary.main" }} />
              Profile
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutIcon sx={{ mr: 2, color: "error.main" }} />
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box
        component="nav"
        sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            display: { xs: "block", lg: "none" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", lg: "block" },
            "& .MuiDrawer-paper": {
              boxSizing: "border-box",
              width: drawerWidth,
              border: "none",
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { lg: `calc(100% - ${drawerWidth}px)` },
          minHeight: "100vh",
          backgroundColor: "background.default",
        }}
      >
        <Toolbar />
        <Box sx={{ p: 0 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
