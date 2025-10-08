import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

import VideoPlayer from "./VideoPlayer";
import Slider from "./Slider";
import Instructions from "./Instructions";
import RatingOverlay from "./RatingOverlay";
import TransitionScreen from "./TransitionScreen";

interface DyadTaskMainProps {
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
  taskOrder: number;
  onComplete?: () => void;
}

function DyadTaskMain({
  formData,
  csvFilePath,
  taskOrder,
  onComplete,
}: DyadTaskMainProps) {
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
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [showVideoInput, setShowVideoInput] = useState(true);
  const [showToggleScreen, setShowToggleScreen] = useState(false);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [textInput, setTextInput] = useState("");
  const [numberScale, setNumberScale] = useState<number | undefined>(undefined);
  const [currentRatingTarget, setCurrentRatingTarget] = useState<
    "self" | "partner"
  >("self");
  const [instructionsDone, setInstructionsDone] = useState(false);
  const [instructionIndex, setInstructionIndex] = useState(0);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);
  const [latestSlider, setLatestSlider] = useState<number>(50);
  const latestSliderRef = useRef<number>(50);
  const [videoEnded, setVideoEnded] = useState(false);
  const [showTransitionScreen, setShowTransitionScreen] = useState(false);
  const overlayWatchRef = useRef<number | null>(null);
  const sliderFlushRef = useRef<number | null>(null);
  const taskStartMsRef = useRef<number | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const nextStopTimeSecRef = useRef<number>(150);
  const sampleBufferRef = useRef<string[]>([]);
  const videoStartedRef = useRef<boolean>(false);
  const textPromptCountRef = useRef<number>(0);
  const timeoutRef = useRef<number | null>(null);
  const trialNumber = useRef<number>(1);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (
      file &&
      (file.type === "video/mp4" || file.type === "video/quicktime")
    ) {
      const url = URL.createObjectURL(file);
      setVideoSrc(url);
      setShowVideoInput(false);
      if (formData.computer === "Left") {
        setCurrentRatingTarget("self");
      } else {
        setCurrentRatingTarget("partner");
      }
    } else {
      alert("Please select a valid MP4 or MOV video file.");
    }
  };

  useEffect(() => {
    let sampleTimerIdLocal: number | null = null;
    if (videoSrc && instructionsDone && !showTransitionScreen) {
      if (taskStartMsRef.current === null) {
        taskStartMsRef.current = Date.now();

        timeoutRef.current = window.setTimeout(() => {
          const buffer = sampleBufferRef.current;
          if (buffer.length > 0) {
            invoke("write_csv_ratings", {
              path: csvFilePath,
              contents: buffer,
            }).catch((err) => console.error("CSV write failed:", err));
            sampleBufferRef.current = [];
          }

          if (videoRef.current) {
            videoRef.current.pause();
            setVideoEnded(true);
            onComplete?.();
          }
        }, 10000000);
      }

      sampleTimerIdLocal = window.setInterval(() => {
        if (!showToggleScreen && !videoEnded && !showTransitionScreen) {
          const vt = videoRef.current?.currentTime ?? 0;
          if (vt <= 0) {
            return;
          }
          if (!videoStartedRef.current) {
            videoStartedRef.current = true;
            nextStopTimeSecRef.current = Math.ceil(vt / 150) * 150 || 150;
          }
          const taskElapsedSec = taskStartMsRef.current
            ? (Date.now() - taskStartMsRef.current) / 15000
            : 0;
          const movieTime = vt;
          const row = [
            formData.participantId,
            formData.partnerId,
            formData.dyadId,
            formData.computer,
            formData.subjectInitials,
            formData.saveFolder,
            formData.raName,
            formData.sessionTime,
            formData.sessionDate,
            new Date().toISOString(),
            taskOrder.toString(),
            latestSliderRef.current.toFixed(2),
            "NA",
            currentRatingTarget,
            taskElapsedSec.toFixed(2),
            nextStopTimeSecRef.current.toFixed(0),
            movieTime.toFixed(2),
            0,
            "",
            trialNumber.current,
            "1.0.0",
          ]
            .map(csvEscape)
            .join(",");
          sampleBufferRef.current.push(row);
        }
      }, 100);

      overlayWatchRef.current = window.setInterval(() => {
        if (
          !showToggleScreen &&
          !videoEnded &&
          !showTransitionScreen &&
          videoRef.current &&
          videoStartedRef.current
        ) {
          const movieTime = videoRef.current.currentTime;
          if (movieTime >= nextStopTimeSecRef.current) {
            setShowToggleScreen(true);
            setAttemptedSubmit(false);
          }
        }
      }, 50);

      sliderFlushRef.current = window.setInterval(() => {
        const buffer = sampleBufferRef.current;
        if (buffer.length > 0) {
          const toFlush = buffer.splice(0, buffer.length);
          invoke("write_csv_ratings", {
            path: csvFilePath,
            contents: toFlush,
          }).catch((err) => console.error("CSV write failed:", err));
        }
      }, 15000);
    }

    return () => {
      if (sampleTimerIdLocal) {
        clearInterval(sampleTimerIdLocal);
      }
      if (overlayWatchRef.current) {
        clearInterval(overlayWatchRef.current);
      }
      if (sliderFlushRef.current) {
        clearInterval(sliderFlushRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [videoSrc, instructionsDone, showToggleScreen, showTransitionScreen]);

  useEffect(() => {
    if (!videoSrc || videoEnded) return;

    const checkVideoEnd = () => {
      const el = videoRef.current;
      if (el && el.duration && el.currentTime >= el.duration - 0.1) {
        console.log("Video end detected via time check");
        setVideoEnded(true);
        setShowToggleScreen(false);
        onComplete?.();
      }
    };

    const interval = setInterval(checkVideoEnd, 100);
    return () => clearInterval(interval);
  }, [videoSrc, videoEnded]);

  useEffect(() => {
    const el = videoRef.current;
    if (!el || !videoSrc) return;

    const handleEnded = () => {
      setVideoEnded(true);
      setShowToggleScreen(false);
      onComplete?.();
      const buffer = sampleBufferRef.current;
      if (buffer.length > 0) {
        const toFlush = buffer.splice(0, buffer.length);
        invoke("write_csv_ratings", {
          path: csvFilePath,
          contents: toFlush,
        }).catch((err) => console.error("CSV write failed:", err));
      }
    };

    const handleLoadedMetadata = () => {
      console.log("Video metadata loaded, duration:", el.duration);
    };

    const handleTimeUpdate = () => {
      if (el.currentTime >= el.duration - 0.5 && !videoEnded) {
        console.log("Video near end detected via time update");
        handleEnded();
      }
    };

    el.addEventListener("ended", handleEnded);
    el.addEventListener("loadedmetadata", handleLoadedMetadata);
    el.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      el.removeEventListener("ended", handleEnded);
      el.removeEventListener("loadedmetadata", handleLoadedMetadata);
      el.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, [videoSrc, csvFilePath, videoEnded]);

  useEffect(() => {
    if (videoRef.current) {
      if (showToggleScreen || showTransitionScreen) {
        videoRef.current.pause();
      } else if (instructionsDone) {
        videoRef.current.play();
      }
    }
  }, [showToggleScreen, showTransitionScreen, instructionsDone]);

  const submitAndAdvance = async (ratingValue: number, note: string) => {
    try {
      const taskElapsedSec = taskStartMsRef.current
        ? (Date.now() - taskStartMsRef.current) / 15000
        : 0;
      const nextBoundary = nextStopTimeSecRef.current;
      const movieTime = videoRef.current?.currentTime ?? 0;
      const row = [
        formData.participantId,
        formData.partnerId,
        formData.dyadId,
        formData.computer,
        formData.subjectInitials,
        formData.saveFolder,
        formData.raName,
        formData.sessionTime,
        formData.sessionDate,
        new Date().toISOString(),
        taskOrder.toString(),
        latestSlider.toFixed(2),
        ratingValue.toString(),
        currentRatingTarget,
        taskElapsedSec.toFixed(2),
        nextBoundary.toFixed(0),
        movieTime.toFixed(2),
        1,
        note,
        trialNumber.current,
        "1.0.0",
      ]
        .map(csvEscape)
        .join(",");
      await invoke("write_csv_ratings", { path: csvFilePath, contents: [row] });

      setCurrentRatingTarget((prev) => (prev === "self" ? "partner" : "self"));
      invoke("set_pointer_position", {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });

      setTextInput("");
      setNumberScale(undefined);
      setAttemptedSubmit(false);

      setShowToggleScreen(false);
      setShowTransitionScreen(true);
      setResetTrigger((prev) => prev + 1);
      nextStopTimeSecRef.current += 150;

      textPromptCountRef.current += 1;
      trialNumber.current += 1;

      if (textPromptCountRef.current >= 4) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        const buffer = sampleBufferRef.current;
        if (buffer.length > 0) {
          invoke("write_csv_ratings", {
            path: csvFilePath,
            contents: buffer,
          }).catch((err) => console.error("CSV write failed:", err));
          sampleBufferRef.current = [];
        }

        // End the video
        if (videoRef.current) {
          videoRef.current.pause();
          setVideoEnded(true);
          onComplete?.();
        }
      }
    } catch (err) {
      console.error("CSV write failed:", err);
    }
  };

  const handleTabSubmit = async () => {
    if (showToggleScreen) {
      const textEmpty = textInput.trim() === "";
      const scaleMissing = numberScale === undefined;
      if (textEmpty && scaleMissing) {
        setAttemptedSubmit(true);
        return;
      }

      if (numberScale !== undefined) {
        await submitAndAdvance(numberScale, textInput);
      } else {
        setAttemptedSubmit(true);
      }
    }
  };

  const handleConfirmIncomplete = async () => {
    if (!showToggleScreen) return;
    await submitAndAdvance(numberScale ?? 0, textInput.trim());
  };

  const handleDismissIncomplete = () => {
    setAttemptedSubmit(false);
  };

  const handleTransitionContinue = () => {
    setShowTransitionScreen(false);
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (showTransitionScreen) {
        event.preventDefault();
        handleTransitionContinue();
      } else if (showToggleScreen && event.key === "Tab") {
        event.preventDefault();
        handleTabSubmit();
      } else if (videoSrc && !instructionsDone) {
        event.preventDefault();
        if (instructionIndex + 1 >= 5) {
          setInstructionsDone(true);
          setShowTransitionScreen(true);
        } else {
          setInstructionIndex((i) => i + 1);
        }
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [
    showTransitionScreen,
    showToggleScreen,
    textInput,
    numberScale,
    videoSrc,
    instructionsDone,
    instructionIndex,
    onComplete,
  ]);

  return (
    <div
      className={`h-screen w-screen overflow-hidden bg-black ${
        videoSrc && !showToggleScreen && instructionsDone
          ? "cursor-none"
          : "cursor-auto"
      }`}
    >
      {showVideoInput ? (
        <div className="h-full w-full flex items-center justify-center bg-black">
          <div className="bg-black border p-8 max-w-2xl mx-auto">
            <h1 className="text-white text-2xl mb-8">Select Video File</h1>
            <input
              type="file"
              accept=".mp4,.mov"
              onChange={handleFileChange}
              className="px-4 py-2 border rounded-2xl border-white bg-black text-white cursor-pointer hover:bg-gray-800"
            />
          </div>
        </div>
      ) : videoSrc && !instructionsDone ? (
        <Instructions
          instructionIndex={instructionIndex}
          onBack={() => setInstructionIndex((i) => Math.max(0, i - 1))}
          groupSize={4}
          instructions={[
            "In this part of the study, you will watch the video recording of the conversation you just had.",
            "We are interested in two things:\n\t1. How you were feeling during the conversation.\n\t2. How you think your partner was feeling during the \tconversation.",
            "Each block will tell you whether to focus on your own feelings or your partner's feelings.",
            "As the video plays, continuously move the slider to indicate how positive or negative you OR your partner felt at that moment during the conversation.",
            "At certain points, you will be asked to write a short response and make ratings about how you or your partner felt during the part of the conversation you just watched.",
          ]}
        />
      ) : (
        <div className="h-full w-full flex flex-col relative">
          <div className="flex-1 flex flex-col items-center justify-center bg-black">
            <p className="text-center text-white mt-20 mb-7 text-2xl">
              How positive or negative did
              {currentRatingTarget === "self" ? " YOU" : " YOUR PARTNER"} feel
              during this moment in the conversation?
            </p>
            <VideoPlayer
              ref={videoRef}
              videoSrc={videoSrc}
              onFileChange={handleFileChange}
            />
          </div>
          {videoSrc && !showToggleScreen && !videoEnded && (
            <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 w-full max-w-5xl cursor-none">
              <div className="bg-black border border-white p-6">
                <Slider
                  resetTrigger={resetTrigger}
                  onSample={(v) => {
                    latestSliderRef.current = v;
                    setLatestSlider(v);
                  }}
                />
              </div>
            </div>
          )}
          {showToggleScreen && !videoEnded && (
            <div className="absolute inset-0 z-10">
              <RatingOverlay
                currentRatingTarget={currentRatingTarget}
                textInput={textInput}
                setTextInput={setTextInput}
                numberScale={numberScale}
                setNumberScale={setNumberScale}
                attemptedSubmit={attemptedSubmit}
                onConfirmIncomplete={handleConfirmIncomplete}
                onDismissIncomplete={handleDismissIncomplete}
              />
            </div>
          )}
          {showTransitionScreen && (
            <TransitionScreen
              ratingTarget={currentRatingTarget}
              onContinue={handleTransitionContinue}
            />
          )}
        </div>
      )}
    </div>
  );
}

export default DyadTaskMain;
