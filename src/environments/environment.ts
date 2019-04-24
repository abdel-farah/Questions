// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  apiUrl: 'http://localhost:4000',
     firebaseConfig: {
      apiKey: "AIzaSyBqn9SVEb-JVE6x4CZEIkynhRgKbQVgkhQ",
      authDomain: "questions-90905.firebaseapp.com",
      databaseURL: "https://questions-90905.firebaseio.com",
      projectId: "questions-90905",
      storageBucket: "questions-90905.appspot.com",
      messagingSenderId: "832762549689"
    }
};
/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
