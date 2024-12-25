var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { expect, test } from 'vitest';
import { listRecordingIdsByTrackId, listRecordingIdsByReleaseId } from './main.js';
test('sdsd', () => __awaiter(void 0, void 0, void 0, function* () {
    yield listRecordingIdsByTrackId('');
}));
test('Method: listRecordingIdsByReleaseId()', () => __awaiter(void 0, void 0, void 0, function* () {
    expect(yield listRecordingIdsByReleaseId('70d0009e-3b8d-4e03-ab41-2beb34a2c546')).toEqual([]);
}));
