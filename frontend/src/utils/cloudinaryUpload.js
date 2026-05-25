export const uploadToCloudinary = async (file, folder = "learnSphere_courses") => {
  const formData = new FormData();
  formData.append("file", file);
  
  const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "learnSphere_preset";
  const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "your_cloud_name";

  formData.append("upload_preset", uploadPreset);
  formData.append("folder", folder);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error(errorData.error?.message || "Cloudinary upload failed");
  }

  return await res.json(); // returns secure_url, public_id, etc.
};
