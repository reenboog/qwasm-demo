import React from 'react';
import { Box, Button, Avatar } from '@mui/material';
import FolderIcon from '@mui/icons-material/Folder';
import ForumIcon from '@mui/icons-material/Forum';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';

function truncName(name) {
	return name ? name.slice(0, 2) : null;
}

const Sidebar = ({ name, onSectionChange, onLogout, selectedSection }) => {
	const buttonStyle = (section) => ({
		mb: '20px',
		color: selectedSection === section ? 'primary.main' : '#b0b0b0'
	});

	return (
		<Box sx={{ width: '80px', height: '100vh', backgroundColor: '#f6f8fa', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '20px 0' }}>
			<Avatar sx={{ mb: '40px' }} >{truncName(name)}</Avatar>
			<Button sx={buttonStyle('files')} onClick={() => onSectionChange('files')}>
				<FolderIcon />
			</Button>
			<Button sx={buttonStyle('messages')} onClick={() => onSectionChange('messages')}>
				<ForumIcon />
			</Button>
			<Button sx={buttonStyle('settings')} onClick={() => onSectionChange('settings')}>
				<SettingsIcon />
			</Button>
			<Box sx={{ flexGrow: 1 }} />
			<Button sx={{ mb: '40px' }} onClick={onLogout}>
				<LogoutIcon sx={{ color: '#586069' }} />
			</Button>
		</Box>
	);
};

export default Sidebar;