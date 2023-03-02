import Container from './Container';

const Header = ({ className = '', children }) => {
	return (
		<div className={`py-8 bg-white border-b ${className}`}>
			<Container>{children}</Container>
		</div>
	);
};

export default Header;
