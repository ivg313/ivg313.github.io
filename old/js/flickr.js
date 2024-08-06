var author = "28007771@N06";
var base = "https://api.flickr.com/services/rest/?api_key=a34d2aaa34e8c82407b5a6eae3271925&format=json&user_id=" + author + "&nojsoncallback=1&";


var FlickrConnect = function (args, handler) {
	var xhr = new XMLHttpRequest();
	//var xhr = new ActiveXObject("Microsoft.XMLHTTP");
	/*if (window.XMLHttpRequest) {
        xhr = new XMLHttpRequest();
    } else if (window.ActiveXObject) {
        // for IE
        xhr = new ActiveXObject("Microsoft.XMLHTTP");
    }*/
	var url = base + args;
	console.log(url);
	xhr.open('get', url, true);
	// xhr.responseType = 'json';
	xhr.onreadystatechange = function () {
		if (xhr.readyState == 4) {
			if (xhr.status == 200) {
				handler.call(JSON.parse(xhr.response));
			} else {
				console.log(xhr.status);
				console.log(url);
				alert("Flickr error! Please reload page.")
			}
		}
	};
	xhr.send();
};


var FlickrGetGeo = function (page) {
	if (page == undefined) page = 1;
	// var method = 'method=flickr.people.getPublicPhotos&extras=description, license, date_upload, date_taken, owner_name, icon_server, original_format, last_update, geo, tags, machine_tags, o_dims, views, media, path_alias, url_sq, url_t, url_s, url_q, url_m, url_n, url_z, url_c, url_l, url_o&per_page=100&page=';
	var method = 'method=flickr.people.getPublicPhotos&extras=description, date_taken, geo, tags, media, path_alias, url_sq, url_s, url_l, url_o&per_page=500&page=';
	//var method='method=flickr.photosets.getPhotos&photoset_id=72157665103507436&extras=geo,date_taken&per_page=100&page=';
	FlickrConnect(method + page, function () {
		if (this.stat == 'ok') {
			if (this.photos.page < this.photos.pages) { //
				var page = this.photos.page + 1; //
				FlickrGetGeo(page);
			} else {
				var lastPage = true;
			}
			this.photos.photo.forEach(function (photo, idx, array) { //
				if (+photo.latitude != 0 && +photo.longitude != 0) {
					photos.push(photo);
					if (lastPage && idx === array.length - 1) {
						photos.sort(function (a, b) {
							if (a.datetaken < b.datetaken) return 1;
							if (a.datetaken > b.datetaken) return -1;
						})
						window.addEventListener("load", setMarkers(), false);
					}
				} else {
					// do something else if photo does NOT have location
				}

			});
		} else {
			console.log('Flickr в ахуе от запроса getPublicPhotos:');
			console.log(this);
		}
	});
};

FlickrGetGeo();


var FlickrBubbleContent = function (photo, num) {
	history.replaceState(null, null, '?id=' + photo.id);
	var url = 'gtfo';
	switch (photo.media) {
		case 'photo':
			content(photo.url_o);
			break;
		case 'video':
			/*	if (photo.description._content) {
					var weird = /\b(https|http):\/\/(youtu\.be|w{3}\.?youtube\.com)\/(\w{11}|watch\?v=\w{11})/gim;
					var yt = photo.description._content.match(weird);
					console.log(yt);
				}*/

			FlickrConnect('method=flickr.photos.getSizes&photo_id=' + photo.id, function () {
				content(this.sizes.size[10].source);
			});

			break;
	}

	function content(url) {
		if (~photo.tags.indexOf("360panorama")) {
			console.log("VR!");
			result = '<iframe allowfullscreen="true" scrolling="no" src="https://storage.googleapis.com/vrview/2.0/index.html?is_debug=false&preview=' + photo.url_l + '&image=' + url + '&amp;" style="border: 0px;"></iframe>';
			/*var vrView = new VRView.Player('#vrview', {
                image: 'https://farm1.staticflickr.com/948/41925991851_567c4494e0_o_d.jpg'
            });*/

		} else {
		var thumb = '<img onload="setBubbleWidth(this.width)" src="' + photo.url_s + '"/>';
		if (photo.media == 'video') thumb = '<img src="img/play.png" id="play" />' + thumb;
		var result = '<a id="goBig" target="_blank" href="' + url + '">' + thumb + '</a>'
		}
		var title = (photo.description._content) ? photo.description._content : photo.title;
		result = result + '<br/>' + '<b>' + title + '</b>' + '<br/>' + photo.latitude + ' ' + photo.longitude + '<br/>' + photo.datetaken;
		result = result + '<br/><a id="goFlickr" target="_blank" href="http://www.flickr.com/photos/' + photo.pathalias + '/' + photo.id + '/">Open on Flickr</a>'
		result = '<div id="bubbleContent">' + result + '</div>';

		infoWindow.setContent(result);
		infoWindow.open(map, markers[num]);
		
	}
}