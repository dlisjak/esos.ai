import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import rehypeSanitize from "rehype-sanitize";
import { useS3Upload } from "next-s3-upload";
import { GrammarlyEditorPlugin } from '@grammarly/editor-sdk-react'

import Modal from "../Modal";
import LoadingDots from "../app/loading-dots";

import { useCredits, usePrompts } from "@/lib/queries";
import { HttpMethod } from "@/types";
import onImagePasted from './onImagePasted';

import "../../node_modules/@uiw/react-md-editor/markdown-editor.css";
import "../../node_modules/@uiw/react-markdown-preview/markdown.css";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { PER_GENERATE } from "@/lib/consts/credits";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const TextEditor = ({ content, setContent, dataId }) => {
  const router = useRouter();
  const [aiDetected, setAiDetected] = useState(null);
  const [checkingForAI, setCheckingForAI] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [generateInput, setGenerateInput] = useState("");
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [useGPT_4, setUseGPT_4] = useState(true);
  const [promptVariable, setPromptVariable] = useState("");
  const { uploadToS3 } = useS3Upload();
  const { prompts } = usePrompts();
  const { mutateCredits } = useCredits();
  const { data: session } = useSession();

  const { subdomain } = router.query;
  const { name: sessionUser } = session?.user;

  const handleGenerate = async () => {
    if (!generateInput || !selectedPrompt) return;
    setGeneratingResponse(true);
    setContent("");

    try {
      let prompt;
      const promptResponse = await fetch(`/api/prompt?promptId=${selectedPrompt}`, {
        method: HttpMethod.GET,
      })

      if (promptResponse.ok) {
        prompt = await promptResponse.json()
      }

      if (!prompt) {
        return toast.error("Prompt does not exist");
      }
      if (!prompt?.command) {
        return toast.error("Prompt has no command");
      }
      const regex = new RegExp(/\[(.*?)\]/g);
      const command = prompt.command.replaceAll(regex, promptVariable);

      const response = await fetch(`/api/stream`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: command,
        }),
      });

      if (!response.ok) {
        return toast.error(response.statusText);
      }

      setShowGenerateModal(false);

      const data = response.body;
      if (!data) {
        return;
      }

      const reader = data.getReader();
      const decoder = new TextDecoder();
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value);
        setContent((prev) => prev + chunkValue);
      }
      toast.success("Generated content")
    } catch (e) {
      console.error(e);
    } finally {
      mutateCredits();
      setGeneratingResponse(false);
    }
  };

  const checkAIContent = async () => {
    if (!value) return;
    setCheckingForAI(true);

    try {
      const response = await fetch(`/api/content`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          input: value,
        }),
      });

      if (response.ok) {
        const body = await response.json();
        setAiDetected(body);
        toast.success("Content analyzed successfully");
      }
    } catch (e) {
      console.error(e);
    } finally {
      mutateCredits();
      setCheckingForAI(false);
    }
  }

  return (
    <>
      <div className="w-full">
        <p className="py-1 text-xs italic">Images can be added to content by dragging and dropping</p>
        <GrammarlyEditorPlugin clientId="client_BFSnu3qQymueAZTtFf7Sni">
          <MDEditor
            height={640}
            value={content}
            onChange={setContent}
            textareaProps={{
              placeholder: "Please enter Markdown text",
            }}
            previewOptions={{
              className: "prose lg:prose-xl mx-auto max-w-screen-xl",
              rehypePlugins: [[rehypeSanitize]],
            }}
            onPaste={async (event) => {
              await onImagePasted(event.clipboardData, sessionUser, subdomain, dataId, uploadToS3, setValue);
            }}
            onDrop={async (event) => {
              await onImagePasted(event.dataTransfer, sessionUser, subdomain, dataId, uploadToS3, setValue);
            }}
          />
        </GrammarlyEditorPlugin>
        <div className="mb-4 flex w-full justify-between pt-2">
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
              {prompts?.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </select>
            <button
              className="flex items-center whitespace-nowrap border border-black bg-black px-3 py-1 tracking-wide text-white duration-200 hover:border hover:bg-white hover:text-black"
              disabled={!selectedPrompt}
              onClick={() => setShowGenerateModal(true)}
            >
              Generate
            </button>
          </div>
          <div className="flex">
            {aiDetected && (
              <div className="flex flex-col">
                <div className="px-2">Content is {Math.round(aiDetected[0].score * 100)}% Human generated</div>
              </div>
            )}
            <button
              className={`flex whitespace-nowrap border bg-white items-center px-2 py-1 tracking-wide text-black duration-200 hover:border-black ${checkingForAI
                ? "cursor-not-allowed bg-gray-50 text-gray-400"
                : "bg-white text-gray-600 hover:text-black"
                }`}
              onClick={() => checkAIContent()}
              disabled={checkingForAI}
            >
              Check for AI
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
                    prompts?.find((prompt) => prompt.id === selectedPrompt)
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
                    prompts?.find((prompt) => prompt.id === selectedPrompt)
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
                    prompts?.find((prompt) => prompt.id === selectedPrompt)
                      ?.hint || ""
                  }
                  onChange={(e) => setPromptVariable(e.target.value)}
                  type="text"
                />
              </div>
            </div>
            <div className="mt-auto pt-4 text-sm italic">
              The cost of generating content is{" "}
              <b>1 credit per {PER_GENERATE} words</b>
            </div>
            <div className="w-full mt-4 flex items-center">
              <label className="font-semibold mr-2 hover:cursor-pointer" htmlFor="internalLink">Use Internal Linking</label>
              <input className="hover:cursor-pointer rounded" id="internalLink" type="checkbox" />
            </div>
            <div className="w-full mt-2 pb-2 flex items-center">
              <label className="font-semibold mr-2 hover:cursor-pointer" htmlFor="useGPT4">Use GPT 4</label>
              <input className="hover:cursor-pointer rounded" id="useGPT4" onChange={() => setUseGPT_4(!useGPT_4)} checked={useGPT_4} type="checkbox" />
            </div>
          </div>
          <div className="mt-4 flex w-full items-center justify-between">
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
              className={`${generatingResponse
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

export default TextEditor;
