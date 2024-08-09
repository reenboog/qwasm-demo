import React, { useEffect, useState } from 'react';
import { Box, TableRow, TableCell } from '@mui/material';
import FileIcon from './FileIcon';
import { truncName } from './utils';

const FileTableRow = ({ item, onClick, progress, thumb }) => {
	const handleClick = () => {
		if (!progress.pending || item.is_dir()) {
			onClick(item);
		}
	};

	return (
		<TableRow
			onClick={handleClick}
			sx={{ position: 'relative', opacity: `${!progress.cached && !item.is_dir() ? 0.5 : 1}`, cursor: `${progress.pending ? 'not-allowed' : 'pointer'}` }}
		>
			<TableCell>
				<Box sx={{ display: 'flex', alignItems: 'center' }}>
					<Box className='file-icon-container' >
						{thumb ? (
							<img src={thumb} alt={item.name()} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 4 }} />
						) : (
							<FileIcon ext={item.ext()} />
						)}
					</Box>
					{truncName(item.name())}
				</Box>
			</TableCell>
			<TableCell>{new Date(Number(item.created_at())).toLocaleString()}</TableCell>
			<TableCell>{item.ext() ?? 'dir'}</TableCell>
			<TableCell style={{ display: 'table-row' }}>
				{!progress.cached && (
					<div className="progress-bar-container">
						<div className="progress-bar" style={{ width: `${progress.val}%` }}></div>
					</div>
				)}
			</TableCell>
		</TableRow>
	);
};

export default FileTableRow;
