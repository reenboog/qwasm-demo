import React from 'react';
import { Box } from '@mui/material';

const DropToUpload = () => {
	return (
		<Box className="drop-zone-overlay">
			<Box className="drop-zone">
				<p>Drop to upload files</p>
			</Box>
		</Box>
	)
}

export default DropToUpload;