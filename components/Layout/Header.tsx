import Container from './Container';

const Header = ({ className = '', children }) => {
	return (
		<div className={`py-6 bg-white border-b px-4 ${className}`}>
			<Container className="py-4">{children}</Container>
		</div>
	);
};

export default Header;
