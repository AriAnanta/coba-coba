import React from 'react';
import { Tooltip } from '@mui/material';

/**
 * DisabledTooltip Component
 * 
 * A wrapper component that properly handles tooltips for disabled elements
 * by wrapping them in a span when disabled.
 */
const DisabledTooltip = ({ 
  children, 
  title, 
  disabled = false, 
  placement = "top",
  ...otherProps 
}) => {
  if (disabled) {
    return (
      <Tooltip title={title} placement={placement} {...otherProps}>
        <span style={{ display: 'inline-block' }}>
          {children}
        </span>
      </Tooltip>
    );
  }

  return (
    <Tooltip title={title} placement={placement} {...otherProps}>
      {children}
    </Tooltip>
  );
};

export default DisabledTooltip;
