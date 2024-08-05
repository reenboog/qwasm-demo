import React, { useState } from 'react';
import { Box, Container, TextField, Button, Typography } from '@mui/material';
import { LoadingButton } from '@mui/lab';

const AuthPage = ({ onSignupClick, onLoginClick }) => {
	const [isSigningUp, setIsSigningUp] = useState(false);
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [pin, setPin] = useState('');

	return (
		<Container sx={{ display: 'flex', justifyContent: 'center', minHeight: '50vh' }}>
			<Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, marginTop: 4, width: '300px', margin: 'auto' }}>
				<Typography variant="h5" component="h1">
					{isSigningUp ? 'Sign Up' : 'Login'}
				</Typography>
				<TextField
					label="Email"
					type="email"
					variant="outlined"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					fullWidth
				/>
				<TextField
					label="Password"
					type="password"
					variant="outlined"
					value={password}
					onChange={(e) => setPassword(e.target.value)}
					required
					fullWidth
				/>
				{isSigningUp ?
				<TextField
					label="Pin"
					type="text"
					variant="outlined"
					value={pin}
					onChange={(e) => setPin(e.target.value)}
					fullWidth
				/> : <></>}
				{isSigningUp ? (
					<>
						<Button variant="contained" color="primary" onClick={() => onSignupClick(email, password, pin)} fullWidth>
							Sign Up
						</Button>
						<Button variant="text" onClick={() => setIsSigningUp(false)}>
							Already have an account? Login
						</Button>
					</>
				) : (
					<>
						<Button variant="contained" color="primary" onClick={() => onLoginClick(email, password)} fullWidth>
							Login
						</Button>
						<Button variant="text" onClick={() => setIsSigningUp(true)}>
							Don't have an account? Sign Up
						</Button>
					</>
				)}
			</Box>
		</Container>
	);
};

export default AuthPage;
