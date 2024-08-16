import React, { useEffect, useState } from 'react';
import { Box, TableRow, TableCell, Stack, Typography } from '@mui/material';
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
			<TableCell sx={{ position: 'relative', height: 'auto', padding: 0 }}>
				<Stack direction="column" useFlexGap spacing="0px" sx={{ height: '100%' }}>
					<Stack direction="row" alignItems="center" sx={{ height: '100%' }}>
						<Box sx={{ width: '50%' }} display="flex" direction="row" alignItems="center">
							<Box className="file-icon-container">
								{thumb ? (
									<img src={thumb} alt={item.name()} style={{ objectFit: 'cover', borderRadius: 4 }} />
								) : (
									<FileIcon ext={item.ext()} />
								)}
							</Box>
							<Typography noWrap variant='body2'>{item.name()}</Typography>
						</Box>
						<Box sx={{ width: '30%' }}>
							{new Date(Number(item.created_at())).toLocaleString()}
						</Box>
						<Box sx={{ width: '20%' }}>
							{item.ext() ?? 'dir'}
						</Box>
					</Stack>
					{!progress.cached && (
						<Box
							sx={{
								position: 'absolute',
								left: 0,
								top: 0,
								bottom: 0,
								width: `${progress.val}%`,
								backgroundColor: '#0366d6',
								opacity: '0.1',
								pointerEvents: 'none',
							}}
						></Box>
					)}
				</Stack>
			</TableCell>
		</TableRow >
	);
};

export default FileTableRow;
