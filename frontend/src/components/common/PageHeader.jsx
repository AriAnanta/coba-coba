import { Box, Typography, Button, Breadcrumbs, Link, Paper } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { NavigateNext as NavigateNextIcon } from '@mui/icons-material';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  action,
  actionText,
  actionIcon,
  onAction,
  actionDisabled = false,
  actionComponent,
  backButton,
  backTo,
  backText = 'Back',
  elevation = 0,
}) => {
  return (
    <Paper 
      elevation={elevation} 
      sx={{ 
        p: 3, 
        mb: 3, 
        borderRadius: 2,
        backgroundColor: elevation === 0 ? 'transparent' : 'background.paper',
      }}
    >
      {breadcrumbs.length > 0 && (
        <Breadcrumbs 
          separator={<NavigateNextIcon fontSize="small" />} 
          aria-label="breadcrumb"
          sx={{ mb: 2 }}
        >
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            return isLast ? (
              <Typography color="text.primary" key={index}>
                {crumb.label}
              </Typography>
            ) : (
              <Link 
                component={RouterLink} 
                to={crumb.path} 
                underline="hover" 
                color="inherit"
                key={index}
              >
                {crumb.label}
              </Link>
            );
          })}
        </Breadcrumbs>
      )}
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" component="h1" gutterBottom={!!subtitle}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="subtitle1" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          {backButton && (
            <Button
              variant="outlined"
              component={RouterLink}
              to={backTo}
              color="inherit"
            >
              {backText}
            </Button>
          )}
          
          {actionComponent ? (
            actionComponent
          ) : action && (
            <Button
              variant="contained"
              color="primary"
              onClick={onAction}
              startIcon={actionIcon}
              disabled={actionDisabled}
            >
              {actionText}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  );
};

export default PageHeader;