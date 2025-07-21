// src/components/Loader.tsx
import React from 'react';
import { Backdrop, Box, Typography } from '@mui/material';

interface LoaderProps {
  open: boolean;
  message?: string;
}

const Loader: React.FC<LoaderProps> = ({ open, message = "Loading..." }) => {
  return (
    <Backdrop
      open={open}
      sx={{
        zIndex: 9999,
        backdropFilter: 'blur(8px)',
        background: 'rgba(0, 0, 0, 0.8)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: 'conic-gradient(from 0deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ff6b6b)',
          padding: '4px',
          '@keyframes spin': {
            '0%': { transform: 'rotate(0deg)' },
            '100%': { transform: 'rotate(360deg)' },
          },
          animation: 'spin 1.5s linear infinite',
        }}
      >
        <Box
          sx={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
        />
      </Box>
      
      <Typography sx={{ color: 'white', fontWeight: 300 }}>
        {message}
      </Typography>
    </Backdrop>
  );
};

export default Loader;