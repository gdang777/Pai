function groupBy(arr, grouper){
  const output = {};
  for(const item of arr){
    const key = grouper(item);
    if(output[key]){
      output[key].push(item);
    } else {
      output[key] = [item];
    }
  }
  return output;
}

module.exports = function(knex) {

  return {
    getConnectUsersWithNuggets(userId, cb) {
      function runConnectedUsers(){
        this.distinct('first_user_id AS user_id, connected_at')
          .from('connections')
          .where('second_user_id', userId)
          .union(function(){
            this.distinct('second_user_id AS user_id, connected_at')
            .from('connections')
            .where('first_user_id', userId)
          });
      }

      function getConnectedAtTime(matchId) {
        return knex.select('connected_at')
          .from('connections')
          .where('second_user_id', matchId)
          .union(function(){
            this.select('connected_at')
            .from('connections')
            .where('first_user_id', matchId)
          });

      }

      const myConnectedUsers = knex('users')
        .select('*')
        .whereIn('id', runConnectedUsers);

      const myConnectedUsersNuggets =  knex('nuggets')
        .select('nuggets.*', 'questions.*')
        .innerJoin('questions', 'nuggets.question_id', 'questions.id')
        .whereIn('nuggets.user_id', runConnectedUsers);

      const usersAndNuggets = Promise.all([myConnectedUsers, myConnectedUsersNuggets]);
      return usersAndNuggets
        .then(([users, nuggets]) => {
          const nuggetsGroupedByUserId = groupBy(nuggets, (nugget) => nugget.user_id);
          let promises = users.map(user => {
            return getConnectedAtTime(user.id)
              .then(connectedAt => {
                console.log(connectedAt, 'CONNECTED AT')
                return {
                  ...user,
                  connected_at: connectedAt[0].connected_at,
                  nuggets: nuggetsGroupedByUserId[user.id] || []
                }
              })
          });
          Promise.all(promises).then(function(results) {
            cb(results);
          })
        });
    },

    getMyProfileWithNuggets(userId) {
      const myProfile = knex('users')
        .first('*')
        .where('id', userId);

      const myNuggets = knex('nuggets')
        .select('nuggets.*', 'questions.*')
        .innerJoin('questions', 'nuggets.question_id', 'questions.id')
        .where('nuggets.user_id', userId);

      const profileAndNuggets = Promise.all([myProfile, myNuggets]);
      return profileAndNuggets
        .then(([user, nuggets]) => {
            return {
              ...user,
              nuggets: nuggets
            }
        });
    },

    deleteConnectionById(id) {
      return knex('connections')
      .where('id', id)
      .update({
        'is_connected': false
      })
      .then()
    },

    sendLocationToDatabase(userId, lat, long){
      return knex.raw(
        `INSERT INTO locations(user_id, lat, long)
        VALUES (${userId}, ${lat}, ${long})
        ON CONFLICT (user_id) DO UPDATE
        SET lat = ${lat}, long = ${long}`
      )
    },

    findLocationByUserId(id){
      return knex('locations')
      .select('*')
      .where('user_id', id);
    }
  }
}