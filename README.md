# Homelike server for assignment

## Background information

###run
- edit /config/default.json
- provide mongodb connection path [mongodb://localhost:27017/assignment by default]
- npm install
- npm start

###current endpoints
- `/users`
- `/apartments`
- `/locations`
- `/graphql`
- `/graphiql`

##What to do - for backend engineers
1. add new endpoint /countries which should represent the data from the `countries` collection
1. add `countries` to /graphql endpoint
1. add `country` to `locations.graphql.schema` as a representative of `country` information
1. add functionality to use `limit` and `skip` as a parameters to fetch data through `/graphql` endpoint
1. If you run the following query, location will always be `null`. Please figure out why this is happening.
After you found out how this happens, please describe the reason and how you found the issue. 
```query RootQuery($owner: String) {  
      apartments(owner: $owner) {  
        items {  
          location {  
            title  
          }  
        }  
      }  
    }
```  

#### My Solutation for last problem:

These are the following step I took to figure out the issue

 - First, I look into the [`locations resolver`](https://github.com/PankajJatav/HomelikeAssignment-/blob/develop/src/services/apartments/apartments.resolvers.js#L10) code to check, is there some issue with code or not. But I found that everything was fine there. So I thought there may be some issue with database query.
 - Then, I executed the same query on mongodb shell directly to check, is there anything wrong with query or not? I found I am getting the document. Which means something wrong from my [resolver code](https://github.com/PankajJatav/HomelikeAssignment-/blob/develop/src/services/apartments/apartments.resolvers.js#L10) to database server. And this may be because of mongodb driver (node package).
 - So I look into mongodb node package and added some console inside [`find`](https://github.com/mongodb/node-mongodb-native/blob/v2.2.36/lib/collection.js#L180) function. I noticed that `_id` value was changing. All uppercase alphabets in `_id` value changed to lowercase alphabets. For example, If I was passing `_id` as "5b62B540BcFF044ffA169f60", I was getting "5b62b540bcff044ffa169f60" in my console inside [`find`](https://github.com/mongodb/node-mongodb-native/blob/v2.2.36/lib/collection.js#L180) function. I checked the [ `function`](https://github.com/mongodb/node-mongodb-native/blob/v2.2.36/lib/collection.js#L180) and found `_id` was not changing here, which lead it is chaning inside any database middleware layer. In our case it was [`feathers-mongodb`](https://github.com/feathersjs-ecosystem/feathers-mongodb)
- Then I look into [`feathers-mongodb`](https://github.com/feathersjs-ecosystem/feathers-mongodb) [`find`](https://github.com/feathersjs-ecosystem/feathers-mongodb/blob/master/lib/index.js#L120) function which was calling [`_find`](https://github.com/feathersjs-ecosystem/feathers-mongodb/blob/master/lib/index.js#L60) function. Then I added some console and figure it out the `_id` value was chaning [`here`](https://github.com/feathersjs-ecosystem/feathers-mongodb/blob/v3.0.0/lib/index.js#L66) which was calling [`_objectifyId`](https://github.com/feathersjs-ecosystem/feathers-mongodb/blob/v3.0.0/lib/index.js#L28) function. The [`_objectifyId`](https://github.com/feathersjs-ecosystem/feathers-mongodb/blob/v3.0.0/lib/index.js#L28) creating new `ObjectID` from same hexadecimal string(ie _id value) if it is a valid `ObjectID`.

So what was the issue: 
    
- When you create a new instance of [`ObjectID  Class`](https://github.com/mongodb/js-bson/blob/master/lib/objectid.js#L40) with hexadecimal string following thing happens:
    -  It will store the hexadecimal string to [`buffer`](https://github.com/mongodb/js-bson/blob/master/lib/objectid.js#L71). And while storing, it converts all the hexadecimal value into an integer with base 16. The interger value of "A" and "a" are same in base 16 which is 10. At this place the value are changing for all hexadecimal alphabets values.
    -  You can check the [`hexWrite`]( https://github.com/feross/buffer/blob/master/index.js#L824) function of buffer for more details.

Here are the list of solution: 
- Update the database query, for exmaple:
    - { '_id': { "$eq": "5b62B540BcFF044ffA169f60" } }
    - { '_id': { "$in": ["5b62B540BcFF044ffA169f60"] } }
- Change the all `_id` to lowercase. But not convenience for live data or huge data set. And there are risk also to losing some linking as well if we miss something.
- Overwrite the [`feathers-mongodb`](https://github.com/feathersjs-ecosystem/feathers-mongodb) package file. Then you can't get new update of a package and you have to manage that library all time.

I selected to update the query because it was easy and more convenient which you can check [`here`](https://github.com/PankajJatav/HomelikeAssignment-/blob/master/src/services/apartments/apartments.resolvers.js#L10)