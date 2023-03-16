const AccessTokenCard = ({ accessTokenExists }: any) => {
  return (
    <div className="relative flex items-center bg-white">
      <p>Access Token</p>
      <div
        className={`ml-2 flex h-8 w-8 items-center justify-center rounded-full border text-white ${
          accessTokenExists ? "bg-emerald-400" : "bg-red-400"
        }`}
      >
        {accessTokenExists ? <span>&#10003;</span> : <span>&#x2715;</span>}
      </div>
    </div>
  );
};

export default AccessTokenCard;
