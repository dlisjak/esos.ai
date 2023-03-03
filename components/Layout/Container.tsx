const Container = ({ className = '', dark = false, children }) => {
	return (
		<div
			className={`w-full ${!dark ? 'bg-white' : 'bg-[#fafafa]'} ${className}`}
		>
			<div className="container py-4 max-w-screen-lg mx-auto px-4">
				{children}
			</div>
		</div>
	);
};

export default Container;
