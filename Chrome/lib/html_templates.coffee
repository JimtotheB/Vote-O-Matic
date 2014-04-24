htmlTemplates = {}
htmlTemplates.mainElm = $("""
        <div class='vom-main'>
          <div class="vom-right">
            <div class='vom-userUi' id='badGuysUI'>
              <ul class='vom-inlineList'>
                <li>Bad Guys</li><span class='vom-separator'>-</span>
              </ul>
              <span class="badNotification"></span>
            </div>
            <div class='vom-userUi' id='goodGuysUI'>
              <ul class='vom-inlineList'>
                <li>Good Guys</li><span class='vom-separator'>-</span>
              </ul>
              <span class="goodNotification"></span>
            </div>
          </div>
          <div class="vom-left">
            <ul class="vom-info">
              <li>Vote-O-Matic</li>
              <li> - </li>
              <li><a href="#" id="vom-help">help</a></li>
              <li> - </li>
              <li><a href="#" id="vom-about">about</a></li>
            </ul>
          </div>
          <div class="vom-clear"></div>
        </div>
        """)
htmlTemplates.userDialog = $("""<div id="vom-userPopup"></div>""")
htmlTemplates.messageDialog = $("""<div id="vom-messagePopup"></div>""")
htmlTemplates.generalDialog = $("""<div id="vom-generalPopup"></div>""")

htmlTemplates.helpText = """
                         <div class="vom-dialog">
                            <ul>
                              <li>Hover over a users name in a comment section or subreddit front page,
                                  click the appropriate button to add them to a group.</li>
                              <li class="vom-dialog-dots">...</li>
                              <li>Once selected voting will start immediately and the username will be added to the list at
                                  the top of the page.</li>
                              <li class="vom-dialog-dots">...</li>
                              <li>Vote-O-Matic will apply upvotes and downvotes to every user in your list when it
                                  finds a matching name in a comment thread or subreddit front page.</li>
                              <li class="vom-dialog-dots">...</li>
                              <li>To delete a user or visit their page hover over their name in the list, press "delete"
                                  to remove them, and "visit page" to navigate to the users page.</li>
                            </ul>
                         </div>
"""
htmlTemplates.aboutText = """
                         <div class="vom-dialog">
                            <ul>
                              <li><a href="https://github.com/PaperElectron/Vote-O-Matic">Source: Github/PaperElectron</a></li>
                              <li class="vom-dialog-dots">...</li>
                              <li><a href="https://github.com/PaperElectron/Vote-O-Matic/blob/master/LICENCE.txt">Licenced Under MIT public licence.</a></li>
                              <li class="vom-dialog-dots">...</li>
                              <li>Copyright © 2014 James M. Bulkowski</li>
                            </ul>
                         </div>
"""

window.vomTemplates = htmlTemplates