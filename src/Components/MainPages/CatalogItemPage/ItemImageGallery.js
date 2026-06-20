import { useEffect, useRef, useState } from "react";

import { ItemThumbnailButton } from "Components/ItemThumbnailButton.js";
import { SwipeArea } from "./SwipeArea.js";

import leftArrow from "Assets/Icons/CatalogItem/arrow_left.svg";
import rightArrow from "Assets/Icons/CatalogItem/arrow_right.svg";

import "Styles/MainPages/CatalogItemPage/ItemImageGallery.scss";

const getImageUrl = (imageData) => {
	if (imageData == null) return null;
	if (typeof imageData === "string") return imageData;
	return imageData.image_url ?? null;
};

const getSwipeThreshold = (width) => Math.max(50, width * 0.25);

export const ItemImageGallery = ({ images, onImageClick, className }) => {
	const [index, setIndex] = useState(0);
	const [dragOffset, setDragOffset] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);

	const viewportRef = useRef(null);
	const draggedRef = useRef(false);
	const dragOffsetRef = useRef(0);
	const pendingIndexRef = useRef(null);

	const count = images?.length ?? 0;

	useEffect(() => {
		setIndex(0);
		dragOffsetRef.current = 0;
		pendingIndexRef.current = null;
		setDragOffset(0);
		setIsAnimating(false);
	}, [images]);

	useEffect(() => {
		setIndex((i) => Math.min(i, Math.max(0, count - 1)));
	}, [count]);

	const resetDragState = () => {
		dragOffsetRef.current = 0;
		pendingIndexRef.current = null;
		setDragOffset(0);
		setIsAnimating(false);
	};

	if (!images || count === 0) return null;

	const last = count - 1;
	const safeIndex = Math.min(Math.max(0, index), last);

	const goPrev = () => {
		resetDragState();
		setIndex((i) => Math.max(0, Math.min(last, i) - 1));
	};

	const goNext = () => {
		resetDragState();
		setIndex((i) => Math.min(last, Math.max(0, Math.min(last, i)) + 1));
	};

	const handleDragStart = () => {
		draggedRef.current = true;
	};

	const handleDragMove = (dx) => {
		let clamped = dx;
		if (safeIndex <= 0) clamped = Math.min(0, dx);
		if (safeIndex >= last) clamped = Math.max(0, dx);
		dragOffsetRef.current = clamped;
		setDragOffset(clamped);
	};

	const handleDragEnd = (dx) => {
		const width = viewportRef.current?.offsetWidth ?? 0;
		const threshold = getSwipeThreshold(width);

		if (dx < -threshold && safeIndex < last) {
			setIsAnimating(true);
			pendingIndexRef.current = safeIndex + 1;
			dragOffsetRef.current = -width;
			setDragOffset(-width);
			return;
		}

		if (dx > threshold && safeIndex > 0) {
			setIsAnimating(true);
			pendingIndexRef.current = safeIndex - 1;
			dragOffsetRef.current = width;
			setDragOffset(width);
			return;
		}

		if (dragOffsetRef.current !== 0) {
			setIsAnimating(true);
			dragOffsetRef.current = 0;
			setDragOffset(0);
		}
	};

	const handleTransitionEnd = (event) => {
		if (event.target !== event.currentTarget) return;
		if (event.propertyName !== "transform") return;

		const nextIndex = pendingIndexRef.current;
		if (nextIndex !== null) {
			setIndex(nextIndex);
			pendingIndexRef.current = null;
		}

		dragOffsetRef.current = 0;
		setDragOffset(0);
		setIsAnimating(false);
	};

	const handleImageClick = (url) => {
		if (draggedRef.current) return;
		onImageClick?.(url);
	};

	const trackClassName = [
		"item-image-gallery__track",
		isAnimating ? "item-image-gallery__track--animating" : "",
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={`item-image-gallery${className ? ` ${className}` : ""}`}>
			<SwipeArea
				className="item-image-gallery__swipe-area"
				onDragStart={handleDragStart}
				onDragMove={handleDragMove}
				onDragEnd={handleDragEnd}
			>
				<div
					className="item-image-gallery__viewport"
					ref={viewportRef}
				>
					<div
						className={trackClassName}
						style={{
							transform: `translateX(calc(-${safeIndex * 100}% + ${dragOffset}px))`,
						}}
						onTransitionEnd={handleTransitionEnd}
					>
						{images.map((imageData, i) => (
							<div key={i} className="item-image-gallery__slide">
								<ItemThumbnailButton
									imageSrc={getImageUrl(imageData)}
									onImageClick={handleImageClick}
									buttonClassName="item-image-gallery__image-button"
									imageClassName="item-image-gallery__image"
								/>
							</div>
						))}
					</div>
				</div>
			</SwipeArea>
			<div className="item-image-gallery__controls">

				{/* кнопка перехода на предыдущее изображение */}
				{/* TODO Вынести в отдельный компонент */}
				<button
					type="button"
					className="item-image-gallery__nav-button"
					disabled={safeIndex <= 0}
					onClick={goPrev}
					aria-label="Previous image"
				>
					<img
						className="item-image-gallery__arrow"
						src={leftArrow}
						alt=""
					/>
				</button>

				{/* счетчик изображений */}
				<span className="item-image-gallery__counter" aria-live="polite">
					{safeIndex + 1}/{count}
				</span>

				{/* кнопка перехода на следующее изображение */}
				<button
					type="button"
					className="item-image-gallery__nav-button"
					disabled={safeIndex >= last}
					onClick={goNext}
					aria-label="Next image"
				>
					<img
						className="item-image-gallery__arrow"
						src={rightArrow}
						alt=""
					/>
				</button>
			</div>
		</div>
	);
};
