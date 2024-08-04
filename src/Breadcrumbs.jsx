import React, { useRef } from 'react';
import { IconButton, TableRow, TableCell, Box, Button, Typography } from '@mui/material';
import { FaChevronRight } from 'react-icons/fa';
import UploadFile from '@mui/icons-material/Upload';
import AddBoxIcon from '@mui/icons-material/AddBox';
import CreateNewFolder from '@mui/icons-material/CreateNewFolder';

const Breadcrumbs = ({ breadcrumbs, currentDirName, onBreadcrumbClick, onUploadClick, onDirAddClick }) => {
	const fileInputRef = useRef(null);

	const handleButtonClick = () => {
		fileInputRef.current.click();
	};

	return (
		<TableRow>
			<TableCell colSpan={2}>
				<Box sx={{ display: 'inline-flex', flexWrap: 'wrap' }}>
					{breadcrumbs.map((breadcrumb, index) => (
						<Box key={breadcrumb.id()} sx={{ display: 'inline-flex', alignItems: 'center' }}>
							<Typography
								onClick={() => onBreadcrumbClick(breadcrumb.id())}
								className="breadcrumb"
							>
								{breadcrumb.name()}
							</Typography>
							<FaChevronRight className="breadcrumb-delimiter" />
						</Box>
					))}
					<Typography variant="body1" className="breadcrumb-current-dir">
						{currentDirName}
					</Typography>
				</Box>
			</TableCell>
			<TableCell>
				<Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
					<IconButton onClick={handleButtonClick} >
						<UploadFile />
					</IconButton>
					<input
						type="file"
						ref={fileInputRef}
						style={{ display: 'none' }}
						onChange={onUploadClick}
						multiple
					/>
					<IconButton onClick={onDirAddClick}>
						<CreateNewFolder className="folder-icon" />
					</IconButton>
				</Box>
			</TableCell>
		</TableRow>
	);
};

export default Breadcrumbs;