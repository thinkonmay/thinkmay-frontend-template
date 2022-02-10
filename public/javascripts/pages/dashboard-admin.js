import * as API from "../util/api.js";
import { getCookie } from "../util/cookie.js"

$(document).ready(async () => {
	$("[data-toggle=\"tooltip\"]").tooltip()
	$("#addslave").click(() => {
		Swal.fire({
			title: "Submit your slave ID",
			input: "text",
			showCancelButton: true,
			confirmButtonText: "Add",
			showLoaderOnConfirm: true,
			preConfirm: id => {
				// fetch goes here
				return id
			},
			allowOutsideClick: () => !Swal.isLoading()
		}).then(result => {
			if (result.isConfirmed) {
				Swal.fire({
					title: `Added slave ID ${result.value}`
				})
			}
		})
	})


  for (const slave of slaves) {
    append("slaves", createSlave(slave))
  }
	$(document).on("click", '.overlay :input[name="terminate"]', async function () {
		const SlaveID = getSlaveID(this)
		await API.terminateSession(SlaveID)
	})
	$(document).on("click", '.overlay :input[name="reject"]', async function () {
		const SlaveID = getSlaveID(this)
		await API.rejectDevice(SlaveID)
		getParent(this).remove()
	})

})

async function getSlaves() {
  const token = getCookie("token")
  if (!token) return []
  try {
    const data = await fetch(API.FetchSlave, {
      headers: API.genHeaders(token)
    })
    return await data.json()
  } catch (e) {
    console.log(e)
    return []
  }
}

function createSlave(slave) {
  return `
    <div class="col-12 col-sm-6 col-md-3 d-flex align-items-stretch flex-column slave">
      <div class="card bg-light d-flex flex-fill">
        <div class="card-header text-muted border-bottom-0">
          <br>
        </div>
        <div class="card-body pt-0">
          <div class="row">
            <div class="col-7">
              <h2 class="lead"><b>${slave.name}</b></h2>
              <ul class="ml-4 mb-0 fa-ul text-muted">
                <li class="small"><span class="fa-li"><i class="fab fa-windows"></i></span>OS: ${slave.OS}</li>
                <li class="small"><span class="fa-li"><i class="fas fa-memory"></i></span>RAM: ${slave.RAMcapacity}</li>
                <li class="small"><span class="fa-li"><i class="fas fa-microchip"></i></span>CPU: ${slave.CPU}</li>
                <li class="small"><span class="fa-li"><i class="fas fa-tv"></i></span>GPU: ${slave.GPU}</li>
              </ul>
            </div>
            <div class="col-5 text-center">
              <img src="images/avtFounder.png" alt="user-avatar" class="img-circle img-fluid">
            </div>
          </div>
        </div>
        <div class="overlay">
          <div class="row">
            <div class="col colbut"><input class="btn btn-secondary" type="submit" name="" value="Reject device"></div>
            <div class="col colbut"><input class="btn btn-secondary" type="submit" name="" value="Connect device"></div>
            <div class="w-100"></div>
            <div class="col colbut"><input class="btn btn-secondary" type="submit" name="" value="AMOGUS"></div>
            <div class="col colbut"><input class="btn btn-secondary" type="submit" name="" value="SUSSY BAKA"></div>
          </div>
        </div>
      </div>
    </div>`
}

function append(id, html) {
  $(`#${id}`).append(html)
}

async function initSlave(slaveId, quality) {
  const data = await fetch(API.Initialize, {
    method: "POST",
    body: {
      slaveId,
      cap: {
        ...Quality(quality),
        mode: 1,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight
      }
    }
  })
  console.log(await data.text())
  // html.windows.open(html text), _blank
}

function Quality(qual) {
  switch (qual) {
    case "best":
      return {
        audioCodec: 4,
        videoCodec: 4
      }
    case "good":
      return {
        audioCodec: 2,
        videoCodec: 2
      }
    default:
      return {
        audioCodec: 0,
        videoCodec: 0
      }
  }
}


async function rejectDevice(sessionClientId) {
	const data = await API.rejectDevice(sessionClientId)
	console.log(await data.text())
}
