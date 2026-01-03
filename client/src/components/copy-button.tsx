import { useState, useCallback, useRef, useEffect } from "react";
import { PrimaryButton } from "./button";
import { CheckIcon, Square2StackIcon } from "@heroicons/react/24/outline";

const useCopy = () => {
  const [isCopied, setIsCopied] = useState(false);
  const timerRef = useRef<any>(null);

  const copyToClipboard = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);

      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setIsCopied(true);

      timerRef.current = setTimeout(() => {
        setIsCopied(false);
        timerRef.current = null;
      }, 2000);

      return true;
    } catch (error) {
      console.error("Copy failed", error);
      setIsCopied(false);
      return false;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return { isCopied, copyToClipboard };
};

const CopyButton = ({ url }: { url: string }) => {
  const { isCopied, copyToClipboard } = useCopy();

  return (
    <PrimaryButton onClick={() => copyToClipboard(url)} className="mb-6">
      {isCopied ? (
        <>
          <CheckIcon className="size-6" />
          <span>コピー完了</span>
        </>
      ) : (
        <>
          {" "}
          <Square2StackIcon className="size-6" />
          <span> コピー</span>
        </>
      )}
    </PrimaryButton>
  );
};

const PlayerJoinLink = ({ roomId }: { roomId: string }) => {
  const url = `${window.location.origin}/join/${roomId}`;
  return (
    <section className="">
      <h2 className="text-lg font-bold text-center mb-6 ">プレイヤー招待</h2>

      <p className="bg-gray-50 p-2 rounded-sm mb-4">{url}</p>
      <CopyButton url={url} />

      <p className="text-gray-700 text-center">ゲストの参加を待っています</p>
    </section>
  );
};

export default PlayerJoinLink;
