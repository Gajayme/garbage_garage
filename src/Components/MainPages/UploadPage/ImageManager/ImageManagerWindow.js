import {ImageManager} from "./ImageManager.js"
import {OuterWindow} from "Components/Window/OuterWindow.js"
import {InnerWindow} from "Components/Window/InnerWindow.js"
import {ButtonLayer} from "Components/Window/ButtonLayer.js"

export const ImageManagerWindow = ({images, errors, onAddFiles, onDelete, onDeleteSpecific, onReorder}) => {

	const buttonLayer = <ButtonLayer className="button-layer">
		<span>images</span>
	</ButtonLayer>

	const innerWindow = <InnerWindow className="inner-window">
		<ImageManager images={images} errors={errors} onAddFiles={onAddFiles} onDelete={onDelete} onDeleteSpecific={onDeleteSpecific} onReorder={onReorder}/>
	</InnerWindow>

	return (
		<OuterWindow className="outer-window-image-manager"
			buttonLayer={buttonLayer}
			innerWindow={innerWindow}>
		</OuterWindow>
	)
}
