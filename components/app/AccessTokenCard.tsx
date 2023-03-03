const AccessTokenCard = ({ accessTokenExists }) => {
	return (
		<div className="relative bg-white flex items-center">
			<p>Access Token</p>
			<div
				className={`flex justify-center items-center rounded-full border text-white ml-2 w-8 h-8 ${
					accessTokenExists ? 'bg-emerald-400' : 'bg-red-400'
				}`}
			>
				{accessTokenExists ? <span>&#10003;</span> : <span>&#x2715;</span>}
			</div>
		</div>
	);
};

export default AccessTokenCard;
