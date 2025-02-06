import { Readable } from "stream";
import { drive_v3, google } from "googleapis";

interface FileChunkData {
  chunk: ArrayBuffer;
  currentChunk: number;
  fileName: string;
}

export const socketOnFileChunk = async (data: FileChunkData, callback: (response: { success: boolean }) => void, drive: drive_v3.Drive, folderID: string, filesID: string[]): Promise<void> => {
  const { chunk, currentChunk, fileName } = data;

  console.log(`Received chunk ${currentChunk + 1}`);

  const fileMetadata = {
    name: `${fileName}._${currentChunk}`,
    parents: [folderID],
  };

  const bufferChunk = Buffer.from(chunk); // Convert ArrayBuffer to Buffer

  // Create a readable stream from the buffer
  const stream = new Readable();
  stream.push(bufferChunk);
  stream.push(null);

  const media = {
    mimeType: "application/octet-stream",
    body: stream,
  };

  try {
    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id",
    });

    if (response.data.id) {
      filesID.push(response.data.id);
      console.log(`Chunk ${currentChunk} Uploaded File ID:`, response.data.id);
      callback({ success: true });
    } else {
      throw new Error("No file ID returned from Google Drive API");
    }
  } catch (error) {
    console.error("Error uploading file:", error);
    callback({ success: false });
  }
};
