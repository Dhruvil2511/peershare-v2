# PeerShare

**Your data, your control.**

PeerShare is a decentralized, peer-to-peer platform designed for secure, private, and instant collaboration. Whether it's sending large files, engaging in live chat, or hosting a video call, PeerShare makes it simple and safe — all without relying on central servers.

---

## 🚀 Features

* 🤝 **Peer To Peer**: Built using WebRTC for direct device-to-device communication.
* 📦 **No Size Limit**: Send files of any size without restrictions.
* 💬 **Live Chat**: Real-time text communication.
* 🎥 **Video Chat**: High-quality peer-to-peer video calling.
* ⚡ **File Transfer**: Instant sharing without uploads.
* 💻 **Screen Share**: Share your screen securely and in real time.

---

## ❓ Why PeerShare?

* **One-One Collaboration**: Combine file transfers, chat, and video calls in a single interface.
* **No Servers, No Storage**: Files go straight to the recipient without touching any servers.
* **Cross-Platform**: Works on any modern browser and across devices.
* **Eco-Friendly**: Reduced carbon footprint by eliminating server infrastructure.
* **Privacy First**: Data is encrypted using DTLS. Files disappear once the session ends.

---

## 🔐 Privacy & Security

* **End-to-End Encryption**: Only the receiver can decrypt the data.
* **Temporary Sharing**: Sessions are ephemeral. Once the tab is closed, everything is gone.
* **No Access**: PeerShare never stores or has access to your files or chats.

---

## 🌍 Global Availability

* Share anywhere with an internet connection.
* Works worldwide with no regional limitations.

---

## 🛠️ Tech Used

- React + Vite + JavaScript
- WebRTC for peer-to-peer communication
- Firestore for signaling
- shadcn/ui + Tailwind CSS for UI components and styling

---


## 🛠️ Run Locally

To run PeerShare locally:

1. Clone the repository:

   ```bash
   git clone https://github.com/Dhruvil2511/peershare-v2.git
   ```

2. Navigate into the directory:

   ```bash
   cd peershare-v2
   ```

3. Install dependencies:

   ```bash
   npm install
   # or
   yarn install
   ```

4. Start the development server:

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. ENV required (Firebase and TURN server Username password)
    ``` bash
    VITE_FIREBASE_API_KEY=
    VITE_FIREBASE_AUTH_DOMAIN=
    VITE_FIREBASE_PROJECT_ID=
    VITE_FIREBASE_STORAGE_BUCKET=
    VITE_FIREBASE_MESSAGING_SENDER_ID=
    VITE_FIREBASE_APP_ID=
    VITE_FIREBASE_MEASUREMENT_ID=
    VITE_ICE_USERNAME=
    VITE_ICE_PASSWORD=
    VITE_ICE_STUN_SERVER=
    VITE_ICE_TURN_SERVER_1=
    VITE_ICE_TURN_SERVER_2=
    VITE_ICE_TURN_SERVER_3=
    VITE_ICE_TURN_SERVER_4=
    ```

6. Open your browser and go to `http://localhost:5173`

---

## 🤝 Contributing

We welcome contributions from the community!

To contribute:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Commit and push (`git commit -m "Add your message" && git push origin feature/your-feature`)
5. Open a Pull Request describing your changes

Please make sure your code adheres to our coding guidelines and passes all tests.

---

## 🐞 Raise an Issue

If you encounter any bugs or have feature requests:

1. Go to the [Issues](https://github.com/dhruvil2511/peershare-v2/issues) section of the repository.
2. Click on **New Issue**.
3. Choose the appropriate template (bug report, feature request, etc.).
4. Fill in the details and submit.

We appreciate your feedback and help in making PeerShare better!

---

**Start Sharing Today →**

Experience fast, secure, and private sharing with PeerShare.

> © 2025 PeerShare. All rights reserved.
