import React from 'react';
import { FaChevronRight } from 'react-icons/fa';

const Breadcrumbs = ({ breadcrumbs, currentDirName, onBreadcrumbClick, onUploadClick, onFileAddClick, onDirAddClick }) => {
	return (
		<tr>
			<td colSpan="2">
				<div className="breadcrumbs">
					{breadcrumbs.slice().reverse().map((breadcrumb, index) => (
						<span key={breadcrumb.id} className="breadcrumb-container">
							<span onClick={() => onBreadcrumbClick(breadcrumb.id)} className="breadcrumb">
								{breadcrumb.name}
							</span>
							<FaChevronRight className="breadcrumb-delimiter" />
						</span>
					))}
					<span className="breadcrumb-current-dir">{currentDirName}</span>
				</div>
			</td>
			<td>
				<div className="upload-button-container">
					<button className="upload-button" onClick={onUploadClick}>Upload files</button>
					<button className="add-dir-button" onClick={onDirAddClick}>Add dir</button>
					<button className="add-file-button" onClick={onFileAddClick}>Add file</button>
				</div>
			</td>
		</tr>
	);
};

export default Breadcrumbs;
