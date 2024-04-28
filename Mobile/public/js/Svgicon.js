import React from 'react';

const getSvg = (name, fill, width, height) => {
	switch (name) {
		case 'gameInfo_trust':
			return (
				<svg width="28.001" height="28" viewBox="0 0 28.001 28">
					<g transform="translate(-15.999 -0.5)">
						<path
							fill={fill}
							d="M14,28a9.625,9.625,0,1,1,9.626-9.625A9.636,9.636,0,0,1,14,28Zm0-15.087a.614.614,0,0,0-.562.349l-1.282,2.6-2.867.418a.628.628,0,0,0-.347,1.071l2.075,2.021-.491,2.856a.615.615,0,0,0,.137.508.63.63,0,0,0,.481.227.619.619,0,0,0,.292-.074L14,21.541l2.566,1.347a.62.62,0,0,0,.292.074.631.631,0,0,0,.482-.227.614.614,0,0,0,.137-.507l-.491-2.856,2.074-2.021a.627.627,0,0,0-.347-1.071l-2.866-.418-1.282-2.6A.627.627,0,0,0,14,12.913ZM6.245,10.07h0L.159,1.377A.863.863,0,0,1,.1.47.861.861,0,0,1,.877,0H6.955a1.94,1.94,0,0,1,1.5.85l3.781,6.3a11.286,11.286,0,0,0-5.99,2.919Zm15.51,0h0a11.3,11.3,0,0,0-5.99-2.918L19.544.85a1.759,1.759,0,0,1,1.5-.85h6.079A.861.861,0,0,1,27.9.47a.863.863,0,0,1-.058.907l-6.085,8.691Z"
							transform="translate(16 0.5)"
						/>
					</g>
				</svg>
			);
		case 'img_error':
			return (
				<svg
					t="1643275544415"
					viewBox="0 0 1024 1024"
					version="1.1"
					xmlns="http://www.w3.org/2000/svg"
					p-id="1527"
					width="50"
					height="50"
				>
					<path
						d="M320 447.936c35.392 0 64-28.608 64-64s-28.608-64-64-64-64 28.608-64 64S284.608 447.936 320 447.936zM751.744 706.752c-146.496-91.008-333.44-91.008-479.872 0-14.336 8.896-19.328 28.736-11.264 44.48 8 15.744 26.048 21.248 40.384 12.352 128.704-79.936 292.864-79.936 421.632 0 4.544 2.88 9.6 4.224 14.528 4.224 10.368 0 20.416-6.016 25.856-16.64C771.072 735.488 766.016 715.648 751.744 706.752zM832 127.936 192 127.936c-70.656 0-128 57.344-128 128l0 576c0 70.656 57.344 128 128 128l640 0c70.656 0 128-57.344 128-128l0-576C960 185.28 902.656 127.936 832 127.936zM896 831.936c0 35.392-28.608 64-64 64L192 895.936c-35.392 0-64-28.608-64-64l0-576c0-35.392 28.608-64 64-64l640 0c35.392 0 64 28.608 64 64L896 831.936zM704 319.936c-35.392 0-64 28.608-64 64s28.608 64 64 64 64-28.608 64-64S739.392 319.936 704 319.936z"
						p-id="1528"
						fill="#1296db"
					/>
				</svg>
			);
		case 'gameInfo_stable':
			return (
				<svg width="28" height="28.499" viewBox="0 0 28 28.499">
					<g transform="translate(-16 -0.501)">
						<path
							fill={fill}
							d="M13.122,28a2.623,2.623,0,0,1-1.009-.2,16.365,16.365,0,0,1-4.361-2.752,21.048,21.048,0,0,1-3.89-4.491A24.786,24.786,0,0,1,0,7,2.614,2.614,0,0,1,1.619,4.576L12.119.2A3.148,3.148,0,0,1,13.127,0a3.148,3.148,0,0,1,1.009.2l10.5,4.375A2.615,2.615,0,0,1,26.25,7a26.06,26.06,0,0,1-1.235,8.081A22.706,22.706,0,0,1,21.948,21.2,21.183,21.183,0,0,1,18,25.425,16.3,16.3,0,0,1,14.131,27.8,2.623,2.623,0,0,1,13.122,28Zm0-25.373L2.625,7a22.389,22.389,0,0,0,3.25,11.827,16.217,16.217,0,0,0,7.249,6.548,13.836,13.836,0,0,0,3.8-2.434,18.453,18.453,0,0,0,3.37-3.989A22.287,22.287,0,0,0,23.625,7l-10.5-4.375ZM11.307,19.956a.658.658,0,0,1-.468-.194l-4.965-5a.664.664,0,0,1,.005-.93L7.12,12.6a.663.663,0,0,1,.93.005L11.32,15.9l7.733-7.667a.663.663,0,0,1,.93.005l1.23,1.242a.662.662,0,0,1-.005.93l-9.439,9.363A.656.656,0,0,1,11.307,19.956Z"
							transform="translate(16.875 0.501)"
						/>
						<rect fill="none" width="28" height="28" transform="translate(16 1)" />
					</g>
				</svg>
			);
		case 'icon-Slot':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#673ab7" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M5.625,10h-5A.625.625,0,0,1,0,9.375V.625A.625.625,0,0,1,.625,0H6.875A.625.625,0,0,1,7.5.625v7.5A1.877,1.877,0,0,1,5.625,10ZM4.531,6.563A.468.468,0,1,0,5,7.031.469.469,0,0,0,4.531,6.563ZM1.406,6.25a.156.156,0,0,0-.156.157v.312a.156.156,0,0,0,.156.157h.469v.469a.156.156,0,0,0,.157.156h.312A.156.156,0,0,0,2.5,7.344V6.875h.469a.156.156,0,0,0,.156-.157V6.406a.156.156,0,0,0-.156-.157H2.5V5.782a.157.157,0,0,0-.157-.157H2.031a.157.157,0,0,0-.157.157V6.25Zm4.376-.625a.469.469,0,1,0,.468.469A.469.469,0,0,0,5.782,5.625ZM2.188,1.25a.313.313,0,0,0-.313.312v2.5a.313.313,0,0,0,.313.312H5a.625.625,0,0,0,.625-.625V1.562a.313.313,0,0,0-.312-.312Z"
						transform="translate(6.25 5)"
					/>
				</svg>
			);
		case 'icon-Lottery':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#b620e0" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M9.688,10A1.562,1.562,0,1,1,11.25,8.438,1.564,1.564,0,0,1,9.688,10ZM5.625,10A1.562,1.562,0,1,1,7.187,8.438,1.564,1.564,0,0,1,5.625,10ZM1.562,10A1.562,1.562,0,1,1,3.125,8.438,1.564,1.564,0,0,1,1.562,10ZM7.813,6.406A1.562,1.562,0,1,1,9.375,4.844,1.565,1.565,0,0,1,7.813,6.406Zm-4.376,0A1.562,1.562,0,1,1,5,4.844,1.564,1.564,0,0,1,3.437,6.406ZM5.625,3.125A1.562,1.562,0,1,1,7.187,1.562,1.564,1.564,0,0,1,5.625,3.125Z"
						transform="translate(4.375 5)"
					/>
				</svg>
			);
		case 'icon-Special':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#ff9800" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M6.944,9.166a.854.854,0,0,1-.608-.252l-.006-.006L9.446,5.792a1.61,1.61,0,0,0,0-2.279L5.933,0h.873a.988.988,0,0,1,.608.252l3.794,3.793a.86.86,0,0,1,0,1.215L7.552,8.915A.854.854,0,0,1,6.944,9.166Zm-2.292,0a.852.852,0,0,1-.607-.252L.252,5.122A.989.989,0,0,1,0,4.513V.86A.86.86,0,0,1,.86,0H4.514a.989.989,0,0,1,.608.252L8.915,4.045a.859.859,0,0,1,0,1.215L5.26,8.915A.854.854,0,0,1,4.653,9.166ZM2.005,1.146a.859.859,0,1,0,.859.859A.86.86,0,0,0,2.005,1.146Z"
						transform="translate(4.583 5.833)"
					/>
				</svg>
			);
		case 'icon-ESports':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="none" width="20" height="20" />
					<rect fill="#00c853" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M9.816,8.167a2.1,2.1,0,0,1-2-1.361l-.137-.39h-3.7l-.138.39a2.094,2.094,0,0,1-2,1.361A1.882,1.882,0,0,1,.4,7.5,1.684,1.684,0,0,1,.025,6.129L.634,2.272A2.389,2.389,0,0,1,2.47.392,17.643,17.643,0,0,1,5.833,0,17.626,17.626,0,0,1,9.2.392a2.387,2.387,0,0,1,1.836,1.88l.608,3.857A1.683,1.683,0,0,1,11.265,7.5,1.881,1.881,0,0,1,9.816,8.167ZM7.875,3.645a.729.729,0,1,0,.729.73A.73.73,0,0,0,7.875,3.645ZM2.114,3.062a.219.219,0,0,0-.219.219v.437a.219.219,0,0,0,.219.22h.949v.948a.219.219,0,0,0,.219.219h.437a.219.219,0,0,0,.219-.219V3.938h.948a.219.219,0,0,0,.219-.22V3.281a.219.219,0,0,0-.219-.219H3.938V2.114A.219.219,0,0,0,3.719,1.9H3.281a.219.219,0,0,0-.219.219v.948ZM9.041,1.9a.729.729,0,1,0,.729.729A.73.73,0,0,0,9.041,1.9Z"
						transform="translate(4.167 5.833)"
					/>
				</svg>
			);
		case 'icon-Casino':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="none" width="20" height="20" />
					<rect fill="#e91e63" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M4.88.118C5.741.938,8.209,3.313,8.6,3.739A2.221,2.221,0,0,1,5.3,6.717c0,.672.025.942.949,1.354a.571.571,0,0,1,.329.63.582.582,0,0,1-.575.466H3.153a.573.573,0,0,1-.559-.444.58.58,0,0,1,.335-.655c.924-.414.937-.695.938-1.35A2.22,2.22,0,0,1,0,5.184,2.151,2.151,0,0,1,.573,3.741C.96,3.313,3.427.938,4.287.118A.431.431,0,0,1,4.88.118Z"
						transform="translate(5.417 5.417)"
					/>
				</svg>
			);
		case 'icon-Fishing':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#00bcd4" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M6.389,6.25A6.066,6.066,0,0,1,2.243,4.265L.537,5.556a.342.342,0,0,1-.207.07A.351.351,0,0,1,.061,5.5a.27.27,0,0,1-.054-.232L.48,3.125.007.981A.27.27,0,0,1,.061.75.346.346,0,0,1,.33.625a.341.341,0,0,1,.207.07L2.243,1.985A6.077,6.077,0,0,1,6.389,0,5.543,5.543,0,0,1,9.826,1.328a3.7,3.7,0,0,1,1.424,1.8,3.694,3.694,0,0,1-1.424,1.8A5.732,5.732,0,0,1,6.389,6.25ZM8.1,2.656a.469.469,0,1,0,.469.469A.469.469,0,0,0,8.1,2.656Z"
						transform="translate(4.375 6.667)"
					/>
				</svg>
			);
		case 'icon-P2P':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#99683d" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M11.562,10H7.187a.939.939,0,0,1-.938-.938V8.156L8.911,5.494A1.573,1.573,0,0,0,9.243,3.75h2.319a.938.938,0,0,1,.938.937V9.062A.939.939,0,0,1,11.562,10ZM9.375,6.406a.469.469,0,1,0,.468.469A.469.469,0,0,0,9.375,6.406Zm-5,2.344A.952.952,0,0,1,3.7,8.469L.281,5.053a.959.959,0,0,1,0-1.355L3.7.281a.958.958,0,0,1,1.355,0L8.469,3.7a.959.959,0,0,1,0,1.355L5.053,8.469A.952.952,0,0,1,4.375,8.75Zm0-2.344a.469.469,0,1,0,.469.469A.469.469,0,0,0,4.375,6.406Zm2.5-2.5a.469.469,0,1,0,.469.469A.469.469,0,0,0,6.875,3.906Zm-2.5,0a.469.469,0,1,0,.469.469A.469.469,0,0,0,4.375,3.906Zm-2.5,0a.469.469,0,1,0,.469.469A.469.469,0,0,0,1.875,3.906Zm2.5-2.5a.469.469,0,1,0,.469.469A.469.469,0,0,0,4.375,1.406Z"
						transform="translate(2.917 5)"
					/>
				</svg>
			);
		case 'icon-Sports':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="none" width="20" height="20" />
					<rect fill="#2994ff" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M5.833,11.667a5.833,5.833,0,1,1,5.834-5.834A5.84,5.84,0,0,1,5.833,11.667ZM2.215,7.811h0l2,.246.854,1.831-.7.418a4.743,4.743,0,0,0,2.929,0l-.7-.418.854-1.831,2-.246.181.8a4.655,4.655,0,0,0,.9-2.776V5.827l-.613.535L8.45,4.986,8.837,3l.807.072a4.687,4.687,0,0,0-2.369-1.72L7.6,2.1l-1.763.977L4.071,2.1l.32-.751a4.685,4.685,0,0,0-2.369,1.72L2.836,3l.381,1.984L1.742,6.361,1.13,5.827v.007a4.655,4.655,0,0,0,.9,2.775l.181-.8ZM6.971,7.47H4.7L4,5.322,5.833,3.992,7.668,5.322l-.7,2.148Z"
						transform="translate(4.167 4.167)"
					/>
				</svg>
			);
		case 'icon-8 Shop':
			return (
				<svg width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#eb1717" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M3.961,9.166A5.179,5.179,0,0,1,1.081,8.5,2.476,2.476,0,0,1,0,6.5,2.424,2.424,0,0,1,.7,4.59a2.74,2.74,0,0,1-.62-1.642A2.478,2.478,0,0,1,.714,1.1,4.967,4.967,0,0,1,4.246,0,4.65,4.65,0,0,1,7.614,1a2.478,2.478,0,0,1,.641,1.866,2.734,2.734,0,0,1-.62,1.642,2.427,2.427,0,0,1,.7,1.907A2.582,2.582,0,0,1,7.264,8.476a4.944,4.944,0,0,1-2.839.685H4.3C4.186,9.165,4.071,9.166,3.961,9.166ZM2.777,6.56h0c.036.443.424.667,1.151.667.078,0,.162,0,.248-.008.875,0,1.338-.249,1.379-.74H5.548c-.009-.539-.465-.821-1.358-.839-.924.071-1.4.38-1.406.919ZM4.209,2.115c-.818.066-1.238.354-1.246.855.021.369.38.555,1.068.555.063,0,.129,0,.2,0,.858-.013,1.3-.223,1.327-.625C5.547,2.395,5.094,2.132,4.209,2.115Z"
						transform="translate(5.833 5.417)"
					/>
				</svg>
			);
		case 'icon-VIP':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
					<rect fill="#3956cc" width="20" height="20" rx="10" />
					<path
						fill="#fff"
						d="M5.625,10a.233.233,0,0,1-.181-.086L.052,3.258a.236.236,0,0,1-.014-.277L1.992.105A.235.235,0,0,1,2.187,0H9.062a.235.235,0,0,1,.2.105L11.21,2.981a.234.234,0,0,1-.013.277L5.807,9.914A.235.235,0,0,1,5.625,10ZM3.734,3.75,5.625,8.5,7.515,3.75Zm4.785,0h0L7.187,6.875,9.523,3.75h-1Zm-6.795,0L4.063,6.875,2.728,3.75ZM7.576.938h0l1.01,1.875H9.922L8.685.938H7.576Zm-2.838,0L3.731,2.813H7.519L6.51.938Zm-2.174,0L1.327,2.813H2.664L3.674.938H2.564Z"
						transform="translate(4.375 5.417)"
					/>
				</svg>
			);
		case 'icon-dice':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
					<rect fill="#44d7b6" width="40" height="40" rx="20" />
					<path
						fill="#fff"
						d="M19.063,17.5H15.1a.938.938,0,0,1-.937-.937V13.438A.938.938,0,0,1,15.1,12.5h3.959a.938.938,0,0,1,.937.938v3.125A.938.938,0,0,1,19.063,17.5Zm-7.084,0H8.021a.938.938,0,0,1-.938-.937V13.438a.939.939,0,0,1,.938-.938h3.958a.939.939,0,0,1,.938.938v3.125A.938.938,0,0,1,11.979,17.5ZM4.9,17.5H.938A.938.938,0,0,1,0,16.563V13.438A.939.939,0,0,1,.938,12.5H4.9a.938.938,0,0,1,.937.938v3.125A.938.938,0,0,1,4.9,17.5Zm14.167-6.25H15.1a.938.938,0,0,1-.937-.938V7.187A.938.938,0,0,1,15.1,6.25h3.959A.938.938,0,0,1,20,7.187v3.125A.938.938,0,0,1,19.063,11.25Zm-7.084,0H8.021a.939.939,0,0,1-.938-.938V7.187a.939.939,0,0,1,.938-.938h3.958a.939.939,0,0,1,.938.938v3.125A.939.939,0,0,1,11.979,11.25Zm-7.083,0H.938A.939.939,0,0,1,0,10.312V7.187A.939.939,0,0,1,.938,6.25H4.9a.938.938,0,0,1,.937.938v3.125A.938.938,0,0,1,4.9,11.25ZM19.063,5H15.1a.938.938,0,0,1-.937-.938V.938A.938.938,0,0,1,15.1,0h3.959A.938.938,0,0,1,20,.938V4.063A.938.938,0,0,1,19.063,5ZM11.979,5H8.021a.939.939,0,0,1-.938-.938V.938A.939.939,0,0,1,8.021,0h3.958a.939.939,0,0,1,.938.938V4.063A.939.939,0,0,1,11.979,5ZM4.9,5H.938A.939.939,0,0,1,0,4.063V.938A.939.939,0,0,1,.938,0H4.9a.938.938,0,0,1,.937.938V4.063A.938.938,0,0,1,4.9,5Z"
						transform="translate(10 11.667)"
					/>
				</svg>
			);
		case 'icon-done':
			return (
				<svg width="60" height="60" viewBox="0 0 60 60">
					<rect fill="none" width="60" height="60" />
					<path
						fill="#42d200"
						d="M30,60A30.008,30.008,0,0,1,18.323,2.358,30.008,30.008,0,0,1,41.677,57.643,29.813,29.813,0,0,1,30,60ZM16.1,27.2a2.9,2.9,0,0,0-2.054,4.957l8.99,8.987a2.906,2.906,0,0,0,4.11,0l18.2-18.193a2.9,2.9,0,0,0-4.109-4.107L25.1,34.989l-6.937-6.935A2.888,2.888,0,0,0,16.1,27.2Z"
					/>
				</svg>
			);
		case 'icon-refresh':
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<rect fill="none" width="24" height="24" />
					<path
						fill="#ccc"
						d="M7.013,0a6.976,6.976,0,0,1,4.823,1.939L12.844.931A.677.677,0,0,1,14,1.41V5.194a.677.677,0,0,1-.677.677H9.539A.677.677,0,0,1,9.06,4.715l1.178-1.178a4.742,4.742,0,1,0-.115,7.033.338.338,0,0,1,.462.016L11.7,11.7a.339.339,0,0,1-.014.492A7,7,0,1,1,7.013,0Z"
						transform="translate(5 5)"
					/>
				</svg>
			);
		case 'icon-bell':
			return (
				<svg width="16" height="16" viewBox="0 0 16 16">
					<rect fill="none" width="16" height="16" />
					<path
						fill="#fe0"
						d="M5.25,12a1.5,1.5,0,0,1-1.5-1.5h3A1.5,1.5,0,0,1,5.25,12Zm4.5-2.25h-9A.748.748,0,0,1,0,9a.731.731,0,0,1,.2-.509l.233-.247A4.477,4.477,0,0,0,1.5,4.875a3.7,3.7,0,0,1,3-3.637V.75A.749.749,0,1,1,6,.75v.489A3.7,3.7,0,0,1,9,4.875,4.394,4.394,0,0,0,10.209,8.4l.089.094A.725.725,0,0,1,10.5,9,.748.748,0,0,1,9.748,9.75Z"
						transform="translate(2.75 2.5)"
					/>
				</svg>
			);
		case 'icon-open-eyes':
			return (
				<svg viewBox="0 0 1024 1024" width="21" height="21">
					<path
						fill="#b6b6b6"
						d="M512.7 813.2h-0.6c-79.1-0.1-160.8-26.3-242.8-77.8-38.7-24.3-98.3-67.7-162.9-136.8-20.7-22.1-32.5-54.6-32.5-89 0.1-34.4 12-66.8 32.8-88.9 35.8-38 93.2-92.5 163.4-136.3 81.9-51.1 163.5-77 242.5-77h0.6c79.1 0.1 160.8 26.3 242.8 77.8 38.7 24.3 98.3 67.7 162.9 136.8 20.7 22.1 32.5 54.6 32.5 89s-12 66.8-32.8 88.9c-35.8 38-93.2 92.5-163.4 136.3-82 51.1-163.6 77-242.5 77z m-0.2-529.2C362.9 284 229 402.5 162.4 473.2c-7.3 7.8-11.9 21.8-11.9 36.5s4.5 28.7 11.8 36.5c66.4 71 200.2 190.1 349.9 190.4h0.5c149.5 0 283.5-118.5 350.1-189.2 7.3-7.8 11.9-21.8 12-36.5 0-14.7-4.5-28.7-11.8-36.5-66.5-71-200.3-190.1-350-190.4h-0.5z"
						p-id="2535"
					/>
					<path
						fill="#b6b6b6"
						d="M512.6 646h-0.2c-36.2-0.1-70.3-14.2-95.9-39.9-25.6-25.7-39.6-59.8-39.6-96 0.1-74.7 61-135.5 135.7-135.5h0.2c36.2 0.1 70.3 14.2 95.9 39.9s39.6 59.8 39.6 96l-32.6-0.1 32.6 0.1c-0.1 74.8-61 135.5-135.7 135.5z m0-206.2c-38.9 0-70.5 31.6-70.6 70.4 0 18.8 7.3 36.6 20.6 49.9 13.3 13.3 31 20.7 49.9 20.8h0.1c18.8 0 36.5-7.3 49.8-20.6 13.3-13.3 20.7-31 20.8-49.9 0-18.8-7.3-36.6-20.6-49.9-13.3-13.3-31-20.7-49.9-20.8 0 0.1-0.1 0.1-0.1 0.1z"
						p-id="2536"
					/>
				</svg>
			);
		case 'icon-close-eyes':
			return (
				<svg viewBox="0 0 1024 1024" width="21" height="21">
					<path
						fill="#b6b6b6"
						d="M512 830.871c-58.519 0-118.836-16.271-179.277-48.363-46.915-24.909-94.073-59.416-140.164-102.56C114.987 607.335 67.13 535.423 65.13 532.397a37.002 37.002 0 0 1 0-40.795c2-3.026 49.857-74.938 127.429-147.551 46.091-43.144 93.249-77.65 140.164-102.56C393.164 209.4 453.481 193.128 512 193.128s118.836 16.271 179.277 48.363c46.915 24.909 94.073 59.416 140.164 102.56 77.571 72.612 125.429 144.524 127.429 147.551a37.002 37.002 0 0 1 0 40.795c-2 3.026-49.857 74.938-127.429 147.551-46.091 43.144-93.249 77.65-140.164 102.56-60.441 32.091-120.758 48.363-179.277 48.363zM141.513 512C188.029 574.165 339.447 756.87 512 756.87c172.541 0 323.95-182.679 370.486-244.871C835.95 449.807 684.541 267.128 512 267.128S188.049 449.808 141.513 512z"
						p-id="2290"
					/>
					<path
						fill="#b6b6b6"
						d="M512 674.154c-89.412 0-162.154-72.742-162.154-162.154S422.588 349.845 512 349.845 674.154 422.587 674.154 512 601.412 674.154 512 674.154z m0-250.309c-48.608 0-88.154 39.546-88.154 88.154s39.546 88.154 88.154 88.154 88.154-39.546 88.154-88.154-39.546-88.154-88.154-88.154z"
						p-id="2291"
					/>
					<path
						fill="#b6b6b6"
						d="M210.392 850.609c-9.469 0-18.938-3.612-26.163-10.837-14.449-14.449-14.449-37.877 0-52.326l603.217-603.218c14.449-14.449 37.877-14.449 52.326 0s14.449 37.877 0 52.326L236.555 839.772c-7.225 7.225-16.695 10.837-26.163 10.837z"
						p-id="2292"
					/>
				</svg>
			);
		case 'icon-check-circle':
			return (
				<svg width="16" height="16" viewBox="0 0 16 16">
					<g stroke={fill} strokeMiterlimit="10" strokeWidth="2px">
						<rect stroke="none" width="16" height="16" rx="8" />
						<rect fill="#fff" x="1" y="1" width="14" height="14" rx="7" />
					</g>
					<rect fill={fill} width="8" height="8" rx="4" transform="translate(4 4)" />
				</svg>
			);
		case 'icon-filter':
			return (
				<svg width="16" height="16" viewBox="0 0 16 16">
					<rect fill="none" width="16" height="16" />
					<rect fill="#fff" width="12" height="1.5" rx="0.75" transform="translate(2 3)" />
					<rect fill="#fff" width="8" height="1.5" rx="0.75" transform="translate(4 7)" />
					<rect fill="#fff" width="4" height="1.5" rx="0.75" transform="translate(6 11)" />
				</svg>
			);
		case 'icon-search':
			return (
				<svg width="24" height="24" viewBox="0 0 24 24">
					<rect fill="none" width="24" height="24" />
					<path
						fill="#999"
						d="M13.054,14a.327.327,0,0,1-.233-.1L9.5,10.585a.336.336,0,0,1-.1-.232V9.992a5.687,5.687,0,1,1,.586-.586h.361a.326.326,0,0,1,.232.1L13.9,12.821a.329.329,0,0,1,0,.465l-.617.617A.327.327,0,0,1,13.054,14ZM5.687,1.312a4.375,4.375,0,1,0,4.376,4.375A4.38,4.38,0,0,0,5.687,1.312Z"
						transform="translate(5 4.75)"
					/>
				</svg>
			);
		case 'icon-logo':
			return (
				<svg xmlns="http://www.w3.org/2000/svg" className='Logosvg' width="78.452" height="35.102" viewBox="0 0 78.452 35.102">
					<g id="Group_12319" data-name="Group 12319" transform="translate(-106.239 -178.008)">
						<path
							id="Path_2"
							data-name="Path 2"
							d="M126.841,186.482l3.274-.024.288-2.276h-3.362l.253-2.893-2.915.042-.253,2.851h-3.615l.243-3.29a49.312,49.312,0,0,0,9.337-.853l-.4-2.032c-1.86.833-11.2,1.108-11.2,1.108l.006.166h-.02l-.362,4.9h-.948l-.26,2.372,7.011-.051-.174,1.956.851-.005a8.214,8.214,0,0,0-.854.047l-.1,1.154c-.224.536-.776,1.06-2.073,1.106l-.055,2.6s5.157-.378,5-3.347l.025-.018Z"
							transform="translate(-8.604)"
							fill="#fff"
						/>
						<path
							id="Path_3"
							data-name="Path 3"
							d="M163.205,232.536l-.145,1.657-.82-.089.171-1.648Z"
							transform="translate(-45.156 -43.903)"
							fill="#fff"
						/>
						<path
							id="Path_4"
							data-name="Path 4"
							d="M124.98,183.994l.021-.267.316.134-.239.277Z"
							transform="translate(-15.111 -4.611)"
							fill="#fff"
						/>
						<path
							id="Path_5"
							data-name="Path 5"
							d="M117.449,237.832l.541-1.083.625.213-.654.954Z"
							transform="translate(-9.039 -47.364)"
							fill="#fff"
						/>
						<rect
							id="Rectangle_5237"
							data-name="Rectangle 5237"
							width="1.608"
							height="0.544"
							transform="translate(107.097 190.794)"
							fill="#fff"
						/>
						<path
							id="Path_6"
							data-name="Path 6"
							d="M113.216,224.448l-1.268,2.5.077.415-.113.095s.358-.038.322.062l-.052.1.01.007c-.032.077-.649.162-.7.243a.627.627,0,0,1-.595.368h-.745l-.124,1.935h1.956a1.154,1.154,0,0,0,.281-.079,1.945,1.945,0,0,0,1.227-1.148h0l2.328-4.5Z"
							transform="translate(-3.057 -37.446)"
							fill="#fff"
						/>
						<path
							id="Path_7"
							data-name="Path 7"
							d="M119.818,248.044a1.8,1.8,0,0,0,1.368-.863c.406-.745-.526-.549-.526-.549l-.815.23Z"
							transform="translate(-10.949 -55.315)"
							fill="#fff"
						/>
						<path
							id="Path_8"
							data-name="Path 8"
							d="M152.139,230.1l-.052.587.664.2.2-.853Z"
							transform="translate(-36.968 -41.954)"
							fill="#fff"
						/>
						<path
							id="Path_9"
							data-name="Path 9"
							d="M173.444,252.441s1.555.854,5.5.165l-2.569-1-2.152.081Z"
							transform="translate(-54.189 -59.348)"
							fill="#fff"
						/>
						<path
							id="Path_10"
							data-name="Path 10"
							d="M199.1,194.047l.289-.3.057-1.091.563-.025.148-3.008h-1.375l.129-.958H196.7l-.129.958h-1.393l.1-.958h-2.213l-.129.958h-1.465l.1-.921H189.36l-.135.921h-1.117v.059l-.151,3.021.5.007-.136,3.018-.032.7h.013l-.018.409,4.7-.01-.027.539H187.9l-.184,1.673,5.16-.031-.038.776h-5v.009c-3.524-.107-5.053-1.853-5.676-2.992l.047-1.309,5.649.047.254-2.494H182.3l.073-2.036,5.1-.017.176-2.024-14.395-.13-.265,2.2,6.57-.022-.061,2.027h-5.835l-.241,2.374,6,.05-.033,1.079a5.911,5.911,0,0,1-1.767,2.3l-.041.036c-1.633,1.354-4.544,1.033-4.544,1.033-.014-.07-.029-.147-.043-.241-.124-.836-.19-2.687-.21-3.359,0-.157-.007-.25-.007-.25l-2.706.083.031.99h.28l.342,4.542a5.5,5.5,0,0,0,2.019.367c.379.044,5.4.558,8.036-2.908,2.1,2.575,6.236,2.892,7.054,2.929v.008l11.712.028.206-2.323h-4.741l.046-.789,4.58-.028.176-1.6h-4.662l.031-.544,4.027-.009.1-1.468h-.006l.068-1.307Zm-1.492,1.31-7.264.012.065-1.322h7.263Zm.75-2.857h-8.752l.072-1.149,8.728.03Z"
							transform="translate(-51.475 -8.598)"
							fill="#fff"
						/>
						<path
							id="Path_11"
							data-name="Path 11"
							d="M249.864,244.2a11.125,11.125,0,0,1-3.133-.461l.636,1.225,2.113-.264Z"
							transform="translate(-113.283 -53)"
							fill="#fff"
						/>
						<path
							id="Path_12"
							data-name="Path 12"
							d="M248.555,253.288a11.8,11.8,0,0,1-3.355-.561l1.914-.558,1.891.522Z"
							transform="translate(-112.048 -59.798)"
							fill="#fff"
						/>
						<path
							id="Path_13"
							data-name="Path 13"
							d="M264.209,228.225h-.432l.043-.651h1.118Z"
							transform="translate(-127.027 -39.967)"
							fill="#fff"
						/>
						<path
							id="Path_14"
							data-name="Path 14"
							d="M316.961,214.415l.08-1.531h-.756l-.252,1.225Z"
							transform="translate(-169.163 -28.121)"
							fill="#fff"
						/>
						<path
							id="Path_15"
							data-name="Path 15"
							d="M113.032,273.868l8.761-.038.391-3.595-10.121.051h0l-1.263.006c-3.66.285-3.982,4.284-3.982,4.284l-.576,12.528,4.937.026.293-5.961,9.59-.049.22-3.564-9.664.059s.012-1.047.132-2.222A1.666,1.666,0,0,1,113.032,273.868Z"
							transform="translate(0 -74.365)"
							fill="#fff"
						/>
						<g id="Group_7843" data-name="Group 7843" transform="translate(122.55 195.87)">
							<path
								id="Path_16"
								data-name="Path 16"
								d="M206.341,270.235l-.926,9.345c-.527,5.319-1.391,7.68-8.032,7.68-5.625,0-7.351-2.46-6.838-7.63l.931-9.4h4.883l-.953,9.619c-.3,2.983-.019,3.6,2.143,3.6,2.081,0,2.862-.692,3.15-3.6l.953-9.619Z"
								transform="translate(-190.459 -270.235)"
								fill="#fff"
							/>
						</g>
						<path
							id="Path_17"
							data-name="Path 17"
							d="M283.754,270.283l-.5,4.951a35.323,35.323,0,0,0-.352,4.964c-.509-1.257-1.1-2.343-1.721-3.675l-2.912-6.239h-4.5l-1.705,17.025h4.118l.707-5.128c.185-1.846.415-3.523.579-5.109.542,1.269,1.161,2.532,1.67,3.67l2.819,5.57h0a2.047,2.047,0,0,0,2.012,1.2,2.41,2.41,0,0,0,2.438-2.244l1.457-14.987Z"
							transform="translate(-133.715 -74.404)"
							fill="#fff"
						/>
						<path
							id="Path_18"
							data-name="Path 18"
							d="M355.734,278.9a2.43,2.43,0,0,0-1.24,1.878l-.41,4.563a1.944,1.944,0,0,0,1.955,2.174h9.607a2.415,2.415,0,0,0,2.346-2.174l.411-4.563a1.967,1.967,0,0,0-.9-1.878,2.43,2.43,0,0,0,1.24-1.878l.411-4.563a1.945,1.945,0,0,0-1.955-2.174h-9.607a2.415,2.415,0,0,0-2.347,2.174l-.411,4.563A1.967,1.967,0,0,0,355.734,278.9Zm2.632,2.255a1.013,1.013,0,0,1,1.021-.868H363.6a.816.816,0,0,1,.865.868l-.164,1.821a1.013,1.013,0,0,1-1.021.868h-4.212a.816.816,0,0,1-.865-.868Zm.579-6.436a1.013,1.013,0,0,1,1.021-.868h4.212a.816.816,0,0,1,.865.868l-.164,1.821a1.013,1.013,0,0,1-1.021.868h-4.212a.816.816,0,0,1-.865-.868Z"
							transform="translate(-199.836 -74.404)"
							fill="#fff"
						/>
						<path
							id="Path_19"
							data-name="Path 19"
							d="M435.081,278.9a2.43,2.43,0,0,0-1.24,1.878l-.41,4.563a1.944,1.944,0,0,0,1.955,2.174h9.607a2.415,2.415,0,0,0,2.346-2.174l.41-4.563a1.967,1.967,0,0,0-.9-1.878,2.43,2.43,0,0,0,1.24-1.878l.411-4.563a1.945,1.945,0,0,0-1.955-2.174h-9.607a2.415,2.415,0,0,0-2.346,2.174l-.411,4.563A1.967,1.967,0,0,0,435.081,278.9Zm2.632,2.255a1.013,1.013,0,0,1,1.021-.868h4.212a.816.816,0,0,1,.865.868l-.164,1.821a1.013,1.013,0,0,1-1.021.868h-4.212a.816.816,0,0,1-.865-.868Zm.579-6.436a1.013,1.013,0,0,1,1.021-.868h4.212a.816.816,0,0,1,.865.868l-.164,1.821a1.013,1.013,0,0,1-1.021.868h-4.212a.816.816,0,0,1-.864-.868Z"
							transform="translate(-263.816 -74.404)"
							fill="#fff"
						/>
					</g>
				</svg>
			);
		default:
			return null;
	}
};

const SVGIcon = ({ name = '', fill = '', width = '', height = '' }) => getSvg(name, fill, width, height);

export default SVGIcon;