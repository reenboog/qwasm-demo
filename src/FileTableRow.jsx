import React from 'react';
import { Box, TableRow, TableCell, LinearProgress } from '@mui/material';
import FileIcon from './FileIcon';

const truncFileName = (fileName, maxLength = 100) => {
	if (fileName.length > maxLength) {
		return fileName.substring(0, maxLength - 3) + '...';
	}
	return fileName;
};

const FileTableRow = ({ item, onClick, progress }) => {
	const handleClick = () => {
		if (progress.ready || item.is_dir()) {
			onClick(item);
		}
	};

	return (
		<TableRow
			onClick={handleClick}
			sx={{ position: 'relative', opacity: `${!progress.ready && !item.is_dir() ? 0.5 : 1}`, cursor: `${!progress.ready && !item.is_dir() ? 'not-allowed' : 'pointer'}` }}
		>
			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<Box className='file-icon-container' ><FileIcon ext={item.ext()} /></Box>
					{truncFileName(item.name())}
				</Box>
			</TableCell>
			<TableCell>{new Date(Number(item.created_at())).toLocaleString()}</TableCell>
			<TableCell>{item.ext() ?? 'dir'}</TableCell>
			<TableCell style={{ display: 'table-row' }}>
				{!progress.ready && (
					<div className="progress-bar-container">
						<div className="progress-bar" style={{ width: `${progress.val}%` }}></div>
					</div>
				)}
			</TableCell>
		</TableRow>
	);
};

export default FileTableRow;
