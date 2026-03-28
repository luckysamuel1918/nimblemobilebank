
import { Client, Storage } from 'appwrite';

const client = new Client();

client
  .setEndpoint('https://nyc.cloud.appwrite.io/v1')
  .setProject('6859c88c002756f2e385');

export const storage = new Storage(client);
export const BUCKET_ID = '686bdbb5001cd56adb41';
