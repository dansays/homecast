const RSS     = require('rss');
const express = require('express');
const fs      = require('fs');
const ip      = require('ip');
const mime    = require('mime-types');
const config  = require('./config.json');

let app = express();
let port = 2310;
let server = app.listen(port, () => {
	console.log(`Listening on port ${port}`)
});

app.get('/:user/:folder', (req, res) => {
	const { user, folder } = req.params;
	const path = [ config.folders[user], folder ].join('/');
	const url  = `http://${ip.address()}:${port}/${user}/${folder}`;

	fs.readdir(path, (err, files) => {

		if (err) {
			res.send('shit');
			return;
		}

		let feed = new RSS({
			title: `Homecast: ${folder}`,
			generator: 'Homecast',
			copyright: 'No copyright intended ¯\\_(ツ)_/¯',
			feed_url: url,
			site_url: url,
		});

		let audioFiles = files.filter(file => file.endsWith('.mp3'));
	
		audioFiles.forEach(file => {

			const filePath = [ path, file ].join('/')
			const fileUrl  = [ url, escape(file) ].join('/');
			const fileInfo = fs.statSync(filePath);
			const fileType = mime.lookup(filePath);

			feed.item({
				title: file,
				url: fileUrl,
				date: fileInfo.ctime,
				enclosure: {
					url: fileUrl,
					size: fileInfo.size,
					type: fileType
				}
			});
		});
		res.contentType = 'application/rss+xml';
		res.send(feed.xml({ indent: '  ' }));

	});

});

app.get('/:user/:folderName/:fileName', (req, res) => {
	const { user, folderName, fileName } = req.params;
	const userPath = config.folders[user];
	const path = [ userPath, folderName, fileName ].join('/');
	res.send(path);

});