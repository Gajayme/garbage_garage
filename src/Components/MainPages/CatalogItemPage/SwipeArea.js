import { useEffect, useRef } from "react";

const HORIZONTAL_LOCK_THRESHOLD = 8;

/**
 * Обёртка для горизонтального drag на тач-устройствах.
 * Не мешает вертикальному скроллу: игнорирует жесты, где вертикальная компонента доминирует.
 *
 * @param {object} props
 * @param {import("react").ReactNode} props.children — контент внутри зоны свайпа.
 * @param {string} [props.className] — CSS-класс корневого контейнера.
 * @param {number} [props.maxVertical=40] — максимальное допустимое отклонение по Y в px
 *   (при превышении и доминировании по Y жест считается скроллом и игнорируется).
 * @param {() => void} [props.onDragStart] — начало горизонтального перетаскивания.
 * @param {(dx: number) => void} [props.onDragMove] — смещение пальца по X от точки касания.
 * @param {(dx: number) => void} [props.onDragEnd] — завершение горизонтального жеста с итоговым dx.
 */
export const SwipeArea = ({
	children,
	className,
	maxVertical = 40,
	onDragStart,
	onDragMove,
	onDragEnd,
}) => {
	const containerRef = useRef(null);
	const touchStartRef = useRef(null);
	const horizontalLockRef = useRef(false);
	const callbacksRef = useRef({});
	callbacksRef.current = {
		onDragStart,
		onDragMove,
		onDragEnd,
		maxVertical,
	};

	const handleTouchStart = (event) => {
		const touch = event.touches?.[0];
		if (!touch) return;
		horizontalLockRef.current = false;
		touchStartRef.current = {
			x: touch.clientX,
			y: touch.clientY,
		};
	};

	const finishTouch = (event) => {
		const start = touchStartRef.current;
		touchStartRef.current = null;
		const wasHorizontal = horizontalLockRef.current;
		horizontalLockRef.current = false;

		const endTouch = event.changedTouches?.[0];
		if (!start || !endTouch || !wasHorizontal) return;

		const dx = endTouch.clientX - start.x;
		callbacksRef.current.onDragEnd?.(dx);
	};

	useEffect(() => {
		const el = containerRef.current;
		if (!el) return;

		const handleTouchMove = (event) => {
			const start = touchStartRef.current;
			const touch = event.touches?.[0];
			if (!start || !touch) return;

			const dx = touch.clientX - start.x;
			const dy = touch.clientY - start.y;
			const absX = Math.abs(dx);
			const absY = Math.abs(dy);
			const { maxVertical: maxVert, onDragStart: dragStart, onDragMove: dragMove } =
				callbacksRef.current;

			if (!horizontalLockRef.current) {
				if (absX < HORIZONTAL_LOCK_THRESHOLD && absY < HORIZONTAL_LOCK_THRESHOLD) {
					return;
				}
				if (absY > maxVert && absY > absX) return;
				if (absX >= HORIZONTAL_LOCK_THRESHOLD && absX > absY) {
					horizontalLockRef.current = true;
					dragStart?.();
				} else {
					return;
				}
			}

			event.preventDefault();
			dragMove?.(dx);
		};

		el.addEventListener("touchmove", handleTouchMove, { passive: false });
		return () => el.removeEventListener("touchmove", handleTouchMove);
	}, []);

	return (
		<div
			ref={containerRef}
			className={className}
			onTouchStart={handleTouchStart}
			onTouchEnd={finishTouch}
			onTouchCancel={finishTouch}
		>
			{children}
		</div>
	);
};
