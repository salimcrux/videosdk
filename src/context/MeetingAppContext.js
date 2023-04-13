import { createContext, useContext, useState, useEffect } from "react";
import { VirtualBackgroundProcessor } from "@videosdk.live/videosdk-media-processor-web";
import { participantModes } from "../utils/common";

export const MeetingAppContext = createContext();

export const useMeetingAppContext = () => useContext(MeetingAppContext);

export const MeetingAppProvider = ({
  children,
  selectedMic,
  selectedWebcam,
  initialMicOn,
  initialWebcamOn,
  topbarEnabled,
  participantMode,
  clegId, // Salim
}) => {
  const [participantId, setparticipantId] = useState(clegId); // Salim
  
  const [sideBarMode, setSideBarMode] = useState(null);
  const [selectedWebcamDevice, setSelectedWebcamDevice] =
    useState(selectedWebcam);
  const [selectedMicDevice, setSelectedMicDevice] = useState(selectedMic);
  const [raisedHandsParticipants, setRaisedHandsParticipants] = useState([]);
  const [useVirtualBackground, setUseVirtualBackground] = useState(
    participantMode !== participantModes.CLIENT
  );
  const [participantLeftReason, setParticipantLeftReason] = useState(null);
  const [meetingMode, setMeetingMode] = useState(null);

  const [isLandscape, setIsLandscape] = useState(null);
 
  const videoProcessor = new VirtualBackgroundProcessor();

  const isAgent =
    !!participantMode && participantMode !== participantModes.CLIENT;

    // *********** Salim ********************************//
    const [vbgUrl, setVbgUrl] = useState(null);
    const [promoText, setPromoText] = useState("");
    const [promoUrl, setPromoUrl] = useState("");
          
    useEffect(() => {      
      const childResponse = (event) => {        
        if(event?.data) {
            if(event.data.type === "virtualBG") {
              setVbgUrl(event.data.data.vbgUrl);              
            }  
            if(event.data.type === "promographic") {              
              setPromoText(event.data.info);
              setPromoUrl(event.data.url);
              event.source.postMessage({type:"changedpromo", info:"Changed Infographics"}, event.origin);
            }                 
        }        
      };      
      window.addEventListener('message', childResponse);     
      return () => { 
        window.removeEventListener('message', childResponse);
      }
    }, []);
    // ***********************************************************//

  return (
    <MeetingAppContext.Provider
      value={{
        // default options
        initialMicOn,
        initialWebcamOn,
        participantMode,

        allowedVirtualBackground: isAgent,

        maintainVideoAspectRatio: isAgent,
        maintainLandscapeVideoAspectRatio: true,
        canRemoveOtherParticipant: isAgent,

        // states
        sideBarMode,
        selectedWebcamDevice,
        selectedMicDevice,
        raisedHandsParticipants,
        useVirtualBackground,
        isLandscape,
        participantLeftReason,
        meetingMode,
        vbgUrl, // Salim
        promoText,  // Salim
        promoUrl,  // Salim
        participantId, // Salim

        // setters
        setSideBarMode,
        setSelectedMicDevice,
        setSelectedWebcamDevice,
        setRaisedHandsParticipants,
        setUseVirtualBackground,
        setIsLandscape,
        setParticipantLeftReason,
        setMeetingMode,
        setVbgUrl,  // Salim

        videoProcessor,
      }}
    >
      {children}
    </MeetingAppContext.Provider>
  );
};
