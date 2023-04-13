import {
  createCameraVideoTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../context/MeetingAppContext";
import useMediaStream from "../hooks/useMediaStream";

const ResolutionListner = () => {
  const mMeeting = useMeeting();

  const {
    selectedWebcamDevice,
    allowedVirtualBackground,
    useVirtualBackground,
  } = useMeetingAppContext();
  const { getVideoTrack } = useMediaStream();

  usePubSub(`CHANGE_RESOLUTION_${mMeeting?.localParticipant?.id}`, {
    onMessageReceived: async ({ message }) => {
      let customTrack;
      if (allowedVirtualBackground) {
        customTrack = await getVideoTrack({
          useVirtualBackground: useVirtualBackground,
        });
      } else {
        customTrack = await createCameraVideoTrack({
          cameraId: selectedWebcamDevice.id,
          optimizationMode: "motion",
          encoderConfig: message.resolutionValue, //h90p_w160p | h180p_w320p | h216p_w384p | h360p_w640p | h540p_w960p | h720p_w1280p | h1080p_w1920p | h1440p_w2560p | h2160p_w3840p | h120p_w160p | h180p_w240p | h240p_w320p | h360p_w480p | h480p_w640p | h540p_w720p | h720p_w960p | h1080p_w1440p | h1440p_w1920p
          facingMode: "environment",
          multiStream: false,
        });
      }

      mMeeting.changeWebcam(customTrack);
    },
  });

  return <></>;
};

export default ResolutionListner;
