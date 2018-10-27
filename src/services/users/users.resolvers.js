
export default function (Profiles) {

  const usersResolvers = {
    Users: {
      profile: (user) => {
        return Profiles.find({ query: { _id: user.owner }}).then(result=>result[0]);
      }
    }
  };

  return usersResolvers;
}
