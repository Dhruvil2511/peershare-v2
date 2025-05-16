// src/store/webrtcStore.js
import { create } from 'zustand';
import { doc, setDoc, collection, addDoc, onSnapshot, deleteDoc, getDocs } from 'firebase/firestore';
import { db } from '../config/firebaseconfig';
import iceconfig from '../config/iceconfig';
import { toast } from 'sonner';

const useWebRTCStore = create((set, get) => ({
  // Connection state
  connection: null,
  role: null, // 'caller' or 'callee'
  roomId: null,
  connectionStatus: 'Initializing...',

  // Stream state
  localStream: null,
  remoteStream: null,
  isMobile: false, // Track if the device is mobile

  // Data channel
  dataChannel: null,
  fileTransferChannel: null,
  incomingFileMeta: null,
  videoEnabled: false,  // Track if video is enabled
  audioEnabled: false, // Track if audio is enabled
  customRoom: false,

  setCustomRoom: (customRoom) => set({ customRoom }),

  setIncomingFileMeta: (meta) => set({ incomingFileMeta: meta }),
  setIsMobile: (isMobile) => set({ isMobile }),

  // ICE candidates
  pendingCandidates: [],

  // Set connection status
  setConnectionStatus: (status) => set({ connectionStatus: status }),

  // Initialize as caller
  initializeCaller: (connection, roomId) => {
    set({
      connection,
      role: 'caller',
      roomId
    });
  },

  // Initialize as callee
  initializeCallee: (connection, roomId) => {
    set({
      connection,
      role: 'callee',
      roomId
    });
  },

  // Store data channel
  setDataChannel: (dataChannel) => set({ dataChannel }),

  setFileTransferChannel: (fileTransferChannel) => set({ fileTransferChannel }),

  // Store local stream
  setLocalStream: (stream) => set({ localStream: stream }),

  // Store remote stream
  setRemoteStream: (stream) => set({ remoteStream: stream }),

  // Add pending ICE candidate
  addPendingCandidate: (candidate) => {
    const pendingCandidates = [...get().pendingCandidates, candidate];
    set({ pendingCandidates });
  },

  // Clear pending candidates
  clearPendingCandidates: () => set({ pendingCandidates: [] }),

  // Process pending ICE candidates
  processPendingCandidates: async () => {
    const { connection, pendingCandidates } = get();

    if (connection && connection.remoteDescription) {
      const candidates = [...pendingCandidates];
      set({ pendingCandidates: [] });

      for (const candidate of candidates) {
        try {
          await connection.addIceCandidate(new RTCIceCandidate(candidate));
        } catch (error) {
          console.error("Error adding pending ICE candidate:", error);
        }
      }
    }
  },

  // Initialize connection listeners
  initializeConnectionListeners: () => {
    const { connection, setConnectionStatus } = get();

    if (!connection) return;



    connection.addEventListener('connectionstatechange', () => {
      if (connection.connectionState === 'connected') {
        setConnectionStatus("connected");
      } else if (connection.connectionState === 'disconnected') {
        setConnectionStatus("disconnected");
      } else if (connection.connectionState === 'failed') {
        setConnectionStatus("failed");
      } else {
        setConnectionStatus(`ℹ️ State: ${connection.connectionState}`);
      }
    });

    connection.addEventListener('iceconnectionstatechange', () => {
      if (connection.iceConnectionState === 'connected') {
        setConnectionStatus("ice-connected");
      } else if (connection.iceConnectionState === 'checking') {
        setConnectionStatus("ice-checking");
      } else if (connection.iceConnectionState === 'failed') {
        setConnectionStatus("ice-failed");
      }
    });
  },

  // Create room and offer
  createRoom: async (customRoomID, isStale) => {

    const roomId = customRoomID ? customRoomID : Math.random().toString(36).substring(2, 10);
    console.log("Generated room ID:", roomId);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      set({ localStream: stream });

    } catch (error) {
      toast.error("Error accessing media devices");
    }
    const connection = new RTCPeerConnection(iceconfig);

    get().localStream?.getTracks().forEach(track => {
      connection.addTrack(track, get().localStream);
    });
    get().localStream?.getVideoTracks().forEach(track => { track.enabled = false });
    get().localStream?.getAudioTracks().forEach(track => { track.enabled = false });

    connection.ontrack = (event) => {
      set({ remoteStream: event.streams[0] });
    };


    // Store the connection in our state
    set({ connection, roomId, role: 'caller' });

    // Initialize listeners
    get().initializeConnectionListeners();

    // Store and send ICE candidates
    connection.onicecandidate = async (event) => {
      if (event.candidate) {
        const candidatesRef = collection(db, "rooms", roomId, "callerCandidates");
        await addDoc(candidatesRef, event.candidate.toJSON());
      } else {
        console.log('✅ All local ICE candidates gathered');
      }
    };

    // Create data channel
    const dataChannel = connection.createDataChannel('chat');
    set({ dataChannel });
    console.log("Data channel created");

    dataChannel.onopen = () => {
      console.log("✅ Caller data channel open");
      setTimeout(() => {
        try {
          dataChannel.send("Welcome to PeerShare 👋");
        } catch (error) {
          console.error("❌ Failed to send via data channel:", error);
        }
      }, 1000);
    };

    dataChannel.onclose = () => {
      console.log("❌ Data channel closed");
    };

    dataChannel.onerror = (error) => {
      console.error("❌ Data channel error:", error);
    };


    const fileTransferChannel = connection.createDataChannel('file', { ordered: true });
    set({ fileTransferChannel });
    console.log("File Transfer channel created");

    fileTransferChannel.onopen = () => {
      console.log("fileTransferChannel channel opened.");
    };

    fileTransferChannel.onclose = () => {
      console.log("❌ fileTransferChannel closed");
    };

    fileTransferChannel.onerror = (error) => {
      console.error("❌ fileTransferChannel error:", error);
    };


    // Create and set local offer
    try {
      const offer = await connection.createOffer();
      await connection.setLocalDescription(offer);

      const roomRef = doc(db, "rooms", roomId);
      await setDoc(roomRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
        lastSeen: Date.now(),
      });

      // Listen for answer
      onSnapshot(roomRef, async (snapshot) => {
        const data = snapshot.data();
        if (!data) return;

        if (data?.answer && connection && !data.connectionStatus) {
          try {
            const remoteDesc = new RTCSessionDescription(data.answer);
            await connection.setRemoteDescription(remoteDesc);
            // Process any pending candidates after remote description is set
            await get().processPendingCandidates();
          } catch (error) {
            console.error("❌ Error setting remote description:", error);
          }
        }
      });

      // Listen for callee candidates
      const calleeCandidatesRef = collection(db, "rooms", roomId, "calleeCandidates");
      onSnapshot(calleeCandidatesRef, (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
          if (change.type === "added") {
            const candidate = change.doc.data();
            if (connection && connection.remoteDescription) {
              try {
                await connection.addIceCandidate(new RTCIceCandidate(candidate));
              } catch (error) {
                console.error("Error adding remote ICE candidate:", error);
              }
            } else {
              get().addPendingCandidate(candidate);
            }
          }
        });
      });

      return roomId;
    } catch (error) {
      console.error("Error during offer creation:", error);
      return null;
    }
  },

  // Reset state
  resetState: async () => {
    const { roomId } = get();

    if (roomId) {
      try {
        const roomRef = doc(db, "rooms", roomId);

        // Delete callerCandidates subcollection
        const callerCandidatesRef = collection(roomRef, "callerCandidates");
        const callerSnapshot = await getDocs(callerCandidatesRef);
        const callerDeletePromises = callerSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(callerDeletePromises);

        // Delete calleeCandidates subcollection
        const calleeCandidatesRef = collection(roomRef, "calleeCandidates");
        const calleeSnapshot = await getDocs(calleeCandidatesRef);
        const calleeDeletePromises = calleeSnapshot.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(calleeDeletePromises);

        // Delete the room document itself
        await deleteDoc(roomRef);
        console.log(`Room ${roomId} deleted from Firestore`);
      } catch (error) {
        console.error("Error cleaning up Firestore room:", error);
      }
    }

    // Reset the local state
    set({
      connection: null,
      role: null,
      roomId: null,
      localStream: null,
      remoteStream: null,
      dataChannel: null,
      pendingCandidates: [],
      connectionStatus: 'Initializing...',
      incomingFileMeta: null,
      videoEnabled: false,
      audioEnabled: false,
      customRoom: false,
      isMobile: false,
      fileTransferChannel: null,
    });
  },
}));

export default useWebRTCStore;