const Container = ({
  className = "",
  innerContainerClassNames = "",
  dark = false,
  children,
}: any) => {
  return (
    <div
      className={`w-full ${!dark ? "bg-white" : "bg-gray-100"} ${className}`}
    >
      <div
        className={`container mx-auto max-w-screen-xl p-4 ${innerContainerClassNames}`}
      >
        {children}
      </div>
    </div>
  );
};

export default Container;
