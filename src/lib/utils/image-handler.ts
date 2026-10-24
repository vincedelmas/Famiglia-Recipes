import path from "path";
import crypto from "crypto";
import {serverEnv} from "~/env/server";
import {promises as fsPromises} from "node:fs";
import pinoLogger from "~/lib/server/core/pino-logger";
import {FormattedError} from "~/lib/utils/error-classes";
import {createServerOnlyFn} from "@tanstack/react-start";


interface ResizeOptions {
    width: number;
    height: number;
}


interface ProcessAndSaveImageOptions {
    buffer: Buffer;
    resize?: ResizeOptions;
}


interface SaveUploadedImageOptions {
    file: File;
    resize?: ResizeOptions;
}


export const saveUploadedImage = createServerOnlyFn(() => async ({ file, resize }: SaveUploadedImageOptions) => {
    try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        return await processAndSaveImage({ buffer, resize });
    }
    catch {
        throw new FormattedError("This image could not be processed");
    }
})();


const processAndSaveImage = createServerOnlyFn(() => async ({ buffer, resize }: ProcessAndSaveImageOptions) => {
    const randomHex = crypto.randomBytes(8).toString("hex");
    const fileName = `${randomHex}.jpg`;

    await fsPromises.mkdir(serverEnv.BASE_UPLOADS_LOCATION, { recursive: true });
    const filePath = path.join(serverEnv.BASE_UPLOADS_LOCATION, fileName);

    const image = new Bun.Image(buffer, { autoOrient: false });
    if (resize) {
        // ImageCropper already crops uploads to the target aspect ratio.
        image.resize(resize.width, resize.height, { fit: "fill" });
    }

    await image.jpeg({ quality: 90 }).write(filePath);

    return fileName;
})();


export const deleteImage = createServerOnlyFn(() => async (imagePath: string) => {
    const imageName = path.basename(imagePath);
    if (imageName === "default.png") return;

    try {
        const imagePath = path.join(serverEnv.BASE_UPLOADS_LOCATION, imageName);
        await fsPromises.unlink(imagePath);
    }
    catch (err: any) {
        if (err.code !== "ENOENT") {
            pinoLogger.error({ error: err, imageName }, `Failed to delete image ${imageName}:`);
        }
    }
})();
