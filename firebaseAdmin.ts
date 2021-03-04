import * as firebaseAdmin from "firebase-admin";

const privateKey = process.env["PRIVATE_KEY"];
const clientEmail = `${process.env["CLIENT_EMAIL"]}@learn-to-code-nz.iam.gserviceaccount.com`;
const projectId = "learn-to-code-nz";

if (!privateKey || !clientEmail || !projectId) {
  console.log(
    `Failed to load Firebase credentials. Follow the instructions in the README to set your Firebase credentials inside environment variables.`
  );
}

if (!firebaseAdmin.apps.length) {
  firebaseAdmin.initializeApp({
    credential: firebaseAdmin.credential.cert({
      privateKey: privateKey,
      clientEmail,
      projectId,
    }),
    databaseURL: `https://${projectId}.firebaseio.com`,
  });
}

export { firebaseAdmin };