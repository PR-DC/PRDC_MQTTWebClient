/**
 * MQTTWebClient - functions.js
 * Author: Milos Petrasinovic <mpetrasinovic@pr-dc.com>
 * PR-DC, Republic of Serbia
 * info@pr-dc.com
 * 
 * --------------------
 * Copyright (C) 2021 PR-DC <info@pr-dc.com>
 *
 * This file is part of PRDC_MQTTWebClient.
 *
 * PRDC_MQTTWebClient is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as 
 * published by the Free Software Foundation, either version 3 of the 
 * License, or (at your option) any later version.
 * 
 * PRDC_MQTTWebClient is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU Lesser General Public License for more details.
 * 
 * You should have received a copy of the GNU Lesser General Public License
 * along with PRDC_MQTTWebClient.  If not, see <https://www.gnu.org/licenses/>.
 *
 */
 
// ready() function
// Call function when document is ready
// --------------------
function ready(fn) {
  if(document.readyState != 'loading') {
    fn();
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}

// getTimestamp() function
// Returns current timestamp in format HH:mm:SS.ms
// --------------------
function getTimestamp() {
  var date = new Date();
  var pad = function(num, size) { 
    return ('000' + num).slice(size * -1); 
  };
  var time = parseFloat(date.getTime()/1000).toFixed(3);
  var hours = date.getHours();
  var minutes = Math.floor(time / 60) % 60;
  var seconds = Math.floor(time - minutes * 60);
  var milliseconds = time.slice(-3);

  return pad(hours, 2) + ':' + pad(minutes, 2) + ':' + 
    pad(seconds, 2) + '.' + pad(milliseconds, 3);
}

// showTopCont() function
// Show top options container
// --------------------
function showTopCont(id) {
  $('#settings').css({'overflow': 'hidden'});
  showCont('top-overlay-mask');
  $('#'+id).height('auto');
  showCont(id);
}

// hideTopCont() function
// Hide top options container
// --------------------
function hideTopCont(id) {
  $('#settings').css({'overflow': 'auto'});
  hideCont(id);
  $('#'+id).height(0);
  hideCont('top-overlay-mask');
}

// showBotCont() function
// Show bottom options container
// --------------------
function showBotCont(id) {
  $('#messages-cont').css({'overflow': 'hidden'});
  showCont('bottom-overlay-mask');
  $('#'+id).height('auto');
  showCont(id);
}

// hideBotCont() function
// Hide bottom options container
// --------------------
function hideBotCont(id) {
  $('#messages-cont').css({'overflow': 'auto'});
  hideCont(id);
  $('#'+id).height(0);
  hideCont('bottom-overlay-mask');
}

// showCont() function
// Show container
// --------------------
function showCont(id) {
  var cont = document.getElementById(id);
  cont.style.visibility = 'visible';
  cont.style.opacity = 1;
}

// hideCont() function
// Hide container
// --------------------
function hideCont(id) {
  var cont = document.getElementById(id);
  setTimeout(function() {
    cont.style.visibility = 'hidden';
  }, 350);
  cont.style.opacity = 0;
}

// getPanelsSize() function
// Get panels size
// --------------------
function getPanelsSize() {
  var panels_bcr = document.getElementById('panels-container')
    .getBoundingClientRect();
  panels_width = panels_bcr.width;
  panels_height = panels_bcr.height;
}

// initPanelsSize() function
// Initialize panels size
// --------------------
function initPanelsSize() {
  var panel_t_height_t = localStorage.getItem('panel_t_height')
  if(panel_t_height_t) {
    panel_t_height = panel_t_height_t;
  }
  var panel_b_height_t = localStorage.getItem('panel_b_height')
  if(panel_b_height_t !== null) {
    panel_b_height = panel_b_height_t;
  }
  
  $('#top-panel').height('calc('+panel_t_height+'% - 12.5px)');
  $('#bottom-panel').height('calc('+panel_b_height+'% - 12.5px)');
}

// initPanelsResize() function
// Initialize panels resize
// --------------------
function initPanelsResize() {
  onDrag(document.getElementById('middle'), resizeTopBottom);
}

// onDrag() function
// On element drag call funciton
// --------------------
function onDrag(el, fun) {
  el.addEventListener('mousedown', function() {
    document.addEventListener('mousemove', fun, false);
    document.addEventListener('mouseup', function mouseUp() {
      document.removeEventListener('mousemove', fun, false);
      document.removeEventListener('mousemove', mouseUp, false);
    }, false);
  }, false);
}

// resizeTopBottom() function
// Resize top and bottom pannels
// --------------------
function resizeTopBottom(e) {
  var panel_t_height_t = (e.y-panels_top)/panels_height*100;
  var panel_b_height_t = 100-panel_t_height_t;
  if(panel_t_height_t >= 15 && panel_b_height_t >= 15) {
    panel_t_height = panel_t_height_t;
    panel_b_height = panel_b_height_t;
    $('#top-panel').height('calc('+panel_t_height+'% - 12.5px)');
    $('#bottom-panel').height('calc('+panel_b_height+'% - 12.5px)');
    localStorage.setItem('panel_t_height', panel_t_height);
    localStorage.setItem('panel_b_height', panel_b_height);
  }
}

// updateStatus() function
// Update status
// --------------------
function updateStatus(txt) {
  $('#status').text(txt);
}

// messagesShow() function
// Show messages panel
// --------------------
function messagesShow() {
  $('#messages-container').removeClass('inactive');
}

// messagesHide() function
// Hide messages panel
// --------------------
function messagesHide() {
  $('#messages-container').addClass('inactive');

  // Remove all messages
  setTimeout(function() {
    $('#messages-container .message').each(function() {
      $(this).remove();
    });
  }, 200)
};

// updateMessagesScroll() function
// Go to bottom of messages container
// --------------------
function updateMessagesScroll() {
  var bcr = messages_dom.getBoundingClientRect();
  messages_dom.parentElement.scrollTop = bcr.height;
}

// showMessage() function
// Show message
// --------------------
function showMessage(msg) {
  var timestamp = getTimestamp();
  if(N_messages < N_messages_max) {
    N_messages += 1;
  } else {
    messages_dom.firstChild.remove();
  }
  
  messages_dom.innerHTML += 
    '<p><span class="timestamp">' + timestamp + '</span>' + msg + '</p>';
  if(autoscroll) {
    updateMessagesScroll();
  }
}

// localStorage.setObj(), sessionStorage.setObj() function
// Functions to store object in localStorage or sessionStorage
// --------------------
Storage.prototype.setObj = function(key, obj) {
  return this.setItem(key, JSON.stringify(obj))
}

// localStorage.getObj(), sessionStorage.getObj() function
// Functions to retrieve object from localStorage or sessionStorage
// --------------------
Storage.prototype.getObj = function(key) {
  return JSON.parse(this.getItem(key))
}