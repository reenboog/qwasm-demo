import React, { useRef, useState } from 'react';
import { IconButton, Box, Typography } from '@mui/material';
import { FaChevronRight } from 'react-icons/fa';
import UploadFile from '@mui/icons-material/Upload';
import AddDir from '@mui/icons-material/CreateNewFolder';
import AddUser from '@mui/icons-material/PersonAdd';
import InviteByMail from './InviteByEmail';
import CreateDir from './CreateDir';

const Breadcrumbs = ({ breadcrumbs, currentDirName, onBreadcrumbClick, onAddUserClick, onUploadClick, handleAddDirClick }) => {
	const [showInvite, setShowInvite] = useState(false);
	const [showCreateDir, setShowCreateDir] = useState(false);
	const fileInputRef = useRef(null);

	const handleUploadFile = () => {
		fileInputRef.current.click();
	};

	return (
		<Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 1, paddingLeft: '16px', paddingTop: '8px', paddingBottom: '0px', paddingRight: '0px' }}>
			<Box sx={{ display: 'inline-flex', flexWrap: 'wrap', alignItems: 'center' }}>
				{breadcrumbs.map((breadcrumb) => (
					<Box key={breadcrumb.id()} sx={{ display: 'inline-flex', alignItems: 'center' }}>
						<Typography onClick={() => onBreadcrumbClick(breadcrumb.id())} className="breadcrumb">
							{breadcrumb.name()}
						</Typography>
						<FaChevronRight className="breadcrumb-delimiter" />
					</Box>
				))}
				<Typography variant="body1" className="breadcrumb-current-dir">
					{currentDirName}
				</Typography>
			</Box>
			<Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
				{showInvite ? (
					<InviteByMail
						onCancel={() => setShowInvite(false)}
						onConfirm={(email, pin) => {
							onAddUserClick(email, pin);
							setShowInvite(false);
						}}
					/>
				) : showCreateDir ? (<CreateDir
					onCancel={() => setShowCreateDir(false)}
					onConfirm={(name) => {
						console.log('created dir: ' + name);
						handleAddDirClick(name)
						setShowCreateDir(false);
					}}
				/>) : (
					<>
						<IconButton onClick={handleUploadFile}>
							<UploadFile />
						</IconButton>
						<input
							type="file"
							ref={fileInputRef}
							style={{ display: 'none' }}
							onChange={onUploadClick}
							multiple
						/>
						<IconButton onClick={() => setShowCreateDir(true)}>
							<AddDir className="folder-icon" />
						</IconButton>
						<IconButton onClick={() => setShowInvite(true)}>
							<AddUser sx={{ color: '#0366d6' }} />
						</IconButton>
					</>
				)}
			</Box>
		</Box>
	);
};

export default Breadcrumbs;
