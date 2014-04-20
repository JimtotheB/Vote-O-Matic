// ==UserScript==
// @name           Vote-O-Matic
// @description    Manage your friends and enemies on Reddit
// @author         PaperElectron
// @copyright      (c) 2014 James M. Bulkowski
// @license        MIT
// @include        http://www.reddit.com/r/*
// @include        https://www.reddit.com/r/*
// @include        http://reddit.com/r/*
// @include        https://reddit.com/r/*
// @require        http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.4/jquery-ui.min.js
// @grant          GM_getValue
// @grant          GM_setValue
// @grant          GM_listValues
// @grant          GM_deleteValue
// @version        0.0.1
// ==/UserScript==

/*
 The MIT License (MIT)

 Copyright (c) 2014 James M. Bulkowski

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
 */

(function() {
    var addUserDialog, addUserTimer, badGuys, badGuysInitNotification, badGuysNotificationElm, badGuysUlElm, changeStatus
    var choppingBlock, delayMax, delayMin, editUserTimer, getUsersWithVotes, goodGuys, goodGuysInitNotification
    var goodGuysNotificationElm, goodGuysUlElm, listElm, newUi, populateFromLocalStorage, populateUserArray, pushUsers
    var randomInt, rePopulate, removeUserFromStorage, spinUsers, timeout, resetData;

    /* Add your list of users to downvote here */
    badGuys = [];

    /* Add your list of users to upvote here */
    goodGuys = [];

    /* Minimum delay between voting attempts */
    delayMin = 500;

    /* Maximum delay between voting attempts */
    delayMax = 2000;

    /* Set this to true and reload a page it runs on to delete all data. Then reset to false. */
    resetData = false;

    /*Do not edit below, unless you know what you are doing.
     */

    if(resetData){
        GM_deleteValue("badGuys");
        GM_deleteValue("goodGuys");
    }

    /* Bring in some styles */

    $("head").append('<link rel="stylesheet" href="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.1/themes/redmond/jquery-ui.min.css" type="text/css" />');


    /* Get values from greasemonkey storage and append them to the in script list */

    populateFromLocalStorage = function() {
        var bgs, ggs;
        if (GM_listValues().length) {
            bgs = GM_getValue("badGuys");
            ggs = GM_getValue("goodGuys");
            badGuys = _.union(bgs, badGuys);
            goodGuys = _.union(ggs, goodGuys);
            GM_setValue("badGuys", badGuys);
            return GM_setValue("goodGuys", goodGuys);
        } else {
            GM_setValue("badGuys", badGuys);
            return GM_setValue("goodGuys", goodGuys);
        }
    };

    populateFromLocalStorage();

    choppingBlock = [];

    addUserDialog = $("<div id=\"dialog\"></div>");

    listElm = $("<div class='sr-header-area'>\n  <div class='sr-list' id='badGuysUI'>\n    <ul class='flat-list'>\n      <li>The Bad Guys</li><span class='separator'>-</span>\n    </ul>\n    <span class=\"badNotification\"></span>\n  </div>\n  <div class='sr-list' id='goodGuysUI'>\n    <ul class='flat-list'>\n      <li>The Good Guys</li><span class='separator'>-</span>\n    </ul>\n    <span class=\"goodNotification\"></span>\n  </div>\n</div>");

    $("document").append(addUserDialog);

    newUi = $("#header").append(listElm);


    /* Bad Guys UI elements */

    badGuysInitNotification = "Downvoting users";

    badGuysNotificationElm = $("#badGuysUI .badNotification");

    badGuysUlElm = $("#badGuysUI ul");


    /* Good guys Ui elements */

    goodGuysInitNotification = "Upvoting users";

    goodGuysNotificationElm = $("#goodGuysUI .goodNotification");

    goodGuysUlElm = $("#goodGuysUI ul");

    populateUserArray = function() {
        console.log("Populating users");
        pushUsers(badGuys, "down", badGuysUlElm);
        pushUsers(goodGuys, "up", goodGuysUlElm);
        badGuysNotificationElm.html(badGuysInitNotification).css({
            color: "green"
        });
        return goodGuysNotificationElm.html(goodGuysInitNotification).css({
            color: "green"
        });
    };

    rePopulate = function() {
        console.log("Page state changed. Re running user populator");
        badGuysNotificationElm.html(badGuysInitNotification).css({
            color: "green"
        });
        goodGuysNotificationElm.html(goodGuysInitNotification).css({
            color: "green"
        });
        return choppingBlock.forEach(function(user) {
            var arr;
            arr = $(".author:contains(" + user.user + ")").closest(".thing").children(".midcol.unvoted").children(".arrow." + user.direction);
            user.votes = $.makeArray(arr);
            console.log(user);
            return user.selector.html("<a href='/user/" + user.user + "'>" + user.user + ": " + user.count + "/" + arr.length + "</a>");
        });
    };


    /*
     * Iterates through the list generated by populateUserArray()
     * clicks on the downvote button, and updates the UI.
     */

    timeout = null;

    spinUsers = function(delay) {
        console.time("spinUsers");
        clearTimeout(timeout);
        return timeout = setTimeout((function() {
            var user, userIndex;
            if (getUsersWithVotes().length) {

                /* Select random user with votes remaining */
                userIndex = getUsersWithVotes()[Math.floor(Math.random() * getUsersWithVotes().length)];
                user = choppingBlock[userIndex];
                if (user.votes.length) {
                    $(user.votes.shift()).click();
                    user.selector.html("<li data-direction='" + user.direction + "' data-username='" + user.user + "'><a href='/user/" + user.user + "'>" + user.user + ": " + user.count + "/" + user.votes.length + "</a></li>");
                    if (!user.votes.length) {
                        console.log("No more votes for " + user.user);
                    }
                    spinUsers(randomInt());
                } else {
                    console.log(user.user + " is all out of votes");
                    spinUsers(randomInt());
                }
            } else {

            }
            if (changeStatus("down")) {
                badGuysNotificationElm.html("All users downvoted").css({
                    color: "red"
                });
            }
            if (changeStatus("up")) {
                goodGuysNotificationElm.html("All users upvoted").css({
                    color: "red"
                });
            }
            console.timeEnd("spinUsers");
            return console.log(delay);
        }), delay);
    };


    /*
     * Add some event handlers so we can repopulate our data as the page changes.
     */

    $(document).on("DOMNodeInserted", function(event) {
        if ((event.target.tagName === "DIV") && (event.target.getAttribute("id") && event.target.getAttribute("id").indexOf("siteTable") !== -1)) {
            rePopulate();
            spinUsers(randomInt());
        }
    });


    /*
     * Repopulate and rerun when the page loads in additional data.
     */

    $(document).ajaxComplete(function() {
        rePopulate();
        spinUsers(randomInt());
    });


    /*
     * Repopulate and rerun when a users comments are uncollapsed.
     * TODO: this may not be necessary, but Im leaving it in for now.
     */

    $(".expand").click(function() {
        rePopulate();
        spinUsers(randomInt());
    });


    /*
     * Attach mouseenter handler to usernames on the page, opens dialog to add user to local storage
     * In addition, push users onto the chopping block and commence voting.
     * TODO: The click handlers could probably be factored into a function. But they are already fairly terse and may not
     * Save many lines.
     */

    addUserTimer = false;

    $(".author").on("mouseenter", function(event) {
        var thisUsername;
        thisUsername = $(this).html();
        return addUserTimer = setTimeout((function() {
            return $(addUserDialog).dialog({
                title: "Add " + thisUsername,
                height: 100,
                show: {
                    delay: 50,
                    effect: "fade",
                    duration: 300
                },
                hide: {
                    effect: "slide",
                    duration: 100
                },
                buttons: [
                    {
                        text: "GoodGuys",
                        click: function() {
                            var newGoodUser;
                            newGoodUser = thisUsername;
                            goodGuys.push(newGoodUser);
                            populateFromLocalStorage();
                            pushUsers([newGoodUser], "up", goodGuysUlElm);
                            rePopulate();
                            spinUsers(200);
                            $(this).dialog("close");
                        }
                    }, {
                        text: "Badguys",
                        click: function() {
                            var newBadUser;
                            newBadUser = thisUsername;
                            badGuys.push(newBadUser);
                            populateFromLocalStorage();
                            pushUsers([newBadUser], "down", badGuysUlElm);
                            rePopulate();
                            spinUsers(200);
                            $(this).dialog("close");
                        }
                    }
                ],
                position: {
                    my: "center bottom+10",
                    of: event
                },
                open: function(event, ui) {
                    return $(this).parent().on("mouseleave", (function(_this) {
                        return function() {
                            return $(_this).dialog("close");
                        };
                    })(this));
                }
            });
        }), 400);
    }).on("mouseout", function() {
        clearTimeout(addUserTimer);
        return addUserTimer = false;
    });


    /*
     * Add a delegated event handler to the ul>li of usernames and votes.
     */

    editUserTimer = false;

    $("ul").on("mouseenter", ".vom-userDisplay", function(event) {
        var thisUsername, userData;
        userData = $(this).data();
        thisUsername = $(this).html();
        return editUserTimer = setTimeout((function() {
            return $(addUserDialog).dialog({
                title: "Edit " + userData.username,
                height: 100,
                show: {
                    delay: 50,
                    effect: "fade",
                    duration: 300
                },
                hide: {
                    effect: "slide",
                    duration: 100
                },
                buttons: [
                    {
                        text: "Visit page",
                        click: function() {
                            $(this).dialog("close");
                            window.location.href = "/user/" + userData.username;
                        }
                    }, {
                        text: "Delete",
                        click: function() {
                            removeUserFromStorage(userData);
                            $(this).dialog("close");
                        }
                    }
                ],
                position: {
                    my: "top-20",
                    of: event
                },
                open: function(event, ui) {
                    return $(this).parent().on("mouseleave", (function(_this) {
                        return function() {
                            return $(_this).dialog("close");
                        };
                    })(this));
                }
            });
        }), 400);
    }).on("mouseout", function() {
        clearTimeout(editUserTimer);
        return editUserTimer = false;
    });


    /*
     * Returns true if all of the specified groups votes are 0
     */

    changeStatus = function(direction) {
        var users;
        users = _.filter(choppingBlock, function(user) {
            return user.direction === direction;
        });
        return _.every(users, function(user) {
            return !user.votes.length;
        });
    };


    /*
     * Returns a random interval between delayMin and delayMax
     */

    randomInt = function() {
        return Math.floor(Math.random() * (delayMax - delayMin + 1)) + delayMin;
    };


    /*
     * Returns an array of array indexes of users with votes remaining.
     */

    getUsersWithVotes = function() {
        var votesRemaining;
        votesRemaining = [];
        _.map(choppingBlock, function(user) {
            if (user.votes.length) {
                votesRemaining.push(choppingBlock.indexOf(user));
            }
        });
        return votesRemaining;
    };


    /*
     * Remove a user from local storage as well as the chopping block.
     */

    removeUserFromStorage = function(user) {
        var newBadguys, newGoodguys, remove;
        if (user.direction === "down") {
            newBadguys = _.without(badGuys, user.username);
            badGuys = newBadguys;
            GM_setValue("badGuys", badGuys);
        }
        if (user.direction === "up") {
            newGoodguys = _.without(goodGuys, user.username);
            goodGuys = newGoodguys;
            GM_setValue("goodGuys", goodGuys);
        }
        remove = _.find(choppingBlock, function(u) {
            return u.user === user.username;
        });
        console.log(remove.selector);
        remove.selector.remove();
        remove.separator.remove();
        rePopulate();
        return spinUsers(200);
    };


    /*
     * Push Users along with their data and selectors onto the chopping block.
     */

    pushUsers = function(UserArray, voteDirection, uiElement) {
        return UserArray.forEach(function(user) {
            var arr, elm, sep, userComments;
            userComments = $(".author:contains(" + user + ")").closest(".thing").children(".midcol");
            arr = $(".author:contains(" + user + ")").closest(".thing").children(".midcol.unvoted").children(".arrow." + voteDirection);
            elm = $("<li class='vom-userDisplay' data-direction='" + voteDirection + "' data-username='" + user + "'><a href='/user/" + user + "'>" + user + ": " + userComments.length + "/" + arr.length + " </a></li>");
            sep = $("<span class='separator'>-</span>");
            uiElement.append(elm);
            uiElement.append(sep);
            return choppingBlock.push({
                user: user,
                votes: $.makeArray(arr),
                count: userComments.length,
                selector: elm,
                separator: sep,
                direction: voteDirection
            });
        });
    };


    /*
     * commence voting
     */

    populateUserArray();

    spinUsers(100);

}).call(this);

