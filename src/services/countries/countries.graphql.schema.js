export default [
  `
  type CountriesWithPagination {
  	total: Int
    items: [Countries]
  }
  
  type Countries {
    _id: String!
    title: String
  }
`,
];
