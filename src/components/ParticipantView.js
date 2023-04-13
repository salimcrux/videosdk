import { CameraIcon } from "@heroicons/react/24/solid";
import { useParticipant, usePubSub } from "@videosdk.live/react-sdk";
import React, { useEffect, useMemo, useRef, useState } from "react";
import ReactPlayer from "react-player";
import { useMeetingAppContext } from "../context/MeetingAppContext";
import { CornerDisplayName } from "../utils/common";
import ImageCapturePreviewDialog from "./ImageCapturePreviewDialog";

function ParticipantView({ participantId, showImageCapture, showResolution }) {
  const {
    displayName,
    webcamStream,
    micStream,
    webcamOn,
    micOn,
    isLocal,
    mode,
  } = useParticipant(participantId);

  const [participantResolution, setParticipantResolution] = useState(null);

  const { publish } = usePubSub(`CHANGE_RESOLUTION_${participantId}`, {
    onMessageReceived: async ({ message }) => {
      setParticipantResolution({
        res: message.resolution,
      });
    },
    onOldMessagesReceived: async (messages) => {
      const newResolution = messages.map(({ message }) => {
        return { ...message };
      });
      newResolution.forEach((res) => {
        if (res.resolution) {
          setParticipantResolution({
            res: res.resolution,
          });
        }
      });
    },
  });

  const { maintainVideoAspectRatio, maintainLandscapeVideoAspectRatio } =
    useMeetingAppContext();

  const micRef = useRef(null);
  const webcamRef = useRef(null);
  // const playerRef = useRef(null);
  const [mouseOver, setMouseOver] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [image, setImage] = useState(null);
  const [portrait, setPortrait] = useState(false);

  const checkAndUpdatePortrait = () => {
    if (webcamStream && maintainVideoAspectRatio) {
      const { height, width } = webcamStream.track.getSettings();
      if (height > width && !portrait) {
        setPortrait(true);
      } else if (height < width && portrait) {
        setPortrait(false);
      }
    } else {
      setPortrait(false);
    }
  };

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);
        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error("videoElem.current.play() failed", error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);
  const webcamMediaStream = useMemo(() => {
    if (webcamOn && webcamStream) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      return mediaStream;
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (webcamRef.current && webcamMediaStream) {
      webcamRef.current.srcObject = webcamMediaStream;
      webcamRef.current
        .play()
        .catch((error) =>
          console.error("videoElem.current.play() failed", error)
        );
    }
  }, [webcamRef.current, webcamMediaStream]);
  return mode === "CONFERENCE" ? (
    <div
      onMouseEnter={() => {
        setMouseOver(true);
      }}
      onMouseLeave={() => {
        setMouseOver(false);
      }}
      className={`h-full w-full  bg-gray-750 relative overflow-hidden rounded-lg ${
        maintainLandscapeVideoAspectRatio
          ? "video-contain"
          : portrait
          ? "video-contain"
          : "video-cover"
      }`}
    >
      <audio ref={micRef} autoPlay muted={isLocal} />

      {webcamOn ? (
        <video
          autoPlay
          playsInline
          muted
          ref={webcamRef}
          className="w-full h-full"
        />
      ) : (
        // <ReactPlayer
        //   ref={playerRef}
        //   //
        //   playsinline // very very imp prop
        //   playIcon={<></>}
        //   //
        //   pip={false}
        //   light={false}
        //   controls={false}
        //   muted={true}
        //   playing={true}
        //   //
        //   url={webcamMediaStream}
        //   //
        //   height={"100%"}
        //   width={"100%"}
        //   onError={(err) => {
        //     console.log(err, "participant video error");
        //   }}
        //   onProgress={() => {
        //     checkAndUpdatePortrait();
        //   }}
        // />
        <div className="h-full w-full flex items-center justify-center">
          <div
            className={`z-10 flex items-center justify-center rounded-full bg-gray-800 2xl:h-[92px] h-[52px] 2xl:w-[92px] w-[52px]`}
          >
            <p className="text-2xl text-white">
              {String(displayName).charAt(0).toUpperCase()}
            </p>
          </div>
        </div>
      )}
      {webcamOn && showResolution && (
        <div className="absolute top-3 right-14">
          <div>
            {[
              { value: "sd", label: "SD", res: "h480p_w640p" },
              { value: "hd", label: "HD", res: "h720p_w1280p" },
            ].map(({ value, label, res }) =>
              label === "SD" || label === "HD" ? (
                <button
                  className={`inline-flex items-center justify-center px-3 py-1 border ${
                    participantResolution?.res === value
                      ? "bg-purple-350 border-purple-350"
                      : "border-gray-100"
                  }  text-sm font-medium rounded-sm text-white bg-gray-750`}
                  onClick={async () => {
                    publish(
                      {
                        resolution: value,
                        resolutionValue: res,
                      },
                      {
                        persist: true,
                      }
                    );
                  }}
                >
                  {label}
                </button>
              ) : null
            )}
          </div>
        </div>
      )}
      {showImageCapture && !isLocal && (
        <div
          className="absolute top-2 left-2 rounded-md flex items-center justify-center p-2 cursor-pointer"
          style={{
            backgroundColor: "#00000066",
          }}
          onClick={() => {
            const track = new MediaStream();
            track.addTrack(webcamStream.track);
            let imageCapture = new ImageCapture(track.getVideoTracks()[0]);
            imageCapture
              .grabFrame()
              .then((imageBitmap) => {
                setImage(imageBitmap);
                setShowImagePreview(true);
              })
              .catch((error) => console.log("image capture", error));
          }}
        >
          <CameraIcon className="w-6 h-6 text-white" />
        </div>
      )}
      {showImagePreview && (
        <ImageCapturePreviewDialog
          image={image}
          open={showImagePreview}
          setOpen={setShowImagePreview}
        />
      )}
      <CornerDisplayName
        {...{
          isLocal,
          displayName,
          micOn,
          webcamOn,
          isPresenting: false,
          participantId,
          mouseOver,
        }}
      />
    </div>
  ) : null;
}

export const MemoizedParticipant = React.memo(
  ParticipantView,
  (prevProps, nextProps) => {
    return (
      prevProps.participantId === nextProps.participantId &&
      prevProps.showImageCapture === nextProps.showImageCapture
    );
  }
);
