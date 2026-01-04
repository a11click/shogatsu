import { useState, useCallback, useRef, useEffect } from "react";
import { PrimaryButton } from "../button";
import { CheckIcon, Square2StackIcon } from "@heroicons/react/24/outline";
import { Heading } from "../heading";

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
    <>
      <Heading className="mb-6">プレイヤー招待</Heading>

      <p className="mb-4 rounded-sm bg-gray-50 p-2 select-all">{url}</p>
      <p className="mb-8 text-center font-bold text-gray-700">
        ゲストの参加を待っています
      </p>
      <CopyButton url={url} />
    </>
  );
};

export default PlayerJoinLink;
