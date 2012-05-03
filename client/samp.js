(function (win, doc, exports) {

    'use strict';

    function init() {
    
        var cv = document.getElementById('canvas'),
            ctx = cv.getContext('2d'),
            cWidth = cv.width,
            cheight = cv.height,
            img = new Image();


        img.src = 'HTML5_Logo_256.png';
        img.onload = function () {

            ctx.beginPath();
            ctx.drawImage(img, 0, 0);
            ctx.closePath();
        };
    }


    ////////////////////////////////////////////////////////////////

    function createBMP(oData) {
		var aHeader = [];
	
		var iWidth = oData.width;
		var iHeight = oData.height;

		aHeader.push(0x42); //as 'B'
		aHeader.push(0x4D); //as 'M'
	
		var iFileSize = iWidth * iHeight * 3 + 54; // total header size = 54 bytes
        //split 4 areas by 8 bit. (e.g. 12000054byte = 00000000 10110111 00011011 00110110 (2進数)
		aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256); iFileSize = Math.floor(iFileSize / 256);
		aHeader.push(iFileSize % 256);

		aHeader.push(0); aHeader.push(0); // reserved as 2 bytes.
		aHeader.push(0); aHeader.push(0); // reserved as 2 bytes.

		aHeader.push(54); aHeader.push(0); aHeader.push(0); aHeader.push(0); // dataoffset as 4 byte.

		var aInfoHeader = [];
		aInfoHeader.push(40); aInfoHeader.push(0); aInfoHeader.push(0); aInfoHeader.push(0); // info header size as 4 bytes.

		var iImageWidth = iWidth;
		aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256); iImageWidth = Math.floor(iImageWidth / 256);
		aInfoHeader.push(iImageWidth % 256);
	
		var iImageHeight = iHeight;
		aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256); iImageHeight = Math.floor(iImageHeight / 256);
		aInfoHeader.push(iImageHeight % 256);
	
		aInfoHeader.push(1); // num of planes
		aInfoHeader.push(0);
	
		aInfoHeader.push(24); // num of bits per pixel
		aInfoHeader.push(0);
	
		aInfoHeader.push(0); // compression = none
		aInfoHeader.push(0);
		aInfoHeader.push(0);
		aInfoHeader.push(0);
	
		var iDataSize = iWidth * iHeight * 3; 
		aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256); iDataSize = Math.floor(iDataSize / 256);
		aInfoHeader.push(iDataSize % 256); 
	
		for (var i = 0; i < 16; i++) {
			aInfoHeader.push(0);	// these bytes not used
		}
	
		var iPadding = (4 - ((iWidth * 3) % 4)) % 4;

		var aImgData = oData.data;

		var strPixelData = "";
		var y = iHeight;

		do {
			var iOffsetY = iWidth * (y - 1) * 4;
			var strPixelRow = "";

			for (var x = 0; x < iWidth; x++) {
				var iOffsetX = 4 * x;

				strPixelRow += String.fromCharCode(aImgData[iOffsetY + iOffsetX + 2]);
				strPixelRow += String.fromCharCode(aImgData[iOffsetY + iOffsetX + 1]);
				strPixelRow += String.fromCharCode(aImgData[iOffsetY + iOffsetX + 0]);
			}

			for (var c = 0; c < iPadding; c++) {
				strPixelRow += String.fromCharCode(0);
			}

			strPixelData += strPixelRow;
		} while (--y);

		var strEncoded = encodeData(aHeader.concat(aInfoHeader)) + encodeData(strPixelData);

		return strEncoded;
	}

    function encodeData(data) {
    
        var strData = '',
            aData;

        if (typeof data === 'string') {
            strData = data;
        }
        else {
            aData = data;
            for (var i = 0, l = aData.length; i < l; i++) {
                strData += String.fromCharCode(aData[i]);
            }
        }

        return btoa(strData);
    }

	function readCanvasData(oCanvas) {

		var iWidth = parseInt(oCanvas.width),
            iHeight = parseInt(oCanvas.height);

		return oCanvas.getContext('2d').getImageData(0, 0, iWidth, iHeight);
	}

	function makeDataURI(strData, strMime) {

		return 'data:' + strMime + ';base64,' + strData;
	}

	function makeImageObject(strSource) {

		var oImgElement = document.createElement('img');

		oImgElement.src = strSource;

		return oImgElement;
	}
    
    function scaleCanvas(oCanvas, iWidth, iHeight) {

		if (iWidth && iHeight) {
			var oSaveCanvas = document.createElement("canvas");
			oSaveCanvas.width = iWidth;
			oSaveCanvas.height = iHeight;
			oSaveCanvas.style.width = iWidth+"px";
			oSaveCanvas.style.height = iHeight+"px";

			var oSaveCtx = oSaveCanvas.getContext("2d");

			oSaveCtx.drawImage(oCanvas, 0, 0, oCanvas.width, oCanvas.height, 0, 0, iWidth, iHeight);
			return oSaveCanvas;
		}

		return oCanvas;
	}

    /////////////////////////////////////////////////////////////////////////

    init();

    var cv  = document.getElementById('canvas'),
        cWidth = cv.width,
        cHeight = cv.height,
        oScaledCanvas = scaleCanvas(cv, 100, 100),
        ocv = readCanvasData(oScaledCanvas);

    var strImgData = createBMP(ocv);
    var img = makeImageObject(makeDataURI(strImgData, "image/bmp"));

    doc.body.appendChild(img);

    /* -----------------------------------------------------
       EXPORT
    -------------------------------------------------------- */
    exports.createBMP = createBMP;

}(window, document, window));
