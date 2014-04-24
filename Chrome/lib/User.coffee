class User
  constructor: (user, voteDirection,uiElement)->
    arr = $(".author:contains(#{user})").closest(".thing").children(".midcol.unvoted").children(".arrow.#{voteDirection}")
    @user = user
    @votes = $.makeArray(arr)
    @count = $(".author:contains(#{user})").closest(".thing").children(".midcol").length
    @selector = $("<li class='vom-userDisplay' data-direction='#{voteDirection}' data-username='#{user}'><a href='/user/#{user}'>#{user}: #{@count}/#{arr.length} </a></li>")
    @separator = $("<span class='vom-separator'>-</span>")
    @direction = voteDirection
    uiElement.append @selector
    uiElement.append @separator

  vote: ->
    $(@votes.shift()).click()
    @selector.html "<li data-direction='#{@direction}' data-username='#{@user}'><a href='/user/#{@user}'>#{@user}: #{@count}/#{@votes.length}</a></li>"
    console.log "No more votes for #{@user}"  unless @votes.length


window.vomUser = User