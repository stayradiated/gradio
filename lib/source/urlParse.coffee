###*
 * @fileOverview Parses a URL and detects what type it is (album, playlist,
 * artist) and it's ID.
###

regex =
  domain: /^(https?:\/\/)?grooveshark\.com/
  collection: /\/#!\/(album|artist|tag|playlist|user)\/[A-Za-z0-9\+_]+\/(\d+)\/?$/
  user: /\/#!\/([A-Za-z-0-9_]+)\/?$/
  search: /\#\!\/search\?q=([A-Za-z0-9\+\%\!\*\(\)\_\-\'\.\~]+)\/?$/

parse = (url) ->

  if not url.match(regex.domain)?
    return ['err_url']

  collection = url.match(regex.collection)
  if collection?
    type = collection[1]
    id = collection[2]
    return [type, id]

  user = url.match(regex.user)
  if user?
    user = user[1]
    # username instead of user so we can tell the difference from the user ID
    return ['username', user]

  search = url.match(regex.search)
  if search?
    query = search[1]
    query = query.replace(/\+/g, '%20')
    query = decodeURIComponent(query)
    return ['search', query]

  return ['err_url']

module.exports = parse
