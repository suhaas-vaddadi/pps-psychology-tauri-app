import { useState } from "react";
import MatrixQuestion from "../components/MatrixQuestion";
import ConfirmationModal from "../components/ConfirmationModal";
// Partner sliders moved to its own screen

export interface ClassifcationTaskProps {
  onContinue?: (data?: any) => void;
}

export default function PartnerHistory({ onContinue }: ClassifcationTaskProps) {
  const [partnerHistory, setPartnerHistory] = useState<boolean | null>(null);
  const [partnerHistoryMonths, setPartnerHistoryMonths] = useState<string>("");
  const [matrixSelections, setMatrixSelections] = useState<{
    [rowIndex: number]: number;
  }>({});
  const [showConfirmationModal, setShowConfirmationModal] =
    useState<boolean>(false);
  // Sliders moved to separate screen

  const matrixRows = [
    "I am happy with my friendship with my partner",
    "My partner is fun to sit and talk with",
  ];

  // Slider rows defined in PartnerSliders screen

  const handlePartnerHistoryChange = (value: boolean) => {
    setPartnerHistory(value);
    if (value === false) {
      setMatrixSelections({});
      setPartnerHistoryMonths("");
    }
  };
  // Slider selection handler moved to PartnerSliders

  const handleMatrixSelectionChange = (
    rowIndex: number,
    columnIndex: number
  ) => {
    setMatrixSelections((prev) => ({
      ...prev,
      [rowIndex]: columnIndex,
    }));
    console.log(matrixSelections);
  };

  const isFormValid = () => {
    if (partnerHistory === null) return false;

    if (partnerHistory === false) return true;

    const hasMonths = partnerHistoryMonths.trim() !== "";
    const hasMatrixAnswers = Object.keys(matrixSelections).length === 2;
    return hasMonths && hasMatrixAnswers;
  };

  const handleContinue = () => {
    if (isFormValid()) {
      const data = {
        partnerHistory,
        partnerHistoryMonths,
        matrixSelections,
      };
      onContinue?.(data);
    } else {
      setShowConfirmationModal(true);
    }
  };

  const handleConfirmContinue = () => {
    setShowConfirmationModal(false);
    const data = {
      partnerHistory,
      partnerHistoryMonths,
      matrixSelections,
    };
    onContinue?.(data);
  };

  const handleCancelContinue = () => {
    setShowConfirmationModal(false);
  };

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className="bg-black border p-8  max-w-7xl mx-auto flex-1 flex flex-col justify-center">
        <div className="max-w-2xl mx-auto text-left flex flex-col justify-center mt-72">
          <label className="block text-white text-2xl">
            Have you met your partner prior to today's study?
          </label>
          <div className="flex space-x-4 mt-32">
            <button
              type="button"
              onClick={() => handlePartnerHistoryChange(true)}
              className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                partnerHistory === true
                  ? "bg-white text-black"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
            >
              Yes
            </button>
            <button
              type="button"
              onClick={() => handlePartnerHistoryChange(false)}
              className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                partnerHistory === false
                  ? "bg-white text-black"
                  : "bg-gray-800 hover:bg-gray-700 text-white"
              }`}
            >
              No
            </button>
          </div>
        </div>

        {partnerHistory === true && (
          <div className="mt-32">
            <div className="grid grid-cols-1 gap-4 mb-6 max-w-2xl mx-auto">
              <div>
                <label className="block text-white text-2xl mb-2">
                  How long have you known your partner? (in months):
                </label>
                <input
                  type="text"
                  value={partnerHistoryMonths}
                  onChange={(e) => setPartnerHistoryMonths(e.target.value)}
                  className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
                />
              </div>
            </div>
            <MatrixQuestion
              rows={matrixRows}
              columns={[
                "Very much Disagree",
                "",
                "Somewhat Disagree",
                "",
                "Somewhat Agree",
                "",
                "Very much Agree",
              ]}
              onSelectionChange={handleMatrixSelectionChange}
              selections={matrixSelections}
            />
          </div>
        )}
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
