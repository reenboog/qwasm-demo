import React, { useState, useEffect, useRef } from 'react';
import { Box, TextField, IconButton, FormHelperText } from '@mui/material';
import Cancel from '@mui/icons-material/Cancel';
import Confirm from '@mui/icons-material/CheckCircle';

function genPin(length = 4) {
	return Math.floor(Math.random() * Math.pow(10, length)).toString().padStart(length, '0');
}

const InviteByMail = ({ onCancel, onConfirm }) => {
	const [email, setEmail] = useState('');
	const emailInputRef = useRef(null);
	const [pin, setPin] = useState(genPin());
	const wrapperRef = useRef(null);

	const handleKeyDown = (event) => {
		if (event.key === 'Enter') {
			onConfirm(email, pin);
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
		if (emailInputRef.current) {
			emailInputRef.current.focus();
		}

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	return (
		<Box ref={wrapperRef} sx={{ display: 'flex', alignItems: 'center', height: '40px', }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', marginTop: '-26px' }}>
				<FormHelperText sx={{ alignSelf: 'flex-end', marginBottom: '-17px' }}>pin: {pin}</FormHelperText>
				<TextField
					inputRef={emailInputRef}
					label="Email"
					variant="standard"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					size="small"
					margin="none"
					sx={{ marginTop: '0px', width: '300px' }}
					onKeyDown={handleKeyDown}
				/>
			</Box>
			<Box sx={{ alignItems: 'center', marginRight: '-8px' }}>
				<IconButton onClick={onCancel} sx={{ paddingLeft: '8px' }}>
					<Cancel />
				</IconButton>
			</Box>
			<IconButton onClick={() => onConfirm(email, pin)}>
				<Confirm sx={{ color: '#2196F3' }} />
			</IconButton>
		</Box>
	);
};

export default InviteByMail;