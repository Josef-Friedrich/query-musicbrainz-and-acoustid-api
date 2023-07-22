#! /usr/bin/env node

const URLSearchParams = require('url').URLSearchParams

const MusicBrainzApi = require('musicbrainz-api').MusicBrainzApi

const mbApi = new MusicBrainzApi({
  appName: 'queryReleases',
  appVersion: '0.1.0',
  appContactInfo: 'josef@friedrich.rocks'
})

// release
// https://musicbrainz.org/release/70d0009e-3b8d-4e03-ab41-2beb34a2c546

async function getRecordingIdsByRelease (releaseId) {
  const release = await mbApi.lookupRelease(releaseId, ['recordings'])
  const recordingIds = []
  for (const cd of release.media) {
    for (const track of cd.tracks) {
      recordingIds.push(track.recording.id)
    }
  }
  return recordingIds
}

getRecordingIdsByRelease('70d0009e-3b8d-4e03-ab41-2beb34a2c546').then((recordingIds) => {
  console.log(recordingIds)
})

// mbid: MusicBrainz Recording ID
// 36c668ac-3cfb-44d9-a8e6-0a1d65a77a76

// track ID: a cluster of fingerprints.
// https://acoustid.org/track/47b1aca5-5ec9-41a4-93c7-ceadad334087
// 47b1aca5-5ec9-41a4-93c7-ceadad334087

// fingerprint
// https://acoustid.org/fingerprint/48005565

async function query (url, query) {
  const response = await fetch(url + '?' + new URLSearchParams(query))
  const result = await response.json()
  console.log(result)
  return result
}

async function listAcoustIdTracksByMbid (mbid) {
  await query('https://api.acoustid.org/v2/track/list_by_mbid', {
    mbid
  })
}

listAcoustIdTracksByMbid('36c668ac-3cfb-44d9-a8e6-0a1d65a77a76')

async function lookupAcoustIdByTrackId (trackid) {
  const result = await query('https://api.acoustid.org/v2/lookup', {
    client: 'Gp4IuWk1QAQ',
    trackid,
    meta: 'recordings'
  })

  for (const track of result.results) {
    for (const recording of track.recordings) {
      console.log(recording)
    }
  }
}

lookupAcoustIdByTrackId('47b1aca5-5ec9-41a4-93c7-ceadad334087')
