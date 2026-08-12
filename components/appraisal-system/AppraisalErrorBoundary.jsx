'use client';

import { Component } from 'react';
import { Box, Button, Typography } from '@mui/material';

export class AppraisalErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  render() {
    if (this.state.error) {
      return (
        <Box p={4} minHeight="60vh" display="flex" flexDirection="column" alignItems="center" justifyContent="center" gap={2}>
          <Typography variant="h5" fontWeight={700}>Performance failed to load</Typography>
          <Typography color="text.secondary" textAlign="center" maxWidth={520}>
            {this.state.error?.message || 'Unexpected error in the appraisal module.'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.assign('/performance')}>
            Reload Performance
          </Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
