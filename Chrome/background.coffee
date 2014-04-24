chrome.runtime.onConnect.addListener (port) ->
  console.log "client connected"
  console.assert port.name is "client"
  port.onMessage.addListener (msg) ->
    switch msg.command
      when "ready"
        initStorage (data)->
          port.postMessage command: "Initialize", data: badGuys: data.badGuys, goodGuys: data.goodGuys

      when "addUser"
        addNewUser msg.data.username, msg.data.group, (command,user,dir, message)->
          port.postMessage command: command, message: message ,data: username: user, direction: dir

      when "deleteUser"
        deleteUser msg.data.username, msg.data.group, (message)->
          port.postMessage command: "userDeleted", message: message

      when "deleteAllUsers"
        deleteAllUsers (message)->
          port.postMessage command: "AllDataDeleted", message: message
  return


uniqueUser = (username, cb)->
  s = chrome.storage.local
  s.get "goodGuys", (good)->
    s.get "badGuys", (bad)->
#      console.log _.contains good.goodGuys, username
#      console.log _.contains bad.badGuys, username
      cb?(not _.contains good.goodGuys, username or not _.contains bad.badGuys, username)

addNewUser = (username, group, cb)->
  if group is "goodGuys" or "badGuys"
    s = chrome.storage.local
    direction = if group is "goodGuys" then "up" else "down"
    s.get group, (result)->
      uniqueUser username, (unique)->
        if unique
          console.log unique
          result[group].push username
          temp = {}
          temp[group] = result[group]
          s.set temp
          cb? "newUserAdded",username, direction, "User added"
        else
          cb? "Error",null, null, "User already saved"

deleteUser = (username, group, cb)->
  s = chrome.storage.local
  s.get group, (result)->
    removed = _.without result[group], username
    temp = {}
    temp[group] = removed
    s.set temp
    cb? "User deleted."

deleteAllUsers = (cb)->
  s = chrome.storage.local
  s.set badGuys: [], ->
    s.set goodGuys: [], ->
      if not chrome.runtime.lastError
        cb? "All data successfully deleted, please reload all reddit tabs."
      else
        cb? "Sorry there seems to have been an error."


initStorage = (cb)->
  data = {}
  s = chrome.storage.local
  s.get "badGuys", (r)->
    if not Object.getOwnPropertyNames(r).length
      s.set badGuys: []
      s.get "badGuys", (r)->
        data.badGuys = r.badGuys
    else
      data.badGuys = r.badGuys

    s.get "goodGuys", (r)->
      if not Object.getOwnPropertyNames(r).length
        s.set goodGuys: []
        s.get "goodGuys", (r)->
          data.goodGuys = r.goodGuys
          cb?(data)
      else
        data.goodGuys = r.goodGuys
        cb?(data)

#chrome.storage.local.clear()

