
import React, { useState } from 'react';
import { Box, Button } from '@mui/material';
import { base64ToUint8Array, bufferToBase64, bufferToString } from './utils';

const Settings = ({ onRegisterPasskey, onAuthPasskey }) => {
	return (
		<Box display="flex" justifyContent="center" alignItems="center" height="100vh" sx={{ mt: -20,  }}>
			<Button variant="contained" color="primary" onClick={onRegisterPasskey} sx={{ mr: 2 }}>
				Register
			</Button>
			<Button variant="text" onClick={onAuthPasskey}>
				Authenticate
			</Button>
		</Box>
	);
}

export default Settings;