import Cropper from "react-easy-crop";
import {Input} from "~/lib/client/components/ui/input";
import {Button} from "~/lib/client/components/ui/button";
import {MutedText} from "~/lib/client/components/app/MutedText";
import React, {useCallback, useEffect, useMemo, useState} from "react";


interface ImageCropperProps extends Pick<React.ComponentProps<"input">, "id" | "aria-describedby" | "aria-invalid"> {
    aspect: number;
    fileName: string;
    resultClassName?: string;
    cropShape: "rect" | "round";
    onCropApplied: (file: File) => void;
}


interface CropArea {
    x: number;
    y: number;
    width: number;
    height: number;
}


interface CropState {
    zoom: number;
    open: boolean;
    imageSrc: string;
    showResult: boolean;
    croppedImage: Blob | null;
    crop: { x: number; y: number };
    croppedAreaPixels: CropArea | null;
}


export const ImageCropper = ({ onCropApplied, fileName, cropShape, aspect, resultClassName = "", ...inputProps }: ImageCropperProps) => {
    const [state, setState] = useState<CropState>({
        zoom: 1,
        open: true,
        imageSrc: "",
        showResult: false,
        croppedImage: null,
        crop: { x: 0, y: 0 },
        croppedAreaPixels: null,
    });

    const previewUrl = useMemo(() => state.croppedImage
            ? URL.createObjectURL(state.croppedImage)
            : undefined,
        [state.croppedImage]);

    useEffect(() => () => {
        if (previewUrl) URL.revokeObjectURL(previewUrl);
    }, [previewUrl]);

    const getCroppedImg = async (imageSrc: string, crop: CropArea): Promise<Blob> => {
        const image = await createImage(imageSrc);
        const canvas = document.createElement("canvas");

        const ctx = canvas.getContext("2d");
        if (!ctx) {
            throw new Error("Could not get canvas context");
        }

        canvas.width = crop.width;
        canvas.height = crop.height;
        ctx.drawImage(image, crop.x, crop.y, crop.width, crop.height, 0, 0, crop.width, crop.height);

        return new Promise((resolve, reject) => {
            canvas.toBlob((blob) => {
                if (blob) resolve(blob);
                else reject(new Error("Canvas is empty"));
            }, "image/jpeg");
        });
    };

    const createImage = (url: string): Promise<HTMLImageElement> => {
        return new Promise((resolve, reject) => {
            const image = new Image();
            image.addEventListener("load", () => resolve(image));
            image.addEventListener("error", reject);
            image.src = url;
        });
    };

    const onFileChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
        const file = ev.target.files?.[0];
        if (file) {
            const reader = new FileReader();

            reader.onload = () => setState((prev) => ({
                ...prev,
                open: true,
                showResult: false,
                imageSrc: reader.result as string,
            }));

            reader.readAsDataURL(file);
        }
    };

    const onCropComplete = useCallback((_: any, croppedAreaPixels: CropArea) => {
        setState((prev) => ({ ...prev, croppedAreaPixels }));
    }, []);

    const handleApplyCrop = async (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();

        if (!state.croppedAreaPixels || !state.imageSrc) return;

        const croppedImage = await getCroppedImg(state.imageSrc, state.croppedAreaPixels);
        const croppedFile = new File([croppedImage], `${fileName}.jpg`, { type: "image/jpeg" });

        onCropApplied(croppedFile);
        setState((prev) => ({ ...prev, open: false, showResult: true, croppedImage }));
    };

    const handleEditCrop = (ev: React.MouseEvent<HTMLButtonElement>) => {
        ev.preventDefault();
        setState((prev) => ({ ...prev, open: true, showResult: false }));
    };

    return (
        <div>
            <Input
                {...inputProps}
                type="file"
                accept="image/*"
                onChange={onFileChange}
                className="cursor-pointer"
            />
            {(state.imageSrc && state.open) &&
                <div className="mt-5 flex flex-col gap-4 rounded-xl bg-muted p-4">
                    <div>
                        <div>
                            Crop Recipe Image
                        </div>
                        <MutedText className="not-italic">
                            Resize the recipe image to fit the crop area.
                        </MutedText>
                    </div>

                    <div className="relative h-62.5 w-full">
                        <Cropper
                            aspect={aspect}
                            zoom={state.zoom}
                            crop={state.crop}
                            cropShape={cropShape}
                            image={state.imageSrc}
                            onCropComplete={onCropComplete}
                            onCropChange={(crop) => setState((prev) => ({ ...prev, crop }))}
                            onZoomChange={(zoom) => setState((prev) => ({ ...prev, zoom }))}
                        />
                    </div>

                    <Button onClick={handleApplyCrop}>
                        Save
                    </Button>
                </div>
            }
            {state.showResult && state.croppedImage &&
                <div className="mt-4 flex flex-col gap-4 rounded-xl bg-muted p-4">
                    <MutedText className="not-italic">
                        Selected Image
                    </MutedText>
                    <img
                        alt={fileName}
                        src={previewUrl}
                        className={resultClassName}
                    />
                    <Button onClick={handleEditCrop}>
                        Edit
                    </Button>
                </div>
            }
        </div>
    );
};
