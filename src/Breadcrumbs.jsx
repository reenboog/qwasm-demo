import React, { useRef } from 'react';
import { FaChevronRight } from 'react-icons/fa';

const Breadcrumbs = ({ breadcrumbs, currentDirName, onBreadcrumbClick, onUploadClick, onFileAddClick, onDirAddClick }) => {
	const fileInputRef = useRef(null);

	const handleButtonClick = () => {
		fileInputRef.current.click();
	};

	return (
		<tr>
			<td colSpan="2">
				<div className="breadcrumbs">
					{breadcrumbs.map((breadcrumb, index) => (
						<span key={breadcrumb.id()} className="breadcrumb-container">
							<span onClick={() => onBreadcrumbClick(breadcrumb.id())} className="breadcrumb">
								{breadcrumb.name()}
							</span>
							<FaChevronRight className="breadcrumb-delimiter" />
						</span>
					))}
					<span className="breadcrumb-current-dir">{currentDirName}</span>
				</div>
			</td>
			<td>
				<div className="upload-button-container">
					<button className="upload-button" onClick={handleButtonClick}>Upload files</button>
					<input
						type="file"
						ref={fileInputRef}
						style={{ display: 'none' }}
						onChange={onUploadClick}
						multiple
					/>
					<button className="add-dir-button" onClick={onDirAddClick}>Add dir</button>
				</div>
			</td>
		</tr>
	);
};

export default Breadcrumbs;
