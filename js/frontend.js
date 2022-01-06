/**
 * MQTTWebClient - frontend.js
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

// Variables
// --------------------
var connected = false;

var panel_t_height = 66.66; // [%]
var panel_b_height = 33.33; // [%]
var panels_top; // [px]
var panels_left; // [px]
var panels_width; // [px]
var panels_height; // [px]

var client;
var topics_list = {};
var topics_num = 0;
var N_messages = 0;
var N_messages_max;
var show_timestamp;
var autoscroll;
var messages_dom = document.getElementById('messages');

// Generate a random client ID
var client_id = 'MQTTWebClient' + parseInt(Math.random() * 100000);

// When document is ready 
// --------------------
ready(function(){
  // Jquery ready
  $(document).ready(function() {
    $('#client-id').val(client_id);

    // Disable buttons
    $('#publish-msg-btn').prop('disabled', true);
    $('#subscribe-msg-btn').prop('disabled', true);
    
    // Terminal settings
    $(document.body).on('click', '#show-timestamp', toggleShowTimestamp);
    $(document.body).on('click', '#autoscroll-on', toggleAutoscroll);
    $(document.body).on('click', '#terminal-options .timestamp', 
      toggleShowTimestamp);
    $(document.body).on('click', '#terminal-options .autoscroll', 
      toggleAutoscroll);
    $(document.body).on('blur', '#nMsgMax', changeMaxMessagesNum);
  });
  
  // Initialize options
  initOptions();
  
  // Initialize panels resize
  window.addEventListener('resize', getPanelsSize);
  var panels_bcr = $('#panels-container')[0].getBoundingClientRect();
  panels_top = panels_bcr.top;
  panels_left = panels_bcr.left;
  panels_width = panels_bcr.width;
  panels_height = panels_bcr.height;
  initPanelsSize();
  initPanelsResize();
  
  // Show welcome message
  showMessage('Welcome to PR-DC MQTTWebClient...');
});