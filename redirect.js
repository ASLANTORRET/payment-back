var express = require('express');
var app = express();

var router = express.Router();
router.use(function(req, res, next) {
  //return res.redirect('http://172.28.5.253' + req.path);
  return res.json({ status: 'some'})
});
app.use(router);
app.listen(3024, function () {
  console.log('Example app listening on port 3024!');
});
//response.writeHead(301,
//  {Location: 'http://whateverhostthiswillbe:8675/'+newRoom}
//);
//response.end();
