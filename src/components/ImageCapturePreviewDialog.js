import { Dialog, Transition } from "@headlessui/react";
import { Fragment, useEffect, useRef, useState } from "react";
import { Cropper } from "react-cropper";
import "cropperjs/dist/cropper.css";

const ImageCapturePreviewDialog = ({ image, open, setOpen }) => {
  const canvasRef = useRef();

  const [drawComplete, setDrawComplete] = useState(false);
  const [imageSrc, setImageSrc] = useState(null);

  useEffect(() => {
    if (open && image) {
      let canvas = canvasRef.current;

      if (canvas) {
        canvas.width = image.width;
        canvas.height = image.height;

        let ratio = 16 / 9;
        let x = (canvas.width - image.width * ratio) / 2;
        let y = (canvas.height - image.height * ratio) / 2;
        canvas.getContext("2d").clearRect(0, 0, x / 2, y / 2);
        canvas.getContext("2d").drawImage(image, 0, 0);

        var url = canvas.toDataURL("image/png");

        setImageSrc(url);

        setDrawComplete(true);
      }
    }
  }, [image, canvasRef.current]);

  useEffect(() => {
    if (!open) {
      setDrawComplete(false);
    }
  }, [open]);

  const [cropData, setCropData] = useState("#");
  const [cropper, setCropper] = useState();
  const [cropButtonClicked, setCropButtonClicked] = useState(false);

  const getCropData = () => {
    if (typeof cropper !== "undefined") {
      setCropData(cropper.getCroppedCanvas().toDataURL());
    }
  };

  return (
    <>
      <Transition appear show={open} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={() => {}}>
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

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center  text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-9/12 h-5/6 transform relative overflow-hidden rounded bg-gray-750 p-4 text-left align-middle flex flex-col items-center shadow-xl transition-all">
                  <Dialog.Title className="text-base font-medium  text-white w-full ">
                    Preview
                  </Dialog.Title>
                  <div className="flex mt-2">
                    <canvas
                      ref={canvasRef}
                      id="previewCanvas"
                      className="object-contain h-1/2 w-1/2"
                    />

                    <Cropper
                      className="ml-4"
                      // style={{ height: 400, width: "100%" }}
                      zoomTo={0.5}
                      initialAspectRatio={1}
                      preview=".img-preview"
                      src={imageSrc}
                      viewMode={1}
                      minCropBoxHeight={10}
                      minCropBoxWidth={10}
                      background={false}
                      responsive={true}
                      autoCropArea={1}
                      checkOrientation={false} // https://github.com/fengyuanchen/cropperjs/issues/671
                      onInitialized={(instance) => {
                        setCropper(instance);
                      }}
                      guides={true}
                      crossorigin="anonymous"
                    />
                  </div>

                  <div className="flex items-end justify-end w-full mt-3">
                    <button
                      className="bg-white text-black px-3 py-2 rounded"
                      style={{ float: "right" }}
                      onClick={() => {
                        setCropButtonClicked(true);
                        getCropData();
                      }}
                    >
                      Crop Image
                    </button>
                  </div>
                  {cropData && cropButtonClicked && (
                    <div className="flex flex-col w-full">
                      <span className="text-white font-semibold">
                        After Crop Image
                      </span>
                      <img
                        className="object-contain h-1/4 w-1/2 mt-3"
                        src={cropData}
                        alt="cropped"
                      />
                    </div>
                  )}

                  {!drawComplete && (
                    <p className="absolute text-white  h-full w-full text-center">
                      Loading Preview...
                    </p>
                  )}
                  <div className="mt-6 flex w-full  justify-end gap-5">
                    <button
                      type="button"
                      className="rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="rounded border border-white bg-transparent px-4 py-2 text-sm font-medium text-white hover:bg-gray-700"
                      onClick={() => {
                        setOpen(false);
                      }}
                    >
                      Upload
                    </button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};

export default ImageCapturePreviewDialog;
