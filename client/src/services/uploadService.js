
import axios from "axios";
import api from "./api";

export const uploadImage = async (file) => {
  try {
    // 1. Get temporary ImageKit authentication credentials
    const authResponse = await api.get("/upload/auth");

    if (!authResponse.data.success) {
      return {
        success: false,
        message: "Failed to authenticate image upload",
      };
    }

    const {
      token,
      expire,
      signature,
      publicKey,
    } = authResponse.data.data;

    // 2. Prepare image data
    const formData = new FormData();

    formData.append("file", file);
    formData.append("fileName", file.name);
    formData.append("publicKey", publicKey);
    formData.append("token", token);
    formData.append("expire", expire);
    formData.append("signature", signature);

    // 3. Upload directly to ImageKit
    const response = await axios.post(
      "https://upload.imagekit.io/api/v1/files/upload",
      formData
    );

    // 4. Return uploaded image information
    return {
      success: true,
      data: {
        url: response.data.url,
        fileId: response.data.fileId,
        name: response.data.name,
      },
    };
  } catch (error) {
    console.error(
      "Image upload error:",
      error.response?.data || error.message
    );

    return {
      success: false,
      message:
        error.response?.data?.message || "Image upload failed",
    };
  }
};
