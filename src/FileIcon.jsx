import React from 'react';
import FolderIcon from '@mui/icons-material/Folder';
import DescriptionIcon from '@mui/icons-material/Description';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import ImageIcon from '@mui/icons-material/Image';
import MovieIcon from '@mui/icons-material/Movie';
import ArchiveIcon from '@mui/icons-material/Archive';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';

const FileIcon = ({ ext }) => {
	if (ext == undefined || ext == null) {
		return <FolderIcon className="folder-icon" />;
	}
	switch (ext) {
		case 'doc':
		case 'docx':
			return <DescriptionIcon className="word-icon" />;
		case 'pdf':
			return <PictureAsPdfIcon className="pdf-icon" />;
		case 'jpg':
		case 'jpeg':
		case 'png':
		case 'gif':
		case 'webp':
		case 'avif':
			return <ImageIcon className="image-icon" />;
		case 'mp4':
		case 'mov':
			return <MovieIcon className="video-icon" />;
		case 'zip':
		case '7z':
		case 'rar':
			return <ArchiveIcon className="archive-icon" />;
		default:
			return <InsertDriveFileIcon className="file-icon" />;
	}
};

export default FileIcon;
