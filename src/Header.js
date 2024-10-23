import React from 'react';
import { AppBar, Toolbar, Typography, Button } from '@mui/material';

const Header = () => {
  return (
    <AppBar  sx={{ backgroundColor: '#024CAA' }} position="static">
      <Toolbar>
        <Typography variant="h6" component="div" style={{marginRight:"5%"}}>
          Diabetes Dashboard
        </Typography>
        <Button color="inherit">Display</Button>
        <Button color="inherit">Prediction</Button>
        <Button color="inherit">Other</Button>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
