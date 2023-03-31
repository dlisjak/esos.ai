import { useState } from "react";
import { toast } from "react-hot-toast";
import ReactTextareaAutosize from "react-textarea-autosize";
import getSlug from "speakingurl";

import Modal from "./Modal";
import LoadingDots from "./app/loading-dots";

import { useCredits, usePrompts } from "@/lib/queries";
import { HttpMethod } from "@/types";

const TitleEditor = ({ value, setValue, slug, setSlug }: any) => {
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [generateInput, setGenerateInput] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [promptVariable, setPromptVariable] = useState("");
  const { prompts } = usePrompts();
  const { mutateCredits } = useCredits();

  const handleGenerate = async () => {
    if (!generateInput || !selectedPrompt) return;
    setGeneratingResponse(true);

    try {
      const response = await fetch(`/api/prompt/generate`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          promptVariable,
          promptId: selectedPrompt,
        }),
      });

      if (response.ok) {
        const body = await response.json();

        if (generateInput === "description") {
          setValue(body);
        }
        toast.success("Prompt executed successfully");
      }
    } catch (e) {
      console.error(e);
    } finally {
      mutateCredits();
      setGeneratingResponse(false);
      setShowGenerateModal(false);
    }
  };

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
        <div className="mb-4 flex w-full justify-between">
          <div className="flex">
            <select
              onChange={(e) => {
                setSelectedPrompt(e.target.value);
                setGenerateInput("description");
              }}
              value={selectedPrompt}
            >
              <option value="" disabled>
                Select a Prompt
              </option>
              {prompts?.map((prompt: any) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </select>
            <button
              className="flex items-center whitespace-nowrap border border-black bg-black px-3 py-1 tracking-wide text-white duration-200 hover:border hover:bg-white hover:text-black"
              onClick={() => setShowGenerateModal(true)}
            >
              Generate
            </button>
          </div>
        </div>
      </div>
      <Modal showModal={showGenerateModal} setShowModal={setShowGenerateModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleGenerate();
          }}
          className="inline-block w-full max-w-xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Use Prompt</h2>
            <div className="flex-start flex flex-col items-center space-y-4">
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Name
                </label>
                <input
                  id="name"
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="name"
                  required
                  value={
                    prompts?.find((prompt: any) => prompt.id === selectedPrompt)
                      ?.name || ""
                  }
                  readOnly
                  type="text"
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Command
                </label>
                <textarea
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="command"
                  required
                  value={
                    prompts?.find((prompt: any) => prompt.id === selectedPrompt)
                      ?.command || ""
                  }
                  readOnly
                  rows={8}
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Your Input
                </label>
                <input
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="hint"
                  required
                  placeholder={
                    prompts?.find((prompt: any) => prompt.id === selectedPrompt)
                      ?.hint || ""
                  }
                  onChange={(e) => setPromptVariable(e.target.value)}
                  type="text"
                />
              </div>
            </div>
          </div>
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-200 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => {
                setShowGenerateModal(false);
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={generatingResponse}
              className={`${
                generatingResponse
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-0`}
            >
              {generatingResponse ? <LoadingDots /> : "GENERATE RESPONSE"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TitleEditor;
