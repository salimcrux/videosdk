import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline"; // Salim
import React, { useState, useEffect, Fragment, useRef } from "react";
import { toast } from "react-toastify";
import { useMeetingAppContext } from "../context/MeetingAppContext"; //Salim
import { meetingModes,
  participantModes,
  sideBarModes, } from "../utils/common";
import { Dialog, Popover, Transition } from "@headlessui/react"; // Salim
import { useMeeting } from "@videosdk.live/react-sdk"; // Salim
import { ChevronDownIcon } from "@heroicons/react/24/outline"; // Salim

const AudioAnalyser = ({ audioTrack }) => {
  const audioTrackRef = useRef();
  const audioAnalyserIntervalRef = useRef();

  const [volume, setVolume] = useState(null);

  const analyseAudio = (audioTrack) => {
    const audioStream = new MediaStream([audioTrack]);
    const audioContext = new AudioContext();

    const audioSource = audioContext.createMediaStreamSource(audioStream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 512;
    analyser.minDecibels = -127;
    analyser.maxDecibels = 0;
    analyser.smoothingTimeConstant = 0.4;

    audioSource.connect(analyser);

    const volumes = new Uint8Array(analyser.frequencyBinCount);
    const volumeCallback = () => {
      analyser.getByteFrequencyData(volumes);

      const volumeSum = volumes.reduce((sum, vol) => sum + vol);
      const averageVolume = volumeSum / volumes.length;

      setVolume(averageVolume);
    };

    audioAnalyserIntervalRef.current = setInterval(volumeCallback, 100);
  };

  const stopAudioAnalyse = () => {
    clearInterval(audioAnalyserIntervalRef.current);
  };

  useEffect(() => {
    audioTrackRef.current = audioTrack;

    if (audioTrack) {
      analyseAudio(audioTrack);
    } else {
      stopAudioAnalyse();
    }
  }, [audioTrack]);

  return (
    <div className="relative w-20 h-[0px]">
      {[
        {
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderTopLeftRadius: 100,
          borderTopRightRadius: 100,
          top: 0,
          alignItems: "flex-end",
        },
        {
          borderBottomLeftRadius: 100,
          borderBottomRightRadius: 100,
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          top: "100%",
          alignItems: "flex-start",
        },
      ].map(
        (
          {
            alignItems,
            top,
            borderBottomLeftRadius,
            borderBottomRightRadius,
            borderTopLeftRadius,
            borderTopRightRadius,
          },
          i
        ) => (
          <div
            key={`audio_analyzer_i_${i}`}
            className={`h-5 flex justify-evenly left-0 right-0`}
            style={{ alignItems, top }}
          >
            {[40, 70, 100, 100, 70, 40].map((height, j) => (
              <div
                key={`audio_analyzer_j_${j}`}
                style={{
                  borderBottomLeftRadius,
                  borderBottomRightRadius,
                  borderTopLeftRadius,
                  borderTopRightRadius,
                  backgroundColor: "#1178F8",
                  width: 80 / 12,
                  height: `${(volume / 256) * height}%`,
                  transition: "all 50ms",
                  transitionTimingFunction: "ease-in",
                }}
              ></div>
            ))}
          </div>
        )
      )}
    </div>
  );
};

export function MeetingDetailsScreen({
  onClickJoin,
  _handleOnCreateMeeting,
  participantName,
  meetingId, // Salim
  setParticipantName,
  videoTrack,
  setVideoTrack,
  onClickStartMeeting,
  setPromoImage,
  audioTrack,
  changeMic,
  mics,
  outputmics,
  webcams,
  setSelectedWebcam,
  changeWebcam,
  popupVideoPlayerRef,
  isMobile,
  setting,
  setSetting,
}) {
  const [selectedMicLabel, setSelectedMicLabel] = useState(null);
  const [selectedWebcamLabel, setSelectedWebcamLabel] = useState(null);
  const boxRef = useRef(); 
  const [selectedMic, setSelectedMic] = useState({ id: null });
 
  // const [meetingId, setMeetingId] = useState(""); // commented by salim
  const [meetingIdError, setMeetingIdError] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [iscreateMeetingClicked, setIscreateMeetingClicked] = useState(false);
  const [isJoinMeetingClicked, setIsJoinMeetingClicked] = useState(true);

  // ***** added by Salim ***************//
  
  let url = new URL(window.location.href);
  let searchParams = new URLSearchParams(url.search);
  const participantMode = searchParams.get("mode");
  useEffect(() => {
    // console.log('Using Context',isLandscape);
    // Creating meeting automatically without clicking on 'create meeting' button
    // async function fD() {
    //   const meetingId = await _handleOnCreateMeeting();
    //   setMeetingId(meetingId);      
    // }
    // fD();    
    if(participantMode === participantModes.AGENT) {
      setIscreateMeetingClicked(true);
      setIsJoinMeetingClicked(true);      
    }
  }, []);  
  // ***************************************** //
  
  return (
    <>
    <div className={`flex flex-1 flex-col w-full md:p-[0px] sm:p-1 p-1.5`}>
      {/* ** commented by Salim ***************
       {iscreateMeetingClicked ? (
        <div className="border border-solid border-gray-400 rounded-xl px-4 py-3  flex items-center justify-center">
          <p className="text-white text-base">
            {`Meeting code : ${meetingId}`}
          </p>
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
              <CheckIcon className="h-5 w-5 text-green-550" />
            ) : (
              <ClipboardIcon className="h-5 w-5 text-white" />
            )}
          </button>
        </div>
      ) : isJoinMeetingClicked ? (
        <>
          <input
            defaultValue={meetingId}
            onChange={(e) => {
              setMeetingId(e.target.value);
            }}
            placeholder={"Enter meeting Id"}
            className="px-4 py-3 bg-gray-650 rounded-xl text-white w-full text-center"
          />
          {meetingIdError && (
            <p className="text-xs text-red-600">{`Please enter valid meetingId`}</p>
          )}
        </>
      ) : null} */}

      {(iscreateMeetingClicked || isJoinMeetingClicked) && (
        <>
          <input
            value={participantName}
            onChange={(e) => setParticipantName(e.target.value)}
            placeholder="Enter your name"
            className="px-2 py-1 2xl:py-2 xl:py-2 lg:py-2 md:py-2 sm:py-2 sm:mt-0 md:mt-0 lg:mt-0 xl:mt-0 mt-0  rounded-xl text-black text-base w-full text-center border border-iprured-100"
          />

          {/* <p className="text-xs text-white mt-1 text-center">
            Your name will help everyone identify you in the meeting.
          </p> */}
        </>
      )}
      

      {/* {!iscreateMeetingClicked && !isJoinMeetingClicked && (
        <div className="w-full md:mt-0 mt-4 flex flex-col justify-center h-full">
          { **** commented by Salim  <button
            className="w-full bg-purple-350 text-white px-2 py-3 rounded-xl"
            onClick={async (e) => {
              const meetingId = await _handleOnCreateMeeting();
              setMeetingId(meetingId);
              setIscreateMeetingClicked(true);
            }}
          >
            Create a meeting
          </button> }
          <button
            className="w-full bg-gray-650 text-white px-2 py-3 rounded-xl mt-5"
            onClick={(e) => {
              setIsJoinMeetingClicked(true);
            }}
          >
            Join a meeting
          </button>
        </div>
      )} */}

      {/* <div className="col-span-12 mt-1 2xl:h-20 xl:h-14 lg:h-14 md:h-14 sm:h-14 h-12"></div> */}
      <div className="col-span-12 h-[2rem] sm:h-[3.5rem] md:h-[29%] lg:h-[27.5%] xl:h-[27%] 2xl:h-[28%] min-h-[15%]"></div>
        {/* Camera Check */}
        <div className="w-full">
          <div className="grid container grid-flow-col">
            <div className="grid grid-cols-12">
              <div className="col-span-12">
                <div className="flex flex-col mt-0">                

                  <div className="w-full mt:0 text-left">
                    <Popover className="relative">
                      {({ close }) => (
                        <>
                          <Popover.Button className="flex  w-full ">
                            <button className="flex items-center justify-between text-black w-full rounded-xl py-1 px-2 bg-white border border-iprured-100">
                              {selectedWebcamLabel
                                ? selectedWebcamLabel
                                : "Select your camera"}
                              <ChevronDownIcon
                                className="h-4 w-4"
                                style={{
                                  color: "#aa2329",
                                }}
                              />
                            </button>
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
                            <Popover.Panel className="absolute left-1/2  z-10 mt-1 w-full -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                              <div className="overflow-hidden border border-iprured-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div
                                  className={"bg-white py-1"}
                                >
                                  <div>
                                    <div className="flex flex-col">
                                      {webcams.map(
                                        (item, index) => {
                                          return (
                                            item?.kind ===
                                              "videoinput" && (
                                              <div
                                                className={`px-3 py-1 my-1 pl-6 text-black text-left`}
                                              >
                                                <button
                                                  className={`flex flex-1 w-full text-left`}
                                                  key={`webcam_${index}`}
                                                  value={
                                                    item?.deviceId
                                                  }
                                                  onClick={() => {
                                                    setSetting('video');
                                                    setSelectedWebcamLabel(
                                                      item?.label
                                                    );
                                                    setSelectedWebcam(
                                                      (s) => ({
                                                        ...s,
                                                        id: item?.deviceId,
                                                      })
                                                    );
                                                    changeWebcam(
                                                      item?.deviceId
                                                    );
                                                    close();
                                                  }}
                                                >
                                                  {item?.label ===
                                                  ""
                                                    ? `Webcam ${
                                                        index +
                                                        1
                                                      }`
                                                    : item?.label}
                                                </button>
                                              </div>
                                            )
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Mic Check */}
        <div className="w-full ">
          <div className="grid container grid-flow-col ">
            <div className="grid grid-cols-12">
              <div class="col-span-12 ">
                <div className="flex flex-col mt-1 md:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4">               

                  <div className="w-full mt-0 text-left">
                    <Popover className="relative">
                      {({ close }) => (
                        <>
                          <Popover.Button className="flex  w-full">
                            <button className="flex text-left justify-between text-black w-full border border-iprured-100 rounded-xl py-1 px-2 rounded bg-white">
                              {selectedMicLabel
                                ? selectedMicLabel
                                : "Select your mic"}
                              <ChevronDownIcon
                                className="h-4 w-4"
                                style={{
                                  color: "#aa2329",
                                }}
                              />
                            </button>
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
                            <Popover.Panel className="absolute left-1/2  z-10 mt-1 w-full -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                              <div className="overflow-hidden border border-iprured-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div
                                  className={"bg-white py-1"}
                                >
                                  <div>
                                    <div className="flex flex-col">
                                      {mics.map(
                                        (item, index) => {
                                          return (
                                            item?.kind === "audioinput" && (
                                              <div className={`px-3 py-1 my-1 pl-6 text-black text-left`}>
                                                <button
                                                  className={`flex flex-1 w-full text-left`}
                                                  key={`mics_${index}`}
                                                  value={
                                                    item?.deviceId
                                                  }
                                                  onClick={() => {
                                                    setSetting('audio'); // Salim
                                                    setSelectedMicLabel(
                                                      item?.label
                                                    );
                                                    setSelectedMic((s) => ({
                                                        ...s,
                                                        id: item?.deviceId,
                                                      })
                                                    );
                                                    changeMic(
                                                      item?.deviceId
                                                    );
                                                    close();
                                                  }}
                                                >
                                                  {item?.label? item?.label : `Mic ${
                                                        index +
                                                        1
                                                  }`}
                                                </button>
                                              </div>
                                            )
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Speaker Check */}
        <div className="w-full ">
          <div className="grid container grid-flow-col ">
            <div className="grid grid-cols-12">
              <div class="col-span-12 ">
                <div className="flex flex-col mt-1 md:mt-4 lg:mt-4 xl:mt-4 2xl:mt-4 ">               

                  <div className="w-full mt-0 text-left">
                    <Popover className="relative">
                      {({ close }) => (
                        <>
                          <Popover.Button className="flex  w-full">
                            <button className="flex text-left justify-between text-black w-full border border-iprured-100 rounded-xl py-1 px-2 bg-white">
                              {selectedMicLabel
                                ? selectedMicLabel
                                : "Select your speaker"}
                              <ChevronDownIcon
                                className="h-4 w-4"
                                style={{
                                  color: "#aa2329",
                                }}
                              />
                            </button>
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
                            <Popover.Panel className="absolute left-1/2  z-10 mt-1 w-full -translate-x-1/2 transform px-4 sm:px-0 pb-4">
                              <div className="overflow-hidden border border-iprured-100 rounded-lg shadow-lg ring-1 ring-black ring-opacity-5">
                                <div
                                  className={"bg-white rounded py-1"}
                                >
                                  <div>
                                    <div className="flex flex-col">
                                      {outputmics.map(
                                        (item, index) => {
                                          return (
                                            item?.kind === "audiooutput" && (
                                              <div className={`px-3 py-1 my-1 pl-6 text-black text-left`} >
                                                <button
                                                  className={`flex flex-1 w-full text-left`}
                                                  key={`outputmics_${index}`}
                                                  value={
                                                    item?.deviceId
                                                  }
                                                  onClick={() => {
                                                    // setSetting('audio'); // Salim
                                                    setSelectedMicLabel(
                                                      item?.label
                                                    );
                                                    setSelectedMic(
                                                      (s) => ({
                                                        ...s,
                                                        id: item?.deviceId,
                                                      })
                                                    );
                                                    changeMic(
                                                      item?.deviceId
                                                    );
                                                    close();
                                                  }}
                                                >
                                                  {item?.label? item?.label : `OutputMics ${index + 1}`}
                                                </button>
                                              </div>
                                            )
                                          );
                                        }
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </Popover.Panel>
                          </Transition>
                        </>
                      )}
                    </Popover>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Audio And Video Monitors */} 
        {/* <div className="col-span-12 mt-1 2xl:h-20 xl:h-14 lg:h-14 md:h-14 sm:h-14 h-12  lg:pl-[40%] sm:pl-[33%] pl-[30%]"> */}
        <div className="col-span-12 h-[2rem] sm:h-[3.5rem] md:h-[29%] lg:h-[27.5%] xl:h-[27%] 2xl:h-[28%]  lg:pl-[40%] sm:pl-[33%] pl-[30%] min-h-[15%]">
          { setting === "audio" ? (
              <AudioAnalyser audioTrack={audioTrack} />
          ) : setting === "video" ? (
            <></>
            // <video
            //   autoPlay
            //   playsInline
            //   muted
            //   ref={popupVideoPlayerRef}
            //   controls={false}
            //   style={{
            //     backgroundColor: "transparent",
            //   }}
            //   className={
            //     "rounded-md h-full w-2/7 object-cover flip"
            //   }
            // /> 
          ) : null}
        </div> 
        {/* Joining Button */}
        <button
            disabled={participantName.length < 3}
            className={`w-full ${
              participantName.length < 3 ? "bg-gray-650" : "bg-iprured-100"
            }  text-white px-2 py-1 2xl:py-2 xl:py-2 lg:py-2 md:py-2 sm:py-2 rounded-xl mt-0`}
            onClick={(e) => { 
              if (iscreateMeetingClicked) {
                if (videoTrack) {
                  videoTrack.stop();
                  setVideoTrack(null);
                }                
                onClickStartMeeting();
                
                // toast(`Join C screen button clicked`, {
                //   position: "bottom-left",
                //   autoClose: 4000,
                //   hideProgressBar: true,
                //   closeButton: false,
                //   pauseOnHover: true,
                //   draggable: true,
                //   progress: undefined,
                //   theme: "light",
                // });
                window.parent.postMessage({type:"notify", info:"Start a meeting button clicked"}, '*');
              } else {  
                if (meetingId.match("\\w{4}\\-\\w{4}\\-\\w{4}")) { 
                  onClickJoin(meetingId);
                  // toast(`Join screen button clicked`, {
                  //   position: "bottom-left",
                  //   autoClose: 4000,
                  //   hideProgressBar: true,
                  //   closeButton: false,
                  //   pauseOnHover: true,
                  //   draggable: true,
                  //   progress: undefined,
                  //   theme: "light",
                  // });
                  //window.parent.postMessage({type:"notify", info:"Meeting Joined Successfully !"}, '*');
                } else setMeetingIdError(true);                                  
              }
            }}
          >
            {iscreateMeetingClicked ? "Start a meeting" : "Join a meeting"}
          </button>       
      </div>    
    </>    
  );
}
