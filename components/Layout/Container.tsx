const Container = ({ className = '', children }) => {
	return (
		<div className={`container max-w-screen-lg mx-auto px-4 ${className}`}>
			{children}
		</div>
	);
};

export default Container;
