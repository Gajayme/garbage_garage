import React, {useMemo} from 'react';
import {
	DndContext,
	MouseSensor,
	TouchSensor,
	closestCenter,
	useSensor,
	useSensors,
} from '@dnd-kit/core';
import {
	SortableContext,
	horizontalListSortingStrategy,
	useSortable,
} from '@dnd-kit/sortable';
import {CSS} from '@dnd-kit/utilities';
import {restrictToHorizontalAxis} from '@dnd-kit/modifiers';
import {DeletableImage} from "./DeletableImage";

import 'Styles/MainPages/UploadPage/ImageManager/ImageViewer.scss'

// MouseSensor — только мышь; TouchSensor — только тач. PointerSensor на тач-экранах
// перехватывает касания раньше TouchSensor и ломает long-press drag.
const TOUCH_ACTIVATION_DELAY_MS = 250;
const MOUSE_ACTIVATION_DISTANCE_PX = 8;
const TOUCH_ACTIVATION_TOLERANCE_PX = 8;

const SortableImageItem = ({ image, onDeleteSpecific }) => {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: image.id });

	const style = {
		// horizontalListSortingStrategy иногда даёт ненулевой y — обнуляем явно.
		transform: CSS.Transform.toString(
			transform ? { ...transform, y: 0 } : null
		),
		transition,
	};

	return (
		<DeletableImage
			image={image}
			onCrossClick={onDeleteSpecific}
			isDragging={isDragging}
			setNodeRef={setNodeRef}
			style={style}
			dragHandleProps={{ ...attributes, ...listeners }}
		/>
	);
};

export const ImageViewer = ({ images, onDeleteSpecific, onReorder }) => {
	const imageIds = useMemo(() => images.map((image) => image.id), [images]);

	const sensors = useSensors(
		useSensor(MouseSensor, {
			activationConstraint: { distance: MOUSE_ACTIVATION_DISTANCE_PX },
		}),
		useSensor(TouchSensor, {
			activationConstraint: {
				delay: TOUCH_ACTIVATION_DELAY_MS,
				tolerance: TOUCH_ACTIVATION_TOLERANCE_PX,
			},
		}),
	);

	const handleDragEnd = ({ active, over }) => {
		if (!over || active.id === over.id) return;
		onReorder?.(active.id, over.id);
	};

	return (
		<div className='image-viewer'>
			{images.length === 0 ? (
				<p>No uploaded images.</p>
			) : (
				<DndContext
					sensors={sensors}
					collisionDetection={closestCenter}
					modifiers={[restrictToHorizontalAxis]}
					onDragEnd={handleDragEnd}
				>
					<SortableContext
						items={imageIds}
						strategy={horizontalListSortingStrategy}
					>
						{images.map((image) => (
							<SortableImageItem
								key={image.id}
								image={image}
								onDeleteSpecific={onDeleteSpecific}
							/>
						))}
					</SortableContext>
				</DndContext>
			)}
		</div>
	);
};
