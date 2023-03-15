const Container = ({ className = "", dark = false, children }) => {
  return (
    <div
      className={`w-full ${!dark ? "bg-white" : "bg-[#fafafa]"} ${className}`}
    >
      <div className="container mx-auto max-w-screen-xl py-4">{children}</div>
    </div>
  );
};

export default Container;
