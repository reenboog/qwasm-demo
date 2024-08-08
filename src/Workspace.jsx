
import React, { useState } from 'react';
import { Box, Container } from '@mui/material';
import FileTable from './FileTable';
import Sidebar from './Sidebar';
import Messages from './Messages';
import Settings from './Settings';

const Workspace = ({
	currentDir,
	onItemClick,
	onBackClick,
	onBreadcrumbClick,
	onAddUserClick,
	onUploadClick,
	onAddDirClick,
	onLogout,
	progress,
	dragActive,
	name
}) => {
	const [section, setSection] = useState('files');

	const renderContent = () => {
		switch (section) {
			case 'files':
				return <FileTable
					currentDir={currentDir}
					onItemClick={onItemClick}
					onBackClick={onBackClick}
					onBreadcrumbClick={onBreadcrumbClick}
					onAddUserClick={onAddUserClick}
					onUploadClick={onUploadClick}
					onAddDirClick={onAddDirClick}
					progress={progress}
					dragActive={dragActive}
				/>;
			case 'messages':
				return <Messages />;
			case 'settings':
				return <Settings />;
			default:
				return null;
		}
	};

	return (
		<Box sx={{ display: 'flex', height: '100vh' }}>
			<Sidebar onSectionChange={setSection} onLogout={onLogout} name={name} selectedSection={section} />
			<Box sx={{ flexGrow: 1, marginLeft: '80px', overflow: 'auto' }}>
				<Container sx={{ padding: '10px' }}>
					{renderContent()}
				</Container>
			</Box>
		</Box>
	)
};

export default Workspace;
