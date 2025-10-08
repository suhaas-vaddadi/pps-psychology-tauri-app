import { useState } from "react";

import ParticipantForm from "./components/ParticipantForm";
import DyadTaskMain from "./dyad-task/DyadTaskMain";
import ClassificationTaskMain from "./classification-task/ClassificationTaskMain";
import { invoke } from "@tauri-apps/api/core";

function App() {
  const [formData, setFormData] = useState({
    dyadId: "",
    participantId: "",
    partnerId: "",
    computer: "",
    subjectInitials: "",
    saveFolder: "",
    raName: "",
    sessionTime: "",
    sessionDate: "",
  });

  const [selectedTask, setSelectedTask] = useState<
    "dyad" | "classification" | null
  >();
  const [dyadCsvFilePath, setDyadCsvFilePath] = useState<string>("");
  const [classificationCsvFilePath, setClassificationCsvFilePath] =
    useState<string>("");
  const [completedTasks, setCompletedTasks] = useState<{
    dyad: boolean;
    classification: boolean;
  }>({ dyad: false, classification: false });
  const [taskOrder, setTaskOrder] = useState<number>(0);

  const handleFormSubmit = async () => {
    if (
      formData.dyadId &&
      formData.participantId &&
      formData.partnerId &&
      formData.computer &&
      formData.subjectInitials &&
      formData.saveFolder &&
      formData.raName &&
      formData.sessionTime &&
      formData.sessionDate
    ) {
      try {
        const basePath = await invoke("setup_rating_directory", {
          basePath: formData.saveFolder,
          dyadId: formData.dyadId,
          participantId: formData.participantId,
          partnerId: formData.partnerId,
          initials: formData.subjectInitials,
        });

        const dyadPath = `${basePath}/ratings.csv`;
        const classificationPath = `${basePath}/transitions.csv`;

        setDyadCsvFilePath(dyadPath as string);
        setClassificationCsvFilePath(classificationPath as string);

        setSelectedTask("dyad");
        setTaskOrder(1);
      } catch (error) {
        console.error("Error setting up directory:", error);
        alert("Error setting up file directory. Please try again.");
      }
    } else {
      alert("Please fill in all fields.");
    }
  };

  const handleFormChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleDyadTaskComplete = () => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, dyad: true };
      setTaskOrder(2);
      setSelectedTask("classification");
      return updated;
    });
  };

  const handleClassificationTaskComplete = () => {
    setCompletedTasks((prev) => {
      const updated = { ...prev, classification: true };
      setSelectedTask(null);
      return updated;
    });
  };

  const allTasksCompleted =
    completedTasks.dyad && completedTasks.classification;

  return (
    <div className={` w-screen bg-black cursor-auto`}>
      {allTasksCompleted ? (
        <div className="min-h-full w-full flex flex-col items-center justify-center overflow-hidden h-screen">
          <div className="max-w-2xl mx-auto px-8">
            <p className="text-white text-2xl">
              Please alert your researcher that you are finished.
            </p>
          </div>
        </div>
      ) : selectedTask === "dyad" ? (
        <DyadTaskMain
          formData={formData}
          csvFilePath={dyadCsvFilePath}
          taskOrder={taskOrder}
          onComplete={handleDyadTaskComplete}
        />
      ) : selectedTask === "classification" ? (
        <ClassificationTaskMain
          formData={formData}
          csvFilePath={classificationCsvFilePath}
          onComplete={handleClassificationTaskComplete}
        />
      ) : (
        <ParticipantForm
          formData={formData}
          onChange={handleFormChange}
          onSubmit={handleFormSubmit}
        />
      )}
    </div>
  );
}

export default App;
