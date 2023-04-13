import { createCameraVideoTrack } from "@videosdk.live/react-sdk";
import { useMeetingAppContext } from "../context/MeetingAppContext";

const useMediaStream = () => {
  const {
    selectedWebcamDevice,
    selectedMicDevice,
    videoProcessor,
    allowedVirtualBackground,
    vbgUrl,
    setVbgUrl,
  } = useMeetingAppContext();
  
  const getVideoTrack = async ({ webcamId, useVirtualBackground }) => {

    const track = await createCameraVideoTrack({
      cameraId: webcamId ? webcamId : selectedWebcamDevice.id,
      multiStream: false,
    });
    if (allowedVirtualBackground) {
      if (useVirtualBackground) {        
        if (!videoProcessor.ready) {
          await videoProcessor.init();
        }        
        try {
          const processedStream = await videoProcessor.start(track, {
            type: "image",
            imageUrl: (vbgUrl)?vbgUrl:"https://cdn.videosdk.live/virtual-background/wall-with-pot.jpeg",
          });
          return processedStream;
        } catch (error) {
          console.log(error);
        }
      } else {
        if (videoProcessor.processorRunning) {
          videoProcessor.stop();
        }
      }
    }

    return track;
  };

  return { getVideoTrack };
};

export default useMediaStream;
