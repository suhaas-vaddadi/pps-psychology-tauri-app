interface TaskSelectionProps {
  onTaskSelect: (task: "dyad" | "classification") => void;
}

function TaskSelection({ onTaskSelect }: TaskSelectionProps) {
  return (
    <div className="min-h-full w-full flex flex-col items-center justify-center bg-black cursor-auto overflow-hidden h-screen">
      <div className="text-center max-w-2xl mx-auto px-8">
        <h1 className="text-white text-4xl font-bold mb-8">Select Task</h1>

        <div className="space-y-6">
          <button
            onClick={() => onTaskSelect("dyad")}
            className="w-full px-8 py-6 text-white text-2xl border-2 border-white bg-black hover:bg-gray-800 transition-colors rounded-lg"
          >
            Video Rating Task
          </button>

          <button
            onClick={() => onTaskSelect("classification")}
            className="w-full px-8 py-6 text-white text-2xl border-2 border-white bg-black hover:bg-gray-800 transition-colors rounded-lg"
          >
            Transitions Task
          </button>
        </div>
      </div>
    </div>
  );
}

export default TaskSelection;
