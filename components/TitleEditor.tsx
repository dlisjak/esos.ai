import ReactTextareaAutosize from "react-textarea-autosize";
import getSlug from "speakingurl";

const TitleEditor = ({ value, setValue, slug, setSlug }: any) => {
  const generateSlug = (e: any) => {
    if (slug.length) return;
    const title = value;

    setSlug(getSlug(title));
  };

  const setTitle = (e: any) => {
    const title = e.target.value;

    setValue(title);
  };

  return (
    <>
      <div className="w-full">
        <h2 className="mr-auto text-xl">
          Title<span className="text-red-600">*</span>
        </h2>
        <ReactTextareaAutosize
          name="title"
          onInput={setTitle}
          className="w-full resize-none border-t-0 border-l-0 border-r-0 border-b px-2 py-2 text-4xl text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-0"
          placeholder="Untitled Category"
          value={value}
          onBlur={generateSlug}
        />
      </div>
    </>
  );
};

export default TitleEditor;
