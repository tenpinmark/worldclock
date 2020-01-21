/* global Log, Module, moment, config */
/* Magic Mirror
* Module: worldlock
*
* By eouia
*/
Module.register("worldclock",{
  // Module config defaults.
  defaults: {
	float: 'left',  // Add this to align module withing the same region
	timeFormat: 'LT', //defined in moment.js format()
    style: 'left', //where the time could be located; 'top', 'left','right','bottom'
    offsetTimezone: null, // or "Europe/Berlin" to get difference from this timezone to each clock.
    clocks: [
      {
        title: "Seoul",
        timezone:"Asia/Seoul",
        flag:"kr",
      },
    ]
  },
  // Define required scripts.
  getScripts: function() {
    return ["moment.js", "moment-timezone.js"]
  },
  // Define styles.
  getStyles: function() {
    return ["worldclock.css"]
  },

  getCommands: function(commander) {
    if (commander.constructor.name == 'TelegramBotCommandRegister') {
      return [
        {
          command: 'worldclock',
          description: 'Tell the time of worldclock',
          callback : 'TLGBOT_worldclock',
        },
      ]
    }
  },

  TLGBOT_worldclock: function(command, handler) {
    var text = ""
    var m = moment()
    for (var c in this.config.clocks) {
      var clock = this.config.clocks[c]
      var title = (clock.title) ? clock.title : clock.timezone
      if (clock.timezone) {
        m.tz(clock.timezone)
      } else {
        m.local()
      }

      text += "`" + m.format(this.config.timeFormat) + "`"
      text += " in *" + title + "*\n"
    }
    text = (text) ? text : "I cannot answer now, sorry."
    handler.reply("TEXT", text, {parse_mode:'Markdown'})
  },

  start: function() {

    this.loadCSS()
    var self = this
    setInterval(function() {
      self.updateDom()
    }, 1000)

    // Set locale.
    moment.locale(config.language)
  },

  clockFormat: function(c, index) {
    var worldWrapper = document.createElement("div")
    worldWrapper.className = "world world-" + index

    var clock = moment()

    if (c.timezone == null || undefined ) {
      clock.local()
    } else {
      clock.tz(c.timezone)
    }

    var timeString
    timeString = clock.format(this.config.timeFormat)

    var timeWrapper = document.createElement("div")
    timeWrapper.innerHTML = timeString
    timeWrapper.className = "time"
    //timeWrapper.className = "time bright medium"

    var captionWrapper = document.createElement("div")
    captionWrapper.className = "caption"
    //captionWrapper.className = 'caption small normal'

    var zoneWrapper = document.createElement("div")
    zoneWrapper.className = 'zone'

    if (c.title != null) {
      zoneWrapper.innerHTML = c.title
    } else {
      zoneWrapper.innerHTML = c.timezone
    }

    captionWrapper.appendChild(zoneWrapper)

    var gapWrapper = document.createElement("div")
    gapWrapper.className = 'gap'

    var gap = ""
    if (this.config.offsetTimezone) {
      var ori = "+"
      var oclock = moment().tz(this.config.offsetTimezone)
      var os = clock.utcOffset() - oclock.utcOffset()
      if (os < 0) {
        os = oclock.utcOffset() - clock.utcOffset()
        ori = "-"
      }

      var dur = moment.duration(os, 'minutes')
      gap = ori + moment.utc(dur.asMilliseconds()).format('HH:mm')
    } else {
      gap = "UTC " + clock.format('Z')
    }

    gapWrapper.innerHTML = gap

    captionWrapper.appendChild(gapWrapper)



    var mainWrapper = document.createElement("div")
    mainWrapper.className = "main"

    if (c.flag) {
      var flagWrapper = document.createElement("div")
      flagWrapper.className = "flag"
      var flagIconWrapper = document.createElement("span")
      flagIconWrapper.className = "flag-icon flag-icon-squared"
      flagIconWrapper.className += " flag-icon-" + c.flag
      flagWrapper.appendChild(flagIconWrapper)
      mainWrapper.appendChild(flagWrapper)
    }



    mainWrapper.appendChild(timeWrapper)

    worldWrapper.appendChild(mainWrapper)
    worldWrapper.appendChild(captionWrapper)

    return worldWrapper
  },

  notificationReceived: function(noti, payload) {

  },




  // Override dom generator.
  getDom: function() {
    var wrapper = document.createElement("div")
    wrapper.className
      = "worldtime"
        + ' style-' + this.config.style
    var c
    for (c in this.config.clocks) {
      wrapper.appendChild(this.clockFormat(this.config.clocks[c], c))
    }
	
    // Code added to shift the module left or right within the same region
    if (this.config.float!== ""){
       // get the MM div container for this module (parent of our wrapper div)
       document.getElementById(this.identifier).style.float=this.config.float;			
       // adjust the border between instances
       if (this.config.spacing !==""){
           if(this.config.float === "left")
               document.getElementById(this.identifier).style.marginLeft=this.config.spacing
           else if(this.config.float === "right")
               document.getElementById(this.identifier).style.marginRight=this.config.spacing
        }
    }
	
    return wrapper
  },

  loadCSS: function() {
    var css = [
      {
        id:'flag-icon-CSS',
        href: 'https://cdnjs.cloudflare.com/ajax/libs/flag-icon-css/2.8.0/css/flag-icon.min.css'
      }
    ]
    css.forEach(function(c) {
      if (!document.getElementById(c.id))
      {
        var head  = document.getElementsByTagName('head')[0]
        var link  = document.createElement('link')
        link.id   = c.id
        link.rel  = 'stylesheet'
        link.type = 'text/css'
        link.href = c.href
        link.media = 'all'
        head.appendChild(link)
      }
    })
  },
})
