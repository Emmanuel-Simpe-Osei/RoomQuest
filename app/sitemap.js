export default function sitemap() {
  const baseUrl = "https://www.roomquestaccomodations.com";

  return [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/hostels`,
      lastModified: new Date(),
    },
    {
      url: `${baseUrl}/rooms`,
      lastModified: new Date(),
    },
  ];
}
