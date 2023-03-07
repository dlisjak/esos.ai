export default function Loader() {
	const circleCommonClasses = 'h-4 w-4 bg-black rounded-full';

	return (
		<div className="flex my-12 h-auto">
			<div className="flex m-auto">
				<div className={`${circleCommonClasses} mr-2 animate-bounce`}></div>
				<div className={`${circleCommonClasses} mr-2 animate-bounce200`}></div>
				<div className={`${circleCommonClasses} animate-bounce400`}></div>
			</div>
		</div>
	);
}
