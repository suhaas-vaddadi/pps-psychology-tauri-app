import { useState, useEffect, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";

interface SliderProps {
  resetTrigger?: number;
  csvFilePath?: string;
}

function Slider({ resetTrigger, csvFilePath }: SliderProps) {
  const [sliderPosition, setSliderPosition] = useState(50);
  const sliderRef = useRef(50);
  const dataRef = useRef<number[]>([]);

  useEffect(() => {
    if (resetTrigger !== undefined) {
      invoke("set_pointer_position", {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
      });
    }
  }, [resetTrigger]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      const position = (event.clientX / window.innerWidth) * 100;
      setSliderPosition(position);
      sliderRef.current = position;
    };

    const captureInterval = setInterval(() => {
      dataRef.current.push(sliderRef.current);
    }, 100);

    const flushInterval = setInterval(() => {
      if (dataRef.current.length > 0 && csvFilePath) {
        const rows = dataRef.current.splice(0);
        invoke("write_csv", {
          path: csvFilePath,
          contents: rows.map((v) => v.toString()),
        })
          .then(() => console.log("Flushed", rows.length, "values"))
          .catch((err) => console.error("CSV write failed:", err));
      }
    }, 1000);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      clearInterval(captureInterval);
      clearInterval(flushInterval);
    };
  }, [csvFilePath]);

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-2">
        <span className="text-white text-sm">Very Negative</span>
        <span className="text-white text-sm">Very Positive</span>
      </div>
      <div className="relative w-full h-2 bg-white rounded-full cursor-none">
        <div
          className="absolute w-4 h-6 bg-white rounded-full top-1/2 cursor-none"
          style={{
            left: `${sliderPosition}%`,
            transform: "translateX(-50%) translateY(-50%)",
          }}
        />
      </div>
    </div>
  );
}

export default Slider;
