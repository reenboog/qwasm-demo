import React from 'react';
import { Box, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Stack } from '@mui/material';
import Breadcrumbs from './Breadcrumbs';
import FileTableRow from './FileTableRow';
import FileIcon from './FileIcon';
import DropToUpload from './DropToUpload';

const FileTable = ({
	currentDir,
	onItemClick,
	onBackClick,
	onBreadcrumbClick,
	onAddUserClick,
	onUploadClick,
	onAddDirClick,
	progress,
	thumbs,
	dragActive
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
					<TableRow>
						<TableCell>
							<Stack direction='row' alignItems='center' justifyContent='flex-start'>
								<Box sx={{ width: '50%' }}>Name</Box>
								<Box sx={{ width: '30%' }}>Created At</Box>
								<Box sx={{ width: '20%' }}>Type</Box>
							</Stack>
						</TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{currentDir.breadcrumbs().length !== 0 && (
						<TableRow key="back" onClick={onBackClick} sx={{ cursor: 'pointer' }}>
							<TableCell colSpan={3}>
								<Box sx={{ display: 'flex', alignItems: 'center' }}>
									<Box className='file-icon-container' ><FileIcon ext={null} /></Box>
									{'..'}
								</Box>
							</TableCell>
						</TableRow>
					)}
					{currentDir.items().map((item, index) => (
						<FileTableRow key={index} item={item} onClick={onItemClick} progress={progress[item.id()] || { val: 0, pending: false, cached: false }} thumb={thumbs[item.id()]} />
					))}
				</TableBody>
			</Table>
		</TableContainer>
		{dragActive === true && <DropToUpload />}
	</Box>
);

export default FileTable;
