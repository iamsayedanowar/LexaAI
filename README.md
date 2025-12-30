![LexaAI](https://raw.githubusercontent.com/iamsayedanowar/LexaAI/refs/heads/main/GRP.png)

# LexaAI

**LexaAI** is an AI-powered chatbot built using **React**, **Vite**, and **Appwrite**, powered by **Google’s Gemini API**. It provides a modern, fast, and interactive chat experience with secure authentication, persistent conversations, and a clean UI.

## Features

- **AI-Powered Conversations**: Real-time intelligent responses using the **Gemini API**.  
- **Secure Authentication**: User authentication and session management handled by **Appwrite**.
- **Conversation Persistence**: Chat history stored securely using Appwrite Databases.
- **Modern UI**: Clean and responsive interface built with **Tailwind CSS**.
- **Fast Performance**: Optimized development and build process using **Vite**.

## Tech Stack

**Frontend**
- React  
- Vite  
- JavaScript
- Tailwind CSS  

**Backend & Services**
- Appwrite (Authentication, Database)
- Gemini API (AI Responses)

## Getting Started

### Prerequisites

Make sure you have:

- Node.js (v18+ recommended)
- An Appwrite account
- A Google AI Studio account (Gemini API key)

## Installation

### Install dependencies

```bash
npm install
```

### Configure Environment Variables

Create a `.env` file in the root directory and add the following keys (See the Configuration Guide below for how to get these values):

```bash
VITE_APPWRITE_PROJECT_ID = "YOUR_APPWRITE_PROJECT_ID"
VITE_APPWRITE_PROJECT_NAME = "Your Project Name"
VITE_APPWRITE_ENDPOINT = "https://appwrite.io/docs/products/network/regions"
VITE_APPWRITE_DATABASE_ID = "YOUR_APPWRITE_DATABASE_ID"
VITE_GEMINI_API_KEY = "YOUR_GEMINI_API_KEY"
```

### Run the Development Server

```bash
npm run dev
```

## Configuration Guide

**1. Appwrite Setup**
- **Create Project**
    - Go to the Appwrite Console
    - Click **Create Project**
    - Name it `Your_Choice`
    - **Create Project ID**
    - Select Region
    - **Create**
- **Add Platform**
  - In your project dashboard, click **Get started → Connect your platform → Web**
  - Select **React**
  - Hostname: `localhost` (for development)
  - **Create platform**
- **Get Project ID & Endpoint**
    - Copy the **Project ID**, **Project Name**, and **Endpoint** from Web platform
    - Paste it into `VITE_APPWRITE_PROJECT_ID`, `VITE_APPWRITE_PROJECT_NAME`, `VITE_APPWRITE_ENDPOINT` in your `.env` file
- **Database Setup**
  - Go to **Databases**
  - Create a new database
    - Name: `Your_Choice`
    - ID: `Your_Choice`
    - Copy the **Database ID** and paste it into `VITE_APPWRITE_DATABASE_ID`
  - Create two tables
    - `Conversations`
    - `Chats`
  - In `Conversations` create theses columns
    - `title (string, Size: 512, required)`
    - `user_id (string, Size: 128, required)`
    - **Create column → Type: `Relationship` → Two-way relationship → `Chats` → Column key (related table): `conversation` → Relation: `One to many` → On deleting a row: `Cascade`**
    - Go to **Conversations → Settings → Permissions → Add role → All users**
      - Enable **Create, Read, Delete**
      - Click **Update**
      - Enable **Row security**
      - Click **Update**
  - In `Chats` create theses columns
    - `user_prompt (string, Size: 1073741824, required)`
    - `ai_response (string, Size: 1073741824, required)`
    - Go to **Chats → Settings → Permissions → Add role → All users**
      - Enable **Create, Read, Update, Delete**
      - Click **Update**
      - Enable **Row security**
      - Click **Update**

**2. Gemini API Setup**
- Go to the **Google Cloud Console**
- Click the project dropdown top left → **Create New Project**
- Name it `Your_Choice`
- Go to **Google AI Studio**
- Click **Get API key** → **Create API key**
  - Name your key: `Your_Choice`
  - Choose an imported project: **Import or Choose** `Your_Choice`
  - Click **Create**
    - If you get any error, Go to the **Google Cloud Console** → **`Your Project`** → **APIs & Services** → **Library**
    - Search **Gemini API**
    - **Enable API**
  - Copy the **API Key** and paste it into `VITE_GEMINI_API_KEY`