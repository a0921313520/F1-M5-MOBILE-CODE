
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import { resetRemSize } from '$SBTWOLIB/js/util';
function Screen(props) {
	const handle = useFullScreenHandle();
	props.setHandle(handle);
	return (
		<FullScreen
			handle={handle}
			onChange={(status) => {
				const height = document.documentElement.clientHeight || document.body.clientHeight;
				props.setStatus && props.setStatus(status);
				resetRemSize(status ? height : null);
			}}
		>
			{props.children}
		</FullScreen>
	);
}

export default Screen;
