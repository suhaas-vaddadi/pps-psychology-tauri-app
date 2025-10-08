import { useState } from "react";
import MatrixQuestion from "../components/MatrixQuestion";
import { ClassifcationTaskProps } from "./PartnerHistory";
import ConfirmationModal from "../components/ConfirmationModal";

export default function Experience({ onContinue }: ClassifcationTaskProps) {
  const [matrixSelections1, setMatrixSelections1] = useState<{
    [rowIndex: number]: number;
  }>({});
  const [matrixSelections2, setMatrixSelections2] = useState<{
    [rowIndex: number]: number;
  }>({});
  const [textInput, setTextInput] = useState("");
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const row_reflective = [
    "How often were you thinking about the fact that your conversation was being video recorded?",
  ];
  const row_comfort = ["How comfortable did you feel during the conversation?"];

  const columns_reflective = [
    "Not at all",
    "",
    "",
    "",
    "",
    "",
    "The entire time",
  ];

  const columns_comfort = [
    "Extremely uncomfortable",
    "",
    "",
    "",
    "",
    "",
    "Extremely comfortable",
  ];

  const handleMatrixSelectionChange1 = (
    rowIndex: number,
    columnIndex: number
  ) => {
    setMatrixSelections1((prev) => ({ ...prev, [rowIndex]: columnIndex }));
  };

  const handleMatrixSelectionChange2 = (
    rowIndex: number,
    columnIndex: number
  ) => {
    setMatrixSelections2((prev) => ({ ...prev, [rowIndex]: columnIndex }));
  };

  const isFormValid = () =>
    Object.keys(matrixSelections1).length === row_reflective.length &&
    Object.keys(matrixSelections2).length === row_comfort.length &&
    textInput.trim() !== "";

  const handleContinue = () => {
    if (isFormValid()) {
      const data = {
        sync: matrixSelections1[0],
        wavelength: matrixSelections2[0],
        text: textInput,
      };
      onContinue?.(data);
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    const data = {
      sync: matrixSelections1[0],
      wavelength: matrixSelections2[0],
      text: textInput,
    };
    onContinue?.(data);
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black border p-8 text-center max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div>
          <MatrixQuestion
            rows={row_reflective}
            columns={columns_reflective}
            selections={matrixSelections1}
            onSelectionChange={handleMatrixSelectionChange1}
          />
        </div>
        <div>
          <MatrixQuestion
            rows={row_comfort}
            columns={columns_comfort}
            selections={matrixSelections2}
            onSelectionChange={handleMatrixSelectionChange2}
          />
        </div>
        <div className="mt-8">
          <label className="block text-white text-2xl mb-6">
            We're interested in hearing more about your experience during your
            conversation. Please share any thoughts that you have below.
          </label>
          <textarea
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="w-full h-56 p-4 text-white bg-gray-800 border border-white rounded-lg resize-none focus:outline-none focus:border-blue-400 text-xl"
            autoFocus
          />
        </div>
      </div>
      <div className="w-full flex justify-center pb-8">
        <button
          type="button"
          onClick={handleContinue}
          className="px-8 py-3 rounded-lg font-semibold transition-colors bg-white text-black hover:bg-gray-200"
        >
          Continue
        </button>
      </div>
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onClose={handleCancelContinue}
        onConfirm={handleConfirmContinue}
        message="There are unanswered questions on this page. Would you like to continue?"
        confirmText="Continue"
        cancelText="Close"
      />
    </div>
  );
}
