const AddNewButton = ({ onClick, children }) => {
	return (
		<button
			onClick={onClick}
			className="text-md tracking-wide text-white rounded bg-black border border-black px-4 py-2 transition-all ease-in-out duration-200 hover:bg-white hover:text-black"
		>
			{children}
		</button>
	);
};

export default AddNewButton;
