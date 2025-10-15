import { useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import PressKeyPrompt from "../components/PressKeyPrompt";
import Instructions from "../dyad-task/Instructions";
import EmotionsRating from "./components/EmotionsRating";
import PartnerHistory from "./PartnerHistory";
import SelfFrequency from "./SelfFrequency";
import Loneliness from "./Loneliness";
import Demographics from "./Demographics";
import PartnerSliders from "./PartnerSliders";
import SocialConnectedness from "./SocialConnectedness";
import Experience from "./Experience";
import Expressivity from "./Expressivity";
import StudyFeedback from "./StudyFeedback";

interface ClassificationTaskMainProps {
  formData: {
    dyadId: string;
    participantId: string;
    partnerId: string;
    computer: string;
    subjectInitials: string;
    saveFolder: string;
    raName: string;
    sessionTime: string;
    sessionDate: string;
  };
  csvFilePath: string;
  onComplete?: () => void;
}

function ClassificationTaskMain({
  formData: _formData,
  csvFilePath,
  onComplete,
}: ClassificationTaskMainProps) {
  const trail_number = useRef<number>(1);
  const csvEscape = (value: unknown) => {
    const s = value !== undefined && value !== null ? String(value) : "";
    if (
      s.includes(",") ||
      s.includes('"') ||
      s.includes("\n") ||
      s.includes("\r")
    ) {
      const noNewlines = s.replace(/\r?\n|\r/g, " ");
      const escapedQuotes = noNewlines.replace(/"/g, '""');
      return `"${escapedQuotes}"`;
    }
    return s;
  };

  const writeCSVRow = async (
    ratingTask: string,
    subTask: string,
    emotion1: string = "",
    emotion2: string = "",
    ratingPerson: string = "",
    response: number | string = ""
  ) => {
    const row = [
      _formData.dyadId,
      _formData.participantId,
      _formData.partnerId,
      _formData.computer,
      _formData.subjectInitials,
      _formData.saveFolder,
      _formData.raName,
      _formData.sessionTime,
      _formData.sessionDate,
      new Date().toISOString(),
      ratingTask,
      subTask,
      emotion1,
      emotion2,
      ratingPerson,
      response,
      trail_number.current,
      "1.0.0",
    ]
      .map(csvEscape)
      .join(",");

    await invoke("write_csv_transitions", {
      path: csvFilePath,
      contents: [row],
    });
    trail_number.current = trail_number.current + 1;
  };

  const [currentStep, setCurrentStep] = useState<string>("instructions");
  const [instructionIndex, setInstructionIndex] = useState<number>(0);
  const [currentPersonIndex, setCurrentPersonIndex] = useState<number>(0);
  const [shuffledPeople, setShuffledPeople] = useState<string[]>([]);
  const [allRatings, setAllRatings] = useState<any[]>([]);
  const [showTransition, setShowTransition] = useState<boolean>(false);
  const [formOrder, setFormOrder] = useState<string[]>([]);
  const [currentFormIndex, setCurrentFormIndex] = useState<number>(0);

  const ratingPeople = [
    "yourself",
    "your partner",
    "an average UW-Madison student",
  ];

  useEffect(() => {
    const shuffled = [...ratingPeople].sort(() => Math.random() - 0.5);
    setShuffledPeople(shuffled);
    const blockRandomized = [
      "loneliness",
      "socialConnectedness",
      "expressivity",
    ].sort(() => Math.random() - 0.5);

    const forms = [
      "emotionTransitions",
      "selfFrequency",
      "experience",
      "partnerSliders",
      blockRandomized[0],
      blockRandomized[1],
      blockRandomized[2],
      "partnerHistory",
      "demographics",
      "studyFeedback",
    ];
    setFormOrder(forms);
  }, [csvFilePath, _formData]);
  const emotionTransitions = [
    { initial: "assertive", final: "confident" },
    { initial: "assertive", final: "grouchy" },
    // { initial: "assertive", final: "sad" },
    // { initial: "assertive", final: "assertive" },
    // { initial: "assertive", final: "unrestrained" },
    // { initial: "confident", final: "confident" },
    // { initial: "confident", final: "grouchy" },
    // { initial: "confident", final: "sad" },
    // { initial: "confident", final: "assertive" },
    // { initial: "confident", final: "unrestrained" },
    // { initial: "grouchy", final: "confident" },
    // { initial: "grouchy", final: "grouchy" },
    // { initial: "grouchy", final: "sad" },
    // { initial: "grouchy", final: "assertive" },
    // { initial: "grouchy", final: "unrestrained" },
    // { initial: "sad", final: "confident" },
    // { initial: "sad", final: "grouchy" },
    // { initial: "sad", final: "sad" },
    // { initial: "sad", final: "assertive" },
    // { initial: "sad", final: "unrestrained" },
    // { initial: "unrestrained", final: "confident" },
    // { initial: "unrestrained", final: "grouchy" },
    // { initial: "unrestrained", final: "sad" },
    // { initial: "unrestrained", final: "assertive" },
    // { initial: "unrestrained", final: "unrestrained" },
    // { initial: "bold", final: "nervous" },
    // { initial: "bold", final: "irritable" },
    // { initial: "bold", final: "lively" },
    // { initial: "bold", final: "bold" },
    // { initial: "bold", final: "talkative" },
    // { initial: "irritable", final: "nervous" },
    // { initial: "irritable", final: "irritable" },
    // { initial: "irritable", final: "lively" },
    // { initial: "irritable", final: "bold" },
    // { initial: "irritable", final: "talkative" },
    // { initial: "lively", final: "nervous" },
    // { initial: "lively", final: "irritable" },
    // { initial: "lively", final: "lively" },
    // { initial: "lively", final: "bold" },
    // { initial: "lively", final: "talkative" },
    // { initial: "nervous", final: "nervous" },
    // { initial: "nervous", final: "irritable" },
    // { initial: "nervous", final: "lively" },
    // { initial: "nervous", final: "bold" },
    // { initial: "nervous", final: "talkative" },
    // { initial: "talkative", final: "nervous" },
    // { initial: "talkative", final: "irritable" },
    // { initial: "talkative", final: "lively" },
    // { initial: "talkative", final: "bold" },
    // { initial: "talkative", final: "talkative" },
    // { initial: "contempt", final: "satisfaction" },
    // { initial: "contempt", final: "love" },
    // { initial: "contempt", final: "contempt" },
    // { initial: "contempt", final: "disgust" },
    // { initial: "contempt", final: "embarrassment" },
    // { initial: "disgust", final: "satisfaction" },
    // { initial: "disgust", final: "love" },
    // { initial: "disgust", final: "contempt" },
    // { initial: "disgust", final: "disgust" },
    // { initial: "disgust", final: "embarrassment" },
    // { initial: "embarrassment", final: "satisfaction" },
    // { initial: "embarrassment", final: "love" },
    // { initial: "embarrassment", final: "contempt" },
    // { initial: "embarrassment", final: "disgust" },
    // { initial: "embarrassment", final: "embarrassment" },
    // { initial: "love", final: "satisfaction" },
    // { initial: "love", final: "love" },
    // { initial: "love", final: "contempt" },
    // { initial: "love", final: "disgust" },
    // { initial: "love", final: "embarrassment" },
    // { initial: "satisfaction", final: "satisfaction" },
    // { initial: "satisfaction", final: "love" },
    // { initial: "satisfaction", final: "contempt" },
    // { initial: "satisfaction", final: "disgust" },
    // { initial: "satisfaction", final: "embarrassment" },
  ];

  useEffect(() => {
    const handleKeyPress = async (_event: KeyboardEvent) => {
      if (currentStep === "instructions") {
        if (instructionIndex + 1 >= 10) {
          handleStepComplete();
          return;
        }
        setInstructionIndex((i) => i + 1);
        return;
      }

      if (currentStep === "ratings" && showTransition && _event.key === " ") {
        _event.preventDefault();
        handleTransitionKeyPress();
        return;
      }

      if (currentStep === "completed") {
        onComplete?.();
        return;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [currentStep, instructionIndex, showTransition, onComplete]);

  const handleTransitionSubmit = async (
    initial: string,
    final: string,
    rating: number
  ) => {
    const ratingPerson = shuffledPeople[currentPersonIndex];
    await writeCSVRow(
      "emotion_transitions",
      `${initial}_to_${final}`,
      initial,
      final,
      ratingPerson,
      rating
    );
  };

  const handleAllTransitionsComplete = async (ratings: any[]) => {
    setAllRatings((prev) => [...prev, ...ratings]);

    if (currentPersonIndex + 1 < shuffledPeople.length) {
      setShowTransition(true);
    } else {
      // Move to first form after ratings: selfFrequency
      setCurrentFormIndex(1); // index of selfFrequency in forms array
      setCurrentStep("selfFrequency");
      console.log("All ratings completed:", allRatings.concat(ratings));
    }
  };

  const handleTransitionKeyPress = () => {
    setShowTransition(false);
    setCurrentPersonIndex((prev) => prev + 1);
  };

  const handleStepComplete = async (stepData?: any) => {
    switch (currentStep) {
      case "instructions":
        setCurrentStep("ratings");
        break;
      case "ratings":
        break;
      case "partnerHistory":
        await writeCSVRow(
          "partner_history",
          "Have you met your partner prior to today's study?",
          "",
          "",
          "",
          stepData?.partnerHistory ? "Yes" : "No"
        );
        await writeCSVRow(
          "partner_history",
          "How long have you known your partner? (in months)",
          "",
          "",
          "",
          stepData?.partnerHistoryMonths ?? ""
        );
        await writeCSVRow(
          "partner_history",
          "I am happy with my friendship with my partner",
          "",
          "",
          "",
          stepData?.matrixSelections?.[0] ?? ""
        );
        await writeCSVRow(
          "partner_history",
          "My partner is fun to sit and talk with",
          "",
          "",
          "",
          stepData?.matrixSelections?.[1] ?? ""
        );

        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "selfFrequency":
        if (stepData && stepData.order && stepData.ratings) {
          for (const emotion of stepData.order) {
            await writeCSVRow(
              "self_frequency",
              `How often do you feel ${emotion}?`,
              "",
              "",
              "",
              stepData.ratings?.[emotion] ?? ""
            );
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "loneliness":
        if (stepData && stepData.order && stepData.matrixSelections) {
          for (const [index, question] of stepData.order.entries()) {
            await writeCSVRow(
              "loneliness",
              question,
              "",
              "",
              "",
              stepData.matrixSelections?.[index] ?? ""
            );
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "demographics":
        await writeCSVRow(
          "demographics",
          "Enter your age:",
          "",
          "",
          "",
          stepData?.age ?? ""
        );
        await writeCSVRow(
          "demographics",
          "Are you Spanish, Hispanic, or Latino?",
          "",
          "",
          "",
          stepData?.hispanicLatino ?? ""
        );
        await writeCSVRow(
          "demographics",
          "Choose one or more races that you consider yourself to be:",
          "",
          "",
          "",
          stepData?.races?.join(";") ?? ""
        );
        await writeCSVRow(
          "demographics",
          "Please specify (other race):",
          "",
          "",
          "",
          stepData?.otherRace ?? ""
        );
        await writeCSVRow(
          "demographics",
          "What is your sex?",
          "",
          "",
          "",
          stepData?.sex ?? ""
        );
        await writeCSVRow(
          "demographics",
          "Please provide the zip code of your permanent address (where you grew up):",
          "",
          "",
          "",
          stepData?.zipCode ?? ""
        );
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "partnerSliders":
        await writeCSVRow(
          "partner_sliders",
          "Is similar to me?",
          "",
          "",
          "",
          stepData?.sliderSelections?.[0] ?? ""
        );
        await writeCSVRow(
          "partner_sliders",
          "Is close to me?",
          "",
          "",
          "",
          stepData?.sliderSelections?.[1] ?? ""
        );
        await writeCSVRow(
          "partner_sliders",
          "Is familiar to me?",
          "",
          "",
          "",
          stepData?.sliderSelections?.[2] ?? ""
        );
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "experience":
        console.log(stepData?.sync);
        console.log(stepData?.wavelength);
        await writeCSVRow(
          "experience",
          "How often were you thinking about the fact that your conversation was being video recorded?",
          "",
          "",
          "",
          stepData?.sync ?? ""
        );
        await writeCSVRow(
          "experience",
          "How comfortable did you feel during the conversation?",
          "",
          "",
          "",
          stepData?.wavelength ?? ""
        );
        await writeCSVRow(
          "experience",
          "We're interested in hearing more about your experience during your conversation. Please share any thoughts that you have below",
          "",
          "",
          "",
          stepData?.text ?? ""
        );

        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "socialConnectedness":
        if (stepData && stepData.order && stepData.matrixSelections) {
          for (const [index, question] of stepData.order.entries()) {
            await writeCSVRow(
              "social_connectedness",
              question,
              "",
              "",
              "",
              stepData.matrixSelections?.[index] ?? ""
            );
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "expressivity":
        if (stepData && stepData.order && stepData.matrixSelections) {
          for (const [index, question] of stepData.order.entries()) {
            await writeCSVRow(
              "expressivity",
              question,
              "",
              "",
              "",
              stepData.matrixSelections?.[index] ?? ""
            );
          }
        }
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      case "studyFeedback":
        await writeCSVRow(
          "study_feedback",
          "We're interested in hearing more about your experience with our study. Please share any thoughts you have below.",
          "",
          "",
          "",
          stepData?.text ?? ""
        );
        if (currentFormIndex < formOrder.length - 1) {
          setCurrentFormIndex(currentFormIndex + 1);
          setCurrentStep(formOrder[currentFormIndex + 1]);
        } else {
          setCurrentStep("completed");
          onComplete?.();
        }
        break;
      default:
        break;
    }
  };

  if (currentStep === "completed") {
    onComplete?.();
    return null;
  }

  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black">
      <div className=" w-full mx-auto px-8">
        {currentStep === "instructions" && (
          <div className="overflow-hidden h-screen justify-center items-center">
            <Instructions
              onBack={() => setInstructionIndex((i) => Math.max(0, i - 1))}
              instructionIndex={instructionIndex}
              groupSize={5}
              instructions={[
                "You will be presented with pairs of emotions.",
                "The first emotion denotes the current state; the second emotion denotes the next emotional state.",
                "Your task is to estimate the likelihood of a person feeling the first emotion later feeling the second emotion.",
                "For this example, what is the chance of a person currently feeling Tired next feeling Excited?",
                "You will make your rating on a scale from 0-100%, where 0% means that there is zero chance that a person feeling tired will feel excited next, and where 100% means that a person feeling tired now will definitely feel excited next.",
                "You will be asked to provide ratings for three different people: yourself, your partner, and an average UW-Madison student.",
                "The three people will be presented in random order.",
                "For each person, please try to be as accurate as possible.",
                "This part will take approximately 30 minutes.",
                "We ask that you answer each question efficiently in order to keep your participation time within one hour.",
              ]}
            />
          </div>
        )}

        {currentStep === "ratings" && (
          <>
            {showTransition ? (
              <div className="min-h-screen w-full flex flex-col justify-center items-center bg-black overflow-hidden">
                <div className=" max-w-4xl mx-auto">
                  <h1 className="text-white text-2xl">Phase Complete!</h1>
                  <p className="text-white text-2xl pt-32">
                    You have completed all emotion transition ratings for{" "}
                    {shuffledPeople[currentPersonIndex]}.
                  </p>
                  <p className="text-white text-2xl pt-32">
                    You will now be rating{" "}
                    {shuffledPeople[currentPersonIndex + 1]}.
                  </p>
                  <div className="">
                    <PressKeyPrompt
                      keyLabel="Space"
                      text="to continue to the next person"
                    />
                  </div>
                </div>
              </div>
            ) : shuffledPeople.length > 0 ? (
              <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
                <EmotionsRating
                  emotionTransitions={emotionTransitions}
                  ratingPerson={shuffledPeople[currentPersonIndex]}
                  onTransitionSubmit={handleTransitionSubmit}
                  onAllTransitionsComplete={handleAllTransitionsComplete}
                />
              </div>
            ) : (
              <div className="min-h-screen w-full flex flex-col items-center justify-center bg-black overflow-hidden">
                <div className="text-center max-w-4xl mx-auto px-8">
                  <h1 className="text-white text-4xl font-bold mb-8">
                    Loading...
                  </h1>
                </div>
              </div>
            )}
          </>
        )}

        {currentStep === "partnerHistory" && (
          <PartnerHistory onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "selfFrequency" && (
          <SelfFrequency onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "experience" && (
          <Experience onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "partnerSliders" && (
          <PartnerSliders onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "loneliness" && (
          <Loneliness onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "socialConnectedness" && (
          <SocialConnectedness
            onContinue={(data) => handleStepComplete(data)}
          />
        )}

        {currentStep === "expressivity" && (
          <Expressivity onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "demographics" && (
          <Demographics onContinue={(data) => handleStepComplete(data)} />
        )}

        {currentStep === "studyFeedback" && (
          <StudyFeedback onContinue={(data) => handleStepComplete(data)} />
        )}
      </div>
    </div>
  );
}

export default ClassificationTaskMain;
