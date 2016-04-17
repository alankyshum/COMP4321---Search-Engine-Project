/**
 * MOD:: ERROR HANDLING
 */
module.exports.mongo = {};

module.exports.mongo.parse = (err, cb) => {
  if (err.code === 11000) {
    console.error(`DUPLICATE ITEM WITH KEY: ${err.errmsg.match(/"(.+)"/)[1]}`);
  } else {
    cb && cb();
  }
}
