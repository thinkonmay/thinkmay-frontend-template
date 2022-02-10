import * as API from "../util/api.js"
import * as RemotePage from "../util/remote-page-cookies.js"
import * as Setting from "../util/setting.js"
import {getCookie,setCookie} from "../util/cookie.js"


API.getInfor().then(async data => {
	$("#fullName").html((await data.json()).fullName)
})

$(document).ready(async () => {
	const getParent = input => $($(input).parent().parent().parent().parent())
	const getSlaveID = input => getParent(input).attr("id")



	$(document).on("click", '.overlay :input[name="connect"]', async function () {
		const SlaveID = getSlaveID(this)
		RemotePage.sessionInitialize(SlaveID)
	})
	$(document).on("click", '.overlay :input[name="reconnect"]', async function () {
		const SlaveID = getSlaveID(this)
		RemotePage.sessionReconnect(SlaveID)
	})
	$(document).on("click", '.overlay :input[name="disconnect"]', async function () {
		const SlaveID = getSlaveID(this)
		await API.disconnectDevice(SlaveID)
	})
	$(document).on("click", '.overlay :input[name="terminate"]', async function () {
		const SlaveID = getSlaveID(this)
		await API.terminateSession(SlaveID)
	})

	var defaultDeviceCap = {
		...Setting.AudioCodec("opus"),
		...Setting.VideoCodec("h264"),
		...Setting.Mode("very high"),
		screenWidth: 2560,
		screenHeight: 1440
	}

	
	setCookie("cap", JSON.stringify(defaultDeviceCap), 999999)
	console.log("set default device capability to "+getCookie("cap"));		
	/// How to convert to JSON 
	/// var cap = getCookie("cap");
	//  var parse = JSON.parse(cap);
	// use "parse" like json 
	// For ex: parse["mode"]

	try {
		const sessions = await (await API.fetchSession()).json()
		const slaves = await (await API.fetchSlave()).json()
		for (const slave of sessions) {
			append("onlineSlaves", createSlave(slave))
		}
		for (const slave of slaves) {
			append("availableSlaves", createSlave(slave))
		}
	} catch (err) {
		alert(err.message)
	}



	var stateSignalR = document.getElementById('state-signalr');
	// Connect to hub signalR with access-token Bearer Authorzation
	const connection = new signalR.HubConnectionBuilder()
		.withUrl(`https://conductor.thinkmay.net/ClientHub`,  {
		accessTokenFactory: () => getCookie("token") // Return access token
	}).build()
	connection.start().then(function () {
		console.log("connected to signalR hub");

		// we use signalR to inform browser 
		// about all state changes event of slave and session
		connection.on("ReportSessionDisconnected", function (slaveId) {
			button = slave.getElementById(`button${slaveId}`)
			button.innerHTML = slaveState("OFF_REMOTE")
		})
		connection.on("ReportSessionReconnected", function (slaveId) {
			button = slave.getElementById(`button${slaveId}`)
			button.innerHTML = slaveState("ON_SESSION")
		})
		connection.on("ReportSessionTerminated", function (slaveInfor) {
			sessionQueue = document.getElementById("onlineSlaves")
			slave = sessionQueue.getElementById(slaveId)
			slave.remove()
		})
		connection.on("ReportSlaveObtained", function (slaveId) {
			slaveQueue = document.getElementById("availableSlaves")
			slave = slaveQueue.getElementById(slaveId)
			slave.remove()
		})
		connection.on("ReportSessionInitialized", function (slaveInfor) {
			append("#availableSlaves",createSlave(slaveInfor))
		})
		connection.on("ReportNewSlaveAvailable", function (device) {
			append("#availableSlaves",createSlave(device))
		})
	}).catch(function (err) {
		location.reload();
	})
})

function 	createSlave(slave) {
	return `
    <div class="col-12 col-sm-6 col-md-3 d-flex align-items-stretch flex-column slave" id="${slave.id}">
      <div class="card bg-light d-flex flex-fill">
        <div style="text-alignt: center" class="card-header text-muted border-bottom-0">
		<img width="20px" height="20px" src="images/window-logo.png" alt="user-avatar" class="img-fluid">
		</div>
        <div class="card-body pt-0">
          <div class="row">
			<h2 class="lead"><b>Device</b></h2>
			<ul class="ml-4 mb-0 fa-ul text-muted">
			<li class="small"><span class="fa-li"><i class="fab fa-windows"></i></span>OS: ${slave.cpu}</li>
			<li class="small"><span class="fa-li"><i class="fab fa-windows"></i></span>OS: ${slave.os}</li>
			<li class="small"><span class="fa-li"><i class="fas fa-memory"></i></span>RAM: ${Math.round(slave.raMcapacity / 1024)}GB</li>
			<li class="small"><span class="fa-li"><i class="fas fa-tv"></i></span>GPU: ${slave.gpu}</li>
			</ul>
          </div>
        </div>
        <div class="overlay">
          <div class="row slaveState" id="button${slave.id}">
            ${slaveState(slave.serviceState)}
          </div>
        </div>
      </div>
    </div>`
}

function slaveState(state) {
	const nl = '<div class="w-100"></div>'
	const btn = {
		connect:    '<button type="button" class="btn btn-primary btn-icon-text" name="connect"><i class="ti-file btn-icon-prepend"></i>Connect</button></div>',
		disconnect: '<button type="button" class="btn btn-warning btn-icon-text" name="disconnect"><i class="ti-reload btn-icon-prepend"></i>Disconnect</button>',
		reconnect:  '<button type="button" class="btn btn-warning btn-icon-text" name="reconnect"><i class="ti-reload btn-icon-prepend"></i>Reconnect</button>',
		terminate:  '<button type="button" class="btn btn-outline-danger btn-icon-text" name="terminate"><i class="ti-upload btn-icon-prepend"></i>Terminate</button>'
	}
	if (state === "ON_SESSION"){
		return btn.disconnect + btn.terminate
	}
	if (state === "OFF_REMOTE"){
		return btn.reconnect + btn.terminate
	}
	if (state === null){
		return btn.connect
	}
}

function append(id, html) {
	$(`#${id}`).append(html)
}


function serialize(obj, prefix) {
	var str = [],
		p
	for (p in obj) {
		if (obj.hasOwnProperty(p)) {
			var k = prefix ? prefix + "[" + p + "]" : p,
				v = obj[p]
			str.push(
				v !== null && typeof v === "object" ?
				serialize(v, k) :
				encodeURIComponent(k) + "=" + encodeURIComponent(v)
			)
		}
	}
	return str.join("&")
}
