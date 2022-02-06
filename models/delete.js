var helper = require('../helpers.js');
const fetch = require("node-fetch");

async function startDeleting() {
    var minutes = 1440;
    var interval = minutes * 60 * 1000;
    setInterval(async () => {
      // delete all events from database that are old
      let db = await helper.openDB();

      let twoDaysAgo = new Date();
      twoDaysAgo.setDate(twoDaysAgo.getDate() - 1)
      let deleteDateStr = twoDaysAgo.toISOString().slice(0, 10);
      console.log(deleteDateStr)
      await db.run(`DELETE FROM "events" WHERE startTimeUTC LIKE '${deleteDateStr}%'`, [], 
                    function(err) {if (err) {console.error(err.message)}});

      await db.close((err) => helper.errorCatch(err));
  }, interval)
}
  
module.exports = startDeleting;