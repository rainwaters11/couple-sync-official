# 💖 Couple Sync 

**Seven small daily rituals unlock one meaningful relationship surprise.** Couple Sync is a decentralized app that turns daily emotional labor into a shared, rewarding journey. 

**📺 [Link to 3-5 Minute YouTube Demo Video]** *(https://youtu.be/_zinILT_MDk)*
**🔗 [Link to Live Interactive Demo]** *(https://couplesync.live/)*

---

## 🎯 4-Line Problem Frame
* **User:** Busy couples struggling to maintain consistent, balanced emotional connection.
* **Problem:** Relationship maintenance—often called "invisible emotional labor"—frequently falls disproportionately on one partner and lacks mutual visibility.
* **Constraints:** Couples are burned out on screens and need simple, low-barrier actions that don't feel like long therapy checklists.
* **Success Test:** Both partners complete a 7-day streak of synchronized rituals to unlock a shared reward stored on an immutable ledger.

---

## 🚀 Project Overview
**Couple Sync** is a lightweight, decentralized relationship ritual app designed to help partners stay emotionally connected through small daily actions. The dApp addresses **UN SDG 5 (Gender Equality)** by making "invisible" emotional labor visible and equitable through a shared on-chain ledger.

### 🔐 Solo vs. Synced Modes
* **Solo Mode (Default):** Designed for individuals to build personal consistency or explore the app before inviting a partner. All data remains private and cached locally on the device.
* **Room Sync (Web3):** Users can generate a 6-digit room code to link devices via the **Internet Computer Protocol (ICP)**. This enables shared ritual tracking and the **7-Day Reveal Ceremony**.

---

## ✨ Key Features
* **The Mutual Gift (Weekly Surprise):** Each week runs on a **Saturday-to-Friday** loop. Partners secretly select a date or experience at the start of the week.
* **The Cross-Hint System:** Completing daily check-ins unlocks progressive clues about the partner's secret plan.
* **Resilient Sync Architecture:** I engineered a **Local-First Solo Mode** using `localStorage` caching. The app gracefully transitions to **Synced** once an ICP canister handshake is established.
* **The 7-Day Reveal Ceremony:** On Friday (Day 7), the app reveals the secret weekend plans.



---

## 🗺️ Web3 Roadmap: Soulbound Tokens (SBTs)
Couple Sync tracks **20-day connection streaks** to unlock Monthly Badges (e.g., "Luck of Love"). We are integrating the **ICRC-7 NFT Standard** to mint these as **Soulbound Tokens**. These non-transferable tokens create a permanent, decentralized gallery of authentic relationship milestones in ICP wallets.

---

## 🛠️ Tech Stack
* **Frontend:** React, TypeScript, Tailwind CSS
* **Backend / Smart Contracts:** Motoko
* **Blockchain Network:** Internet Computer Protocol (ICP)
* **Storage:** LocalStorage & ICP Canisters
* **Prototyping Tooling:** Caffeine.ai

---

## 🔗 How to Join a Room
1. **Generate a Code:** One partner clicks the **"Room Sync"** icon to generate a unique 6-digit room code.
2. **Share with Partner:** Share the code with your significant other.
3. **Enter and Sync:** The second partner enters the code to establish a secure, shared state on the **ICP mainnet**.
4. **Synchronized Rituals:** Once synced, both partners see real-time progress toward rewards.

---

## ⚙️ Quickstart / Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/rainwaters11/couple-sync.git](https://github.com/rainwaters11/couple-sync.git)
   cd couple-sync
Install dependencies:

Bash
npm install
Start the local development server:

Bash
npm run dev
