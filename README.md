# PPS Study — Psychology Research Desktop Application

A cross-platform desktop application built for the **Person Perception Study (PPS)** at UW-Madison. The app guides participants through a two-part research session: a **continuous affect rating task** (video playback with slider) and a **classification & survey task** (emotion transition ratings, validated psychological scales, and demographics). All responses are saved to structured CSV files on the local filesystem.

Built with **Tauri v2**, **React 19**, **TypeScript**, and **Vite**.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [Data Output](#data-output)
- [Project Structure](#project-structure)
- [Configuration](#configuration)
- [Building for Production](#building-for-production)
- [Contributing](#contributing)
- [License](#license)

---

## Overview

The PPS Study app is used in dyadic interaction research. A pair of participants has a conversation that is video-recorded. Afterward, each participant sits at a separate computer, loads the conversation video, and:

1. **Dyad Task** — Watches the recorded conversation video while continuously adjusting a slider to indicate how positive or negative they (or their partner) felt at each moment. At periodic intervals, participants provide discrete emotion ratings and short written descriptions.
2. **Classification Task** — Rates the likelihood of emotion-to-emotion transitions for themselves, their partner, and an average UW-Madison student, then completes a battery of validated psychological questionnaires.

The application runs in **fullscreen mode** to minimize distraction and writes all data locally to researcher-specified directories.

---

## Features

- **Continuous Affect Rating** — Real-time slider tracking during video playback, sampled at 10 Hz and flushed to CSV every 15 seconds.
- **Periodic Overlay Prompts** — At 150-second intervals, the video pauses for discrete emotion ratings and free-text descriptions.
- **Emotion Transition Ratings** — 75 emotion pairs rated on a 0–100% likelihood scale for three targets (self, partner, average student) in randomized order.
- **Validated Psychological Scales** — Loneliness, Social Connectedness, Emotional Expressivity, Autism-Spectrum Quotient, and more.
- **Demographic & Experience Surveys** — Age, race/ethnicity, sex, zip code, conversation experience, partner history, and study feedback.
- **Block Randomization** — Loneliness, Social Connectedness, and Expressivity scales are presented in randomized order; rating targets for emotion transitions are also randomized.
- **Local CSV Data Storage** — All data is written directly to the local filesystem via Tauri's Rust backend—no network requests, no data leaves the machine.
- **Fullscreen Enforcement** — The app launches in fullscreen and disables the right-click context menu to prevent participant disruption.
- **Cross-Platform** — Builds for macOS, Windows, and Linux via Tauri.

---

## Architecture

```
┌──────────────────────────────────────────────────┐
│                  Tauri Shell (Rust)               │
│  ┌────────────────────────────────────────────┐   │
│  │  Commands:                                 │   │
│  │  • setup_rating_directory                  │   │
│  │  • write_csv_ratings                       │   │
│  │  • write_csv_transitions                   │   │
│  └────────────────────────────────────────────┘   │
│         ▲                                         │
│         │  invoke()                               │
│         ▼                                         │
│  ┌────────────────────────────────────────────┐   │
│  │           React Frontend (WebView)         │   │
│  │                                            │   │
│  │  ParticipantForm → DyadTask → ClassTask    │   │
│  │       (setup)      (video)    (surveys)    │   │
│  └────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────┘
```

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 19 + TypeScript | UI, task flow, data collection |
| **Styling** | Tailwind CSS v4 | Utility-first CSS |
| **Bundler** | Vite 7 | Dev server & production builds |
| **Backend** | Rust (Tauri v2) | Filesystem access, CSV writing, directory setup |
| **Plugins** | `tauri-plugin-fs`, `tauri-plugin-dialog`, `tauri-plugin-opener` | Native file dialogs, FS permissions |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** (comes with Node.js)
- **Rust** toolchain (install via [rustup](https://rustup.rs/))
- **Tauri v2 CLI** — installed automatically as a dev dependency, or globally via:
  ```bash
  cargo install tauri-cli --version "^2"
  ```
- **Platform-specific dependencies** — see the [Tauri prerequisites guide](https://v2.tauri.app/start/prerequisites/)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd pps-psychology-tauri-app
```

### 2. Install frontend dependencies

```bash
npm install
```

### 3. Run in development mode

```bash
npm run tauri dev
```

This starts the Vite dev server on `http://localhost:1420` and opens the Tauri window with hot-reload enabled.

---

## Usage

### Researcher Setup

1. Launch the application — it opens in fullscreen.
2. Fill in the **Participant Form**:
   - **Dyad ID** — Identifier for the dyad pair
   - **Participant ID** — The current participant's ID
   - **Partner ID** — The conversation partner's ID
   - **Subject Initials** — Participant's initials
   - **Computer (Left / Right)** — Determines initial rating target (Left = rate self first, Right = rate partner first)
   - **RA Name** — Research assistant running the session
   - **Session Time** & **Session Date** — Timestamp metadata
   - **Save Folder** — Browse to select the output directory (uses native file dialog)
3. Click **Start Session** — this creates the output directory and CSV files.

### Task 1: Dyad Task (Continuous Affect Rating)

1. **Select the video file** (MP4 or MOV) of the recorded conversation.
2. Read through the on-screen **instructions** (advance with any key).
3. The video plays while the participant adjusts a **slider** (0 = very negative, 100 = very positive).
4. Every **~150 seconds**, the video pauses and an **overlay** appears asking for:
   - A discrete **emotion rating** (number scale)
   - A **text description** of how the participant (or partner) was feeling
5. After 4 overlay prompts (or when the video ends), the task completes automatically.

### Task 2: Classification Task (Surveys)

Presented in sequence (with some block randomization):

1. **Emotion Transition Ratings** — Rate 75 emotion pairs × 3 targets
2. **Self Frequency** — How often you feel various emotions
3. **Conversation Experience** — Video recording awareness, comfort level, free text
4. **Partner Sliders** — Rate qualities of the conversation partner
5. **Loneliness Scale** *(randomized block)*
6. **Social Connectedness Scale** *(randomized block)*
7. **Emotional Expressivity Scale** *(randomized block)*
8. **Autism-Spectrum Quotient (AQ)**
9. **Partner History** — Prior relationship with partner
10. **Demographics** — Age, race/ethnicity, sex, zip code
11. **Study Feedback** — Free-text comments

After all tasks are complete, the screen displays a message to alert the researcher.

---

## Data Output

The application creates a directory structure under the chosen save folder:

```
<save_folder>/
└── <dyadId>_<participantId>_<partnerId>_<initials>/
    ├── ratings.csv        ← Dyad Task (continuous + overlay ratings)
    └── transitions.csv    ← Classification Task (all survey data)
```

### `ratings.csv` Columns

| Column | Description |
|--------|-------------|
| `SubID` | Participant ID |
| `PartnerID` | Partner ID |
| `dyad` | Dyad ID |
| `computer` | Left or Right |
| `subjectInitials` | Participant initials |
| `saveFolder` | Output directory path |
| `raName` | Research assistant name |
| `sessionTime` | Session time |
| `sessionDate` | Session date |
| `timestamp` | ISO 8601 timestamp of the data point |
| `taskOrder` | Order of the task (1 = dyad first) |
| `Rating` | Continuous slider value (0–100) |
| `EmoRating` | Discrete emotion rating (at overlay) or `NA` |
| `EmoRating_Person` | `self` or `partner` |
| `Time` | Elapsed task time (seconds) |
| `stopTime` | Next scheduled overlay time (seconds) |
| `Movietime` | Current video playback time (seconds) |
| `Shift` | Whether this is an overlay row (1) or continuous sample (0) |
| `Description` | Free-text description (at overlay) |
| `trialNumber` | Incrementing trial counter |
| `softwareVersion` | Application version |

### `transitions.csv` Columns

| Column | Description |
|--------|-------------|
| `dyadId` | Dyad ID |
| `participantId` | Participant ID |
| `partnerId` | Partner ID |
| `computer` | Left or Right |
| `subjectInitials` | Participant initials |
| `saveFolder` | Output directory path |
| `raName` | Research assistant name |
| `sessionTime` | Session time |
| `sessionDate` | Session date |
| `sessionTimestamp` | ISO 8601 timestamp |
| `ratingTask` | Task category (e.g., `emotion_transitions`, `loneliness`, `demographics`) |
| `subTask` | Specific item or transition pair |
| `emotion1` | Initial emotion (for transitions) |
| `emotion2` | Final emotion (for transitions) |
| `ratingPerson` | Target being rated (`yourself`, `your partner`, `an average UW-Madison student`) |
| `response` | Participant's response value |
| `trialNumber` | Incrementing trial counter |
| `softwareVersion` | Application version |

---

## Project Structure

```
pps-psychology-tauri-app/
├── index.html                      # HTML entry point
├── package.json                    # Node.js dependencies & scripts
├── vite.config.ts                  # Vite config (Tauri-optimized)
├── tsconfig.json                   # TypeScript config
│
├── src/                            # React frontend source
│   ├── main.tsx                    # React entry point
│   ├── App.tsx                     # Root component & task flow controller
│   ├── App.css                     # Global styles
│   │
│   ├── components/                 # Shared UI components
│   │   ├── ParticipantForm.tsx     # Session setup form
│   │   ├── ConfirmationModal.tsx   # Generic confirmation dialog
│   │   ├── MatrixQuestion.tsx      # Likert-scale matrix
│   │   ├── MatrixSlider.tsx        # Slider-based matrix
│   │   ├── PressKeyPrompt.tsx      # "Press [key] to continue" prompt
│   │   ├── Slider.tsx              # Reusable slider component
│   │   └── TaskSelection.tsx       # Task selection UI
│   │
│   ├── dyad-task/                  # Dyad Task (video + slider rating)
│   │   ├── DyadTaskMain.tsx        # Task orchestrator & data collection
│   │   ├── Instructions.tsx        # Paginated instruction screens
│   │   ├── VideoPlayer.tsx         # HTML5 video wrapper
│   │   ├── Slider.tsx              # Continuous affect slider
│   │   ├── RatingOverlay.tsx       # Periodic emotion rating overlay
│   │   └── TransitionScreen.tsx    # Between-block transition screen
│   │
│   ├── classification-task/        # Classification Task (surveys)
│   │   ├── ClassificationTaskMain.tsx  # Survey flow orchestrator
│   │   ├── Demographics.tsx        # Demographics questionnaire
│   │   ├── Loneliness.tsx          # UCLA Loneliness Scale
│   │   ├── SocialConnectedness.tsx  # Social Connectedness Scale
│   │   ├── Expressivity.tsx        # Emotional Expressivity Scale
│   │   ├── Autism.tsx              # AQ-10 screening
│   │   ├── Experience.tsx          # Conversation experience survey
│   │   ├── PartnerHistory.tsx      # Partner relationship history
│   │   ├── PartnerSliders.tsx      # Partner quality sliders
│   │   ├── SelfFrequency.tsx       # Emotion frequency self-report
│   │   ├── StudyFeedback.tsx       # Free-text study feedback
│   │   └── components/
│   │       └── EmotionsRating.tsx  # Emotion transition rating UI
│   │
│   └── assets/                     # Static assets
│       ├── pps_icon.png            # Application icon
│       └── react.svg               # React logo
│
└── src-tauri/                      # Rust backend
    ├── Cargo.toml                  # Rust dependencies
    ├── tauri.conf.json             # Tauri app config (fullscreen, bundling, etc.)
    ├── capabilities/
    │   └── default.json            # Security permissions (FS, dialog access)
    ├── src/
    │   ├── main.rs                 # Desktop entry point
    │   └── lib.rs                  # Tauri commands (CSV writing, directory setup)
    └── icons/                      # Application icons (all platforms)
```

---

## Configuration

### Tauri Configuration (`src-tauri/tauri.conf.json`)

| Setting | Value | Description |
|---------|-------|-------------|
| `productName` | `PPS Study` | Application name shown in title bar |
| `identifier` | `com.suhaasvaddadi.pps-study` | Unique bundle identifier |
| `fullscreen` | `true` | App launches in fullscreen |
| `csp` | `null` | Content Security Policy disabled (allows local video loading) |
| `bundle.targets` | `all` | Build for all platform targets |

### Vite Configuration (`vite.config.ts`)

- Dev server runs on **port 1420** (required by Tauri)
- HMR (Hot Module Replacement) enabled for development
- Tailwind CSS v4 integrated via Vite plugin

---

## Building for Production

### Build the desktop application:

```bash
npm run tauri build
```

This produces platform-specific installers in `src-tauri/target/release/bundle/`:

| Platform | Output |
|----------|--------|
| **macOS** | `.dmg`, `.app` |
| **Windows** | `.msi`, `.exe` |
| **Linux** | `.deb`, `.AppImage` |

### Build only the frontend:

```bash
npm run build
```

Output goes to the `dist/` directory.

---

## Recommended IDE Setup

- [VS Code](https://code.visualstudio.com/) with:
  - [Tauri Extension](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode)
  - [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)
  - [Tailwind CSS IntelliSense](https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "Add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is for academic research use. Contact the repository owner for licensing details.
