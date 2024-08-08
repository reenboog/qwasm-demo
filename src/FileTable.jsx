import React from 'react';
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody } from '@mui/material';
import Breadcrumbs from './Breadcrumbs';
import FileTableRow from './FileTableRow';
import FileIcon from './FileIcon';

const FileTable = ({
	currentDir,
	onItemClick,
	onBackClick,
	onBreadcrumbClick,
	onAddUserClick,
	onUploadClick,
	onAddDirClick,
	progress
}) => (
	<Box>
		<Breadcrumbs
			breadcrumbs={currentDir.breadcrumbs()}
			currentDirName={currentDir.name()}
			onBreadcrumbClick={onBreadcrumbClick}
			onAddUserClick={onAddUserClick}
			onUploadClick={onUploadClick}
			onAddDirClick={onAddDirClick}
		/>
		<TableContainer>
			<Table className="file-table">
				<TableHead>
					<TableRow sx={{ backgroundColor: '#f6f8fa' }}>
						<TableCell sx={{ width: '50%' }}>Name</TableCell>
						<TableCell sx={{ width: '30%' }}>Created At</TableCell>
						<TableCell sx={{ width: '20%' }}>Type</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{currentDir.breadcrumbs().length !== 0 && (
						<TableRow key="back" onClick={onBackClick}>
							<TableCell colSpan={3}>
								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Box className='file-icon-container' ><FileIcon ext={null} /></Box>
									{'..'}
								</Box>
							</TableCell>
						</TableRow>
					)}
					{currentDir.items().map((item, index) => (
						<FileTableRow key={index} item={item} onClick={onItemClick} progress={progress[item.id()] || { val: 0, ready: true }} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
	</Box>
);

export default FileTable;
