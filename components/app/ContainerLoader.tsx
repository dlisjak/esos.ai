export default function ContainerLoader() {
  const circleCommonClasses = "h-4 w-4 bg-black rounded-full";

  return (
    <div className="z-50 my-12 flex h-auto">
      <div className="m-auto flex">
        <div className={`${circleCommonClasses} mr-2 animate-bounce`}></div>
        <div className={`${circleCommonClasses} animate-bounce200 mr-2`}></div>
        <div className={`${circleCommonClasses} animate-bounce400`}></div>
      </div>
    </div>
  );
}
