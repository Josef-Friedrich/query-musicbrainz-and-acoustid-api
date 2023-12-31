#! /usr/bin/env node

// https://acoustid.org/my-applications
const ACOUSTID_CLIENT = "b'W4yoQRdE"

// fingerprint
// https://acoustid.org/fingerprint/48005565

// track ID: a cluster of fingerprints.
// https://acoustid.org/track/47b1aca5-5ec9-41a4-93c7-ceadad334087
// 47b1aca5-5ec9-41a4-93c7-ceadad334087

const childProcess = require('child_process')
const URLSearchParams = require('url').URLSearchParams
const MusicBrainzApi = require('musicbrainz-api').MusicBrainzApi

function openUrl (url) {
  // See node module on npmjs.org “open”
  const subprocess = childProcess.spawn('xdg-open', [url], {
    stdio: 'ignore',
    detached: true
  })
  subprocess.unref()
}

const mbApi = new MusicBrainzApi({
  appName: 'queryReleases',
  appVersion: '0.1.0',
  appContactInfo: 'josef@friedrich.rocks'
})

async function query (url, query) {
  const response = await fetch(url + '?' + new URLSearchParams(query))
  const result = await response.json()
  return result
}

/**
 * ```js
 * {
 *   results: [
 *     {
 *       id: 'be89452d-604d-41f4-bef4-1ec39ed5e25f',
 *       recordings: [Array],
 *       score: 1
 *     }
 *   ],
 *   status: 'ok'
 * }
 * ```
 *
 * `result.results[0].recordings[0]`
 *
 * ```js
 * {
 *   artists: [
 *     {
 *       id: 'da5e774b-026a-4117-82a4-11d246c05a8b',
 *       name: 'György Ligeti'
 *     }
 *   ],
 *   duration: 230,
 *   id: 'fec2b24c-ed42-4025-b67d-6b5bba6565e9',
 *   title: 'Artikulation'
 * }
 * ```
 *
 * or:
 *
 * `result.results[0].recordings[0]`
 *
 * ```js
 * {
 *   id: 'fec2b24c-ed42-4025-b67d-6b5bba6565e9'
 * }
 * ```
 *
 * @param {*} trackId
 */
async function listRecordingIdsByTrackId (trackId) {
  const result = await query('https://api.acoustid.org/v2/lookup', {
    client: ACOUSTID_CLIENT,
    trackid: trackId,
    meta: 'recordings'
  })
  if (result != null && result.results != null) {
    return result.results[0].recordings.map(recording => {
      recording.id
    })
  }
  console.error(result)
}

/**
 * ```js
 * {
 *   status: 'ok',
 *   tracks: [ { id: '096d3924-58da-450b-8ed8-7e5a68213fac' } ]
 * }
 * ```
 *
 * @param {string} recordingId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 *
 * @returns {Promise<string[]>}
 */
async function listTrackIdsByRecordingId (recordingId) {
  const result = await query('https://api.acoustid.org/v2/track/list_by_mbid', {
    client: ACOUSTID_CLIENT,
    mbid: recordingId
  })
  if (result != null && result.tracks != null) {
    return result.tracks.map(track => {
      return track.id
    })
  }
  return []
}

/**
 *
 * https://musicbrainz.org/release/70d0009e-3b8d-4e03-ab41-2beb34a2c546
 *
 * @param {string} releaseId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 *
 * @returns {Promise<string[]>}
 */
async function listRecordingIdsByReleaseId (releaseId) {
  const release = await mbApi.lookupRelease(releaseId, ['recordings'])
  const recordingIds = []
  for (const cd of release.media) {
    for (const track of cd.tracks) {
      recordingIds.push(track.recording.id)
    }
  }
  return recordingIds
}

/**
 * @param {string} releaseId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 *
 * @returns {Promise<string[]>}
 */
async function openAcoustIdWithMultipleRecordings (releaseId) {
  const recordingIds = await listRecordingIdsByReleaseId(releaseId)
  const intervalId = setInterval(async () => {
    const recordingId = recordingIds.pop()
    console.log(recordingId)
    if (recordingId != null) {
      const trackIds = await listTrackIdsByRecordingId(recordingId)
      if (trackIds.length === 1) {
        const result = await listRecordingIdsByTrackId(trackIds[0])
        if (result.length > 1) {
          console.log('Found multiple records')
          openUrl(`https://acoustid.org/track/${trackIds[0]}`)
        }
      }
    } else {
      clearInterval(intervalId)
    }
  }, 300)
}

if (process.argv.length < 3) {
  console.log(`Usage: ${process.argv[1]} <musicbrainz-release-id>`)
  process.exit(1)
}

openAcoustIdWithMultipleRecordings(process.argv[2])
