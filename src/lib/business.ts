export const BUSINESS = {
  name: "מיטל ג'ל",
  address: "רחוב הדוגמה 12, תל אביב",
  phone: "050-0000000",
  instagram: "@mital.nails",
};

export function getGoogleMapsUrl(address: string = BUSINESS.address) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

export function getWazeUrl(address: string = BUSINESS.address) {
  return `https://waze.com/ul?q=${encodeURIComponent(address)}&navigate=yes`;
}
