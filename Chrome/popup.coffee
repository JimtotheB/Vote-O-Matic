$ ->
  localServer = chrome.runtime.connect(name: "client")

  $("#deleteAllUsers").click (event)->
      conf = confirm "Are you sure? \nThis will delete ALL saved users."
      if conf
        localServer.postMessage command: "deleteAllUsers", data: null

  localServer.onMessage.addListener (msg)->
    switch msg.command
      when "AllDataDeleted"
        status = $("#confirmation")
        status.html(msg.message)
        setTimeout (->
          status.empty()
          setTimeout (->
            window.close()
          ), 300
        ), 3000