import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import rehypeSanitize from "rehype-sanitize";
import { useS3Upload } from "next-s3-upload";
import { GrammarlyEditorPlugin } from '@grammarly/editor-sdk-react'
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";

import Modal from "../Modal";
import LoadingDots from "../app/loading-dots";

import { useCredits, usePrompts, useUser } from "@/lib/queries";
import { PER_GENERATE } from "@/lib/consts/credits";
import onImagePasted from './onImagePasted';
import { HttpMethod } from "@/types";

import "../../node_modules/@uiw/react-md-editor/markdown-editor.css";
import "../../node_modules/@uiw/react-markdown-preview/markdown.css";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

const regex = new RegExp(/\[(.*?)\]/g);

const TextEditor = ({ content, setContent, dataId }) => {
  const router = useRouter();
  const [selectedPrompt, setSelectedPrompt] = useState("");
  const [promptCommand, setPromptCommand] = useState("");
  const [promptVariables, setPromptVariables] = useState(null)
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [generatingResponse, setGeneratingResponse] = useState(false);
  const [previewingPrompt, setPreviewingPrompt] = useState(false);
  const { uploadToS3 } = useS3Upload();
  const { prompts } = usePrompts();
  const { mutateCredits } = useCredits();
  const { data: session } = useSession();

  const { subdomain } = router.query;
  const { name: sessionUser } = session?.user;
  const { user } = useUser();

  useEffect(() => {
    const match = promptCommand?.match(regex);
    if (!match || !match.length) return setPromptVariables(null);

    setPromptVariables(
      match?.map((variable) => ({ name: variable, value: variable }))
    );
  }, [promptCommand]);

  const handleGenerateButton = () => {
    setPreviewingPrompt(false)
    if (selectedPrompt) {
      const prompt = prompts?.find((prompt) => prompt.id === selectedPrompt)?.command;
      setPromptCommand(prompt);
    }
    setShowGenerateModal(true)
  }

  const handleGenerate = async () => {
    if (!promptCommand) return;
    setGeneratingResponse(true);
    setContent("");

    try {
      const userResponse = await fetch("/api/user", {
        method: HttpMethod.GET,
        headers: {
          "Content-Type": "application/json",
        },
      })

      const user = await userResponse.json();

      const response = await fetch(`/api/stream`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          prompt: promptCommand,
          useGPT_4: user.isSubscribed ? true : false,
          openAIKey: user.openAIKey,
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
      if (!user.openAIKey || !user.openAIKey.length) {
        const decrementResponse = await fetch(`/api/decrement`, {
          method: HttpMethod.PUT,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contenteLength: content.length
          }),
        });

        if (decrementResponse.ok) {
          mutateCredits();
        }
      }
      setGeneratingResponse(false);
    }
  };

  // const checkAIContent = async () => {
  //   if (!value) return;
  //   setCheckingForAI(true);

  //   try {
  //     const response = await fetch(`/api/content`, {
  //       method: HttpMethod.POST,
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({
  //         input: value,
  //       }),
  //     });

  //     if (response.ok) {
  //       const body = await response.json();
  //       setAiDetected(body);
  //       toast.success("Content analyzed successfully");
  //     }
  //   } catch (e) {
  //     console.error(e);
  //   } finally {
  //     mutateCredits();
  //     setCheckingForAI(false);
  //   }
  // }

  // const handleRemoveBrokenLinks = async () => {
  //   setRemovingBrokenLinks(true);
  //   const brokenLinks = await extractBrokenLinks(content);
  //   const newMessage = removeBrokenLinks(content, brokenLinks);

  //   if (newMessage) {
  //     setContent(newMessage);
  //   }

  //   setRemovingBrokenLinks(false)
  // }

  const handleChangeVariableValue = (variable, value) => {
    if (!value.length) return;

    const newCommand = promptCommand.replaceAll(variable.value, value)
    setPromptCommand(newCommand);
  }

  const handlePreviewPrompt = () => {
    setPreviewingPrompt(true);
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
              className: "prose lg:prose-lg mx-auto max-w-screen-xl prose-a:text-blue-600 hover:prose-a:text-blue-500",
              rehypePlugins: [[rehypeSanitize]],
            }}
            onPaste={async (event) => {
              await onImagePasted(event.clipboardData, sessionUser, subdomain, dataId, uploadToS3, setContent);
            }}
            onDrop={async (event) => {
              await onImagePasted(event.dataTransfer, sessionUser, subdomain, dataId, uploadToS3, setContent);
            }}
          />
        </GrammarlyEditorPlugin>
        <div className="mb-4 flex w-full justify-between pt-2">
          <div className="flex">
            <select
              onChange={(e) => {
                setSelectedPrompt(e.target.value);
              }}
              value={selectedPrompt}
            >
              <option value="blank">
                Blank Prompt
              </option>
              {prompts?.map((prompt) => (
                <option key={prompt.id} value={prompt.id}>
                  {prompt.name}
                </option>
              ))}
            </select>
            <button
              className="flex items-center whitespace-nowrap border border-black bg-black px-3 py-1 tracking-wide text-white duration-200 hover:border hover:bg-white hover:text-black"
              onClick={() => handleGenerateButton(true)}
            >
              Generate
            </button>
          </div>
        </div>
      </div>
      <Modal showModal={showGenerateModal} setModal={setShowGenerateModal}>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            handleGenerate();
          }}
          className="inline-block w-full max-w-2xl overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Use Prompt</h2>
            <div className="flex-start flex flex-col items-center space-y-4">
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Command
                </label>
                {!previewingPrompt ? (
                  <textarea
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="command"
                    onChange={(e) => setPromptCommand(e.target.value)}
                    value={promptCommand}
                    required
                    rows={12}
                  />
                ) : (
                  <textarea
                    className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                    name="command"
                    value={promptCommand}
                    required
                    readOnly
                    rows={16}
                  />
                )}
              </div>
              {!previewingPrompt && (
                <div className="flex w-full flex-col items-start">
                  <div className="flex w-full justify-between">
                    <label className="mb-1 text-start" htmlFor="name">
                      Prompt Variables
                    </label>
                  </div>
                  <div className="flex flex-wrap">
                    {promptVariables?.map((variable, i) => (
                      <div className="flex flex-col" key={`${variable.name}--${i}`}>
                        <label className="text-xs">{variable.name}</label>
                        <textarea
                          className="my-1 mx-1 w-full rounded bg-white px-2 py-1 text-sm text-gray-700 placeholder-gray-400"
                          name="hint"
                          placeholder={variable.name}
                          onBlur={(e) => handleChangeVariableValue(variable, e.target.value)}
                          type="text"
                          rows={1}
                          required
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-auto pt-4 text-sm italic">
                The cost of generating content is{" "}
                <b>1 credit per {PER_GENERATE} words</b>
              </div>
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

            {previewingPrompt && (
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
            )}
            {!previewingPrompt && (<button
              type="button"
              onClick={handlePreviewPrompt}
              className="bg-white text-gray-600 hover:text-black w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-0">
              PREVIEW PROMPT
            </button>)}
          </div>
        </form>
      </Modal>
    </>
  );
};

export default TextEditor;
