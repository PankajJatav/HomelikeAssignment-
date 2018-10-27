export default function(Query, Service, GetServiceName, FindServiceName) {
  Object.assign(Query, {
    [`${GetServiceName}`]: (root, args, context) => {
      return Service.find(Object.assign({}, context, { query: args })).then(result => result[0]);
    },
  });
  Object.assign(Query, {
    [`${FindServiceName}`]: (root, args, context) => {
      if(typeof args.skip !== 'undefined') {
        delete Object.assign(args, {['$skip']: args['skip'] })['skip'];
      }
      if(typeof args.limit !== 'undefined') {
        delete Object.assign(args, {['$limit']: args['limit'] })['limit'];
      }
      return Service.find(Object.assign({}, context, { query: args })).then(result => {
        return { total: result.length, items: result };
      });
    },
  });
}
