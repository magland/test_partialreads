var Dat = require('dat-node');

var async = require('async');

var tmpDir = require('temporary-directory');

var test_dat_key = '43681050547fef1cb4b204e853a9cdd44d3d626d314e1bb9da411aee645415ad'
var test_filename = 'output_b4092469329c62b46ff2169b639de896952b8811_timeseries_out.mda'

get_dat(test_dat_key,function(dat) {
	var N=1e7;
	var tests=[];
	for (var jj=0; jj<8; jj++) {
		tests.push({start:N*jj,end:N*(jj+1)-1});
	}
	async.eachOfSeries(tests,function(test0,ind,cb) {
		console.log ('Test:',test0);
		run_test(dat,test0,function() {
			cb();
		});
	},function() {
		console.log ('Done. Passed the test.');
		process.exit(0);
	});
});

function run_test(dat,test0,callback) {
    var test_req = {
      headers : {
        "range" : `bytes=${test0.start}-${test0.end}`
      }
    }
    var test_fname='./test.data';
    if (require('fs').existsSync(test_fname)) {
    	require('fs').unlinkSync(test_fname);
    }
    var test_res = require('fs').createWriteStream (test_fname)
	serve_file(dat,test_filename,test_req,test_res,function(err) {
		if (err) {
			console.error('Error serving dat file: '+err);
		}
		console.log ('file has been served')
		var stat=require('fs').statSync(test_fname);
		var expected_size=test0.end-test0.start+1;
		console.log (`File size: ${stat.size}..... Expected: ${expected_size}`);
		if (stat.size!=expected_size) {
			throw `File size does not match expected size. Aborting.`;
		}
		callback();
	});
}

function get_dat(dat_key,callback) {
	Dat(__dirname+'/temporary_storage', {
	//Dat('test_dat', {
		key:dat_key,
		sparse:true,
		temp:false
	}, function (err, dat) {
		if (err) {
			throw `Error initializing dat: `+err.message;
		}
		console.log (`Joining dat network (${dat_key})...`);
		dat.joinNetwork(function(err) {
			if (err) {
				throw 'Error joining network: '+err.message;
			}
			console.log ('joined dat network.');
			callback(dat);
		});
	});
}

function serve_file(dat,filename,req,res,callback) {
	var range=parse_range_header(req.headers.range||'');
	var stream = dat.archive.createReadStream(filename, {
		start:range.start,
		end:range.end
	});
	if (res.setHeader) {
		res.setHeader("content-type", "application/octet-stream");
	}
	stream.pipe(res);
	stream.on('end',function() {
		if (callback) callback(null);
		callback=null;
	});
	stream.on('error',function(err) {
		if (callback) callback('Error: '+err);
		callback=null;
	});
}

function parse_range_header(str) {
    var ret={
      start:undefined,
      end:undefined
    };
    var list=(str||'').split('=');
    if (list.length!=2) return ret;
    if (list[0]=='bytes') {
      var list2=list[1].split('-');
      if (list2.length!=2) return ret;
      return {
        start:Number(list2[0]),
        end:Number(list2[1])
      };
    }
}