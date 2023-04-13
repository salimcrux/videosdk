import React, { useState, useEffect, useRef, createRef } from "react";
import {
  Constants,
  createCameraVideoTrack,
  createMicrophoneAudioTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import { BottomBar } from "./components/BottomBar";
import { SidebarConatiner } from "../components/sidebar/SidebarContainer";
import MemorizedParticipantView from "./components/ParticipantView";
import { PresenterView } from "../components/PresenterView";
import { nameTructed, trimSnackBarText } from "../utils/helper";
import WaitingToJoinScreen from "../components/screens/WaitingToJoinScreen";
import ConfirmBox from "../components/ConfirmBox";
import useIsMobile from "../hooks/useIsMobile";
import useIsTab from "../hooks/useIsTab";
import { useMediaQuery } from "react-responsive";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../context/MeetingAppContext";
import useRaisedHandParticipants from "../hooks/useRaisedHandParticipants";
import useMediaStream from "../hooks/useMediaStream";
import { meetingLeftReasons, meetingModes } from "../utils/common";
import ResolutionListner from "../components/ResolutionListner";
import { ScreenShareView } from "../components/ScreenShareView";
import ModeListner from "../components/ModeListner";

export function MeetingContainer({ onMeetingLeave }) {
  const bottomBarHeight = 60;

  const [containerHeight, setContainerHeight] = useState(0);
  const [containerWidth, setContainerWidth] = useState(0);
  const {
    sideBarMode,
    initialMicOn,
    initialWebcamOn,
    selectedWebcamDevice,
    selectedMicDevice,
    useVirtualBackground,
    allowedVirtualBackground,
    isLandscape,
    participantLeftReason,
    setParticipantLeftReason,
    meetingMode,   
    participantId,  // Salim
  } = useMeetingAppContext();  
  // console.log('participantIdcontext11:', participantId);
  const [meetingErrorVisible, setMeetingErrorVisible] = useState(false);
  const [meetingError, setMeetingError] = useState(false);
  const [localParticipantAllowedJoin, setLocalParticipantAllowedJoin] =
    useState(null);

  const mMeetingRef = useRef();
  const containerRef = createRef();
  const containerHeightRef = useRef();
  const containerWidthRef = useRef();

  useEffect(() => {
    containerHeightRef.current = containerHeight;
    containerWidthRef.current = containerWidth;
  }, [containerHeight, containerWidth]);

  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const isLGDesktop = useMediaQuery({ minWidth: 1024, maxWidth: 1439 });
  const isXLDesktop = useMediaQuery({ minWidth: 1440 });
  const gtThanMD = useMediaQuery({ minWidth: 768 });

  const sideBarContainerWidth = isXLDesktop
    ? 400
    : isLGDesktop
    ? 360
    : isTab
    ? 320
    : isMobile
    ? 280
    : 240;

  useEffect(() => {
    const boundingRect = containerRef.current.getBoundingClientRect();
    const { width, height } = boundingRect;

    if (height !== containerHeightRef.current) {
      setContainerHeight(height);
    }

    if (width !== containerWidthRef.current) {
      setContainerWidth(width);
    }
  }, [containerRef]);

  const _handleOnRecordingStateChanged = ({ status }) => {
    if (
      status === Constants.recordingEvents.RECORDING_STARTED ||
      status === Constants.recordingEvents.RECORDING_STOPPED
    ) {
      toast(
        `${
          status === Constants.recordingEvents.RECORDING_STARTED
            ? "Meeting recording is started"
            : "Meeting recording is stopped."
        }`,
        {
          position: "bottom-left",
          autoClose: 4000,
          hideProgressBar: true,
          closeButton: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light",
        }
      );
    }
  };

  function onParticipantJoined(participant) {
    // Change quality to low, med or high based on resolution
    participant && participant.setQuality("high");
  }

  // function onEntryResponded(participantId, name) {
  // console.log(" onEntryResponded", participantId, name);
  //   if (mMeetingRef.current?.localParticipant?.id === participantId) {
  //     if (name === "allowed") {
  //       setLocalParticipantAllowedJoin(true);
  //     } else {
  //       setLocalParticipantAllowedJoin(false);
  //       setTimeout(() => {
  //         _handleMeetingLeft();
  //       }, 3000);
  //     }
  //   }
  // }

  const { getVideoTrack } = useMediaStream();

  async function onMeetingJoined() {
    const { muteMic, changeMic, changeWebcam, disableWebcam, toggleWebcam } =
      mMeetingRef.current;    

    // if (initialWebcamOn && selectedWebcamDevice.id) {
    //   await new Promise((resolve) => {
    //     disableWebcam();
    //     setTimeout(() => {
    //       changeWebcam(selectedWebcamDevice.id);
    //       resolve();
    //     }, 500);
    //   });
    // }

    if (initialWebcamOn) {
      let track;
      await new Promise((resolve) => {
        disableWebcam();
        setTimeout(async () => {
          if (allowedVirtualBackground) {
            track = await getVideoTrack({
              useVirtualBackground: useVirtualBackground,
            });
          } else {
            track = await createCameraVideoTrack({
              cameraId: selectedWebcamDevice.id,
              optimizationMode: "motion",
              encoderConfig: "h1080p_w1920p",
              facingMode: "environment",
              multiStream: false,
            });
          }
          changeWebcam(track);

          resolve();
        }, 500);
      });
    }

    if (initialMicOn && selectedMicDevice.id) {
      await new Promise((resolve) => {
        muteMic();
        setTimeout(async () => {
          const audioTrack = await createMicrophoneAudioTrack({
            encoderConfig: "speech_standard",
            microphoneId: selectedMicDevice.id,
          });
          changeMic(audioTrack);
          resolve();
        }, 500);
      });
    }
    setLocalParticipantAllowedJoin(true);
    // Added by Salim*****  
    window.parent.postMessage({type:"meetingjoined", info:"Meeting Joined Successfully !!"}, '*');
  }
  function onMeetingLeft() {
    onMeetingLeave();
  }

  const _handleOnError = (data) => {
    const { code, message } = data;

    const joiningErrCodes = [
      4001, 4002, 4003, 4004, 4005, 4006, 4007, 4008, 4009, 4010,
    ];

    const isJoiningError = joiningErrCodes.findIndex((c) => c === code) !== -1;
    const isCriticalError = `${code}`.startsWith("500");

    new Audio(
      isCriticalError
        ? `https://static.videosdk.live/prebuilt/notification_critical_err.mp3`
        : `https://static.videosdk.live/prebuilt/notification_err.mp3`
    ).play();

    setMeetingErrorVisible(true);
    setMeetingError({
      code,
      message: isJoiningError ? "Unable to join meeting!" : message,
    });
  };

  function onParticipantLeft(participant) {
    toast(
      `${trimSnackBarText(nameTructed(participant.displayName, 15))} ${
        participantLeftReason === meetingLeftReasons.TAB_BROWSER_CLOSED
          ? "left because of tab closed."
          : "left the meeting."
      }`,
      {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      }
    );
  }

  const mMeeting = useMeeting({
    onParticipantJoined,
    onParticipantLeft,
    // onEntryResponded,
    onMeetingJoined,
    onMeetingLeft,
    onError: _handleOnError,
    onRecordingStateChanged: _handleOnRecordingStateChanged,
  });

  const isPresenting = mMeeting.presenterId ? true : false;

  useEffect(() => {
    mMeetingRef.current = mMeeting;
  }, [mMeeting]);

  const { participantRaisedHand } = useRaisedHandParticipants();

  usePubSub("RAISE_HAND", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName } = data;

      const isLocal = senderId === localParticipantId;

      new Audio(
        `https://static.videosdk.live/prebuilt/notification.mp3`
      ).play();

      toast(`${isLocal ? "You" : nameTructed(senderName, 15)} raised hand 🖐🏼`, {
        position: "bottom-left",
        autoClose: 4000,
        hideProgressBar: true,
        closeButton: false,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
      });

      participantRaisedHand(senderId);
    },
  });

  usePubSub("CHAT", {
    onMessageReceived: (data) => {
      const localParticipantId = mMeeting?.localParticipant?.id;

      const { senderId, senderName, message } = data;

      const isLocal = senderId === localParticipantId;

      if (!isLocal) {
        new Audio(
          `https://static.videosdk.live/prebuilt/notification.mp3`
        ).play();

        toast(
          `${trimSnackBarText(
            `${nameTructed(senderName, 15)} says: ${message}`
          )}`,
          {
            position: "bottom-left",
            autoClose: 4000,
            hideProgressBar: true,
            closeButton: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
          }
        );
      }
    },
  });

  function unlock() {
    let de = document.documentElement;
    if (de.exitFullscreen) {
      de.exitFullscreen();
    } else if (de.mozCancelFullScreen) {
      de.mozCancelFullScreen();
    } else if (de.webkitExitFullscreen) {
      de.webkitExitFullscreen();
    } else if (de.msExitFullscreen) {
      de.msExitFullscreen();
    }
    window.screen.orientation.unlock();
  }

  function lock() {
    let de = document.documentElement;
    if (de.requestFullscreen) {
      de.requestFullscreen();
    } else if (de.mozRequestFullScreen) {
      de.mozRequestFullScreen();
    } else if (de.webkitRequestFullscreen) {
      de.webkitRequestFullscreen();
    } else if (de.msRequestFullscreen) {
      de.msRequestFullscreen();
    }
    window.screen.orientation.lock("landscape");
  }

  useEffect(() => {
    if (isLandscape && isMobile) {
      lock();
    } else if (!isLandscape && gtThanMD) {
      unlock();
    } else {
    }
  }, [isLandscape]);

  useEffect(() => {
    window.addEventListener("beforeunload", (event) => {
      setParticipantLeftReason(meetingLeftReasons.TAB_BROWSER_CLOSED);
      console.log("participant left because of tab closed");
      event.preventDefault();
      event.returnValue = "";
    });
  }, []);

  return (
    <div
      // style={{ height: windowHeight }}
      ref={containerRef}
      className={`h-screen flex flex-col bg-white`}
    >
      {typeof localParticipantAllowedJoin === "boolean" ? (
        localParticipantAllowedJoin ? (
          <>
            <ResolutionListner />
            <ModeListner />
            <div
              className={` flex flex-1 ${
                isPresenting && isMobile ? "flex-col md:flex-row" : "flex-row"
              } bg-white `}
            >
              {/* <div className="flex flex-1">
                {isPresenting ? (
                  <PresenterView height={containerHeight - bottomBarHeight} />
                ) : null}
                <MemorizedParticipantView
                  isPresenting={isPresenting}
                  sideBarMode={sideBarMode}
                />
              </div> */}
              {isPresenting && isMobile ? (
                <div
                  className={`flex flex-1 ${
                    isPresenting && isMobile ? "flex-col" : "flex-row"
                  } `}
                >
                  <div className={`flex flex-1`}>
                    {isPresenting ? (
                      <PresenterView
                        height={containerHeight - bottomBarHeight}
                      />
                    ) : null}
                  </div>
                  {meetingMode === meetingModes.SCREEN_SHARE &&
                  !isPresenting ? (
                    <div className={`flex flex-1`}>
                      <ScreenShareView
                        height={containerHeight - bottomBarHeight}
                      />
                    </div>
                  ) : meetingMode === meetingModes.SCREEN_SHARE ? null : (
                    <div className={`flex h-1/3 md:flex-1`}>
                      <MemorizedParticipantView
                        isPresenting={isPresenting}
                        sideBarMode={sideBarMode}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <>
                  {isPresenting ? (
                    <PresenterView height={containerHeight - bottomBarHeight} />
                  ) : null}
                  {meetingMode === meetingModes.SCREEN_SHARE &&
                  !isPresenting ? (
                    <ScreenShareView
                      height={containerHeight - bottomBarHeight}
                    />
                  ) : meetingMode === meetingModes.SCREEN_SHARE ? null : (
                    <MemorizedParticipantView
                      isPresenting={isPresenting}
                      sideBarMode={sideBarMode}
                    />
                  )}
                </>
              )}

              <SidebarConatiner
                height={containerHeight - bottomBarHeight}
                sideBarContainerWidth={sideBarContainerWidth}
              />
            </div>

            <BottomBar bottomBarHeight={bottomBarHeight} />
          </>
        ) : (
          <></>
        )
      ) : (
        !mMeeting.isMeetingJoined && <WaitingToJoinScreen />
      )}
      <ConfirmBox
        open={meetingErrorVisible}
        successText="OKAY"
        onSuccess={() => {
          setMeetingErrorVisible(false);
        }}
        title={`Error Code: ${meetingError.code}`}
        subTitle={meetingError.message}
      />
    </div>
  );
}
