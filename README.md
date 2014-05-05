## Overview
Use a **Griffin Powermate** to control your **Sonos** system.
## Setup
Clone the repo, go into the cloned directory, and type `npm install` to bring in the dependencies.

Edit the `sonospowermate.js` file, look for the string "Family Room", and replace it with the name of the Sonos zone you plan to control with the Powermate.
## Use
The blue LED ring on the Powermate will pulse while the app is learning about your Sonos topology, and will turn off (or on, if your zone is currently playing) when discovery is complete, and the system is ready for use.
### Commands
#### Zone playing
- **Turn right**: increase group volume
- **Turn left**: decrease group volume
- **Push turn right**: increase zone volume (that is, the volume of the single specified zone, even if it's in a group)
- **Push turn left**: decrease zone volume
- **Single press**: Stop Sonos
- **Double press**: Next track
- **Long press**: Previous track

#### Zone not playing, and not in favorites mode
- **Single press**: Start Sonos
- **Double press**: Enter favorites mode

#### Zone not playing, and in favorites mode
- **Turn right**: Go to the next favorite
- **Turn left**: Go to the previous favorite
- **Single press**: Play the current favorite
- **Double press**: Exit favorites mode


## Notes
This was developed and deployed on a Raspbian Raspberry Pi system. There are a couple steps necessary to get it running in this context. See this [blog post](http://mattwel.ch/controlling-a-sonos-with-the-griffin-powermate "PowerMate and Sonos") for more thorough instrucitons.
