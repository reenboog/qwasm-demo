import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton } from '@mui/material';
import Cancel from '@mui/icons-material/Cancel';
import Confirm from '@mui/icons-material/CheckCircle';

const CreateDir = ({ onCancel, onConfirm }) => {
	const [dirName, setDirName] = useState('');
	const dirNameInputRef = useRef(null);
	const [error, setError] = useState(null);
	const wrapperRef = useRef(null);

	const handleDirNameChange = (e) => {
		setDirName(e.target.value);

		if (e.target.value) {
			setError(null);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			if (dirName) {
				onConfirm(dirName);
			} else {
				setError(`Can't be empty.`);
			}
		}

		if (event.key === 'Escape') {
			onCancel();
		}
	};

	const handleClickOutside = (event) => {
		if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
			onCancel();
		}
	};

	useEffect(() => {
		if (dirNameInputRef.current) {
			dirNameInputRef.current.focus();
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<Box ref={wrapperRef} sx={{ display: 'flex', alignItems: 'center', height: '40px', }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '-26px' }}>
				<TextField
					inputRef={dirNameInputRef}
					label={error ?? "Name"}
					variant="standard"
					value={dirName}
					onChange={handleDirNameChange}
					size="small"
					margin="none"
					sx={{ marginTop: '0px', width: '300px' }}
					onKeyDown={handleKeyDown}
					error={!!error}
				/>
			</Box>
			<Box sx={{ alignItems: 'center', marginRight: '-8px' }}>
				<IconButton onClick={onCancel} sx={{ paddingLeft: '8px' }}>
					<Cancel />
				</IconButton>
			</Box>
			<IconButton onClick={() => onConfirm(dirName)}>
				<Confirm sx={{ color: '#2196F3' }} />
			</IconButton>
		</Box>
	);
};

export default CreateDir;