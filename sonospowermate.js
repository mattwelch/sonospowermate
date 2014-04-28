/*
* sonospowermate.js
* control a sonos speaker (or group that speaker belongs to)
* and monitor its play status with the led ring
*
*/
'use strict'

var SonosDiscovery = require('sonos-discovery'),
    discovery = new SonosDiscovery(),
    PowerMate = require('node-powermate'),
    powermate = new PowerMate(),
    EasySax = require('easysax');

// Wait until the Sonos discovery process is done, then grab our player
setTimeout(grabPlayer, 5000);

// Used to figure out what gestures are being sent
var pressTimer;
var isDown = false;

// Get the LED strobing while we're discovering the Sonos topology
powermate.setPulseSpeed(511);
powermate.setPulseAwake(true);

// Here we're going to look for messages from the various Sonos zones.....
discovery.on('notify', function(msg) {
// .... and filter on those that match our player's UUID (so we know it's coming from our player)
// or from our player's group.....
    if (player && msg.sid.replace('uuid:', '').indexOf(player.uuid) == 0) {
        var saxParser = new EasySax();
        saxParser.on('startNode', function(elem, attr) {
            if (elem == "TransportState") {
                var attributes = attr();
// And if we've paused, turn the LED off
                if (attributes.val == "PAUSED_PLAYBACK" || attributes.val == "STOPPED") powermate.setBrightness(0);
// Anf if we've played, turn the LED on
                else if (attributes.val == "PLAYING") powermate.setBrightness(255);
            }

        });
        saxParser.parse(msg.body);
    }
});

// Grab the three events our powermate sends, and turn them into gestures
powermate.on('buttonDown', function() {
    isDown = true;
// If we hold the button down for more than 1 second, let's call it a long press....
    pressTimer = setTimeout(longClick, 1000);
});

powermate.on('buttonUp', function() {
    isDown = false;
// If the timer is still goingm call it a single click
    if (pressTimer._idleNext) singleClick();
    clearTimeout(pressTimer);
});

powermate.on('wheelTurn', function(delta) {
    clearTimeout(pressTimer);
// This is a right turn
    if (delta > 0) {
        if (isDown) downRight(); // While down
        else right(); // while up
    }
// Left
    if (delta < 0) {
        if (isDown) downLeft(); //down
        else left(); // up
    }
});

// Our gesstures section
var dblClickTimer;
var player;
var commandReady = true;
var commandTimer;

// We got a single click..
function singleClick() {
// Let's check and see if we're into a double click
    if (!dblClickTimer)
        dblClickTimer = setTimeout(function() {
// If not, toggle the Sonos' play status
            togglePlay()
        }, 500);
    else {
        clearTimeout(dblClickTimer);
        dblClickTimer = null;
// If we get two clicks within 500ms, go to next track....
        if (isPlaying()) {
            player.coordinator.nextTrack();
        }
        else {
            playFavorite(0);
        }
    }
}

// Previous track, or 2nd favorite, if player is off
function longClick() {
    if (isPlaying())
        player.coordinator.previousTrack();
    else {
        playFavorite(1);
    }
}

// Turn up the group volume
function right() {
    if (commandReady && isPlaying()) {
        commandReady = false;
        player.coordinator.groupSetVolume('+2');
        commandTimer = setTimeout(function() {
            commandReady = true;
        }, 100);
    }
}

// Turn down the group volume
function left() {
    if (commandReady && isPlaying()) {
        commandReady = false;
        player.coordinator.groupSetVolume('-2');
        commandTimer = setTimeout(function() {
            commandReady = true;
        }, 100);
    }
}

// Turn up zone player volume
function downRight() {
    if (commandReady && isPlaying()) {
        commandReady = false;
        player.coordinator.setVolume('+2');
        commandTimer = setTimeout(function() {
            commandReady = true;
        }, 100);
    }
}

// Turn down zone player volume
function downLeft() {
    if (commandReady && isPlaying()) {
        commandReady = false;
        player.coordinator.setVolume('-2');
        commandTimer = setTimeout(function() {
            commandReady = true;
        }, 100);
    }
}

function togglePlay() {
    clearTimeout(dblClickTimer);
    dblClickTimer = null;
    if (isPlaying()) {
        player.coordinator.pause();
    } else {
        player.coordinator.play();
    }
}

function grabPlayer() {
    player = discovery.getPlayer('family room');
  //  grabFavorites();
    powermate.setPulseAwake(false);
// Figure out if our player is playing. If so, turn the LED on
    if (isPlaying()) {
        powermate.setBrightness(255);
// Otherwise turn it off
    } else {
        powermate.setBrightness(0);
    }
}

function playFavorite(index) {
    player.getFavorites(function(b,f) {
        if (b && f[index]) {
            player.coordinator.replaceWithFavorite(f[index].title, function(success) {
                if (success)
                    player.coordinator.play();
            });
        }
    });
}

function isPlaying() {
    return player.coordinator.state['currentState'] == "PLAYING";
}
