import { Box, Typography, Button, Paper } from '@mui/material';
import { SentimentDissatisfied as SentimentDissatisfiedIcon } from '@mui/icons-material';

const EmptyState = ({
  title = 'No Data Found',
  description = 'There are no items to display at the moment.',
  icon = <SentimentDissatisfiedIcon sx={{ fontSize: 64, color: 'text.secondary', opacity: 0.6 }} />,
  action,
  actionText,
  actionIcon,
  onAction,
  height = 300,
  paper = true,
}) => {
  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        height: height,
        p: 3,
      }}
    >
      {icon}
      <Typography variant="h6" sx={{ mt: 2, fontWeight: 'medium' }}>
        {title}
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mt: 1, maxWidth: 400 }}>
        {description}
      </Typography>
      {action && (
        <Button
          variant="contained"
          color="primary"
          sx={{ mt: 3 }}
          onClick={onAction}
          startIcon={actionIcon}
        >
          {actionText}
        </Button>
      )}
    </Box>
  );

  if (paper) {
    return <Paper elevation={0} variant="outlined" sx={{ borderRadius: 2 }}>{content}</Paper>;
  }

  return content;
};

export default EmptyState;