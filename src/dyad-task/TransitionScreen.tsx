import { useEffect } from "react";
import PressKeyPrompt from "../components/PressKeyPrompt";

interface TransitionScreenProps {
  ratingTarget: "self" | "partner";
  onContinue: () => void;
}

function TransitionScreen({ ratingTarget, onContinue }: TransitionScreenProps) {
  useEffect(() => {
    const handleKeyPress = () => {
      onContinue();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [onContinue]);

  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="bg-black border p-8 max-w-2xl mx-auto">
        <h1 className="text-white text-2xl mb-32">
          The next part is concerned with{" "}
          {ratingTarget === "self"
            ? "YOUR FEELINGS "
            : "YOUR PARTNER'S FEELINGS "}
          during the conversation.
        </h1>
        <PressKeyPrompt />
      </div>
    </div>
  );
}

export default TransitionScreen;
