
# IdeaMesh: AI-Powered Knowledge Graph

IdeaMesh is a modern, web-based application designed to help users visualize and connect their ideas in an interactive knowledge graph. Leveraging the power of generative AI, it allows for intelligent interaction, automated organization, and insightful analysis of complex information structures.

![Public Home Page](src/components/ideamesh/public-home.tsx)

## 1. Core Features

-   **Interactive Graph Visualization:** Create, connect, and manipulate "nodes" (ideas) and "edges" (relationships) on a dynamic, zoomable canvas.
-   **AI-Powered Chat Assistant:** Interact with your graph using natural language. Ask the AI to create nodes, build connections, modify the graph, and even construct entire systems.
-   **Intelligent Graph Analysis:**
    -   **Summarization:** Get a concise summary of the entire graph's content.
    -   **Link Suggestions:** Discover non-obvious connections between your ideas.
    -   **Automated Layouts:** Ask the AI to rearrange your graph for optimal clarity and visual organization.
    -   **Smart Search:** Find nodes based on semantic context, not just keyword matches.
-   **Real-time Firestore Backend:** All graph data is stored and synced in real-time using Google Firestore, allowing for seamless multi-device usage.
-   **User Authentication:** Secure user accounts are handled via Firebase Authentication with Google Sign-In.
-   **Responsive Design:** A polished and consistent user experience across desktop and mobile devices.

## 2. Tech Stack

-   **Framework:** [Next.js](https://nextjs.org/) (using the App Router)
-   **Generative AI:** [Google AI on Vertex AI](https://cloud.google.com/vertex-ai) via [Genkit](https://firebase.google.com/docs/genkit)
-   **Database & Authentication:** [Firebase](https://firebase.google.com/) (Firestore, Firebase Authentication)
-   **UI Components:** Built with [React](https://react.dev/), [ShadCN UI](https://ui.shadcn.com/), and [Tailwind CSS](https://tailwindcss.com/)
-   **Styling:** Tailwind CSS with CSS Variables for easy theming.
-   **Language:** [TypeScript](https://www.typescriptlang.org/)

## 3. Project Structure

The project follows a standard Next.js App Router structure with clear separation of concerns.

```
.
â”œâ”€â”€ public/
â”‚   â””â”€â”€ assets/               # Static assets like images and Lottie animations
â”œâ”€â”€ src/
â”‚   â”œâ”€â”€ ai/
â”‚   â”‚   â”œâ”€â”€ flows/            # Core Genkit flows for AI logic
â”‚   â”‚   â”œâ”€â”€ tools/            # Tools the AI can call (e.g., to modify the graph)
â”‚   â”‚   â”œâ”€â”€ dev.ts            # Genkit development server entrypoint
â”‚   â”‚   â””â”€â”€ genkit.ts         # Genkit configuration and initialization
â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”œâ”€â”€ auth/             # Authentication page
â”‚   â”‚   â”œâ”€â”€ graph/[graphId]/  # The main graph view page
â”‚   â”‚   â”œâ”€â”€ home/             # User's dashboard with a list of their graphs
â”‚   â”‚   â”œâ”€â”€ globals.css       # Global styles and theme variables
â”‚   â”‚   â””â”€â”€ layout.tsx        # Root layout
â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”œâ”€â”€ ideamesh/         # App-specific components (GraphView, ControlPanel, etc.)
â”‚   â”‚   â””â”€â”€ ui/               # Reusable ShadCN UI components (Button, Card, etc.)
â”‚   â”œâ”€â”€ hooks/
â”‚   â”‚   â”œâ”€â”€ use-auth.tsx      # Manages user authentication state
â”‚   â”‚   â””â”€â”€ use-toast.ts      # Hook for displaying notifications
â”‚   â”œâ”€â”€ lib/
â”‚   â”‚   â”œâ”€â”€ firebase.ts       # Firebase initialization and configuration
â”‚   â”‚   â”œâ”€â”€ types.ts          # Core TypeScript types and interfaces
â”‚   â”‚   â””â”€â”€ utils.ts          # Utility functions (e.g., `cn` for classnames)
â”‚   â””â”€â”€ ...
â”œâ”€â”€ .env                      # Environment variables (you must create this)
â”œâ”€â”€ next.config.ts            # Next.js configuration
â”œâ”€â”€ package.json
â””â”€â”€ tailwind.config.ts        # Tailwind CSS configuration
```

## 4. Getting Started

Follow these steps to set up and run the project locally.

### Prerequisites

-   [Node.js](https://nodejs.org/) (v18 or later)
-   [npm](https://www.npmjs.com/) (or another package manager like yarn or pnpm)
-   A [Firebase project](https://console.firebase.google.com/) with **Firestore**, **Authentication (Google Sign-In enabled)**, and a **Web App** configured.
-   A Google Cloud project with the **Vertex AI API** enabled.

### Installation & Setup

1.  **Clone the Repository**
    ```bash
    git clone <repository-url>
    cd <repository-name>
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Set Up Environment Variables**
    Create a `.env` file in the root of the project and add your Firebase and Google Cloud credentials.

    ```env
    # Firebase Web App Configuration (from your Firebase project settings)
    NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
    NEXT_PUBLIC_FIREBASE_APP_ID=1:...:web:...

    # Google Cloud API Key (for Genkit/Vertex AI)
    # This is typically handled by authenticating with the gcloud CLI
    # Run `gcloud auth application-default login`
    ```
    > **Important:** The `storageBucket` required by Firebase is automatically constructed from your `NEXT_PUBLIC_FIREBASE_PROJECT_ID` in `src/lib/firebase.ts`.

4.  **Authorize Your Domain in Firebase**
    For Google Sign-In to work locally, you must add your development domain to the list of authorized domains in your Firebase project.
    -   Go to **Firebase Console > Authentication > Settings > Authorized domains**.
    -   Click **Add domain** and enter `localhost`.

## 5. Running the Application

The application requires two separate processes to run concurrently in development.

1.  **Start the Next.js Development Server**
    This runs the main web application.
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

2.  **Start the Genkit Development Server**
    This runs the AI backend flows. Open a new terminal for this command.
    ```bash
    npm run genkit:dev
    ```
    The Genkit development UI will be available at `http://localhost:4000`.

### Building for Production

To create a production build, run:
```bash
npm run build
```
To start the production server, run:
```bash
npm run start
```

## 6. Key Components & AI System

### UI Components (`src/components/ideamesh/`)

-   `graph-view.tsx`: The core component that renders the graph canvas, nodes, and edges. It handles panning, zooming, and dragging logic.
-   `node-component.tsx` / `edge-component.tsx`: The visual representations of individual nodes and the links between them.
-   `control-panel.tsx`: The sidebar that appears when a node is selected, allowing users to edit its properties (title, content, color, etc.).
-   `chat-panel.tsx`: The slide-out panel for interacting with the GraphAI assistant.
-   `public-home.tsx`: The marketing/landing page for unauthenticated users.

### AI System (`src/ai/`)

The AI functionality is powered by Genkit, which orchestrates calls to the Google AI models.

-   `chat-flow.ts`: The most complex flow. It manages the conversational state, understands user intent, and uses "tools" to perform actions on the graph, such as creating or deleting nodes and edges.
-   `graph-summarization.ts`: Takes the current graph data as input and generates a high-level summary.
-   `suggest-links.ts`: Analyzes all nodes and suggests new, meaningful connections that the user might have missed.
-   `rearrange-graph.ts`: Uses AI to calculate a visually organized and semantically meaningful layout for the nodes on the canvas.
-   `graph-tools.ts`: Defines the functions (tools) that the AI can call. These definitions are sent to the model, but the logic is executed on the client-side after the AI signals its intent to use a tool.

## 7. Firebase Data Schema

The application uses Firestore to store user and graph data. The schema is structured as follows:

-   **`/users/{userId}`**: Stores user profile information.
    -   `uid`, `email`, `displayName`, `photoURL`, `walkthroughCompleted`
-   **`/graphs/{graphId}`**: Stores metadata for each graph.
    -   `name`, `ownerId`, `createdAt`, `lastEdited`, `isPublic`
-   **`/graphs/{graphId}/nodes/{nodeId}`**: A subcollection containing all nodes for a specific graph.
    -   `id`, `title`, `content`, `x`, `y`, `color`, `shape`, `tags`, `imageUrl`
-   **`/graphs/{graphId}/edges/{edgeId}`**: A subcollection containing all edges for a specific graph.
    -   `id`, `source` (nodeId), `target` (nodeId), `label`
