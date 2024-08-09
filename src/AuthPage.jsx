import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography, FormGroup, FormControlLabel, Checkbox } from '@mui/material';

const AuthPage = ({ onSignupClick, onLoginClick }) => {
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
			setEmailError('Login is required.');
			valid = false;
		}
		if (!password) {
			setPasswordError('Password is required.');
			valid = false;
		}
		if (valid) {
			onSignupClick(email, password, pin, rememberMe);
		}
	};

	const handleLogin = () => {
		let valid = true;
		if (!email) {
			setEmailError('Login is required.');
			valid = false;
		}
		if (!password) {
			setPasswordError('Password is required.');
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
					label="Login"
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
					<>
						<Button variant="contained" color="primary" onClick={handleSignup} fullWidth>
							Sign Up
						</Button>
						<Button variant="text" onClick={() => setIsSigningUp(false)}>
							Already have an account? Login
						</Button>
					</>
				) : (
					<>
						<Button variant="contained" color="primary" onClick={handleLogin} fullWidth>
							Login
						</Button>
						<Button variant="text" onClick={() => setIsSigningUp(true)}>
							Don't have an account? Sign Up
						</Button>
					</>
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