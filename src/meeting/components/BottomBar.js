import {
  Constants,
  createCameraVideoTrack,
  createScreenShareVideoTrack,
  useMeeting,
  usePubSub,
} from "@videosdk.live/react-sdk";
import React, { Fragment, useEffect, useMemo, useRef, useState } from "react";
import {
  ClipboardIcon,
  CheckIcon,
  ChevronDownIcon,
  EllipsisHorizontalIcon,
} from "@heroicons/react/24/outline";
import { CheckCircleIcon } from "@heroicons/react/24/solid";
import recordingBlink from "../../static/animations/recording-blink.json";
import useIsRecording from "../../hooks/useIsRecording";
import RecordingIcon from "../../icons/Bottombar/RecordingIcon";
import MicOnIcon from "../../icons/Bottombar/MicOnIcon";
import MicOffIcon from "../../icons/Bottombar/MicOffIcon";
import WebcamOnIcon from "../../icons/Bottombar/WebcamOnIcon";
import WebcamOffIcon from "../../icons/Bottombar/WebcamOffIcon";
import ScreenShareIcon from "../../icons/Bottombar/ScreenShareIcon";
import ChatIcon from "../../icons/Bottombar/ChatIcon";
import ParticipantsIcon from "../../icons/Bottombar/ParticipantsIcon";
import EndIcon from "../../icons/Bottombar/EndIcon";
import RaiseHandIcon from "../../icons/Bottombar/RaiseHandIcon";
import { OutlinedButton } from "../../components/buttons/OutlinedButton";
import useIsTab from "../../hooks/useIsTab";
import useIsMobile from "../../hooks/useIsMobile";
import { MobileIconButton } from "../../components/buttons/MobileIconButton";
import {
  meetingModes,
  participantModes,
  sideBarModes,
} from "../../utils/common";
import { Dialog, Popover, Transition } from "@headlessui/react";
import { createPopper } from "@popperjs/core";
import { useMeetingAppContext } from "../../context/MeetingAppContext";
import useMediaStream from "../../hooks/useMediaStream";
import ExitScreenIcon from "../../icons/Bottombar/ExitScreenIcon";
import FullScreenIcon from "../../icons/Bottombar/FullScreenIcon";
import { toast } from "react-toastify";
import { nameTructed, trimSnackBarText } from "../../utils/helper";
import OutlineIconTextButton from "../../components/buttons/OutlineIconTextButton";

export function BottomBar({ bottomBarHeight }) {
  const {
    sideBarMode,
    setSideBarMode,
    selectedMicDevice,
    setSelectedMicDevice,
    selectedWebcamDevice,
    setSelectedWebcamDevice,
    participantMode,
  } = useMeetingAppContext();

  const RaiseHandBTN = ({ isMobile, isTab }) => {
    const { publish } = usePubSub("RAISE_HAND");
    const RaiseHand = () => {
      publish("Raise Hand");
    };

    return isMobile || isTab ? (
      <MobileIconButton
        id="RaiseHandBTN"
        tooltipTitle={"Raise hand"}
        Icon={RaiseHandIcon}
        onClick={RaiseHand}
        buttonText={"Raise Hand"}
      />
    ) : (
      <OutlinedButton
        onClick={RaiseHand}
        tooltip={"Raise Hand"}
        Icon={RaiseHandIcon}
      />
    );
  };

  const RecordingBTN = ({ isMobile, isTab }) => {
    const { startRecording, stopRecording, recordingState } = useMeeting();
    const defaultOptions = {
      loop: true,
      autoplay: true,
      animationData: recordingBlink,
      rendererSettings: {
        preserveAspectRatio: "xMidYMid slice",
      },
      height: 64,
      width: 160,
    };

    const isRecording = useIsRecording();
    const isRecordingRef = useRef(isRecording);

    useEffect(() => {
      isRecordingRef.current = isRecording;
    }, [isRecording]);

    const { isRequestProcessing } = useMemo(
      () => ({
        isRequestProcessing:
          recordingState === Constants.recordingEvents.RECORDING_STARTING ||
          recordingState === Constants.recordingEvents.RECORDING_STOPPING,
      }),
      [recordingState]
    );

    const _handleClick = () => {
      const isRecording = isRecordingRef.current;

      if (isRecording) {
        stopRecording();
      } else {
        startRecording();
      }
    };

    return isMobile ? (
      <MobileIconButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        buttonText={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    ) : isTab ? (
      <OutlinedButton
        Icon={RecordingIcon}
        onClick={_handleClick}
        isFocused={isRecording}
        tooltip={
          recordingState === Constants.recordingEvents.RECORDING_STARTED
            ? "Stop Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STARTING
            ? "Starting Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPED
            ? "Start Recording"
            : recordingState === Constants.recordingEvents.RECORDING_STOPPING
            ? "Stopping Recording"
            : "Start Recording"
        }
        lottieOption={isRecording ? defaultOptions : null}
        isRequestProcessing={isRequestProcessing}
      />
    ) : null;
  };

  const MicBTN = () => {
    const mMeeting = useMeeting();
    const [mics, setMics] = useState([]);
    const localMicOn = mMeeting?.localMicOn;
    const changeMic = mMeeting?.changeMic;

    const getMics = async (mGetMics) => {
      const mics = await mGetMics();

      mics && mics?.length && setMics(mics);
    };

    const [tooltipShow, setTooltipShow] = useState(false);
    const btnRef = useRef();
    const tooltipRef = useRef();

    const openTooltip = () => {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "top",
      });
      setTooltipShow(true);
    };
    const closeTooltip = () => {
      setTooltipShow(false);
    };

    return (
      <>
        <OutlinedButton
          Icon={localMicOn ? MicOnIcon : MicOffIcon}
          onClick={() => {
            mMeeting.toggleMic();
          }}
          bgColor={localMicOn ? "bg-gray-750" : "bg-white"}
          borderColor={localMicOn && "#ffffff33"}
          isFocused={localMicOn}
          focusIconColor={localMicOn && "white"}
          tooltip={"Toggle Mic"}
          renderRightComponent={() => {
            return (
              <>
                <Popover className="relative">
                  {({ close }) => (
                    <>
                      <Popover.Button className="flex items-center justify-center mt-1 mr-1">
                        <div
                          ref={btnRef}
                          onMouseEnter={openTooltip}
                          onMouseLeave={closeTooltip}
                        >
                          <button
                            onClick={(e) => {
                              getMics(mMeeting.getMics);
                            }}
                          >
                            <ChevronDownIcon
                              className="h-4 w-4"
                              style={{
                                color: mMeeting.localMicOn ? "white" : "black",
                              }}
                            />
                          </button>
                        </div>
                      </Popover.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className={" bg-gray-750 py-1"}>
                              <div>
                                <div className="flex items-center p-3 pb-0">
                                  <p className="ml-3 text-sm text-gray-900">
                                    {"MICROPHONE"}
                                  </p>
                                </div>
                                <div className="flex flex-col">
                                  {mics.map(({ deviceId, label }, index) => (
                                    <div
                                      className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                                        deviceId === selectedMicDevice.id &&
                                        "bg-gray-150"
                                      }`}
                                    >
                                      <button
                                        className={`flex flex-1 w-full ${
                                          deviceId === selectedMicDevice.id &&
                                          "bg-gray-150"
                                        }`}
                                        key={`mics_${deviceId}`}
                                        onClick={() => {
                                          setSelectedMicDevice({
                                            deviceId,
                                            label,
                                          });
                                          changeMic(deviceId);
                                          close();
                                        }}
                                      >
                                        {label || `Mic ${index + 1}`}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <div
                  style={{ zIndex: 999 }}
                  className={`${
                    tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                  ref={tooltipRef}
                >
                  <div className={"rounded-md p-1.5 bg-black "}>
                    <p className="text-base text-white ">
                      {"Change microphone"}
                    </p>
                  </div>
                </div>
              </>
            );
          }}
        />
      </>
    );
  };

  const ScreenShareModeBTN = () => {
    const { publish } = usePubSub(`CHANGE_MODE`, {});

    const { meetingMode } = useMeetingAppContext();

    return (
      <OutlineIconTextButton
        onClick={() => {
          publish(
            {
              mode:
                meetingMode === meetingModes.SCREEN_SHARE
                  ? meetingModes.CONFERENCE
                  : meetingModes.SCREEN_SHARE,
            },
            {
              persist: true,
            }
          );
        }}
        isFocused={meetingMode === meetingModes.SCREEN_SHARE}
        buttonText={
          meetingMode === meetingModes.SCREEN_SHARE
            ? "Stop screen share mode"
            : "Screen share mode"
        }
        tooltip={
          meetingMode === meetingModes.SCREEN_SHARE
            ? "Stop screen share mode"
            : "Screen share mode"
        }
      />
    );
  };

  const EndBTN = () => {
    const { end, localParticipant } = useMeeting();

    return (
      <OutlineIconTextButton
        onClick={() => {
          toast(
            `${trimSnackBarText(
              nameTructed(localParticipant.displayName, 15)
            )} end the meeting.`,
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
          end();
        }}
        buttonText={"End Meeting"}
        tooltip={"End Meeting"}
      />
    );
  };

  const WebCamBTN = () => {
    const mMeeting = useMeeting();
    const [webcams, setWebcams] = useState([]);

    const localWebcamOn = mMeeting?.localWebcamOn;
    const changeWebcam = mMeeting?.changeWebcam;

    const getWebcams = async (mGetWebcams) => {
      const webcams = await mGetWebcams();

      webcams && webcams?.length && setWebcams(webcams);
    };

    const [tooltipShow, setTooltipShow] = useState(false);
    const btnRef = useRef();
    const tooltipRef = useRef();

    const openTooltip = () => {
      createPopper(btnRef.current, tooltipRef.current, {
        placement: "top",
      });
      setTooltipShow(true);
    };
    const closeTooltip = () => {
      setTooltipShow(false);
    };

    const { getVideoTrack } = useMediaStream();
    const {
      useVirtualBackground,
      setUseVirtualBackground,
      allowedVirtualBackground,
    } = useMeetingAppContext();

    return (
      <>
        <OutlinedButton
          Icon={localWebcamOn ? WebcamOnIcon : WebcamOffIcon}
          onClick={async () => {
            let track;
            if (!localWebcamOn) {
              if (allowedVirtualBackground) {
                track = await getVideoTrack({
                  useVirtualBackground: useVirtualBackground,
                });                
              } else {
                track = await createCameraVideoTrack({
                  cameraId: selectedWebcamDevice.id,
                  optimizationMode: "motion",
                  encoderConfig: "h180p_w320p",
                  facingMode: "environment",
                  multiStream: false,
                });
              }
            }
            mMeeting.toggleWebcam(track);
          }}
          bgColor={localWebcamOn ? "bg-gray-750" : "bg-white"}
          borderColor={localWebcamOn && "#ffffff33"}
          isFocused={localWebcamOn}
          focusIconColor={localWebcamOn && "white"}
          tooltip={"Toggle Webcam"}
          renderRightComponent={() => {
            return (
              <>
                <Popover className="relative">
                  {({ close }) => (
                    <>
                      <Popover.Button className="flex items-center justify-center mt-1 mr-1">
                        <div
                          ref={btnRef}
                          onMouseEnter={openTooltip}
                          onMouseLeave={closeTooltip}
                        >
                          <button
                            onClick={(e) => {
                              getWebcams(mMeeting?.getWebcams);
                            }}
                          >
                            <ChevronDownIcon
                              className="h-4 w-4"
                              style={{
                                color: localWebcamOn ? "white" : "black",
                              }}
                            />
                          </button>
                        </div>
                      </Popover.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="opacity-0 translate-y-1"
                        enterTo="opacity-100 translate-y-0"
                        leave="transition ease-in duration-150"
                        leaveFrom="opacity-100 translate-y-0"
                        leaveTo="opacity-0 translate-y-1"
                      >
                        <Popover.Panel className="absolute left-1/2 bottom-full z-10 mt-3 w-72 -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                          <div className="overflow-hidden rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                            <div className={" bg-gray-750 py-1"}>
                              <div>
                                <div className="flex items-center p-3 pb-0">
                                  <p className="ml-3 text-sm text-gray-900">
                                    {"WEBCAM"}
                                  </p>
                                </div>
                                <div className="flex flex-col">
                                  {webcams.map(({ deviceId, label }, index) => (
                                    <div
                                      className={`px-3 py-1 my-1 pl-6 text-white text-left ${
                                        deviceId === selectedWebcamDevice.id &&
                                        "bg-gray-150"
                                      }`}
                                    >
                                      <button
                                        className={`flex flex-1 w-full ${
                                          deviceId ===
                                            selectedWebcamDevice.id &&
                                          "bg-gray-150"
                                        }`}
                                        key={`output_webcams_${deviceId}`}
                                        onClick={async () => {
                                          setSelectedWebcamDevice({
                                            id: deviceId,
                                            label,
                                          });
                                          if (allowedVirtualBackground) {
                                            const track = await getVideoTrack();
                                            changeWebcam(track);
                                          } else {
                                            let customTrack =
                                              await createCameraVideoTrack({
                                                cameraId: deviceId,
                                                optimizationMode: "motion",
                                                // encoderConfig: "h720p_w1280p",
                                                facingMode: "environment",
                                                multiStream: false,
                                              });
                                            changeWebcam(customTrack);
                                          }

                                          close();
                                        }}
                                      >
                                        {label || `Webcam ${index + 1}`}
                                      </button>
                                    </div>
                                  ))}
                                </div>
                                {allowedVirtualBackground && (
                                  <button
                                    className="flex items-center p-3"
                                    onClick={async () => {
                                      const track = await getVideoTrack({
                                        useVirtualBackground:
                                          !useVirtualBackground,
                                      });
                                      setUseVirtualBackground(
                                        !useVirtualBackground
                                      );
                                      changeWebcam(track);
                                      close();
                                    }}
                                  >
                                    {useVirtualBackground ? (
                                      <CheckCircleIcon className="h-5 w-5 text-green-150" />
                                    ) : (
                                      <div className="w-5 h-5 rounded-full border-[1px] border-gray-500 " />
                                    )}

                                    <p className="ml-3 text-sm text-gray-900">
                                      {"Virtual Background"}
                                    </p>
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </Popover.Panel>
                      </Transition>
                    </>
                  )}
                </Popover>
                <div
                  style={{ zIndex: 999 }}
                  className={`${
                    tooltipShow ? "" : "hidden"
                  } overflow-hidden flex flex-col items-center justify-center pb-4`}
                  ref={tooltipRef}
                >
                  <div className={"rounded-md p-1.5 bg-black "}>
                    <p className="text-base text-white ">{"Change webcam"}</p>
                  </div>
                </div>
              </>
            );
          }}
        />
      </>
    );
  };

  const ScreenShareBTN = ({ isMobile, isTab }) => {
    const { localScreenShareOn, toggleScreenShare, presenterId } = useMeeting();

    return isMobile || isTab ? (
      <MobileIconButton
        id="screen-share-btn"
        tooltipTitle={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        buttonText={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        isFocused={localScreenShareOn}
        Icon={ScreenShareIcon}
        onClick={async () => {
          let customTrack = await createScreenShareVideoTrack({
            optimizationMode: "text",
            encoderConfig: "h720p_15fps",
          });
          toggleScreenShare(customTrack);
        }}
        disabled={
          presenterId
            ? localScreenShareOn
              ? false
              : true
            : isMobile
            ? true
            : false
        }
      />
    ) : (
      <OutlinedButton
        Icon={ScreenShareIcon}
        onClick={async () => {
          let customTrack = await createScreenShareVideoTrack({
            optimizationMode: "text",
            encoderConfig: "h720p_15fps",
          });
          toggleScreenShare(customTrack);
        }}
        isFocused={localScreenShareOn}
        tooltip={
          presenterId
            ? localScreenShareOn
              ? "Stop Presenting"
              : null
            : "Present Screen"
        }
        disabled={presenterId ? (localScreenShareOn ? false : true) : false}
      />
    );
  };

  const LeaveBTN = () => {
    const { leave, localParticipant } = useMeeting();

    return (
      <OutlinedButton
        Icon={EndIcon}
        bgColor="bg-red-150"
        onClick={() => {
          toast(
            `${trimSnackBarText(
              nameTructed(localParticipant.displayName, 15)
            )} left the meeting.`,
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
          window.parent.postMessage({type:"notify", info:"Left the meeting."}, '*');
          leave();
        }}
        tooltip="Leave Meeting"
      />
    );
  };

  const ChatBTN = ({ isMobile, isTab }) => {
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={"Chat"}
        buttonText={"Chat"}
        Icon={ChatIcon}
        isFocused={sideBarMode === sideBarModes.CHAT}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.CHAT ? null : sideBarModes.CHAT
          );
        }}
      />
    ) : (
      <OutlinedButton
        Icon={ChatIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.CHAT ? null : sideBarModes.CHAT
          );
        }}
        isFocused={sideBarMode === "CHAT"}
        tooltip="View Chat"
      />
    );
  };

  const ParticipantsBTN = ({ isMobile, isTab }) => {
    const { participants } = useMeeting();
    return isMobile || isTab ? (
      <MobileIconButton
        tooltipTitle={"Participants"}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        buttonText={"Participants"}
        disabledOpacity={1}
        Icon={ParticipantsIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        badge={`${new Map(participants)?.size}`}
      />
    ) : (
      <OutlinedButton
        Icon={ParticipantsIcon}
        onClick={() => {
          setSideBarMode((s) =>
            s === sideBarModes.PARTICIPANTS ? null : sideBarModes.PARTICIPANTS
          );
        }}
        isFocused={sideBarMode === sideBarModes.PARTICIPANTS}
        tooltip={"Participants"}
        badge={`${new Map(participants)?.size}`}
      />
    );
  };

  const MeetingIdCopyBTN = () => {
    const { meetingId } = useMeeting();
    const [isCopied, setIsCopied] = useState(false);
    return (
      <div className="flex items-center justify-center lg:ml-0 ml-4 mt-4 xl:mt-0">
        <div className="flex border-2 border-gray-850 p-2 rounded-md items-center justify-center">
          <h1 className="sm:text-black md:text-white lg:text-black text-white text-base ">{meetingId}</h1>
          <button
            className="ml-2"
            onClick={() => {
              navigator.clipboard.writeText(meetingId);
              setIsCopied(true);
              setTimeout(() => {
                setIsCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? (
              <CheckIcon className="h-5 w-5 sm:text-white md:text-white lg:text-black text-white" />
            ) : (
              <ClipboardIcon className="h-5 w-5 sm:text-white md:text-white lg:text-black text-white" />
            )}
          </button>
        </div>
      </div>
    );
  };

  const LandscapeModeBTN = () => {
    const { setIsLandscape, isLandscape } = useMeetingAppContext();
    return (
      <OutlinedButton
        Icon={isLandscape ? ExitScreenIcon : FullScreenIcon}
        onClick={() => {
          setIsLandscape((s) => !s);
        }}
        isFocused={isLandscape}
        tooltip={isLandscape ? "Exit Full Screen" : "Full Screen"}
      />
    );
  };

  const tollTipEl = useRef();
  const isMobile = useIsMobile();
  const isTab = useIsTab();
  const [open, setOpen] = useState(false);

  const handleClickFAB = () => {
    setOpen(true);
  };

  const handleCloseFAB = () => {
    setOpen(false);
  };

  const BottomBarButtonTypes = useMemo(
    () => ({
      END_CALL: "END_CALL",
      CHAT: "CHAT",
      PARTICIPANTS: "PARTICIPANTS",
      SCREEN_SHARE: "SCREEN_SHARE",
      WEBCAM: "WEBCAM",
      MIC: "MIC",
      RAISE_HAND: "RAISE_HAND",
      RECORDING: "RECORDING",
      MEETING_ID_COPY: "MEETING_ID_COPY",
      LANDSCAPE_MODE_BUTTON: "LANDSCAPE_MODE_BUTTON",
      SCREEN_SHARE_MODE_BUTTON: "SCREEN_SHARE_MODE_BUTTON",
      END_MEETING: "END_MEETING",
    }),
    []
  );

  const otherFeatures = [
    { icon: BottomBarButtonTypes.RAISE_HAND },
    { icon: BottomBarButtonTypes.SCREEN_SHARE },
    { icon: BottomBarButtonTypes.CHAT },
    { icon: BottomBarButtonTypes.RECORDING },
    { icon: BottomBarButtonTypes.PARTICIPANTS },
    { icon: BottomBarButtonTypes.MEETING_ID_COPY },
    { icon: BottomBarButtonTypes.LANDSCAPE_MODE_BUTTON },
    { icon: BottomBarButtonTypes.SCREEN_SHARE_MODE_BUTTON },
    { icon: BottomBarButtonTypes.END_MEETING },
  ];

  return isMobile || isTab ? (
    <div
      className="flex items-center justify-center"
      style={{ height: bottomBarHeight }}
    >
      <LeaveBTN />
      <MicBTN />
      <WebCamBTN />
      <LandscapeModeBTN />
      <OutlinedButton Icon={EllipsisHorizontalIcon} onClick={handleClickFAB} />
      <Transition appear show={Boolean(open)} as={Fragment}>
        <Dialog
          as="div"
          className="relative"
          style={{ zIndex: 9999 }}
          onClose={handleCloseFAB}
        >
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="translate-y-full opacity-0 scale-95"
            enterTo="translate-y-0 opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="translate-y-0 opacity-100 scale-100"
            leaveTo="translate-y-full opacity-0 scale-95"
          >
            <div className="fixed inset-0 overflow-y-hidden">
              <div className="flex h-screen items-end justify-end text-center">
                <Dialog.Panel className="w-screen transform overflow-hidden bg-gray-800 shadow-xl transition-all">
                  <div className="grid container bg-gray-800 py-6">
                    <div className="grid grid-cols-12 gap-2">
                      {otherFeatures.map(({ icon }) => {
                        return (
                          <div
                            className={`grid items-center justify-center ${
                              icon === BottomBarButtonTypes.MEETING_ID_COPY
                                ? "col-span-7 sm:col-span-5 md:col-span-3"
                                : "col-span-4 sm:col-span-3 md:col-span-2"
                            }`}
                          >
                            {icon === BottomBarButtonTypes.RAISE_HAND ? (
                              <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.SCREEN_SHARE ? (
                              <ScreenShareBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.CHAT ? (
                              <ChatBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon === BottomBarButtonTypes.PARTICIPANTS ? (
                              <ParticipantsBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon === BottomBarButtonTypes.RECORDING ? (
                              <RecordingBTN isMobile={isMobile} isTab={isTab} />
                            ) : icon ===
                              BottomBarButtonTypes.MEETING_ID_COPY ? (
                              <MeetingIdCopyBTN
                                isMobile={isMobile}
                                isTab={isTab}
                              />
                            ) : icon ===
                                BottomBarButtonTypes.SCREEN_SHARE_MODE_BUTTON &&
                              participantMode === participantModes.AGENT ? (
                              <ScreenShareModeBTN />
                            ) : icon === BottomBarButtonTypes.END_MEETING &&
                              participantMode === participantModes.AGENT ? (
                              <EndBTN />
                            ) : null}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </Dialog.Panel>
              </div>
            </div>
          </Transition.Child>
        </Dialog>
      </Transition>
    </div>
  ) : (
    <div className="md:flex lg:px-2 xl:px-6 pb-2 px-2 hidden">
      <MeetingIdCopyBTN />

      <div className="flex flex-1 items-center justify-center" ref={tollTipEl}>
        <RecordingBTN />
        <RaiseHandBTN isMobile={isMobile} isTab={isTab} />
        <MicBTN />
        <WebCamBTN />
        <ScreenShareBTN isMobile={isMobile} isTab={isTab} />
        {participantMode === participantModes.AGENT && (
          <>
            <ScreenShareModeBTN />
            <EndBTN />
          </>
        )}

        <LeaveBTN />
      </div>

      <div className="flex items-center justify-center">
        <ChatBTN isMobile={isMobile} isTab={isTab} />
        <ParticipantsBTN isMobile={isMobile} isTab={isTab} />
      </div>
    </div>
  );
}
