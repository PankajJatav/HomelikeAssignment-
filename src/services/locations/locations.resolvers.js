export default function (Countries) {

  const locationsResolvers = {
    Locations: {
      country: (location) => {
        return Countries.find({ query: { _id: location.country }}).then(result=>result[0]);
      }
    }
  };

  return locationsResolvers;
}