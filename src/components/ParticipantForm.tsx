interface ParticipantFormProps {
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
  onChange: (field: string, value: string) => void;
  onSubmit: () => void;
}

function ParticipantForm({
  formData,
  onChange,
  onSubmit,
}: ParticipantFormProps) {
  return (
    <div className="w-full flex flex-col items-center justify-center bg-black cursor-auto overflow-hidden h-screen">
      <div className="text-center max-w-2xl mx-auto px-8">
        <h1 className="text-white text-4xl font-bold mb-8">
          Please Enter the Particpant's Information
        </h1>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">Dyad ID:</label>
              <input
                autoComplete="off"
                type="text"
                value={formData.dyadId}
                onChange={(e) => onChange("dyadId", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-white text-lg mb-2">
                Participant ID:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.participantId}
                onChange={(e) => onChange("participantId", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">
                Partner ID:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.partnerId}
                onChange={(e) => onChange("partnerId", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-white text-lg mb-2">
                Subject Initials:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.subjectInitials}
                onChange={(e) => onChange("subjectInitials", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-lg mb-2">
              Computer (L/R):
            </label>
            <div className="flex space-x-4">
              <button
                type="button"
                onClick={() => onChange("computer", "Left")}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  formData.computer === "Left"
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Left
              </button>
              <button
                type="button"
                onClick={() => onChange("computer", "Right")}
                className={`flex-1 px-4 py-3 border border-white rounded-lg transition-colors ${
                  formData.computer === "Right"
                    ? "bg-white text-black"
                    : "bg-gray-800 hover:bg-gray-700 text-white"
                }`}
              >
                Right
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white text-lg mb-2">RA Name:</label>
              <input
                autoComplete="off"
                type="text"
                value={formData.raName}
                onChange={(e) => onChange("raName", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>

            <div>
              <label className="block text-white text-lg mb-2">
                Session Time:
              </label>
              <input
                autoComplete="off"
                type="text"
                value={formData.sessionTime}
                onChange={(e) => onChange("sessionTime", e.target.value)}
                className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-white text-lg mb-2">
              Session Date:
            </label>
            <input
              autoComplete="off"
              type="text"
              value={formData.sessionDate}
              onChange={(e) => onChange("sessionDate", e.target.value)}
              className="w-full p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
            />
          </div>

          <div>
            <label className="block text-white text-lg mb-2">
              Save Folder:
            </label>
            <div className="flex space-x-2">
              <input
                autoComplete="off"
                type="text"
                value={formData.saveFolder}
                onChange={(e) => onChange("saveFolder", e.target.value)}
                placeholder="Select folder to save ratings..."
                className="flex-1 p-3 text-white bg-gray-800 border border-white rounded-lg focus:outline-none focus:border-blue-400"
                readOnly
              />
              <button
                type="button"
                onClick={async () => {
                  try {
                    const { open } = await import("@tauri-apps/plugin-dialog");
                    const selected = await open({
                      directory: true,
                      title: "Select folder to save ratings",
                    });
                    if (selected) {
                      onChange("saveFolder", selected as string);
                    }
                  } catch (error) {
                    console.error("Error selecting folder:", error);
                  }
                }}
                className="px-4 py-3 text-white border border-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Browse
              </button>
            </div>
          </div>

          <button
            onClick={onSubmit}
            className="w-full px-8 py-4 text-white text-xl border border-white bg-black hover:bg-gray-800 transition-colors mt-6"
          >
            Start Session
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantForm;
