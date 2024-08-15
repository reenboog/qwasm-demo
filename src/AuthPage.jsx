import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, FormGroup, FormControlLabel, Checkbox, IconButton } from '@mui/material';
import FingerprintIcon from '@mui/icons-material/Fingerprint';
import { validateEmail } from './utils';

const AuthPage = ({ onSignupClick, onLoginClick, onAuthPasskey }) => {
	const [isSigningUp, setIsSigningUp] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [pin, setPin] = useState('');
	const [rememberMe, setRememberMe] = useState(true);
	const [emailError, setEmailError] = useState('');
	const [passwordError, setPasswordError] = useState('');

	const handleSignup = () => {
		let valid = true;
		if (!email) {
			setEmailError(`Can't be empty`);
			valid = false;
		} else {
			if (!validateEmail(email)) {
				setEmailError('A valid email is required');
				valid = false;
			}
		}

		if (!password) {
			setPasswordError(`Can't be empty`);
			valid = false;
		}
		if (valid) {
			onSignupClick(email, password, pin, rememberMe);
		}
	};

	const handleLogin = () => {
		let valid = true;
		if (!email) {
			setEmailError(`Can't be empty`);
			valid = false;
		} else {
			if (!validateEmail(email)) {
				setEmailError('A valid email is required');
				valid = false;
			}
		}
		if (!password) {
			setPasswordError(`Can't be empty`);
			valid = false;
		}
		if (valid) {
			onLoginClick(email, password, rememberMe);
		}
	};

	const handleEmailChange = (e) => {
		setEmail(e.target.value);
		if (e.target.value) {
			setEmailError('');
		}
	};

	const handlePasswordChange = (e) => {
		setPassword(e.target.value);
		if (e.target.value) {
			setPasswordError('');
		}
	};

	return (
		<Container
			sx={{
				mt: '-50px',
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				minHeight: '100vh',
			}}
		>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4, width: '300px', margin: 'auto' }}>
				<Typography variant="h5" component="h1">
					{isSigningUp ? 'Sign Up' : 'Login'}
				</Typography>
				<TextField
					label="Email"
					type="email"
					variant="outlined"
					value={email}
					onChange={handleEmailChange}
					required
					fullWidth
					error={!!emailError}
					helperText={emailError}
				/>
				<TextField
					label="Password"
					type="password"
					variant="outlined"
					value={password}
					onChange={handlePasswordChange}
					required
					fullWidth
					error={!!passwordError}
					helperText={passwordError}
				/>
				{isSigningUp && (
					<TextField
						label="Pin"
						type="text"
						variant="outlined"
						value={pin}
						onChange={(e) => setPin(e.target.value)}
						fullWidth
					/>
				)}
				{isSigningUp ? (
					<Box>
						<Button variant="contained" color="primary" onClick={handleSignup} fullWidth>
							Sign Up
						</Button>
						<Button variant="text" onClick={() => setIsSigningUp(false)} sx={{ mt: '26px' }}>
							Already have an account? Login
						</Button>
					</Box>
				) : (
					<Box>
						<Box display="flex" alignItems="center" gap={0} mb={'16px'}>
							<Button
								variant="contained"
								color="primary"
								onClick={handleLogin}
								sx={{ flexGrow: 1, marginLeft: '-12px', marginRight: '-12px' }}
							>
								Login
							</Button>
							<IconButton
								color="primary"
								sx={{ width: 30, height: 30, marginRight: '-16px', marginLeft: '20px' }}
								onClick={() => { onAuthPasskey(rememberMe) }}>
								<FingerprintIcon sx={{ color: '#586069' }}/>
							</IconButton>
						</Box>
						<Button
							variant="text"
							onClick={() => setIsSigningUp(true)}
							fullWidth
							sx={{ mt: '10px' }}
						>
							Don't have an account? Sign Up
						</Button>
					</Box>
				)}
				<FormGroup>
					<FormControlLabel
						control={
							<Checkbox
								checked={rememberMe}
								onChange={(e) => setRememberMe(e.target.checked)}
							/>
						}
						label="Remember me"
					/>
				</FormGroup>
			</Box>
		</Container>
	);
};

export default AuthPage;
