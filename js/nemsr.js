 $(function() {
  //gets the vocab content and populates the approprate form controls.
  $.getJSON("vocabs.json",function(vocabsjson) {
  var providers = vocabsjson.dataProviders;
  //console.log(providers);
  var themes = vocabsjson.themes;
  //console.log(themes);
  $('#data-provider').empty();
  $('#data-provider').append($('<option></option>').val("").html(""));
  $.each(providers, function(i, p) {
  $('#data-provider').append($('<option></option>').val(p).html(p));
 });
  $('#environmental-theme1').empty();
  $('#environmental-theme1').append($('<option></option>').val("").html(""));
  $('#environmental-theme2').empty();
  $('#environmental-theme2').append($('<option></option>').val("").html(""));
  $('#environmental-theme3').empty();
  $('#environmental-theme3').append($('<option></option>').val("").html(""));
  $.each(themes, function(i, p) {
  $('#environmental-theme1').append($('<option></option>').val(p).html(p));
  $('#environmental-theme2').append($('<option></option>').val(p).html(p));
  $('#environmental-theme3').append($('<option></option>').val(p).html(p));
 });
});


  
  
  
  
  var csv = document.getElementById('csvload');
  var csveditor = CodeMirror.fromTextArea(csv, {
	'lineNumbers': true, 
	'mode': ' text/plain'
  });
  
  var json = document.getElementById('json');
  var jsoneditor = CodeMirror.fromTextArea(json, {
	'lineNumbers': true, 
	'mode': {name: "javascript", jsonld: true}
  });
  
  
  // handle file input
	$("#fileSelector").change(function() {
    var reader = new FileReader();  
    reader.onload = function(e) {
		var text = reader.result;
    csveditor.setValue(reader.result);
	}
	var f=this.files[0];
    reader.readAsText(f);
});
  

  
  
  $( "#transformcsv" ).click(function() {  
    var jsonObj = getNetworkDetails();
    var csvText = csveditor.getDoc().getValue();;
	var json = csvToJson(jsonObj, csvText);
	jsoneditor.getDoc().setValue(json);
    var totalLines = jsoneditor.lineCount();  
    jsoneditor.autoFormatRange({line:0, ch:0}, {line:totalLines});

	});
	
  $( "#savejson" ).click(function() {
		var jsonData = jsoneditor.getValue();
		var textFileAsBlob = new Blob([jsonData], {type:'application/json'});
		var fileNameToSaveAs = "sitedata.json";
		
		var downloadLink = document.createElement("a");
		downloadLink.download = fileNameToSaveAs;
		downloadLink.innerHTML = "Download File";
		if (window.URL != null)
		{
			// Chrome allows the link to be clicked
			// without actually adding it to the DOM.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
		}
		else
		{
			// Firefox requires the link to be added to the DOM
			// before it can be clicked.
			downloadLink.href = window.URL.createObjectURL(textFileAsBlob);
			downloadLink.onclick = destroyClickedElement;
			downloadLink.style.display = "none";
			document.body.appendChild(downloadLink);
		}

		downloadLink.click();

	});
	

});


function destroyClickedElement(event)
{
	document.body.removeChild(event.target);
}



function convertDate(csvstrdate)
//converts a CSV date string of format DD/MM/YYYY to ISO formatted JSON Date-Time, assuming UTC
{
	if (csvstrdate==""){
		jsonDate="";
		
	} else {
	var dateParts=csvstrdate.split("/");
	var day = parseInt(dateParts[0]);
    var month = (parseInt(dateParts[1])-1); //january needs to be month 0, not month 1
    var year = parseInt(dateParts[2]);
	jsonDate= dateParts[2]+"-"+dateParts[1]+"-"+dateParts[0]+"T00:00:00Z";
	}
	return jsonDate;
}


function getNetworkDetails()
{
	var jsonObj = clone(nemsrJSONObject);
	
	jsonObj.properties.dateGenerated = new Date();
	jsonObj.properties.dataProvider = $("#data-provider" ).val();
	jsonObj.properties.network[0].id = $("#network-id" ).val();
	jsonObj.properties.network[0].name = $("#network-name" ).val();
	jsonObj.properties.network[0].networkDescription = $("#network-description" ).val();
	jsonObj.properties.network[0].networkURL = $("#network-url" ).val();
	jsonObj.properties.network[0].contactDetails.name = $("#contact-name" ).val();
	jsonObj.properties.network[0].contactDetails.phone = $("#contact-phone" ).val();
	jsonObj.properties.network[0].contactDetails.address = $("#contact-address" ).val();
	jsonObj.properties.network[0].contactDetails.onlineResource = $("#contact-resource" ).val();
	jsonObj.properties.network[0].environmentalTheme.push($("#environmental-theme1" ).val());
	if ($("#environmental-theme2" ).val() != "")
		jsonObj.properties.network[0].environmentalTheme.push($("#environmental-theme2" ).val());
		
	if ($("#environmental-theme3" ).val() != "")
		jsonObj.properties.network[0].environmentalTheme.push($("#environmental-theme3" ).val());		
	
	jsonObj.properties.network[0].extensionFieldName1 = $("#extension-field1" ).val();
	jsonObj.properties.network[0].extensionFieldName2 = $("#extension-field2" ).val();
	jsonObj.properties.network[0].extensionFieldName3 = $("#extension-field3" ).val();
	jsonObj.properties.network[0].extensionFieldName4 = $("#extension-field4" ).val();
	jsonObj.properties.network[0].extensionFieldName5 = $("#extension-field5" ).val();
	
	return jsonObj;
}

function clone (src) {
    return JSON.parse(JSON.stringify(src));
}

function csvToJson(jsonObj, csv)
{
	var features = {"features": []};
   var array = CSVToArray(csv);
    var objArray = [];
    for (var i = 1; i < array.length; i++) {
	
	   var siteObj = clone(nemsrJSONSite);

	   
        objArray[i - 1] = {};
        for (var k = 0; k < array[0].length && k < array[i].length; k++) {
            var key = array[0][k];
			siteObj = setSiteValue(k, siteObj,array[i][k]);

        }

		features.features.push(siteObj);
				
    }
	

	
	jsonObj.features = features.features;
	
	var json = JSON.stringify(jsonObj);

    var str = json.replace(/},/g, "},\r\n");
	
	return str;
}

function setSiteValue(index, obj, value)
{
switch(index) {
    case 0:
        obj.id = value;
        break;
    case 1:
        obj.properties.name = value;
        break;
    case 2:
        obj.properties.siteDescription = value.substring(0,499); //have to truncate the description if > 500 characters long.
        break;
    case 3:
        obj.properties.siteURL = value;
        break;
    case 4:
        obj.properties.siteLicence = value;
        break;		
    case 5:
        obj.crs.properties.href = value;
        break;
    case 6:
		obj.geometry.coordinates.length = 0;
        obj.geometry.coordinates.push(Number(value));
        break;
    case 7:
        obj.geometry.coordinates.push(Number(value));
        break;
    case 8:	// ahd
	if (value != ""){
        obj.geometry.coordinates.push(Number(value));
		}
        break;
    case 9:
        obj.properties.operatingAuthority.name = value;
        break;
    case 10:
        obj.properties.operatingAuthority.url = value;
        break;
    case 11:
        obj.properties.siteStatus = value;
		break;
    case 12:
        obj.properties.extensionFieldValue1 = value;		
		break;
    case 13:
        obj.properties.extensionFieldValue2 = value;		
		break;
    case 14:
        obj.properties.extensionFieldValue3 = value;		
		break;
    case 15:
        obj.properties.extensionFieldValue4 = value;		
		break;
    case 16:
        obj.properties.extensionFieldValue5 = value;				
        break;		
    case 17:
	{
		var ocObj = clone(nemsrObservingCapability);
        obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[0].observedProperty = value;		
		}
		break;
    case 18:
        obj.properties.observingCapabilities[0].procedure = value;		
		break;
    case 19:
        obj.properties.observingCapabilities[0].observationMethod = value;		
		break;
    case 20:
        obj.properties.observingCapabilities[0].dataAvailabilityStatus = value;		
		break;
    case 21:
        obj.properties.observingCapabilities[0].samplingRegime = value;		
		break;
    case 22:
        obj.properties.observingCapabilities[0].firstObservationDate = convertDate(value);		
		break;
    case 23:
        obj.properties.observingCapabilities[0].finalObservationDate = convertDate(value);				
        break;	
    case 24:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[1].observedProperty = value;

    }
	}
	break;
	case 25:
		if (value != "")
		{
        obj.properties.observingCapabilities[1].procedure = value;		
		}
		break;
    case 26:
		if (value != "")
	{
        obj.properties.observingCapabilities[1].observationMethod = value;		
    }
	break;
	case 27:
			if (value != "")
	{
        obj.properties.observingCapabilities[1].dataAvailabilityStatus = value;		
    }
	break;
	case 28:
     		if (value != "")
	{   obj.properties.observingCapabilities[1].samplingRegime = value;		
    }
	break;
	case 29:
     		if (value != "")
	{   obj.properties.observingCapabilities[1].firstObservationDate = convertDate(value);		
    }
	break;
	case 30:
     		if (value != "")
	{   obj.properties.observingCapabilities[1].finalObservationDate = convertDate(value);				
}     
	 break;			
  case 31:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[2].observedProperty = value;

    }
	}
	break;
	case 32:
		if (value != "")
		{
        obj.properties.observingCapabilities[2].procedure = value;		
		}
		break;
    case 33:
		if (value != "")
	{
        obj.properties.observingCapabilities[2].observationMethod = value;		
    }
	break;
	case 34:
			if (value != "")
	{
        obj.properties.observingCapabilities[2].dataAvailabilityStatus = value;		
    }
	break;
	case 35:
     		if (value != "")
	{   obj.properties.observingCapabilities[2].samplingRegime = value;		
    }
	break;
	case 36:
     		if (value != "")
	{   obj.properties.observingCapabilities[2].firstObservationDate = convertDate(value);		
    }
	break;
	case 37:
     		if (value != "")
	{   obj.properties.observingCapabilities[2].finalObservationDate = convertDate(value);				
}     
	 break;			
	   case 38:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[3].observedProperty = value;

    }
	}
	break;
	case 39:
		if (value != "")
		{
        obj.properties.observingCapabilities[3].procedure = value;		
		}
		break;
    case 40:
		if (value != "")
	{
        obj.properties.observingCapabilities[3].observationMethod = value;		
    }
	break;
	case 41:
			if (value != "")
	{
        obj.properties.observingCapabilities[3].dataAvailabilityStatus = value;		
    }
	break;
	case 42:
     		if (value != "")
	{   obj.properties.observingCapabilities[3].samplingRegime = value;		
    }
	break;
	case 43:
     		if (value != "")
	{   obj.properties.observingCapabilities[3].firstObservationDate = convertDate(value);		
    }
	break;
	case 44:
     		if (value != "")
	{   obj.properties.observingCapabilities[3].finalObservationDate = convertDate(value);				
}     
	 break;			
  case 45:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[4].observedProperty = value;

    }
	}
	break;
	case 46:
		if (value != "")
		{
        obj.properties.observingCapabilities[4].procedure = value;		
		}
		break;
    case 47:
		if (value != "")
	{
        obj.properties.observingCapabilities[4].observationMethod = value;		
    }
	break;
	case 48:
			if (value != "")
	{
        obj.properties.observingCapabilities[4].dataAvailabilityStatus = value;		
    }
	break;
	case 49:
     		if (value != "")
	{   obj.properties.observingCapabilities[4].samplingRegime = value;		
    }
	break;
	case 50:
     		if (value != "")
	{   obj.properties.observingCapabilities[4].firstObservationDate = convertDate(value);		
    }
	break;
	case 51:
     		if (value != "")
	{   obj.properties.observingCapabilities[4].finalObservationDate = convertDate(value);				
}     
	 break;				 
   case 52:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[5].observedProperty = value;

    }
	}
	break;
	case 53:
		if (value != "")
		{
        obj.properties.observingCapabilities[5].procedure = value;		
		}
		break;
    case 54:
		if (value != "")
	{
        obj.properties.observingCapabilities[5].observationMethod = value;		
    }
	break;
	case 55:
			if (value != "")
	{
        obj.properties.observingCapabilities[5].dataAvailabilityStatus = value;		
    }
	break;
	case 56:
     		if (value != "")
	{   obj.properties.observingCapabilities[5].samplingRegime = value;		
    }
	break;
	case 57:
     		if (value != "")
	{   obj.properties.observingCapabilities[5].firstObservationDate = convertDate(value);		
    }
	break;
	case 58:
     		if (value != "")
	{   obj.properties.observingCapabilities[5].finalObservationDate = convertDate(value);				
}     
	 break;	
  case 59:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[6].observedProperty = value;

    }
	}
	break;
	case 60:
		if (value != "")
		{
        obj.properties.observingCapabilities[6].procedure = value;		
		}
		break;
    case 61:
		if (value != "")
	{
        obj.properties.observingCapabilities[6].observationMethod = value;		
    }
	break;
	case 62:
			if (value != "")
	{
        obj.properties.observingCapabilities[6].dataAvailabilityStatus = value;		
    }
	break;
	case 63:
     		if (value != "")
	{   obj.properties.observingCapabilities[6].samplingRegime = value;		
    }
	break;
	case 64:
     		if (value != "")
	{   obj.properties.observingCapabilities[6].firstObservationDate = convertDate(value);		
    }
	break;
	case 65:
     		if (value != "")
	{   obj.properties.observingCapabilities[6].finalObservationDate = convertDate(value);				
}     
	 break;	
  case 66:
	{
	if (value != "") 
	{
		// add additional observing capability
		var ocObj = clone(nemsrObservingCapability);
		obj.properties.observingCapabilities.push(ocObj);
		obj.properties.observingCapabilities[7].observedProperty = value;

    }
	}
	break;
	case 67:
		if (value != "")
		{
        obj.properties.observingCapabilities[7].procedure = value;		
		}
		break;
    case 68:
		if (value != "")
	{
        obj.properties.observingCapabilities[7].observationMethod = value;		
    }
	break;
	case 69:
			if (value != "")
	{
        obj.properties.observingCapabilities[7].dataAvailabilityStatus = value;		
    }
	break;
	case 70:
     		if (value != "")
	{   obj.properties.observingCapabilities[7].samplingRegime = value;		
    }
	break;
	case 71:
     		if (value != "")
	{   obj.properties.observingCapabilities[7].firstObservationDate = convertDate(value);	
    }
	break;
	case 72:
     		if (value != "")
	{   obj.properties.observingCapabilities[7].finalObservationDate = convertDate(value);			
}     
	 break;	
 
    default:
	break;
        ;
	
}
return obj;
}

var nemsrJSONObject = {
	"type": "FeatureCollection",
	"properties": {
		"dateGenerated": "2016-01-18T03:17:46+10:00",
		"version": "1.0.0",
		"dataProvider": "",
		"network": [
			{
				"id": "",
				"name": "",
				"networkDescription": "",
				"networkURL": "",
				"contactDetails": {
					"name": "",
					"phone": "",
					"address": "",
					"onlineResource": ""
				},
				"environmentalTheme": [],
				"extensionFieldName1": "",
				"extensionFieldName2": "",
				"extensionFieldName3": "",
				"extensionFieldName4": "",
				"extensionFieldName5": ""
			}
		]
	},
	"features": []};		  

var nemsrJSONSite = {
			"type": "Feature",
			"id": "",
			"geometry": {
				"type": "Point",
				"coordinates": [
					149, -35, 21
				]
			},
			"crs": {
				"type": "link",
				"properties": {
					"href": "http://www.opengis.net/def/crs/EPSG/0/4979",
					"type": "proj4"
				}
			},
			"properties": {
				"name": "",
				"siteDescription": "",
				"siteURL": "",
				"siteLicence": "",
				"operatingAuthority": {
					"name": "",
					"url": ""
				},
				"siteStatus": "",
				"extensionFieldValue1": "",
				"extensionFieldValue2": "",
				"extensionFieldValue3": "",
				"extensionFieldValue4": "",
				"extensionFieldValue5": "",
				"observingCapabilities": [

				]
			}
		};
		
var nemsrObservingCapability = 					{
						"observedProperty": "",
						"procedure": "",
						"observationMethod": "",
						"dataAvailabilityStatus": "",
						"samplingRegime": "",
						"firstObservationDate": "",
						"finalObservationDate":""
					};

