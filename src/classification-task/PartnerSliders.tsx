import { useEffect, useState } from "react";
import { ClassifcationTaskProps } from "./PartnerHistory";
import MatrixSlider from "../components/MatrixSlider";
import ConfirmationModal from "../components/ConfirmationModal";

export default function PartnerSliders({ onContinue }: ClassifcationTaskProps) {
  const [sliderSelections, setSliderSelections] = useState<{
    [key: string]: number;
  }>({});
  const [shuffledRows, setShuffledRows] = useState<string[]>([]);
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);

  const originalRows = [
    "Is similar to me?",
    "Is close to me?",
    "Is familiar to me?",
  ];

  useEffect(() => {
    const shuffled = [...originalRows].sort(() => Math.random() - 0.5);
    setShuffledRows(shuffled);
  }, []);

  const handleSliderSelectionChange = (rowIndex: number, value: number) => {
    const question = shuffledRows[rowIndex];
    setSliderSelections((prev) => ({
      ...prev,
      [question]: value,
    }));
  };

  const isFormValid = () =>
    Object.keys(sliderSelections).length === originalRows.length;

  const handleContinue = () => {
    if (isFormValid()) {
      const orderedSelections = originalRows.map(
        (question) => sliderSelections[question]
      );

      const data = { sliderSelections: orderedSelections };
      onContinue?.(data);
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    const orderedSelections = originalRows.map(
      (question) => sliderSelections[question]
    );

    const data = { sliderSelections: orderedSelections };
    onContinue?.(data);
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black border p-8 w-10/12 mx-auto flex-1 flex flex-col justify-center">
        <div className="mt-32">
          <MatrixSlider
            title="My partner... (1-100: 1 = Not at all, 100 = Very much)"
            rows={shuffledRows}
            leftLabel="Not at all"
            rightLabel="Very much"
            onSelectionChange={handleSliderSelectionChange}
            selections={sliderSelections}
          />
        </div>
      </div>

      <div className="w-full flex justify-center pb-8 mt-32">
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
      />
    </div>
  );
}
