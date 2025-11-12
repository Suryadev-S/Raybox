# 🌞 Raybox

A **Media Asset Management (MAM)** application designed for individuals and organizations who want to manage, search, and organize media files **locally**, without relying on third-party cloud storage solutions.

---

## 🧭 Table of Contents
- [About the Project](#about-the-project)
- [Purpose and Target Users](#purpose-and-target-users)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Current Progress](#current-progress)
- [Future Plans](#future-plans)
- [Limitations](#limitations)
- [Setup Instructions](#setup-instructions)
- [Usage](#usage)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## 📖 About the Project

**Raybox** is a media management application aimed at providing a **self-hosted, local-first** alternative to popular cloud-based storage systems like Google Drive, Dropbox, or Google Photos.  
The goal is to give users complete control over their media assets — including **images, videos, audios, and documents** — all managed within their own environment.

The system is designed to make **searching, organizing, and categorizing media files** easier while offering the flexibility to extend support for additional file types in the future.

---

## 🎯 Purpose and Target Users

Raybox is built for:

- 🧑‍💻 **Individuals** who prefer keeping personal media files on local storage instead of third-party cloud services.  
- 🏢 **Organizations and teams** managing sensitive or confidential media that must remain on-site or within a private infrastructure.

It provides a foundation for building **private, scalable media repositories** — suitable for photographers, editors, studios, and archival teams.

---

## 🧰 Tech Stack

### Frameworks & Libraries
- **Next.js 15** (Full-stack framework)
- **React 19** (Frontend library, default with Next.js)
- **TypeScript** (Static typing for scalability and clarity)
- **Tailwind CSS** (Utility-first styling)
- **ShadCN/UI** (Accessible UI component system)
- **Auth.js v5** (Authentication)
- **Sharp** (Image processing — resizing, compression, format conversion)
- **MongoDB 8.0** (Database for storing media metadata)

## 🚀 Current Progress

✅ Implemented:
- **Authentication system** using Auth.js v5  
- **Drag-and-drop uploader** with automatic media ingestion  
- **Server-Sent Events (SSE)** for real-time progress logs  
- **Image ingestion module** (upload, metadata storage, thumbnail generation)  
- **Sharp integration** for cropping, resizing, and format conversion  
- **Media directory setup** for organized storage  
- **Basic media listing and retrieval APIs**

🧩 Technical Notes:
- Each upload currently handled **one file per request**.
- The backend processes each file sequentially.  
- Message queues like **BullMQ** or **RabbitMQ** are planned for future asynchronous ingestion.
- **p-map** was previously used for concurrent processing but is no longer active in the current setup.

---

## 🔮 Future Plans

- [ ] Extend ingestion to **videos, audios, and documents**
- [ ] Implement **search and filter system** for media items
- [ ] Add **metadata editing** and tagging capabilities
- [ ] Integrate **BullMQ / RabbitMQ** for async job handling
- [ ] Improve UI feedback and progress tracking system
- [ ] Add **media preview and player support**
- [ ] Implement **role-based access control (RBAC)**
- [ ] Add **export/import** support for media collections
- [ ] Prepare the system for **local deployment packaging**

---

## ⚠️ Limitations

- The application is designed for **local use only** at this stage.
- Current ingestion supports **only image files**.
- No large-scale performance testing has been done yet.
- Concurrency and job queuing features are **paused** for now.

---
