exports.index = function(req, res){
  ctxioClient.accounts().get({limit:15}, function (err, response) {
	    if (err) throw err;
	    res.json(response);
	});
};
