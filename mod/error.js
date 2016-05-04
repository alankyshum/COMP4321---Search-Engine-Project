/**
 * MOD:: ERROR HANDLING
 */
module.exports.mongo = {};

module.exports.mongo.parse = (err, cb, ok_cb) => {
  if (err.code === 11000) {
    console.error(`DUPLICATE ITEM WITH KEY: ${err.errmsg.match(/"(.+)"/)[1]}`);
    ok_cb && ok_cb(); // known response, continue
  } else {
    console.error(err);
    cb && cb();
  }
}
