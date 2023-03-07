import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/router";

import Layout from "@/components/app/Layout";
import LoadingDots from "@/components/app/loading-dots";
import Header from "@/components/Layout/Header";
import Container from "@/components/Layout/Container";
import Modal from "@/components/Modal";
import ContainerLoader from "@/components/app/ContainerLoader";

import type { Prompt } from "@prisma/client";
import { usePrompt } from "@/lib/queries";
import { HttpMethod } from "@/types";

export default function Prompt() {
  const router = useRouter();
  const { promptId } = router.query;
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [promptName, setPromptName] = useState("");
  const [promptDescription, setPromptDescription] = useState("");
  const [promptCommand, setPromptCommand] = useState("");
  const [promptHint, setPromptHint] = useState("");
  const [promptVariables, setPromptVariables] = useState("");
  const [promptVariablesError, setPromptVariablesError] = useState(false);
  const [promptOutput, setPromptOutput] = useState("");

  const { prompt, isLoading, mutatePrompt } = usePrompt(promptId);

  useEffect(() => {
    setPromptName(prompt?.name ?? "");
    setPromptDescription(prompt?.description ?? "");
    setPromptCommand(prompt?.command ?? "");
    setPromptHint(prompt?.hint ?? "");
  }, [prompt]);

  async function save(exit = false) {
    setSaving(true);

    try {
      const res = await fetch(`/api/prompt?promptId=${promptId}`, {
        method: HttpMethod.PUT,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: promptName,
          description: promptDescription,
          command: promptCommand,
          hint: promptHint,
        }),
      });

      if (res.ok) {
        mutatePrompt();
        if (exit) {
          router.push("/prompts");
        }
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  async function test() {
    setPromptVariablesError(false);
    if (promptHint && !promptVariables) {
      return setPromptVariablesError(true);
    }
    setTesting(true);
    const regex = new RegExp(/\[(.*?)\]/g);

    const command = promptCommand.replaceAll(regex, promptVariables);

    try {
      const res = await fetch(`/api/prompt/test?promptId=${promptId}`, {
        method: HttpMethod.POST,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          command,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPromptOutput(data.message);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setTesting(false);
    }
  }

  async function deletePrompt() {
    setDeleting(true);

    try {
      const res = await fetch(`/api/prompt?promptId=${promptId}`, {
        method: HttpMethod.DELETE,
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (res.ok) {
        mutatePrompt();
        router.push("/prompts");
        toast.success("Prompt deleted");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Layout>
      <Header>
        <div className="flex items-center justify-between">
          <h1 className="text-4xl">{prompt?.name}</h1>
          <button
            onClick={async () => {
              await save(true);
            }}
            title={
              saving
                ? "Category must have a title, description, and a slug to be published."
                : "Publish"
            }
            disabled={saving}
            className={`ml-4 ${
              saving
                ? "cursor-not-allowed border-gray-300 bg-gray-300"
                : "border-black bg-black hover:bg-white hover:text-black"
            } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
          >
            {saving ? <LoadingDots /> : "Save & Exit  →"}
          </button>
        </div>
      </Header>
      {isLoading ? (
        <ContainerLoader />
      ) : (
        <>
          <Container className="pb-24">
            <div className="grid-x-4 grid grid-cols-2 py-4">
              <div className="flex flex-col pr-4">
                <div className="flex flex-col">
                  <label>Prompt Name</label>
                  <input
                    className="rounded"
                    value={promptName || prompt?.name || ""}
                    onChange={(e) => setPromptName(e.target.value)}
                    type="text"
                  />
                </div>
                <div className="mt-4 flex flex-col">
                  <label>Prompt Description</label>
                  <textarea
                    className="rounded"
                    value={promptDescription || prompt?.description || ""}
                    onChange={(e) => setPromptDescription(e.target.value)}
                    rows={2}
                  />
                  <div className="mt-4 flex flex-col">
                    <label>Prompt Hint</label>
                    <textarea
                      className="rounded"
                      value={promptHint || prompt?.hint || ""}
                      onChange={(e) => setPromptHint(e.target.value)}
                      rows={1}
                    />
                  </div>
                  <div className="mt-4 flex flex-col">
                    <label>Prompt Command</label>
                    <textarea
                      className="rounded"
                      value={promptCommand || prompt?.command || ""}
                      onChange={(e) => setPromptCommand(e.target.value)}
                      rows={16}
                    />
                  </div>
                </div>
              </div>
              <div className="flex flex-col pl-4">
                <div className="flex flex-col">
                  <label>Prompt Input:</label>
                  <input
                    style={{
                      border: promptVariablesError ? "1px solid red" : "",
                    }}
                    className="rounded"
                    onChange={(e) => setPromptVariables(e.target.value)}
                    value={promptVariables}
                    placeholder={promptHint}
                    type="text"
                  />
                </div>

                <div className="mt-4 flex flex-col">
                  <label>Output:</label>
                  <textarea
                    className="rounded"
                    value={promptOutput}
                    rows={21}
                    readOnly
                  />
                </div>
              </div>
            </div>
            <div className="mt-4 w-full space-y-2">
              <h2 className="text-2xl">Delete Prompt</h2>
              <p>
                Permanently delete the &quot;{prompt?.name}&quot; prompt and all
                This action is not reversible – please continue with caution.
              </p>
              <button
                onClick={() => {
                  setShowDeleteModal(true);
                }}
                className="max-w-max rounded border border-solid border-red-500 bg-red-500 px-5 py-3  text-white transition-all duration-150 ease-in-out hover:bg-white hover:text-red-500 focus:outline-none"
              >
                Delete Prompt
              </button>
            </div>
          </Container>
          <footer className="z-5 fixed inset-x-0 bottom-0 h-20 border-t border-solid border-gray-500 bg-white">
            <div className="mx-auto flex h-full max-w-screen-lg items-center justify-end">
              <button
                onClick={async () => {
                  await save();
                }}
                disabled={saving}
                className={`ml-auto ${
                  saving
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {saving ? <LoadingDots /> : "Save"}
              </button>
              <button
                onClick={async () => {
                  await test();
                }}
                disabled={testing}
                className={`ml-4 ${
                  testing
                    ? "cursor-not-allowed border-gray-300 bg-gray-300"
                    : "border-black bg-black hover:bg-white hover:text-black"
                } mx-2 h-12 w-32 border-2 text-lg text-white transition-all duration-150 ease-in-out focus:outline-none`}
              >
                {testing ? <LoadingDots /> : "Output"}
              </button>
            </div>
          </footer>
          <Modal showModal={showDeleteModal} setShowModal={setShowDeleteModal}>
            <form
              onSubmit={async (event) => {
                event.preventDefault();
                await deletePrompt();
              }}
              className="inline-block w-full max-w-md overflow-hidden rounded bg-white pt-8 text-center align-middle shadow-xl transition-all"
            >
              <h2 className=" mb-6 text-2xl">Delete Prompt</h2>
              <div className="mx-auto grid w-5/6 gap-y-4">
                <p className="mb-3 text-gray-600">
                  Are you sure you want to delete your prompt:{" "}
                  <b>{prompt?.name}</b>? This action is not reversible. Type in{" "}
                  <span className="bg-slate-200 px-1">delete</span> to confirm.
                </p>
                <div className="flex-start flex items-center overflow-hidden rounded border border-gray-700">
                  <input
                    className="w-full rounded-none rounded-r-lg border-none bg-white px-5 py-3 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-0"
                    type="text"
                    name="name"
                    placeholder="delete"
                    pattern="delete"
                  />
                </div>
              </div>
              <div className="mt-10 flex w-full items-center justify-between">
                <button
                  type="button"
                  className="w-full rounded-bl border-t border-gray-300 px-5 py-5 text-sm text-gray-400 transition-all duration-150 ease-in-out hover:text-black focus:outline-none focus:ring-0"
                  onClick={() => setShowDeleteModal(false)}
                >
                  CANCEL
                </button>

                <button
                  type="submit"
                  disabled={deleting}
                  className={`${
                    deleting
                      ? "cursor-not-allowed bg-gray-50 text-gray-400"
                      : "bg-white text-gray-600 hover:text-black"
                  } w-full rounded-br border-t border-l border-gray-300 px-5 py-5 text-sm transition-all duration-150 ease-in-out focus:outline-none focus:ring-0`}
                >
                  {deleting ? <LoadingDots /> : "DELETE PROMPT"}
                </button>
              </div>
            </form>
          </Modal>
        </>
      )}
    </Layout>
  );
}
