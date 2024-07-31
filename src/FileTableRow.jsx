import React from 'react';
import FileIcon from './FileIcon';

const FileTableRow = ({ item, onClick, prog }) => {
	return (
		<tr className="file-table-row" onClick={() => onClick(item)}>
			<td>
				<FileIcon ext={item.ext()} />
				{item.name()}
			</td>
			<td>{new Date(Number(item.created_at())).toLocaleString()}</td>
			<td>{item.ext() ?? "dir"}</td>
			<div className="progress-bar-container">
				<div className="progress-bar" style={{ width: `${ prog || Math.random() * 100 }%` }}></div>
			</div>
		</tr>
	);
};

export default FileTableRow;
