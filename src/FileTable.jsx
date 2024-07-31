import React from 'react';
import FileTableRow from './FileTableRow';
import Breadcrumbs from './Breadcrumbs';
import FileIcon from './FileIcon';

const FileTable = ({
	currentDir,
	handleItemClick,
	handleBackClick,
	handleBreadcrumbClick,
	handleUpload,
	handleFileAdd,
	handleDirAdd
}) => (
	<div className="table-container">
		<table className="file-table">
			<thead>
				<Breadcrumbs
					breadcrumbs={currentDir.breadcrumbs}
					currentDirName={currentDir.name}
					onBreadcrumbClick={handleBreadcrumbClick}
					onUploadClick={handleUpload}
					onFileAddClick={handleFileAdd}
					onDirAddClick={handleDirAdd}
				/>
				<tr>
					<th className="name-column">Name</th>
					<th className="created-at-column">Created At</th>
					<th className="type-column">Type</th>
				</tr>
			</thead>
			<tbody>
				{currentDir.breadcrumbs.length !== 0 && (
					<tr key="back" onClick={handleBackClick}>
						<td colSpan="3">
							<FileIcon ext={null} />
							{".."}
						</td>
					</tr>
				)}
				{currentDir.items.map((item, index) => (
					<FileTableRow key={index} item={item} onClick={handleItemClick} />
				))}
			</tbody>
		</table>
	</div>
);

export default FileTable;
