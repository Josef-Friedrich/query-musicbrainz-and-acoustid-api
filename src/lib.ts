#! /usr/bin/env node

import config from '/etc/musicbrainz.json' with { type: 'json' }

// fingerprint
// https://acoustid.org/fingerprint/48005565

// track ID: a cluster of fingerprints.
// https://acoustid.org/track/47b1aca5-5ec9-41a4-93c7-ceadad334087
// 47b1aca5-5ec9-41a4-93c7-ceadad334087

import * as childProcess from 'node:child_process'
import { URLSearchParams } from 'node:url'
import { MusicBrainzApi } from 'musicbrainz-api'

function openUrl(url: string): void {
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
  appContactInfo: config.musicbrainz.contactEmail
})

async function query(url: string, query: Record<string, string>): Promise<any> {
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
 */
export async function listRecordingIdsByTrackId(
  trackId: string
): Promise<string[] | undefined> {
  const result = await query('https://api.acoustid.org/v2/lookup', {
    // https://acoustid.org/my-applications
    client: config.acoustId.apiKey,
    trackid: trackId,
    meta: 'recordings'
  })
  if (result != null && result.results != null) {
    return result.results[0].recordings.map((recording: Id) => {
      return recording.id
    })
  }
  console.error(result)
}

interface Id {
  id: string
}

/**
 * ```js
 * {
 *   status: 'ok',
 *   tracks: [ { id: '096d3924-58da-450b-8ed8-7e5a68213fac' } ]
 * }
 * ```
 *
 * @param recordingId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 */
export async function listTrackIdsByRecordingId(
  recordingId: string
): Promise<string[]> {
  const result = await query('https://api.acoustid.org/v2/track/list_by_mbid', {
    client: config.acoustId.apiKey,
    mbid: recordingId
  })
  if (result != null && result.tracks != null) {
    return result.tracks.map((track: Id) => {
      return track.id
    })
  }
  return []
}

/**
 * Spielpläne 5/6 (Ausgabe Bayern 2004)
 * https://musicbrainz.org/release/70d0009e-3b8d-4e03-ab41-2beb34a2c546
 *
 * @param releaseId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 */
export async function listRecordingIdsByReleaseId(
  releaseId: string
): Promise<string[]> {
  const release = await mbApi.lookup('release', releaseId, ['recordings'])
  const recordingIds = []
  for (const cd of release.media) {
    for (const track of cd.tracks) {
      recordingIds.push(track.recording.id)
    }
  }
  return recordingIds
}

/**
 * @param releaseId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 */
export async function openAcoustIdWithMultipleRecordings(
  releaseId: string
): Promise<void> {
  const recordingIds = await listRecordingIdsByReleaseId(releaseId)
  const intervalId = setInterval(async () => {
    const recordingId = recordingIds.pop()
    console.log(recordingId)
    if (recordingId != null) {
      const trackIds = await listTrackIdsByRecordingId(recordingId)
      if (trackIds.length === 1) {
        const result = await listRecordingIdsByTrackId(trackIds[0])
        if (result != null && result.length > 1) {
          console.log('Found multiple records')
          openUrl(`https://acoustid.org/track/${trackIds[0]}`)
        }
      }
    } else {
      clearInterval(intervalId)
    }
  }, 300)
}
