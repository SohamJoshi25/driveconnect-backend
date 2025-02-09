import { getDrive } from "../configs/google-auth-config.js";

export const getDriveFiles = async (refresh_token: string) => {
  const drive = getDrive(refresh_token);
  const response = await drive.files.list({
    spaces: "appDataFolder",
    fields: "files(id, name, mimeType, size, createdTime, modifiedTime, parents, description)",
  });
  console.log(response.data.files);
  return response.data.files;
};

export const deleteDriveFiles = async (refresh_token: string) => {
  const drive = getDrive(refresh_token);
  const response = await drive.files.list({
    spaces: "appDataFolder",
    fields: "files(id)",
  });

  if (response.data.files) {
    await Promise.all(
      response.data.files.map(async (file) => {
        await drive.files.delete({
          fileId: file.id!,
        });
      }),
    );
  }
};
