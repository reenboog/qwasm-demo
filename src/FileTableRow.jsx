import React from 'react';
import FileIcon from './FileIcon';

const FileTableRow = ({ item, onClick, progress }) => {
	const handleClick = () => {
		if (progress === 100 || item.is_dir()) {
			onClick(item);
		}
	};

	return (
		<tr
			className="file-table-row"
			onClick={handleClick}
			style={{ opacity: `${(progress < 100 && !item.is_dir()) ? 0.5 : 1}`, cursor: `${(progress < 100 && !item.is_dir()) ? 'not-allowed' : 'pointer'}` }}
		>
			<td>
				<FileIcon ext={item.ext()} />
				{item.name()}
			</td>
			<td>{new Date(Number(item.created_at())).toLocaleString()}</td>
			<td>{item.ext() ?? "dir"}</td>
			<td>
				{progress < 100 &&
					<div className="progress-bar-container">
						<div className="progress-bar" style={{ width: `${progress}%` }}></div>
					</div>
				}
			</td>
		</tr>
	);
};

export default FileTableRow;
