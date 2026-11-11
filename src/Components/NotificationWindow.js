import {OuterWindow} from "Components/Window/OuterWindow.js"
import {InnerWindow} from "Components/Window/InnerWindow.js"
import {ButtonLayer} from "Components/Window/ButtonLayer.js"

export const NotificationWindow = ({className, mainTextClassName, notificationData}) => {

	const buttonLayer = <ButtonLayer className="button-layer">
		<span>{notificationData.headerText}</span>
	</ButtonLayer>

	const innerWindow = <InnerWindow className="inner-window">
		<span className= {[mainTextClassName, notificationData.mainTextColorClassName].join(" ")}>
			{notificationData.mainText}
		</span>
	</InnerWindow>

	return (
		<div className={className}>
			<OuterWindow className={"notification-outer-window"}
						buttonLayer={buttonLayer}
						innerWindow={innerWindow}>
			</OuterWindow>
		</div>
	)
}
