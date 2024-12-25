#! /usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
// https://acoustid.org/my-applications
const ACOUSTID_CLIENT = "b'W4yoQRdE";
// fingerprint
// https://acoustid.org/fingerprint/48005565
// track ID: a cluster of fingerprints.
// https://acoustid.org/track/47b1aca5-5ec9-41a4-93c7-ceadad334087
// 47b1aca5-5ec9-41a4-93c7-ceadad334087
import * as childProcess from 'node:child_process';
import { URLSearchParams } from 'node:url';
import { MusicBrainzApi } from 'musicbrainz-api';
function openUrl(url) {
    // See node module on npmjs.org “open”
    const subprocess = childProcess.spawn('xdg-open', [url], {
        stdio: 'ignore',
        detached: true
    });
    subprocess.unref();
}
const mbApi = new MusicBrainzApi({
    appName: 'queryReleases',
    appVersion: '0.1.0',
    appContactInfo: 'josef@friedrich.rocks'
});
function query(url, query) {
    return __awaiter(this, void 0, void 0, function* () {
        const response = yield fetch(url + '?' + new URLSearchParams(query));
        const result = yield response.json();
        return result;
    });
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
function listRecordingIdsByTrackId(trackId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield query('https://api.acoustid.org/v2/lookup', {
            client: ACOUSTID_CLIENT,
            trackid: trackId,
            meta: 'recordings'
        });
        if (result != null && result.results != null) {
            return result.results[0].recordings.map((recording) => {
                recording.id;
            });
        }
        console.error(result);
    });
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
function listTrackIdsByRecordingId(recordingId) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield query('https://api.acoustid.org/v2/track/list_by_mbid', {
            client: ACOUSTID_CLIENT,
            mbid: recordingId
        });
        if (result != null && result.tracks != null) {
            return result.tracks.map((track) => {
                return track.id;
            });
        }
        return [];
    });
}
/**
 *
 * https://musicbrainz.org/release/70d0009e-3b8d-4e03-ab41-2beb34a2c546
 *
 * @param releaseId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 */
function listRecordingIdsByReleaseId(releaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const release = yield mbApi.lookup('release', releaseId, ['recordings']);
        const recordingIds = [];
        for (const cd of release.media) {
            for (const track of cd.tracks) {
                recordingIds.push(track.recording.id);
            }
        }
        return recordingIds;
    });
}
/**
 * @param releaseId - For example `70d0009e-3b8d-4e03-ab41-2beb34a2c546`
 */
function openAcoustIdWithMultipleRecordings(releaseId) {
    return __awaiter(this, void 0, void 0, function* () {
        const recordingIds = yield listRecordingIdsByReleaseId(releaseId);
        const intervalId = setInterval(() => __awaiter(this, void 0, void 0, function* () {
            const recordingId = recordingIds.pop();
            console.log(recordingId);
            if (recordingId != null) {
                const trackIds = yield listTrackIdsByRecordingId(recordingId);
                if (trackIds.length === 1) {
                    const result = yield listRecordingIdsByTrackId(trackIds[0]);
                    if (result.length > 1) {
                        console.log('Found multiple records');
                        openUrl(`https://acoustid.org/track/${trackIds[0]}`);
                    }
                }
            }
            else {
                clearInterval(intervalId);
            }
        }), 300);
    });
}
if (process.argv.length < 3) {
    console.log(`Usage: ${process.argv[1]} <musicbrainz-release-id>`);
    process.exit(1);
}
openAcoustIdWithMultipleRecordings(process.argv[2]);
