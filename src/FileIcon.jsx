import React from 'react';
import { FaFileWord, FaFilePdf, FaFileImage, FaFileVideo, FaFileArchive, FaFile, FaFolder } from 'react-icons/fa';

const FileIcon = ({ ext }) => {
	if (ext === null) {
		return <FaFolder className="folder-icon" />;
	}
	switch (ext) {
		case 'doc':
		case 'docx':
			return <FaFileWord className="word-icon" />;
		case 'pdf':
			return <FaFilePdf className="pdf-icon" />;
		case 'jpg':
		case 'jpeg':
		case 'png':
			return <FaFileImage className="image-icon" />;
		case 'mp4':
		case 'mov':
			return <FaFileVideo className="video-icon" />;
		case 'zip':
		case 'rar':
			return <FaFileArchive className="archive-icon" />;
		default:
			return <FaFile className="file-icon" />;
	}
};

export default FileIcon;
