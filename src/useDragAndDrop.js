import { useState, useEffect } from 'react';

const useDragAndDrop = (onDropCallback) => {
	const [dragActive, setDragActive] = useState(false);
	const [dragCounter, setDragCounter] = useState(0);

	const handleDragEnter = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragCounter(prev => prev + 1);
		setDragActive(true);
	};

	const handleDragLeave = (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragCounter(prev => prev - 1);
		if (dragCounter === 1) {
			setDragActive(false);
		}
	};

	const handleDragOver = (e) => {
		e.preventDefault();
		e.stopPropagation();
	};

	const handleDrop = async (e) => {
		e.preventDefault();
		e.stopPropagation();
		setDragActive(false);
		setDragCounter(0);
		onDropCallback(e);
	};

	useEffect(() => {
		window.addEventListener('dragenter', handleDragEnter);
		window.addEventListener('dragleave', handleDragLeave);
		window.addEventListener('dragover', handleDragOver);
		window.addEventListener('drop', handleDrop);

		return () => {
			window.removeEventListener('dragenter', handleDragEnter);
			window.removeEventListener('dragleave', handleDragLeave);
			window.removeEventListener('dragover', handleDragOver);
			window.removeEventListener('drop', handleDrop);
		};
	}, [dragCounter]);

	return dragActive;
};

export default useDragAndDrop;
