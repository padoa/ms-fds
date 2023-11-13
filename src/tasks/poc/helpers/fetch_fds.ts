import { createWriteStream } from 'fs';
import * as fs from 'fs/promises';

import CsvTools from '@padoa/csv-tools';
import { promiseMapSeriesNoResult } from '@padoa/promise';

import axios from '@src/helpers/axios.js';

// const CLIENT = 'cmie'
// const PORTAL_TOKEN =
// 'Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUxMDY2Nywic2lkIjoiNjFlMWUyNmEtMzU1Mi00YzNiLWFlNGItM2NiOWE2MzJiNWRjIiwiaWF0IjoxNjk1MTE0MzcyfQ.FB9aRdewJOh493x9vhE-sAJPkKiqEo1nz_n6_8T39eI';

// const CLIENT = 'apst18';
// const PORTAL_TOKEN =
//   'Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NTg5MDQwLCJzaWQiOiJlMzEwYjk3YS00ZmNjLTQyZWMtODJiZi01ZWE4MmI2YThkZWMiLCJpYXQiOjE2OTUxMzIwNzB9.XcOqwo-6tG1ieWAPBs4w8pJr9kTqOIL95xrRSzzadco';

const CLIENT = 'polesantetravail';
const PORTAL_TOKEN =
  'Bearer%20eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6Miwic2lkIjoiZGJiZjYyZGYtM2FlMS00MjllLWFkMTYtNDQ4OGY2ZGFmMzk1IiwiaWF0IjoxNjk1MTM0Nzc2fQ.hUJHb1J7bOBMqlY0fP2Gtk-fQezwQScTEIoDfn2g_Jo';

const CLIENT_URL = `https://snap-${CLIENT}.aodap-staging.fr`;
const FDS_DESTINATION = `/Users/etienneturc/meta-haw/packages/ms-fds/resources/pdf/${CLIENT}`;
const CSV_FILE = `fds_${CLIENT}.csv`;
const CSV_FOLDER = '/Users/etienneturc/meta-haw/packages/ms-fds/resources/csv';
const CSV_PATH = `${CSV_FOLDER}/${CSV_FILE}`;

// /api/portal/files/c464a162-79b6-4ad8-bff1-32c74649f02b/download

export const readCsv = async (): Promise<Array<{ filename: string; uuid: string }>> => {
  const file = await fs.readFile(CSV_PATH);
  return CsvTools.parse(file.toString(), { delimiter: ',' });
};

export const downloadFDS = async (fileUuid: string, filename: string): Promise<void> => {
  try {
    console.log(`Downloading ${filename}`);
    const stream = await axios.get(`${CLIENT_URL}/api/portal/files/${fileUuid}/download`, {
      responseType: 'stream',
      headers: {
        cookie: `portal_token=${PORTAL_TOKEN}`,
        env: 'snap',
      },
    });
    const writer = createWriteStream(`${FDS_DESTINATION}/${filename}`);
    stream.data.pipe(writer);
    return await new Promise((resolve) => {
      stream.data.on('close', (out: any) => {
        resolve(out);
      });
    });
  } catch (err) {
    console.log(err);
    return null;
  }
};

export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchFDS = async (): Promise<void> => {
  const files = await readCsv();
  await promiseMapSeriesNoResult(files, async ({ filename, uuid }) => {
    await sleep(500);
    return downloadFDS(uuid, filename);
  });
  console.log('Done');
};
