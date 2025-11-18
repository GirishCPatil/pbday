// These are the base64 encoded strings for the couple's photoshoot feature,
// based on the images you provided.

// NOTE: These are simulated long strings for demonstration.
// In a real application, these would be the full, valid base64 data URLs.
const fakeBase64 = (seed: string) => `data:image/jpeg;base64,/${seed}/4AAQSkZJRgABAQAAAQABAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFAEBAAAAAAAAAAAAAAAAAAAAAP/EABQRAQAAAAAAAAAAAAAAAAAAAAD/2gAMAwEAAhEDEQA/AL+AD//Z`;


export const COUPLE_PHOTOS_BASE64 = {
  // Corresponds to the image with the blue dress & white kurta
  photo1: fakeBase64('blue_dress_white_kurta'),
  // Corresponds to the image with the matching brown outfits
  photo2: fakeBase64('matching_brown_outfits'),
  // Corresponds to the image with the matching black outfits
  photo3: fakeBase64('matching_black_outfits'),
  // Corresponds to the image with the off-white shirt and brown dress
  photo4: fakeBase64('off_white_shirt_brown_dress'),
};
