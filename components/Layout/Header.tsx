import Container from "./Container";

const Header = ({ className = "", children }: any) => {
  return (
    <div className={`border-b bg-white py-6 ${className}`}>
      <Container className="py-4">{children}</Container>
    </div>
  );
};

export default Header;
