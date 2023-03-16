const AddNewButton = ({ onClick, light = false, children }: any) => {
  return (
    <button
      onClick={onClick}
      className={`${
        light
          ? "border-slate-300 bg-white text-slate-600 hover:border-black hover:text-black"
          : ""
      } text-md tracking-wide
      ${
        !light ? "border-black bg-black text-white" : ""
      } rounded border px-4 py-1 transition-all duration-200 ease-in-out hover:bg-white hover:text-black`}
    >
      {children}
    </button>
  );
};

export default AddNewButton;
