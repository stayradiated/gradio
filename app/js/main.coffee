
togglePlay = ->
  if audio.paused
    audio.play()
  else
    audio.pause()

showBufferProgress = ->
  if audio.buffered.length > 0
    status = audio.buffered.end(0)
    percent = status / duration * 100
    buffer.style.width = percent + "%"

getTime = (time) ->
  minutes = Math.floor(time / 60)
  seconds = Math.floor(time % 60)
  minutes + ":" + seconds

audio = document.getElementsByTagName("audio")[0]
buffer = document.getElementsByClassName("buffer")[0]
track = document.getElementsByClassName("track")[0]
currentTime = document.getElementsByClassName("current-time")[0]
durationTime = document.getElementsByClassName("duration-time")[0]
prev = document.getElementsByClassName("prev")[0]
play = document.getElementsByClassName("play-pause")[0]
next = document.getElementsByClassName("next")[0]

duration = 0

audio.addEventListener "durationchange", (e) ->
  duration = audio.duration
  durationTime.innerHTML = getTime(duration)
  showBufferProgress()

audio.addEventListener "progress", showBufferProgress

audio.addEventListener "timeupdate", (e) ->
  status = audio.currentTime
  percent = status / duration * 100
  track.style.width = percent + "%"
  currentTime.innerHTML = getTime(status)

prev.onclick = ->
  audio.currentTime = 0

play.onclick = togglePlay

next.onclick = ->
  audio.currentTime += 202

document.addEventListener "keydown", (e) ->
  switch e.which
    when 32
      togglePlay()
    else
      console.log e.which
