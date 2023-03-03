const AddNewButton = ({ onClick, light = false, children }) => {
	return (
		<button
			onClick={onClick}
			className={`${
				light
					? 'bg-white border-slate-300 text-slate-600 hover:border-black hover:text-black'
					: ''
			} text-md tracking-wide
      ${
				!light ? 'text-white bg-black border-black' : ''
			} rounded border px-4 py-1 transition-all ease-in-out duration-200 hover:bg-white hover:text-black`}
		>
			{children}
		</button>
	);
};

export default AddNewButton;
