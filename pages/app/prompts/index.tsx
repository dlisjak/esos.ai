import { useRef, useState } from "react";
import { toast } from "react-hot-toast";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Modal from "@/components/Modal";

import { HttpMethod } from "@/types";
import PromptCard from "@/components/app/PromptCard";
import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";
import AddNewButton from "@/components/app/AddNewButton";
import { useCredits, usePrompts } from "@/lib/queries";
import ContainerLoader from "@/components/app/ContainerLoader";

export default function Prompts() {
  const [showCreatePromptModal, setShowCreatePromptModal] =
    useState<boolean>(false);
  const [creatingPrompt, setCreatingPrompt] = useState(false);
  const [testingPrompt, setTestingPrompt] = useState(false);
  const promptNameRef = useRef<HTMLInputElement | null>(null);
  const promptDescriptionRef = useRef<HTMLTextAreaElement | null>(null);
  const promptCommandRef = useRef<HTMLTextAreaElement | null>(null);
  const promptHintRef = useRef<HTMLInputElement | null>(null);

  const { prompts, isLoading, mutatePrompts } = usePrompts();
  const { mutateCredits } = useCredits();

  async function testPrompt(promptId: any, command: any) {
    setTestingPrompt(true);
    const data = { command };

    try {
      const res = await fetch(`/api/prompt/test?promptId=${promptId}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        mutatePrompts();
        toast.success(`Prompt Works!`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      mutateCredits();
      setTestingPrompt(false);
    }
  }

  async function createPrompt() {
    setCreatingPrompt(true);
    if (!promptNameRef.current || !promptCommandRef.current) return;
    const name = promptNameRef.current.value;
    const command = promptCommandRef.current.value;

    let description = "";
    if (promptDescriptionRef.current) {
      description = promptDescriptionRef.current.value;
    }
    let hint = "";
    if (promptHintRef.current) {
      hint = promptHintRef.current.value;
    }

    const data = { name, description, command, hint };

    try {
      const res = await fetch(`/api/prompt`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        mutatePrompts();
        toast.success("Prompt Created");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setCreatingPrompt(false);
      setShowCreatePromptModal(false);
    }
  }

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">Prompts</h1>
          <div className="flex space-x-4">
            <AddNewButton onClick={() => setShowCreatePromptModal(true)}>
              Add Prompt <span className="ml-2">＋</span>
            </AddNewButton>
          </div>
        </div>
      </Header>
      <Container dark>
        <h2 className="mb-4 text-xl">
          Using a prompt to create content or testing a prompt will consume 1
          credit
        </h2>
        {isLoading ? (
          <ContainerLoader />
        ) : prompts && prompts.length > 0 ? (
          <div className="grid grid-cols-3 gap-x-4 gap-y-4">
            {prompts?.map((prompt: any) => (
              <PromptCard
                prompt={prompt}
                testOnClick={testPrompt}
                testingPrompt={testingPrompt}
                key={prompt.id}
              />
            ))}
          </div>
        ) : (
          <>
            <div className="text-center">
              <p className="my-4 text-2xl text-gray-600">
                No Prompts added. Click &quot;Add Prompt&quot; to add one.
              </p>
            </div>
          </>
        )}
      </Container>
      <Modal
        showModal={showCreatePromptModal}
        setShowModal={setShowCreatePromptModal}
      >
        <form
          onSubmit={(event) => {
            event.preventDefault();
            createPrompt();
          }}
          className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
        >
          <div className="px-8">
            <h2 className="mb-6 text-2xl">Create a New Prompt</h2>
            <div className="flex-start flex flex-col items-center space-y-4">
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="name"
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="name"
                  required
                  placeholder="Awesome Writer for Blog Post"
                  ref={promptNameRef}
                  type="text"
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Description
                </label>
                <textarea
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="description"
                  placeholder="To Help Write a Long Form Blog Post in the Style of..."
                  ref={promptDescriptionRef}
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Command <span className="text-red-500">*</span>
                </label>
                <textarea
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="command"
                  required
                  placeholder="Prompt command including placeholders such as [KEYWORD] or [TITLE], these will be replaced automatically"
                  rows={8}
                  ref={promptCommandRef}
                />
              </div>
              <div className="flex w-full flex-col">
                <label className="mb-1 text-start" htmlFor="name">
                  Prompt Hint
                </label>
                <input
                  className="w-full rounded bg-white px-5 py-3 text-gray-700 placeholder-gray-400"
                  name="hint"
                  required
                  placeholder="[TITLE] or [KEYWORD]"
                  type="text"
                  ref={promptHintRef}
                />
              </div>
            </div>
          </div>
          <div className="mt-10 flex w-full items-center justify-between">
            <button
              type="button"
              className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-600 transition-all duration-200 ease-in-out hover:text-black focus:outline-none focus:ring-0"
              onClick={() => {
                setShowCreatePromptModal(false);
              }}
            >
              CANCEL
            </button>

            <button
              type="submit"
              disabled={creatingPrompt}
              className={`${
                creatingPrompt
                  ? "cursor-not-allowed bg-gray-50 text-gray-400"
                  : "bg-white text-gray-600 hover:text-black"
              } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-200 ease-in-out focus:outline-none focus:ring-0`}
            >
              {creatingPrompt ? <LoadingDots /> : "CREATE PROMPT"}
            </button>
          </div>
        </form>
      </Modal>
    </Layout>
  );
}
