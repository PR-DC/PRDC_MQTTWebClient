/**
 * MQTTWebClient - callbacks.js
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
 
// initOptions() function
// Initialize options
// --------------------
function initOptions() {
  N_messages_max = Number(localStorage.getObj('N_messages_max'));
  if(N_messages_max == 0) {
    N_messages_max = Infinity;
  }
  $('#N-messages-max').val(N_messages_max);
  
  show_timestamp = localStorage.getObj('show_timestamp');
  if(show_timestamp == null) {
    show_timestamp = true;
  }
  if(show_timestamp) {
    $('#show-timestamp').prop('checked', true);
    $('#messages').removeClass('no-timestamp');
    $('#terminal-options .timestamp').addClass('active');
  } else {
     $('#show-timestamp').prop('checked', false);
    $('#messages').addClass('no-timestamp');
    $('#terminal-options .timestamp').removeClass('active');
  }
  
  autoscroll = localStorage.getObj('autoscroll');
  if(autoscroll == null) {
    autoscroll = true;
  }
  if(autoscroll) {
    $('#autoscroll-on').prop('checked', true);
    $('#terminal-options .autoscroll').addClass('active');
  } else {
    $('#autoscroll-on').prop('checked', false);
    $('#terminal-options .autoscroll').removeClass('active');
  }
}

// toggleShowTimestamp() function
// Show timestamp toggle
// --------------------
function toggleShowTimestamp() {
  if(show_timestamp) {
    show_timestamp = false;
    $('#show-timestamp').prop('checked', false);
    $('#messages').addClass('no-timestamp');
    $('#terminal-options .timestamp').removeClass('active');
  } else {
    show_timestamp = true;
    $('#show-timestamp').prop('checked', true);
    $('#messages').removeClass('no-timestamp');
    $('#terminal-options .timestamp').addClass('active');
  }
  localStorage.setObj('show_timestamp', show_timestamp);
}

// toggleAutoscroll() function
// Terminal autoscroll toggle
// --------------------
function toggleAutoscroll() {
  if(autoscroll) {
    autoscroll = false;
    $('#autoscroll-on').prop('checked', false);
    $('#terminal-options .autoscroll').removeClass('active');
  } else {
    autoscroll = true;
    $('#autoscroll-on').prop('checked', true);
    $('#terminal-options .autoscroll').addClass('active');
  }
  localStorage.setObj('autoscroll', autoscroll);
}

// toggleConnect() function
// Connect or disconnect platform
// --------------------
function toggleConnect() {
  if(connected) {
    client.disconnect();
    brokerDisconnect();
  } else {
    brokerConnect();
  }
}

// changeMaxMessagesNum() function
// Change max messages number
// --------------------
function changeMaxMessagesNum() {
  N_messages_max = $(this).val();
  if(N_messages_max < 5) {
    N_messages_max = 5;
    $(this).val(5);
  }
  localStorage.setObj('N_messages_max', N_messages_max);
  
  if(N_messages > N_messages_max) {
    while(N_messages > N_messages_max) {
      $('#messages')[0].firstChild.remove();
      N_messages -= 1;
    }
  }
}

// brokerConnect() function
// Broker connect
// --------------------
function brokerConnect() {
  $('#toggle-connect').text('Disconnect');
  $('#toggle-connect').addClass('connected');
  $('#host').prop('disabled', true);
  $('#port').prop('disabled', true);
  $('#username').prop('disabled', true);
  $('#password').prop('disabled', true);
  $('#client-id').prop('disabled', true);
  $('#publish-msg-btn').prop('disabled', false);
  $('#subscribe-msg-btn').prop('disabled', false);
  $('#advanced-settings-open').addClass('disabled');

  // Fetch the hostname/IP address and port number from the form
  var host = $('#host').val();
  var port = $('#port').val();
  var username = $('#username').val();
  var password = $('#password').val();
  var client_id = $('#client-id').val();
  var timeout = Number($('#timeout').val());
  var keep_alive_interval = Number($('#keep-alive').val());
  var clean_session = $('#clean-session').is(':checked');
  var lw_flag = $('#last-will').is(':checked');
  if(lw_flag) {
    var lw_msg = $('#lw-message').val();
    var lw_topic = $('#lw-topic').val();
    var lw_qos = Number($('#lw-qos').val());
    var lw_retain = $('#retain-last-will').is(':checked');
  }
  
  // Print output for the user in the messages div
  showMessage('Connecting to: <span class="data">' + host + 
    '</span> on port: <span class="data">' + port + 
    '</span>, using the following client ID: <span class="data">' + 
    client_id + '</span>');
  
  // Initialize new Paho client connection
  // https://www.eclipse.org/paho/files/jsdoc/Paho.MQTT.Client.html
  client = new Paho.MQTT.Client(host, Number(port), client_id);
  
  var connect_options = { 
    timeout: timeout,
    userName: username,
    password: password,
    cleanSession: clean_session,
    keepAliveInterval: keep_alive_interval,
    onSuccess: onConnect,
    onFailure: onConnectFailed
  };
  
  if(lw_flag) {
    var lw = new Paho.MQTT.Message(lw_msg);
    lw.destinationName = lw_topic;
    lw.qos = lw_qos;
    lw.retained = lw_retain;
    connect_options.willMessage = lw;
  }
  
  // Set callback handlers
  client.onConnectionLost = onConnectionLost;
  client.onMessageArrived = onMessageArrived;
  client.onMessageDelivered = onMessageDelivered;
  
  // Connect the client, if successful, call onConnect function
  client.connect(connect_options);  
  showCont('loading-cont');
}

// brokerDisconnect() function
// Broker disconnect
// --------------------
function brokerDisconnect() {
  if(connected) {
    connected = false;
    setDisconnected();
    showMessage('Disconnected.');
    
    // Update status
    updateStatus('Connect to broker...');
  }
}

// onConnect() function
// Called when the client connects
// --------------------
function onConnect() {
  connected = true;
  showMessage('Connected!');
  hideCont('loading-cont');
  
  // Update status
  updateStatus('Connected to broker...');
}

// onConnectFailed() function
// Called when the client connection failed
// --------------------
function onConnectFailed(res) {
  setDisconnected();
  hideCont('loading-cont');
  showMessage('Failed to connect. Error [<span class="error">' + 
    res.errorCode + '</span>]: <span class="error">' + 
    res.errorMessage + '</span>');
  updateMessagesScroll();
}

// setDisconnected() function
// Set disconnected state
// --------------------
function setDisconnected() {
  $('#toggle-connect').text('Connect');
  $('#toggle-connect').removeClass('connected');
  $('#host').prop('disabled', false);
  $('#port').prop('disabled', false);
  $('#username').prop('disabled', false);
  $('#password').prop('disabled', false);
  $('#client-id').prop('disabled', false);
  $('#publish-msg-btn').prop('disabled', true);
  $('#subscribe-msg-btn').prop('disabled', true);
  $('#advanced-settings-open').removeClass('disabled');
}

// onConnectionLost() function
// Called when the client loses its connection
// --------------------
function onConnectionLost(res) {
  if(connected) {
    if(res.errorCode !== 0) {
      showMessage('Connection lost. Error [<span class="error">' + 
        res.errorCode + '</span>]: <span class="error">' + 
        res.errorMessage + '</span>');
    }
    brokerDisconnect();
  }
}

// onMessageArrived() function
// Called when a message arrives
// --------------------
function onMessageArrived(message) {
  showMessage('Message received. Topic: <span class="topic">' + 
    message.destinationName + '</span>  | Message: <span class="msg">' + 
    message.payloadString + '</span>');
}

// onMessageDelivered() function
// Called when a message is delivered
// --------------------
function onMessageDelivered(message) {
  showMessage('Message delivered. Topic: <span class="topic">' + 
    message.destinationName + '</span>  | Message: <span class="msg">' + 
    message.payloadString + '</span>');
}

// publishMessage() function
// Publish message
// --------------------
function publishMessage() {
  if(connected) {
    var topic = $('#topic').val();
    var payload = $('#message').val();
    var qos = Number($('#qos').val());
    var retained = $('#retain').is(':checked');
    showMessage('Message sent. Topic: <span class="topic">' + topic + 
      '</span>  | Message: <span class="msg">' + payload + '</span>');
    client.publish(topic, payload, qos, retained);
  } else {
    showMessage('Please connect to the broker.');
  }
}

// subTopic() function
// Subscribe to topic
// --------------------
function subTopic() {
  if(connected) {
    var topic = $('#sub-topic').val();
    var qos = Number($('#sub-qos').val());
    if(topics_num > 0 && topic in topics_list) {
      showMessage('Already subscribed to topic: <span class="topic">' + 
        topic + '</span>');
    } else {
      subscribeOptions = {
        qos: qos,
        onSuccess: function(res) {
          // Remove no topics
          if(topics_num == 0) {
            $('#no-sub-topics').hide();
          }
          topics_num = topics_num+1;
          
          // Create node for topic
          var node = document.createElement('li');
          node.innerHTML = topic + '<span>QoS: ' + qos + '</span>';
          
          // Create unsubscribe button
          var unsubButton = document.createElement('img');
          unsubButton.src = 'img/close.svg';
          unsubButton.addEventListener('click', function() {
            unsubTopic(topic);
          });
          node.prepend(unsubButton);
          
          // Add new topic to list
          $('#topics-list')[0].appendChild(node);
          topics_list[topic] = node;
          showMessage('Subscribed to topic: <span class="topic">' + 
            topic + '</span>');
        },
        onFailure: function(res) {
          showMessage('Failed to subscribe to topic: ' +
            '<span class="topic">' + topic + '</span>');
        }
      };
      showMessage('Sent request to subscribe to topic: ' +
        '<span class="topic">' + topic + '</span>');
      client.subscribe(topic, subscribeOptions);
    }
  } else {
    showMessage('Please connect to the broker.');
  }
}

// unsubTopic() function
// Unsubscribe to topic
// --------------------
function unsubTopic(topic) {
  if(connected) {
    if(topics_num > 0 && topic in topics_list) {
      unsubscribeOptions = {
        onSuccess: function(res) {
          topics_num = topics_num-1;
          if(topics_num == 0) {
            $('#no-sub-topics').show();
          }
          showMessage('Unsubscribed from topic: ' +
            '<span class="topic">' + topic + '</span>');
          
          // Remove topic from lists
          var node = topics_list[topic];
          node.parentElement.removeChild(node);
          delete topics_list[topic];
        },
        onFailure: function(res) {
          showMessage('Failed to unsubscribe from topic: ' +
            '<span class="topic">' + topic + '</span>');
        }
      };
      showMessage('Sent request to unsubscribe from topic: ' +
        '<span class="topic">' + topic + '</span>');
      client.unsubscribe(topic, unsubscribeOptions);
    } else {
      showMessage('Topic: <span class="topic">' + 
        topic + '</span> is not subscribed.');
    }
  } else {
    showMessage('Please connect to the broker.');
  }
}