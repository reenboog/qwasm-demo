import React from 'react';
import FileIcon from './FileIcon';

const FileTableRow = ({ item, onClick }) => (
	<tr onClick={() => onClick(item)}>
		<td>
			<FileIcon ext={item.ext} />
			{item.name}
		</td>
		<td>{item.created_at.toLocaleString()}</td>
		<td>{item.ext ?? "dir"}</td>
	</tr>
);

export default FileTableRow;
