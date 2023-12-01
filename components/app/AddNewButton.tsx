import { useUser } from "@/lib/queries";

const AddNewButton = ({ className, onClick, light = false, children }: any) => {
  const { user, isLoading } = useUser();

  if (isLoading) return <div />;

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
      } rounded border px-4 py-1 transition-all duration-200 ease-in-out hover:bg-white hover:text-black ${className}`}
      disabled={!user.isSubscribed}
    >
      {children}
    </button>
  );
};

export default AddNewButton;
