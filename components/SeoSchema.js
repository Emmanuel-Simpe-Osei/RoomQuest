export default function SeoSchema() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Organization",
          name: "RoomQuest Accommodations",
          url: "https://www.roomquestaccomodations.com",
          logo: "https://www.roomquestaccomodations.com/logo.png",
          sameAs: [
            "https://twitter.com/roomquest",
            "https://instagram.com/roomquest",
            "https://facebook.com/roomquest",
          ],
          description:
            "RoomQuest Accommodations is a Ghana-based hostel and room booking platform helping students and travelers find affordable accommodation.",
          address: {
            "@type": "PostalAddress",
            addressCountry: "GH",
          },
        }),
      }}
    />
  );
}
const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "RoomQuest",
  url: "https://www.roomquestaccomodations.com",
  potentialAction: {
    "@type": "SearchAction",
    target:
      "https://www.roomquestaccomodations.com/search?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};
