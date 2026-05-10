// Add this to your stickerYellowFrame.html to upload images

async function uploadImageToServer(canvas) {
  try {
    const imageData = canvas.toDataURL('image/png');
    const timestamp = new Date().getTime();
    const filename = `photo_${timestamp}.png`;

    const response = await fetch('/api/upload', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        imageData: imageData,
        filename: filename,
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Image uploaded successfully:', result);
      return true;
    } else {
      console.error('Upload failed:', result.error);
      return false;
    }
  } catch (error) {
    console.error('Upload error:', error);
    return false;
  }
}

// Call this function when you're ready to upload
// Example: uploadImageToServer(canvas);
